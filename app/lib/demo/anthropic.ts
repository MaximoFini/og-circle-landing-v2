// Cliente mínimo de la API de Mensajes de Anthropic.
// Port de api/_anthropic.js del repo emilianoverabusiness-blip/vegroup (5bbca48).
//
// NO agregar temperature / top_p / top_k / thinking al body: claude-sonnet-5
// los rechaza con 400. El header anthropic-version es obligatorio.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

export type ContentBlock = { type: 'text'; text: string }

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** true si el error es "no hay más crédito/cuota" del lado de Anthropic. */
export function esCuota(err: unknown): boolean {
  return err instanceof HttpError && (err.status === 429 || err.status === 402)
}

/** Llama a la API y devuelve el texto plano concatenado de la respuesta. */
export async function callAnthropic({
  model,
  max_tokens,
  system,
  content,
}: {
  model: string
  max_tokens: number
  system?: string
  content: ContentBlock[]
}): Promise<string> {
  const data = await rawCall({
    model,
    max_tokens,
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content }],
  })
  const text = (data.content || [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n')
    .trim()

  if (!text) throw new HttpError(502, 'Respuesta vacía del modelo.')
  return text
}

/**
 * Llama al modelo esperando un objeto JSON, forzando la respuesta vía tool use
 * (tool_choice obligatorio): el modelo no puede devolver texto vacío ni JSON
 * cortado.
 *
 * retries=1 (upstream eran 3): con tool_choice forzado el 502 por respuesta mal
 * formada prácticamente no pasa, así que reintentar solo triplicaba el costo de
 * un 5xx real de la API. El fallback de identify a búsqueda local cubre el resto.
 */
export async function callAnthropicJSON<T = Record<string, unknown>>(
  {
    model,
    max_tokens,
    system,
    content,
    schema,
  }: {
    model: string
    max_tokens: number
    system?: string
    content: ContentBlock[]
    schema?: Record<string, unknown>
  },
  retries = 1,
): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < retries; i++) {
    try {
      const data = await rawCall({
        model,
        max_tokens,
        ...(system ? { system } : {}),
        messages: [{ role: 'user', content }],
        tools: [
          {
            name: 'emitir_resultado',
            description: 'Emite el resultado estructurado pedido en la consigna.',
            input_schema: schema || { type: 'object' },
          },
        ],
        tool_choice: { type: 'tool', name: 'emitir_resultado' },
      })
      const block = (data.content || []).find((b: any) => b.type === 'tool_use')
      if (!block || typeof block.input !== 'object' || block.input === null) {
        throw new HttpError(502, 'El modelo no devolvió el resultado estructurado.')
      }
      return block.input as T
    } catch (err) {
      lastErr = err
      // Config del servidor (falta API key): reintentar no ayuda.
      if (err instanceof HttpError && err.status === 500) throw err
    }
  }
  throw lastErr
}

async function rawCall(body: Record<string, unknown>): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new HttpError(500, 'Falta ANTHROPIC_API_KEY en el entorno del servidor.')
  }
  const resp = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    // 429/402 los propagamos tal cual para distinguir "sin cuota" de "se rompió".
    const status = resp.status === 401 ? 500 : resp.status === 429 || resp.status === 402 ? resp.status : 502
    throw new HttpError(status, `Error de la API de Anthropic (${resp.status}). ${safeSnippet(detail)}`)
  }
  return resp.json()
}

/** Extrae y parsea el primer objeto/array JSON dentro de un texto. */
export function extractJSON(text: string): any {
  let t = text.trim()
  // Quitar fences ```json ... ```
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  try {
    return JSON.parse(t)
  } catch {
    // Buscar el primer bloque { ... } o [ ... ] balanceado.
    const start = t.search(/[{[]/)
    if (start === -1) throw new HttpError(502, 'El modelo no devolvió JSON válido.')
    const open = t[start]
    const close = open === '{' ? '}' : ']'
    let depth = 0
    for (let i = start; i < t.length; i++) {
      if (t[i] === open) depth++
      else if (t[i] === close) {
        depth--
        if (depth === 0) {
          try {
            return JSON.parse(t.slice(start, i + 1))
          } catch {
            break
          }
        }
      }
    }
    throw new HttpError(502, 'El modelo no devolvió JSON válido.')
  }
}

function safeSnippet(s: string): string {
  if (!s) return ''
  try {
    const j = JSON.parse(s)
    return j?.error?.message ? String(j.error.message).slice(0, 200) : ''
  } catch {
    return String(s).slice(0, 200)
  }
}
