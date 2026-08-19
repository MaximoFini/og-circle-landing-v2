// Cuotas de la demo de la calculadora.
//
// Identidad doble: cookie httpOnly firmada (HMAC) como primaria + hash de IP
// como respaldo, y se cuenta contra las dos. La IP sola no alcanza: es
// bypasseable con VPN y da falsos positivos en CGNAT móvil (todo Movistar en
// una celda comparte IP). La cookie sola tampoco: se borra en un incógnito.
// Por eso el límite por visitante es UX, no seguridad — la red real es el tope
// global diario (DEMO_DAILY_CAP), que acota el gasto pase lo que pase.
//
// Store: @vercel/kv. Un Map en memoria NO sirve en producción: cada instancia
// de lambda tiene el suyo y se recicla; el "límite de 1" se resetea solo. El
// Map de abajo existe únicamente para `npm run dev` sin KV configurado.

import crypto from 'node:crypto'
import { kv } from '@vercel/kv'

const TTL_VISITANTE = 30 * 24 * 60 * 60 // 30 días, en segundos
const COOKIE = 'demo_vid'

export type Endpoint = 'identify' | 'analyze'

export type Visitante = {
  vid: string
  ipHash: string
  /** true si hay que mandar Set-Cookie en la respuesta. */
  nuevo: boolean
}

// ── Identidad ────────────────────────────────────────────────────────────

function secreto(): string {
  // Sin secreto la firma no protege nada, pero preferimos degradar a una
  // constante antes que tirar 500 y romper la demo entera.
  return process.env.DEMO_COOKIE_SECRET || 'vegroup-demo-sin-secreto'
}

function firmar(v: string): string {
  return crypto.createHmac('sha256', secreto()).update(v).digest('base64url')
}

function verificar(raw: string): string | null {
  const i = raw.lastIndexOf('.')
  if (i <= 0) return null
  const id = raw.slice(0, i)
  const sig = raw.slice(i + 1)
  const bueno = firmar(id)
  const a = Buffer.from(sig)
  const b = Buffer.from(bueno)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  return id
}

function leerCookie(req: Request, nombre: string): string | null {
  const raw = req.headers.get('cookie')
  if (!raw) return null
  for (const parte of raw.split(';')) {
    const eq = parte.indexOf('=')
    if (eq === -1) continue
    if (parte.slice(0, eq).trim() === nombre) {
      return decodeURIComponent(parte.slice(eq + 1).trim())
    }
  }
  return null
}

export function identificarVisitante(req: Request): Visitante {
  const cookie = leerCookie(req, COOKIE)
  const previo = cookie ? verificar(cookie) : null
  const vid = previo || crypto.randomUUID()

  // Primer hop de x-forwarded-for: los siguientes los puede falsear el cliente.
  const xff = req.headers.get('x-forwarded-for') || ''
  const ip = xff.split(',')[0].trim() || req.headers.get('x-real-ip') || 'sin-ip'
  const ipHash = crypto.createHmac('sha256', secreto()).update(ip).digest('base64url').slice(0, 22)

  return { vid, ipHash, nuevo: !previo }
}

