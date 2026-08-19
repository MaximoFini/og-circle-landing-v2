// POST /api/demo/identify  { producto } → posición SIM + alícuotas.
//
// Fusión de api/identify.js + api/suggest.js del cotizador original: allá eran
// dos llamadas a IA (interpretar la jerga → elegir la posición). Acá es UNA
// sola con las dos consignas, porque el paso caro es el input, no el output.
//
// Nunca 500 por una falla de IA: si algo se rompe o el tope diario está
// agotado, se devuelve el mejor match de la búsqueda local con fuente:"local".

import { NextResponse } from 'next/server'
import { searchNCM, searchByPartidas } from '../../../lib/demo/ncmSearch.js'
import { callAnthropicJSON } from '../../../lib/demo/anthropic'
import {
  identificarVisitante,
  conCookie,
  consumir,
  devolver,
  consumirGlobal,
  devolverGlobal,
  guardarResultado,
  leerResultado,
} from '../../../lib/demo/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MODEL = process.env.ANTHROPIC_MODEL_IDENTIFY || 'claude-sonnet-5'
const MAX_USOS = 1

// 25 candidatos con descripción recortada a 120 chars. El original mandaba
// hasta 80 con la descripción del sufijo + la de la partida concatenadas
// (4-12k tokens de input); ahí estaba casi todo el costo por llamada.
const MAX_CANDIDATOS = 25
const MAX_DESC = 120

type Registro = {
  sim: string
  ncm: string
  sufijo: string
  descripcion: string
  die: number
  te: number
  iva: number
}

export async function POST(req: Request) {
  const v = identificarVisitante(req)

  let producto = ''
  try {
    const body = await req.json()
    producto = typeof body?.producto === 'string' ? body.producto.trim() : ''
  } catch {
    /* body inválido → cae en la validación de abajo */
  }
  if (!producto) {
    return conCookie(NextResponse.json({ error: 'Falta el producto.' }, { status: 400 }), v)
  }

  const candidatos: Registro[] = await searchNCM(producto, MAX_CANDIDATOS)

  const cuota = await consumir('identify', v, MAX_USOS)

  // Store caído: no podemos contar, así que no gastamos IA — pero la demo sigue.
  if (!cuota.storeOk) return conCookie(NextResponse.json(local(candidatos)), v)

  if (!cuota.ok) {
    const previo = await leerResultado('identify', v)
    return conCookie(
      NextResponse.json(
        {
          error: 'Ya usaste la identificación automática de esta demo.',
          motivo: 'cuota_agotada',
          ...(previo ? { resultadoPrevio: previo } : {}),
        },
        { status: 429 },
      ),
      v,
    )
  }

  // Tope diario agotado: degradamos y le devolvemos el uso al visitante.
  if (!(await consumirGlobal())) {
    await devolver('identify', v)
    const res = local(candidatos)
    await guardarResultado('identify', v, res)
    return conCookie(NextResponse.json(res), v)
  }

  try {
    const res = await conIA(producto, candidatos)
    await guardarResultado('identify', v, res)
    return conCookie(NextResponse.json(res), v)
  } catch (err) {
    // No se gastó nada útil: devolvemos ambos usos y degradamos.
    console.error('[demo/identify]', err)
    await Promise.all([devolver('identify', v), devolverGlobal()])
    const res = local(candidatos)
    await guardarResultado('identify', v, res)
    return conCookie(NextResponse.json(res), v)
  }
}

// ── Camino con IA ────────────────────────────────────────────────────────

