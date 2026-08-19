// POST /api/demo/dolar  {} → { valor, fecha }
// Dólar oficial BNA (billete venta). Fuente: dolarapi.com, refleja la pizarra
// del Banco Nación. Sin IA y sin cuota: es un dato público y barato.

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Caché por instancia de lambda: la pizarra se mueve una vez por día, no tiene
// sentido golpear la fuente en cada cotización. No hace falta KV para esto.
let cache: { data: Payload; ts: number } | null = null
const TTL_MS = 10 * 60 * 1000

type Payload = { valor: number; fecha: string; compra: number | null; fuente: string }

export async function POST() {
  if (cache && Date.now() - cache.ts < TTL_MS) {
    return NextResponse.json(cache.data)
  }

  try {
    const resp = await fetch('https://dolarapi.com/v1/dolares/oficial', {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    if (!resp.ok) throw new Error(`fuente respondió ${resp.status}`)

    const j: any = await resp.json()
    const valor = Number(j?.venta)
    if (!Number.isFinite(valor) || valor <= 0) throw new Error('cotización inválida')

    const data: Payload = {
      valor,
      fecha: String(j?.fechaActualizacion || new Date().toISOString()),
      compra: Number(j?.compra) || null,
      fuente: 'BNA oficial (dolarapi.com)',
    }
    cache = { data, ts: Date.now() }
    return NextResponse.json(data)
  } catch (err) {
    console.error('[demo/dolar]', err)
    // Si tenemos algo viejo en caché es mejor que nada: el cliente puede
    // editar el valor a mano igual.
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json(
      { error: 'No se pudo obtener la cotización BNA. Cargala a mano.' },
      { status: 502 },
    )
  }
}
