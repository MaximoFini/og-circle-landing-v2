// POST /api/demo/lead  { nombre, whatsapp, contexto? } → { ok: true }
// Guarda el contacto y marca la sesión como leadCaptured (lo que habilita
// /api/demo/analyze).
//
// Guardamos ipHash, no la IP: alcanza para deduplicar y no es un dato personal
// más de lo necesario.

import { NextResponse } from 'next/server'
import { identificarVisitante, conCookie, guardarLead } from '../../../lib/demo/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const v = identificarVisitante(req)

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    /* body inválido → cae en la validación de abajo */
  }

  const nombre = String(body?.nombre ?? '').trim().slice(0, 80)
  const whatsappRaw = String(body?.whatsapp ?? '').trim().slice(0, 40)
  const digitos = whatsappRaw.replace(/\D/g, '')

  if (nombre.length < 2) {
    return conCookie(NextResponse.json({ error: 'Poné tu nombre.' }, { status: 400 }), v)
  }
  // 8 dígitos = un fijo argentino sin característica; el piso más laxo que
  // sigue filtrando el "123" de quien quiere saltear el formulario.
  if (digitos.length < 8 || digitos.length > 15) {
    return conCookie(NextResponse.json({ error: 'Poné un WhatsApp válido.' }, { status: 400 }), v)
  }

  await guardarLead(v, {
    nombre,
    whatsapp: whatsappRaw,
    ipHash: v.ipHash,
    contexto: body?.contexto ?? null,
    ts: Date.now(),
  })

  return conCookie(NextResponse.json({ ok: true }), v)
}