async function conIA(producto: string, candidatos: Registro[]) {
  const lista = candidatos.map((c) => ({
    sim: c.sim,
    descripcion: (c.descripcion || '').slice(0, MAX_DESC),
  }))

  const system =
    'Sos un clasificador experto en el Nomenclador Común del Mercosur (NCM) para ' +
    'VEGROUP, empresa argentina de courier e importación de mercadería comercial ' +
    '(electrónica, indumentaria, calzado, accesorios, hogar, etc.). ' +
    'Los usuarios escriben en jerga argentina, abreviado o mal escrito: primero ' +
    'interpretás QUÉ PRODUCTO COMERCIAL es realmente, priorizando la lectura más ' +
    'común en ese contexto de importación. Ejemplos: "zapa"/"zapas" = zapatillas ' +
    '(calzado deportivo), "compu" = computadora, "celu" = teléfono celular, ' +
    '"campera" = cazadora, "joya" = bijouterie/joyería, "auris" = auriculares. ' +
    'Recién después elegís la posición SIM más adecuada, SOLO entre los ' +
    'candidatos provistos. Nunca inventás códigos.'

  const prompt = [
    `Producto del usuario: "${producto}"`,
    '',
    'Candidatos (elegí exclusivamente el campo "sim" de esta lista):',
    JSON.stringify(lista),
    '',
    'Devolvé el "sim" que mejor clasifica el producto, hasta 2 alternativas ' +
      'plausibles de la misma lista (o [] si no hay), y un razonamiento de 1-2 ' +
      'frases que empiece por cómo interpretaste el término del usuario.',
    'Si NINGÚN candidato sirve (o la lista está vacía), dejá "sim" en "" e ' +
      'indicá en "partida" la partida NCM de 4 dígitos donde debería clasificar.',
  ].join('\n')

  const parsed = await callAnthropicJSON<{
    sim?: string
    partida?: string
    confianza?: number
    razonamiento?: string
    alternativas?: { sim?: string; motivo?: string }[]
  }>({
    model: MODEL,
    max_tokens: 1200,
    system,
    content: [{ type: 'text', text: prompt }],
    schema: {
      type: 'object',
      properties: {
        sim: {
          type: 'string',
          description: 'Posición SIM elegida, tal cual figura en los candidatos. "" si ninguno aplica.',
        },
        partida: {
          type: 'string',
          description: 'Solo si "sim" queda vacío: partida NCM de 4 dígitos, ej "6404".',
        },
        confianza: { type: 'integer', description: 'Entero 0-100' },
        razonamiento: { type: 'string', description: '1-2 frases explicando la elección' },
        alternativas: {
          type: 'array',
          description: 'Hasta 2 alternativas de la misma lista ([] si no hay)',
          items: {
            type: 'object',
            properties: { sim: { type: 'string' }, motivo: { type: 'string' } },
            required: ['sim'],
          },
        },
      },
      required: ['sim', 'confianza', 'razonamiento', 'alternativas'],
    },
  })

  const porSim = new Map(candidatos.map((c) => [c.sim, c]))
  let elegido = parsed.sim ? porSim.get(parsed.sim) : undefined
  let confianza = clamp(Number(parsed.confianza) || 0, 0, 100)
  let razonamiento = String(parsed.razonamiento || '').trim()

  if (!elegido) {
    // El modelo devolvió un código que no está en la lista (alucinación) o
    // avisó que ninguno servía. Intentamos rescatar con la partida sugerida
    // — es lo que hacía api/suggest.js, pero sin una segunda llamada.
    const partida = String(parsed.partida || '').replace(/\D/g, '').slice(0, 4)
    if (/^\d{4}$/.test(partida)) {
      const porPartida: Registro[] = await searchByPartidas([partida], MAX_CANDIDATOS)
      elegido = porPartida[0]
    }
    if (!elegido) elegido = candidatos[0]
    if (!elegido) return vacio(razonamiento)
    confianza = Math.min(confianza || 40, 40)
    razonamiento = `${razonamiento} (Ajustado al mejor candidato local.)`.trim()
  }

  const alternativas = (Array.isArray(parsed.alternativas) ? parsed.alternativas : [])
    .map((a) => porSim.get(String(a?.sim || '')))
    .filter((r): r is Registro => Boolean(r) && r!.sim !== elegido!.sim)
    .slice(0, 2)
    .map(campos)

  return { ...campos(elegido), confianza, razonamiento, alternativas, fuente: 'ia' as const }
}

// ── Degradación sin IA ───────────────────────────────────────────────────

function local(candidatos: Registro[]) {
  const mejor = candidatos[0]
  if (!mejor) return vacio('')
  return {
    ...campos(mejor),
    confianza: 50,
    razonamiento:
      'Coincidencia por búsqueda textual en el nomenclador. Verificá la posición con tu despachante.',
    alternativas: candidatos.slice(1, 3).map(campos),
    fuente: 'local' as const,
  }
}

function vacio(razonamiento: string) {
  return {
    ncm: '',
    sufijo: '',
    descripcion: 'No se encontró una posición para ese producto. Probá describirlo con otras palabras.',
    die: 0,
    te: 0,
    iva: 21,
    confianza: 0,
    razonamiento,
    alternativas: [],
    fuente: 'local' as const,
  }
}

function campos(r: Registro) {
  return {
    ncm: r.ncm,
    sufijo: r.sufijo,
    descripcion: r.descripcion,
    die: r.die,
    te: r.te,
    iva: r.iva,
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
