// POST /api/demo/analyze  { producto, costoUnitario, precioSugerido, contexto? }
// → análisis comercial (6 campos). Port de api/analyze.js del cotizador.
//
// Exige lead capturado: es la contraprestación de la demo, no una medida de
// seguridad. Modelo Haiku 4.5 en vez de Opus (5× más barato, $1/$5 vs $5/$25
// por MTok) — es redacción de marketing, no razonamiento fino.

import { NextResponse } from 'next/server'
import { callAnthropic, extractJSON } from '../../../lib/demo/anthropic'
import {
  identificarVisitante,
  conCookie,
  consumir,
  devolver,
  consumirGlobal,
  devolverGlobal,
  tieneLead,
  guardarResultado,
  leerResultado,
} from '../../../lib/demo/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MODEL = process.env.ANTHROPIC_MODEL_ANALYZE || 'claude-haiku-4-5'
const MAX_USOS = 1

export async function POST(req: Request) {
  const v = identificarVisitante(req)

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    /* body inválido → cae en la validación de abajo */
  }
  const producto = typeof body?.producto === 'string' ? body.producto.trim() : ''
  if (!producto) {
    return conCookie(NextResponse.json({ error: 'Falta el nombre del producto.' }, { status: 400 }), v)
  }

  if (!(await tieneLead(v))) {
    return conCookie(
      NextResponse.json(
        { error: 'Dejanos tu contacto para ver el análisis comercial.', motivo: 'lead_requerido' },
        { status: 403 },
      ),
      v,
    )
  }

  const cuota = await consumir('analyze', v, MAX_USOS)
  if (!cuota.ok) {
    const previo = await leerResultado('analyze', v)
    return conCookie(
      NextResponse.json(
        {
          error: 'Ya usaste el análisis comercial de esta demo.',
          motivo: 'cuota_agotada',
          ...(previo ? { resultadoPrevio: previo } : {}),
        },
        { status: 429 },
      ),
      v,
    )
  }

  if (!(await consumirGlobal())) {
    await devolver('analyze', v)
    return conCookie(
      NextResponse.json(
        { error: 'La demo llegó al tope de análisis de hoy. Probá mañana.', motivo: 'cuota_agotada' },
        { status: 429 },
      ),
      v,
    )
  }

  const system =
    'Sos un estratega de marketing y comercio para VEGROUP, empresa argentina de ' +
    'logística e importación. Analizás productos importados para el mercado argentino ' +
    'con criterio comercial realista (precios en USD y contexto local).'

  const prompt = [
    'Analizá comercialmente este producto importado por VEGROUP.',
    '',
    `Producto: ${producto}`,
    num(body?.costoUnitario) != null ? `Costo por unidad puesto en Argentina (USD): ${num(body.costoUnitario)}` : '',
    num(body?.precioSugerido) != null ? `Precio de venta que evalúa el usuario (USD): ${num(body.precioSugerido)}` : '',
    body?.contexto ? `Contexto adicional: ${JSON.stringify(body.contexto).slice(0, 1500)}` : '',
    '',
    'Devolvé UNICAMENTE un JSON con esta forma exacta:',
    '{',
    '  "publicoObjetivo": "<descripción del target ideal>",',
    '  "angulosVenta": ["<ángulo 1>", "<ángulo 2>", "<ángulo 3>"],',
    '  "ideasContenido": ["<idea 1>", "<idea 2>", "<idea 3>"],',
    '  "campanaSugerida": "<concepto de campaña en 1-2 frases>",',
    '  "precioSugerido": "<rango de precio de venta sugerido en ARS o USD con justificación breve>",',
    '  "riesgoPrincipal": "<el mayor riesgo comercial y cómo mitigarlo>"',
    '}',
    'Sé concreto y accionable. Sin texto fuera del JSON.',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const text = await callAnthropic({
      model: MODEL,
      max_tokens: 1600,
      system,
      content: [{ type: 'text', text: prompt }],
    })
    const parsed = extractJSON(text)
    // Normalizamos arrays por si el modelo devolvió strings sueltos.
    parsed.angulosVenta = toArray(parsed.angulosVenta)
    parsed.ideasContenido = toArray(parsed.ideasContenido)
    await guardarResultado('analyze', v, parsed)
    return conCookie(NextResponse.json(parsed), v)
  } catch (err) {
    console.error('[demo/analyze]', err)
    // Acá no hay degradación posible (no existe un análisis "local"), pero sí
    // devolvemos el uso: la falla es nuestra, no del visitante.
    await Promise.all([devolver('analyze', v), devolverGlobal()])
    return conCookie(
      NextResponse.json({ error: 'No pudimos generar el análisis ahora. Probá de nuevo.' }, { status: 503 }),
      v,
    )
  }
}

function num(v: unknown): number | null {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v)
  return Number.isFinite(n) ? n : null
}

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String)
  if (typeof v === 'string' && v.trim()) return [v.trim()]
  return []
}