/** Valor de Set-Cookie, o null si el visitante ya la tenía válida. */
export function cookieDeVisitante(v: Visitante): string | null {
  if (!v.nuevo) return null
  const valor = `${v.vid}.${firmar(v.vid)}`
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE}=${encodeURIComponent(valor)}; Path=/; Max-Age=${TTL_VISITANTE}; HttpOnly; SameSite=Lax${secure}`
}

/** Aplica la cookie (si corresponde) a una respuesta ya construida. */
export function conCookie(resp: Response, v: Visitante): Response {
  const c = cookieDeVisitante(v)
  if (c) resp.headers.append('set-cookie', c)
  return resp
}

// ── Store ────────────────────────────────────────────────────────────────

const KV_OK = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

// Solo dev local sin KV. En prod nunca se usa (ver comentario de cabecera).
const mem = new Map<string, { v: unknown; exp: number }>()

function memGet(k: string): unknown {
  const e = mem.get(k)
  if (!e) return null
  if (e.exp < Date.now()) {
    mem.delete(k)
    return null
  }
  return e.v
}

async function get<T>(k: string): Promise<T | null> {
  if (!KV_OK) return (memGet(k) as T) ?? null
  try {
    return (await kv.get<T>(k)) ?? null
  } catch {
    return null
  }
}

async function set(k: string, v: unknown, ttl: number): Promise<void> {
  if (!KV_OK) {
    mem.set(k, { v, exp: Date.now() + ttl * 1000 })
    return
  }
  try {
    await kv.set(k, v, { ex: ttl })
  } catch {
    /* la demo no se rompe por un fallo de escritura del store */
  }
}

/** Incrementa y devuelve el valor nuevo. Devuelve null si el store falló. */
async function incr(k: string, ttl: number): Promise<number | null> {
  if (!KV_OK) {
    const n = (Number(memGet(k)) || 0) + 1
    mem.set(k, { v: n, exp: Date.now() + ttl * 1000 })
    return n
  }
  try {
    const n = await kv.incr(k)
    if (n === 1) await kv.expire(k, ttl)
    return n
  } catch {
    return null
  }
}

async function decr(k: string): Promise<void> {
  if (!KV_OK) {
    const n = Number(memGet(k)) || 0
    if (n > 0) mem.set(k, { v: n - 1, exp: mem.get(k)!.exp })
    return
  }
  try {
    await kv.decr(k)
  } catch {
    /* ignorado */
  }
}

// ── Cuota por visitante ──────────────────────────────────────────────────

const kVid = (e: Endpoint, v: Visitante) => `demo:${e}:vid:${v.vid}`
const kIp = (e: Endpoint, v: Visitante) => `demo:${e}:ip:${v.ipHash}`

/**
 * Consume un uso de `endpoint`. Contadores (no un booleano) para poder subir
 * el máximo sin migrar datos y para ver cuánto insiste cada visitante.
 * Cuenta contra cookie e IP a la vez: se agota si CUALQUIERA pasa el máximo.
 *
 * `storeOk:false` = el store no respondió y no sabemos cuánto usó. Fail-closed
 * a propósito: sin poder contar no gastamos IA. Se distingue de ok:false para
 * que identify degrade a búsqueda local en vez de tirar un 429 mentiroso.
 */
export async function consumir(
  endpoint: Endpoint,
  v: Visitante,
  max: number,
): Promise<{ ok: boolean; storeOk: boolean; usos: number }> {
  const [a, b] = await Promise.all([
    incr(kVid(endpoint, v), TTL_VISITANTE),
    incr(kIp(endpoint, v), TTL_VISITANTE),
  ])
  if (a === null || b === null) return { ok: false, storeOk: false, usos: max }
  const usos = Math.max(a, b)
  return { ok: usos <= max, storeOk: true, usos }
}

/** Devuelve el uso consumido (la IA falló por algo que no es cuota). */
export async function devolver(endpoint: Endpoint, v: Visitante): Promise<void> {
  await Promise.all([decr(kVid(endpoint, v)), decr(kIp(endpoint, v))])
}

// ── Tope global diario ───────────────────────────────────────────────────

function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

function capDiario(): number {
  const n = Number(process.env.DEMO_DAILY_CAP)
  return Number.isFinite(n) && n > 0 ? n : 200
}

/** false = tope diario agotado (o store caído): hay que degradar, no fallar. */
export async function consumirGlobal(): Promise<boolean> {
  const n = await incr(`demo:global:${hoy()}`, 48 * 60 * 60)
  if (n === null) return false
  return n <= capDiario()
}

export async function devolverGlobal(): Promise<void> {
  await decr(`demo:global:${hoy()}`)
}

// ── Resultado previo (para el 429 con resultadoPrevio) ───────────────────

export async function guardarResultado(endpoint: Endpoint, v: Visitante, data: unknown) {
  await set(`demo:res:${endpoint}:${v.vid}`, data, TTL_VISITANTE)
}

export async function leerResultado<T>(endpoint: Endpoint, v: Visitante): Promise<T | null> {
  return get<T>(`demo:res:${endpoint}:${v.vid}`)
}

// ── Lead ─────────────────────────────────────────────────────────────────

export type Lead = {
  nombre: string
  whatsapp: string
  ipHash: string
  contexto?: unknown
  ts: number
}

export async function guardarLead(v: Visitante, lead: Lead): Promise<void> {
  await Promise.all([
    set(`demo:lead:vid:${v.vid}`, lead, TTL_VISITANTE),
    set(`demo:lead:ip:${v.ipHash}`, 1, TTL_VISITANTE),
  ])
  if (KV_OK) {
    // Lista append-only para exportar los leads sin recorrer keys.
    try {
      await kv.lpush('demo:leads', JSON.stringify(lead))
    } catch {
      /* el lead ya quedó guardado por vid; la lista es comodidad */
    }
  }
}

/** El lead vale por cookie o por IP: no queremos re-pedirlo en cada pestaña. */
export async function tieneLead(v: Visitante): Promise<boolean> {
  const [a, b] = await Promise.all([
    get(`demo:lead:vid:${v.vid}`),
    get(`demo:lead:ip:${v.ipHash}`),
  ])
  return Boolean(a || b)
}
