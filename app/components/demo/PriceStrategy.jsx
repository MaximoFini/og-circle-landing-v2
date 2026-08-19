'use client'

import { useEffect, useMemo, useState } from 'react'

/* ================================================================== */
/*  TABLAS DE REFERENCIA 2026                                         */
/* ================================================================== */

const IVA = 0.21

const CATEGORIAS_ML = {
  'Accesorios para vehículos':     { c: 13.5, p: 16.5 },
  'Agro':                          { c: 12.5, p: 15.5 },
  'Alimentos y bebidas':           { c: 11.8, p: 14.8 },
  'Animales y mascotas':           { c: 13.5, p: 16.5 },
  'Antigüedades y colecciones':    { c: 14.0, p: 17.0 },
  'Arte, librería y mercería':     { c: 14.0, p: 17.0 },
  'Bebés':                         { c: 13.5, p: 16.5 },
  'Belleza y cuidado personal':    { c: 14.5, p: 17.14 },
  'Cámaras y accesorios':          { c: 15.0, p: 17.14 },
  'Celulares y teléfonos':         { c: 15.0, p: 17.14 },
  'Computación':                   { c: 15.0, p: 17.14 },
  'Consolas y videojuegos':        { c: 15.0, p: 17.14 },
  'Construcción':                  { c: 12.5, p: 15.5 },
  'Deportes y fitness':            { c: 13.5, p: 16.5 },
  'Electrodomésticos y aires ac.': { c: 12.5, p: 15.5 },
  'Electrónica, audio y video':    { c: 15.0, p: 17.14 },
  'Herramientas':                  { c: 13.0, p: 16.0 },
  'Hogar, muebles y jardín':       { c: 13.5, p: 16.5 },
  'Industrias y oficinas':         { c: 12.5, p: 15.5 },
  'Instrumentos musicales':        { c: 13.5, p: 16.5 },
  'Joyas y relojes':               { c: 14.5, p: 17.14 },
  'Juegos y juguetes':             { c: 14.0, p: 17.0 },
  'Libros, revistas y comics':     { c: 14.0, p: 17.0 },
  'Música, películas y series':    { c: 14.0, p: 17.0 },
  'Ropa y accesorios':             { c: 14.5, p: 17.14 },
  'Salud y equipamiento médico':   { c: 13.5, p: 16.5 },
  'Souvenirs y cotillón':          { c: 14.5, p: 17.14 },
  'Supermercado':                  { c: 11.8, p: 14.8, sinFijo: true, extra: 3 },
  'Otras categorías':              { c: 13.5, p: 16.5 },
}

const MEDIOS = [
  { k: 'cred1',  n: 'Crédito, un pago',             tarjeta: true },
  { k: 'cred3',  n: 'Crédito, 3 cuotas sin interés', tarjeta: true },
  { k: 'cred6',  n: 'Crédito, 6 cuotas sin interés', tarjeta: true },
  { k: 'debito', n: 'Tarjeta de débito',             tarjeta: true },
  { k: 'cuenta', n: 'Dinero en cuenta o QR',         tarjeta: false },
  { k: 'transf', n: 'Transferencia o CVU',           tarjeta: false },
]

const MIX_TIPICO = { cred1: 30, cred3: 20, cred6: 20, debito: 15, cuenta: 10, transf: 5 }

const PASARELAS = {
  mp_10:    { n: 'Mercado Pago',  detalle: 'cobro a 10 días',
    a: { cred1: 3.99, cred3: 9.74, cred6: 14.74, debito: 3.25, cuenta: 3.99, transf: 0.9 },
    d: { cred1: 10, cred3: 10, cred6: 10, debito: 1, cuenta: 0, transf: 0 } },
  mp_inm:   { n: 'Mercado Pago',  detalle: 'cobro al instante',
    a: { cred1: 6.49, cred3: 12.24, cred6: 17.24, debito: 3.25, cuenta: 6.49, transf: 0.9 },
    d: { cred1: 0, cred3: 0, cred6: 0, debito: 0, cuenta: 0, transf: 0 } },
  mp_30:    { n: 'Mercado Pago',  detalle: 'cobro a 30 días',
    a: { cred1: 2.99, cred3: 8.74, cred6: 13.74, debito: 2.99, cuenta: 2.99, transf: 0.9 },
    d: { cred1: 30, cred3: 30, cred6: 30, debito: 30, cuenta: 0, transf: 0 } },
  uala:     { n: 'Ualá Bis',      detalle: 'cobro al instante',
    a: { cred1: 4.9, cred3: 10.65, cred6: 15.65, debito: 2.9, cuenta: 4.9, transf: 0.9 },
    d: { cred1: 0, cred3: 0, cred6: 0, debito: 0, cuenta: 0, transf: 0 } },
  pagonube: { n: 'Pago Nube',     detalle: 'cobro a 1 día',
    a: { cred1: 6.4, cred3: 12.15, cred6: 17.15, debito: 6.4, cuenta: 6.4, transf: 0.85 },
    d: { cred1: 1, cred3: 1, cred6: 1, debito: 1, cuenta: 0, transf: 0 } },
}

const ARANCEL_ML = { cred1: 0, cred3: 5.75, cred6: 10.75, debito: 0, cuenta: 0, transf: 0 }
const DIAS_ML = { cred1: 12, cred3: 12, cred6: 12, debito: 12, cuenta: 12, transf: 12 }

const CANALES = {
  ml_clasica:  { nombre: 'Mercado Libre', variante: 'Publicación clásica',   ml: true, campo: 'c' },
  ml_premium:  { nombre: 'Mercado Libre', variante: 'Publicación premium',   ml: true, campo: 'p' },
  tiendanube:  { nombre: 'Tiendanube',    variante: 'Tienda propia', ml: false,
    planes: { Inicial: 2, Esencial: 1.5, Evoluciona: 1, Avanzado: 0.7, Escala: 0 }, plan: 'Inicial' },
  shopify:     { nombre: 'Shopify',       variante: 'Tienda propia', ml: false,
    planes: { Basic: 2, Grow: 1, Advanced: 0.6, Plus: 0.2 }, plan: 'Basic' },
  empretienda: { nombre: 'Empretienda',   variante: 'Tienda propia', ml: false,
    planes: { 'Plan gratuito': 2, 'Plan pago': 0 }, plan: 'Plan gratuito' },
  propia:      { nombre: 'Web propia',    variante: 'WooCommerce o a medida', ml: false,
    planes: { 'Sin comisión de plataforma': 0 }, plan: 'Sin comisión de plataforma' },
}

function fijoML(precio, categoria) {
  const cat = CATEGORIAS_ML[categoria]
  if (cat && cat.sinFijo) return 0
  if (precio <= 0) return 0
  if (precio < 15000) return 1115
  if (precio < 25000) return 2300
  if (precio < 33000) return 2810
  return 0
}

/* Lee números escritos a la argentina sin romper decimales con punto. */
function num(s) {
  if (typeof s === 'number') return isNaN(s) ? 0 : s
  let t = String(s).trim().replace(/\s/g, '')
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '')
  const v = parseFloat(t)
  return isNaN(v) ? 0 : v
}

/* ================================================================== */
/*  MOTOR                                                             */
/* ================================================================== */

function ponderar(mix, arancel, dias) {
  const total = MEDIOS.reduce((s, m) => s + (mix[m.k] || 0), 0) || 1
  let ar = 0, di = 0, tarjeta = 0
  const porMedio = MEDIOS.map((m) => {
    const w = (mix[m.k] || 0) / total
    const a = (arancel[m.k] || 0) / 100
    const d = dias[m.k] || 0
    ar += w * a; di += w * d
    if (m.tarjeta) tarjeta += w
    return { ...m, w, a, d }
  })
  return { porMedio, arancel: ar, dias: di, pesoTarjeta: tarjeta }
}

function armar(e, canalKey) {
  const canal = CANALES[canalKey]
  const arancel = canal.ml ? ARANCEL_ML : PASARELAS[e.pasarelaKey].a
  const dias = canal.ml ? DIAS_ML : PASARELAS[e.pasarelaKey].d
  const p = ponderar(e.mix, arancel, dias)

  let comision
  if (e.comisionManual != null && canalKey === e.canalKey) comision = e.comisionManual
  else if (canal.ml) {
    const cat = CATEGORIAS_ML[e.categoria] || CATEGORIAS_ML['Otras categorías']
    comision = (cat[canal.campo] || 0) + (cat.extra || 0)
  } else comision = canal.planes[e.planes[canalKey]] ?? 0

  const financiero = (p.dias / 30) * (e.tasaCapital / 100)
  const retCosto = e.retencionesRecuperables ? 0
    : p.pesoTarjeta * ((e.sirtac + (e.ri ? e.retIVA + e.retGan : 0)) / 100)
  const sobreVenta = 1.21 * (comision / 100 + p.arancel) + e.iibb / 100 + financiero + retCosto
  return { canal, p, comision, financiero, sobreVenta, retCosto }
}

function resolverPrecio(e, canalKey) {
  const A = armar(e, canalKey)
  const den = 1 - A.sobreVenta - e.margen / 100
  if (den <= 0.02) return { imposible: true, sobreVenta: A.sobreVenta, A }

  const calc = (fijo) => {
    const cost = e.ri && e.ivaRecuperable ? e.costo / 1.21 : e.costo
    const otr = e.ri && e.ivaRecuperable ? e.otros / 1.21 : e.otros
    const log = e.ri ? e.envio + fijo : 1.21 * (e.envio + fijo)
    const base = (cost + otr + log) / den
    return e.ri ? base * 1.21 : base
  }

  if (!A.canal.ml) return { precio: calc(0), A }

  let fijo = 0; const vistos = []
  for (let i = 0; i < 30; i++) {
    const precio = calc(fijo)
    const sig = fijoML(precio, e.categoria)
    if (sig === fijo) return { precio, A }
    if (vistos.includes(sig)) {
      const alto = Math.max(...vistos, sig)
      return { precio: calc(alto), A, oscila: true }
    }
    vistos.push(fijo); fijo = sig
  }
  return { precio: calc(fijo), A }
}

function desglosar(e, canalKey, precio) {
  const A = armar(e, canalKey)
  const { p, canal, comision, financiero } = A
  const fijo = canal.ml ? fijoML(precio, e.categoria) : 0

  const comisionCanal = (comision / 100) * precio
  const arancelPago = p.arancel * precio
  const ivaCargos = IVA * (comisionCanal + arancelPago + fijo)

  const baseNeta = e.ri ? precio / 1.21 : precio
  const ivaDebito = e.ri ? precio - baseNeta : 0
  const iibb = (e.iibb / 100) * baseNeta
  const finan = financiero * precio

  const retTotal = p.pesoTarjeta * ((e.sirtac + (e.ri ? e.retIVA + e.retGan : 0)) / 100) * precio
  const retComoCosto = e.retencionesRecuperables ? 0 : retTotal

  const costoProd = e.ri && e.ivaRecuperable ? e.costo / 1.21 : e.costo
  const otros = e.ri && e.ivaRecuperable ? e.otros / 1.21 : e.otros
  const envio = e.ri ? e.envio : e.envio * 1.21

  const cargos = e.ri ? comisionCanal + arancelPago + fijo
                      : comisionCanal + arancelPago + fijo + ivaCargos
  const ganancia = baseNeta - cargos - iibb - finan - retComoCosto - envio - costoProd - otros
  const gan35 = e.ri ? Math.max(0, ganancia) * 0.35 : 0

  const porMedio = p.porMedio.map((m) => {
    const ar = m.a * precio
    const iv = IVA * (comisionCanal + ar + fijo)
    const fi = ((m.d / 30) * (e.tasaCapital / 100)) * precio
    const rt = e.retencionesRecuperables ? 0
      : (m.tarjeta ? ((e.sirtac + (e.ri ? e.retIVA + e.retGan : 0)) / 100) * precio : 0)
    const cg = e.ri ? comisionCanal + ar + fijo : comisionCanal + ar + fijo + iv
    const g = baseNeta - cg - iibb - fi - rt - envio - costoProd - otros
    const gf = e.ri ? g - Math.max(0, g) * 0.35 : g
    return { ...m, ganancia: gf, margen: baseNeta > 0 ? gf / baseNeta : 0 }
  })

  return {
    precio, baseNeta, ivaDebito, comisionCanal, comision, fijo, arancelPago, ivaCargos,
    iibb, finan, retTotal, retComoCosto, envio, costoProd, otros, ganancia, gan35,
    gananciaFinal: ganancia - gan35, porMedio, p, canal,
    margen: baseNeta > 0 ? (ganancia - gan35) / baseNeta : 0,
  }
}

/* ================================================================== */
/*  ESTILO                                                            */
/* ================================================================== */

const C = {
  papel: '#0a0a0a',
  ficha: '#141414',
  tinta: '#ffffff',
  tinta2: 'rgba(255,255,255,0.60)',
  tinta3: 'rgba(255,255,255,0.38)',
  regla: 'rgba(255,255,255,0.08)',
  reglaFuerte: 'rgba(255,255,255,0.18)',
  sello: '#f87171',
  verde: '#4ade80',
  resalte: 'rgba(217,158,0,0.10)',
  dorado: '#d99e00',
}
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
const SANS = '"Inter", ui-sans-serif, system-ui, sans-serif'

const money = (v) => {
  const n = Math.round(v || 0)
  const s = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
    .format(Math.abs(n))
  return (n < 0 ? '−' : '') + s
}
const pct = (v, d = 1) => `${((v || 0) * 100).toFixed(d)}%`

function Etiqueta({ children, nota }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.tinta3 }}>{children}</span>
      {nota && <span style={{ fontFamily: SANS, fontSize: 11, color: C.tinta3, marginLeft: 8 }}>{nota}</span>}
    </div>
  )
}

const inputBase = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', fontFamily: MONO,
  fontSize: 15, color: C.tinta, background: C.ficha, border: `1px solid ${C.regla}`,
  borderRadius: 6, outline: 'none',
}

function Campo({ valor, onChange, prefijo, sufijo, chico }) {
  const est = { ...inputBase, textAlign: 'right', padding: chico ? '6px 8px' : '10px 12px', fontSize: chico ? 13 : 15 }
  const lado = { fontFamily: MONO, fontSize: chico ? 11 : 13, color: C.tinta3, display: 'flex', alignItems: 'center', padding: '0 9px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.regla}` }
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {prefijo && <span style={{ ...lado, borderRight: 'none', borderRadius: '6px 0 0 6px' }}>{prefijo}</span>}
      <input type="text" inputMode="decimal" value={valor} onChange={(e) => onChange(e.target.value)}
        style={{ ...est, borderRadius: prefijo ? (sufijo ? 0 : '0 6px 6px 0') : (sufijo ? '6px 0 0 6px' : 6), borderRight: sufijo ? 'none' : `1px solid ${C.regla}` }} />
      {sufijo && <span style={{ ...lado, borderRadius: '0 6px 6px 0' }}>{sufijo}</span>}
    </div>
  )
}

function Selector({ valor, onChange, children }) {
  return <select value={valor} onChange={(e) => onChange(e.target.value)}
    style={{ ...inputBase, fontFamily: SANS, cursor: 'pointer' }}>{children}</select>
}

function Pestanias({ valor, onChange, items }) {
  return (
    <div style={{ display: 'flex', border: `1px solid ${C.regla}`, borderRadius: 6, overflow: 'hidden' }}>
      {items.map((it) => {
        const on = valor === it.k
        return <button key={it.k} type="button" onClick={() => onChange(it.k)}
          style={{ flex: 1, padding: '10px 6px', cursor: 'pointer', fontFamily: SANS, fontSize: 13.5, fontWeight: on ? 600 : 400, color: on ? '#000' : C.tinta2, background: on ? '#fff' : 'transparent', border: 'none' }}>{it.t}</button>
      })}
    </div>
  )
}

function Casilla({ checked, onChange, children }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', marginTop: 9 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 2, accentColor: C.tinta }} />
      <span style={{ fontSize: 12.5, color: C.tinta2, lineHeight: 1.45 }}>{children}</span>
    </label>
  )
}

function Renglon({ concepto, detalle, monto, resta, fuerte, borde, tenue }) {
  const neg = resta || monto < 0
  return (
    <div className="ps-line" style={{ display: 'flex', alignItems: 'baseline', gap: 9, padding: '6px 0', borderTop: borde ? `1px solid ${C.regla}` : 'none', opacity: tenue ? 0.6 : 1 }}>
      <span className="ps-line__concepto" style={{ fontSize: fuerte ? 14 : 13, fontWeight: fuerte ? 500 : 400, color: fuerte ? C.tinta : C.tinta2, whiteSpace: 'nowrap' }}>{concepto}</span>
      {detalle && <span className="ps-line__detalle" style={{ fontFamily: MONO, fontSize: 10, color: C.tinta3, whiteSpace: 'nowrap' }}>{detalle}</span>}
      <span className="ps-line__divider" style={{ flex: 1, borderBottom: `1px dotted ${C.regla}`, transform: 'translateY(-3px)' }} />
      <span className="ps-line__monto" style={{ fontFamily: MONO, fontSize: fuerte ? 15 : 13, fontWeight: fuerte ? 500 : 400, color: neg ? C.sello : fuerte ? C.tinta : C.tinta2, whiteSpace: 'nowrap' }}>
        {resta ? '−' : ''}{money(Math.abs(monto) * (resta ? 1 : Math.sign(monto) || 1))}
      </span>
    </div>
  )
}

/* ================================================================== */

// Estrategia de venta posterior al cálculo de importación: a partir del
// costo real puesto en mano (calculadora madre) resuelve por qué canal
// conviene vender y a qué precio exacto para lograr el margen buscado.
export default function PriceStrategy({ costoInicial, unidadesInicial, onPrecioSugerido }) {
  const [costo, setCosto] = useState('15000')
  const [envio, setEnvio] = useState('0')
  const [otros, setOtros] = useState('0')
  const [fiscal, setFiscal] = useState('mono')
  const [categoria, setCategoria] = useState('Hogar, muebles y jardín')
  const [margen, setMargen] = useState('30')
  const [pasarelaKey, setPasarelaKey] = useState('mp_10')
  const [canalKey, setCanalKey] = useState('ml_clasica')
  const [unidades, setUnidades] = useState('100')

  const [avanzado, setAvanzado] = useState(false)
  const [ivaRecuperable, setIvaRecuperable] = useState(true)
  const [mix, setMix] = useState(Object.fromEntries(MEDIOS.map((m) => [m.k, String(MIX_TIPICO[m.k])])))
  const [planes, setPlanes] = useState(Object.fromEntries(Object.entries(CANALES).map(([k, c]) => [k, c.plan || ''])))
  const [comisionManual, setComisionManual] = useState('')
  const [iibb, setIibb] = useState('2')
  const [inscriptoIIBB, setInscriptoIIBB] = useState(true)
  const [sirtac, setSirtac] = useState('1,5')
  const [retIVA, setRetIVA] = useState('1')
  const [retGan, setRetGan] = useState('3')
  const [retencionesRecuperables, setRetencionesRecuperables] = useState(true)
  const [tasaCapital, setTasaCapital] = useState('3')

  useEffect(() => { setComisionManual('') }, [canalKey, categoria, planes])

  // Se carga sola con el costo real que acaba de resolver la calculadora madre.
  useEffect(() => {
    if (costoInicial != null && costoInicial > 0) setCosto(String(Math.round(costoInicial)))
  }, [costoInicial])
  useEffect(() => {
    if (unidadesInicial != null && unidadesInicial > 0) setUnidades(String(Math.round(unidadesInicial)))
  }, [unidadesInicial])

  const ri = fiscal === 'ri'

  const entrada = useMemo(() => {
    const m = {}
    MEDIOS.forEach((x) => { m[x.k] = num(mix[x.k]) })
    return {
      costo: num(costo), envio: num(envio), otros: num(otros), ri, ivaRecuperable,
      categoria, canalKey, planes, pasarelaKey, mix: m,
      comisionManual: comisionManual.trim() === '' ? null : num(comisionManual),
      iibb: inscriptoIIBB ? num(iibb) : 0, sirtac: num(sirtac),
      retIVA: num(retIVA), retGan: num(retGan),
      retencionesRecuperables: inscriptoIIBB && retencionesRecuperables,
      tasaCapital: num(tasaCapital), margen: num(margen),
    }
  }, [costo, envio, otros, ri, ivaRecuperable, categoria, canalKey, planes, pasarelaKey,
      mix, comisionManual, iibb, inscriptoIIBB, sirtac, retIVA, retGan,
      retencionesRecuperables, tasaCapital, margen])

  const ranking = useMemo(() => {
    const filas = Object.keys(CANALES).map((k) => {
      const s = resolverPrecio(entrada, k)
      if (s.imposible) return { k, imposible: true, sobreVenta: s.sobreVenta }
      const d = desglosar(entrada, k, s.precio)
      return { k, precio: s.precio, ganancia: d.gananciaFinal, comision: d.comision, oscila: s.oscila }
    })
    return filas.sort((a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity))
  }, [entrada])

  const sel = useMemo(() => {
    const s = resolverPrecio(entrada, canalKey)
    if (s.imposible) return { imposible: true, sobreVenta: s.sobreVenta }
    return { ...desglosar(entrada, canalKey, s.precio), oscila: s.oscila }
  }, [entrada, canalKey])

  const canal = CANALES[canalKey]
  const bloque = { marginBottom: 20 }
  const mejor = ranking.find((r) => !r.imposible)
  const u = Math.max(1, Math.round(num(unidades)))

  // El análisis de marketing necesita el precio que resolvió este panel; sin
  // esto habría que pedirle al usuario un número que la app ya calculó.
  const precioMejor = mejor?.precio ?? null
  useEffect(() => {
    if (onPrecioSugerido) onPrecioSugerido(precioMejor)
  }, [precioMejor, onPrecioSugerido])

  const lote = useMemo(() => {
    if (sel.imposible) return null
    const inversion = num(costo) * u
    const cajaPorVenta = sel.costoProd + sel.gananciaFinal
    return {
      inversion,
      ganancia: sel.gananciaFinal * u,
      recupero: cajaPorVenta > 0 ? Math.ceil(inversion / cajaPorVenta) : null,
    }
  }, [sel, costo, u])

  /* Motor de avisos: mira los números y señala dónde está el problema */
  const avisos = useMemo(() => {
    const out = []
    if (sel.imposible) return out
    const m = num(margen)

    if (ri && m > 0) {
      const neto = m * 0.65
      const bruto = Math.round((m / 0.65) * 10) / 10
      out.push({
        id: 'gan', tono: 'dato',
        titulo: `Tu ${m}% se convierte en ${neto.toFixed(1)}% real`,
        cuerpo: `Como responsable inscripto pagás 35% de Ganancias sobre lo que te queda. Para llevarte ${m}% limpio al bolsillo, tenés que pedirle ${bruto}% acá.`,
        accion: { texto: `Poner ${bruto}%`, fn: () => setMargen(String(bruto)) },
      })
    }

    if (canal.ml) {
      const arriba = resolverPrecio({ ...entrada, margen: m + 5 }, canalKey)
      if (!arriba.imposible) {
        const salto = (arriba.precio - sel.precio) / sel.precio
        if (salto > 0.15) {
          out.push({
            id: 'tramo-sube', tono: 'riesgo',
            titulo: 'Estás pegado al salto de tramo',
            cuerpo: `Subir el margen 5 puntos no te lleva a ${money(sel.precio * 1.08)}: te lleva a ${money(arriba.precio)}. Cruzás un umbral de costo fijo de ML y el precio pega un salto del ${pct(salto, 0)}. Quedate bien abajo del umbral o saltalo con ganas, pero no te pares justo ahí.`,
          })
        }
      }
      const abajo = resolverPrecio({ ...entrada, margen: Math.max(0, m - 5) }, canalKey)
      if (!abajo.imposible) {
        const caida = (sel.precio - abajo.precio) / sel.precio
        if (caida > 0.15) {
          out.push({
            id: 'tramo-baja', tono: 'dato',
            titulo: `Resignando 5 puntos de margen, el precio baja ${pct(caida, 0)}`,
            cuerpo: `Bajando a ${m - 5}% podés publicar a ${money(abajo.precio)} en vez de ${money(sel.precio)}: caés al tramo de costo fijo anterior. Menos margen por unidad, mucho más competitivo en góndola.`,
            accion: { texto: `Probar ${m - 5}%`, fn: () => setMargen(String(m - 5)) },
          })
        }
      }
    }

    const rojos = sel.porMedio.filter((x) => x.ganancia <= 0 && x.w > 0)
    if (rojos.length) {
      const peso = rojos.reduce((s, x) => s + x.w, 0)
      out.push({
        id: 'rojos', tono: 'riesgo',
        titulo: `${rojos.length === 1 ? 'Un medio de pago te deja' : 'Varios medios de pago te dejan'} en pérdida`,
        cuerpo: `${rojos.map((x) => x.n.toLowerCase()).join(', ')} — y son el ${(peso * 100).toFixed(0)}% de tus ventas. A este precio, cada una de esas ventas te resta plata. O subís el precio, o sacás esas cuotas.`,
      })
    }

    if (ri && ivaRecuperable) {
      const credito = num(costo) - num(costo) / 1.21
      if (credito > 0) {
        out.push({
          id: 'credito', tono: 'dato',
          titulo: `${money(credito)} por unidad son crédito fiscal`,
          cuerpo: `De los ${money(num(costo))} que te cuesta, ${money(credito)} es IVA que recuperás. Sobre el lote son ${money(credito * u)}. Un monotributista con el mismo producto arranca con ese costo encima.`,
          accion: { texto: 'Ver como monotributo', fn: () => setFiscal('mono') },
        })
      }
    }

    const mlB = ranking.filter((f) => !f.imposible && CANALES[f.k].ml).sort((a, b) => a.precio - b.precio)[0]
    const prB = ranking.filter((f) => !f.imposible && !CANALES[f.k].ml).sort((a, b) => a.precio - b.precio)[0]
    if (mlB && prB) {
      const mlAlto = ranking.filter((f) => !f.imposible && CANALES[f.k].ml).sort((a, b) => b.ganancia - a.ganancia)[0]
      out.push({
        id: 'brecha', tono: 'ojo',
        titulo: 'El precio más bajo no es el que más te deja',
        cuerpo: `En tienda propia publicás a ${money(prB.precio)} y ganás ${money(prB.ganancia)}. En ${CANALES[mlAlto.k].nombre} ${CANALES[mlAlto.k].variante.toLowerCase()} publicás a ${money(mlAlto.precio)} y ganás ${money(mlAlto.ganancia)} — ${money((mlAlto.ganancia - prB.ganancia) * u)} más sobre las ${u} unidades. La pregunta no es dónde el precio es más bajo: es dónde podés vender las ${u}.`,
      })
    }

    if (sel.finan > 0 && sel.p.dias >= 8) {
      out.push({
        id: 'plazo', tono: 'dato',
        titulo: `Estás financiando ${sel.p.dias.toFixed(0)} días de cobro`,
        cuerpo: `Te cuesta ${money(sel.finan)} por unidad, ${money(sel.finan * u)} en el lote. Si el plazo te aprieta, mirá cuánto cambia cobrando al instante: pagás más arancel pero recuperás capital.`,
      })
    }

    const orden = { riesgo: 0, ojo: 1, dato: 2 }
    return out.sort((a, b) => orden[a.tono] - orden[b.tono]).slice(0, 4)
  }, [sel, entrada, canalKey, ranking, margen, ri, ivaRecuperable, costo, u, canal])

  return (
    <div style={{ background: C.papel, fontFamily: SANS, color: C.tinta }}>
      <style>{`
        .ps select { appearance: auto; }
        .ps select:focus, .ps input:focus { border-color: ${C.dorado} !important; box-shadow: 0 0 0 3px rgba(217,158,0,0.14) !important; outline: none !important; }
        .ps select option { background: #1a1a1a; color: #fff; }
        @media (max-width: 780px) {
          /* minmax(0, 1fr), not just 1fr: a bare 1fr track's automatic
             minimum is the max-content of what's inside it, so nowrap
             money/label spans deep in the results column were forcing this
             single-column track (and the whole modal) to 466px wide on a
             320px-wide dialog. minmax(0, ...) removes that floor so the
             track actually shrinks to the container. */
          .ps .dos-col { grid-template-columns: minmax(0, 1fr) !important; min-width: 0; }
          .ps .ps-main-grid > div:first-child { position: static !important; max-height: none !important; border-right: none !important; border-bottom: 1px solid ${C.regla} !important; }
          .ps .ps-main-grid > div { min-width: 0 !important; padding-left: 16px !important; padding-right: 16px !important; }
          .ps > div:first-child, .ps > div:last-child { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @media (max-width: 480px) {
          .ps .ps-lote { grid-template-columns: 1fr !important; }
          /* Renglon rows pack concepto + detalle + monto nowrap on one line;
             on narrow phones some combos (eg. "Costo fijo por unidad" +
             "venta menor a $33.000" + amount) don't fit. Drop detalle to
             its own line instead of letting the row force horizontal
             scroll on the whole modal. */
          .ps .ps-line { flex-wrap: wrap; row-gap: 2px; }
          .ps .ps-line__concepto { order: 1; }
          .ps .ps-line__divider { order: 2; }
          .ps .ps-line__monto { order: 3; }
          .ps .ps-line__detalle { order: 4; flex-basis: 100%; white-space: normal !important; }
        }
        @keyframes ps-latido { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .3; transform: scale(.72); } }
        .ps .late { animation: ps-latido 1.7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .ps .late { animation: none; } }
        .ps ::-webkit-scrollbar { width: 3px; }
        .ps ::-webkit-scrollbar-track { background: transparent; }
        .ps ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.14); border-radius: 2px; }
      `}</style>

      <div className="ps">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div style={{ padding: '20px 28px 18px', borderBottom: `1px solid ${C.regla}` }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.tinta3, marginBottom: 6 }}>
            VEGROUP · Estrategia de venta
          </div>
          {/* h2 y no h1: la demo vive dentro del landing, que ya tiene su h1. */}
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: '-0.03em', color: C.tinta }}>
            A cuánto vender y dónde conviene
          </h2>
        </div>

        {/* ── Two-column body ──────────────────────────────────────────── */}
        <div className="dos-col ps-main-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', alignItems: 'start' }}>

          {/* ════ LEFT — PREGUNTAS (sticky sidebar) ════ */}
          <div style={{
            position: 'sticky', top: 0,
            maxHeight: 'min(90vh, 920px)',
            overflowY: 'auto', scrollbarWidth: 'thin',
            padding: '24px 20px 28px 28px',
            borderRight: `1px solid ${C.regla}`,
          }}>
            <div style={bloque}>
              <Etiqueta nota="por unidad, puesto acá">¿Cuánto te costó el producto?</Etiqueta>
              <Campo valor={costo} onChange={setCosto} prefijo="$" />
            </div>

            <div style={bloque}>
              <Etiqueta nota="cuántas trajiste">Unidades del lote</Etiqueta>
              <Campo valor={unidades} onChange={setUnidades} sufijo="u" />
            </div>

            <div style={bloque}>
              <Etiqueta>¿Qué vendés?</Etiqueta>
              <Selector valor={categoria} onChange={setCategoria}>
                {Object.keys(CATEGORIAS_ML).map((k) => <option key={k} value={k}>{k}</option>)}
              </Selector>
            </div>

            <div style={bloque}>
              <Etiqueta>¿Cómo estás inscripto?</Etiqueta>
              <Pestanias valor={fiscal} onChange={setFiscal} items={[
                { k: 'mono', t: 'Monotributo' }, { k: 'ri', t: 'Resp. inscripto' }]} />
            </div>

            <div style={bloque}>
              <Etiqueta nota="sobre la venta">¿Cuánto querés ganar?</Etiqueta>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {['20', '30', '40', '50'].map((v) => (
                  <button key={v} type="button" onClick={() => setMargen(v)}
                    style={{ flex: 1, padding: '7px 0', cursor: 'pointer', fontFamily: MONO, fontSize: 12.5,
                      color: margen === v ? '#000' : C.tinta2,
                      background: margen === v ? '#fff' : 'transparent',
                      border: `1px solid ${margen === v ? 'transparent' : C.regla}`, borderRadius: 6 }}>{v}%</button>
                ))}
              </div>
              <Campo valor={margen} onChange={setMargen} sufijo="%" />
            </div>

            <div style={bloque}>
              <Etiqueta nota="solo aplica a tienda propia">¿Por dónde cobrás?</Etiqueta>
              <Selector valor={pasarelaKey} onChange={setPasarelaKey}>
                {Object.entries(PASARELAS).map(([k, p]) => <option key={k} value={k}>{p.n} — {p.detalle}</option>)}
              </Selector>
              <p style={{ margin: '8px 0 0', fontSize: 11.5, color: C.tinta3, lineHeight: 1.5 }}>
                En Mercado Libre el cobro ya viene incluido en su comisión.
              </p>
            </div>

            <div style={{ ...bloque, paddingTop: 16, borderTop: `1px solid ${C.regla}` }}>
              <button type="button" onClick={() => setAvanzado(!avanzado)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.tinta3 }}>
                {avanzado ? '− ocultar ajustes' : '+ ajustes avanzados'}
              </button>
              {!avanzado && (
                <p style={{ margin: '8px 0 0', fontSize: 11.5, color: C.tinta3, lineHeight: 1.5 }}>
                  Envío, impuestos, mix de pagos y comisión exacta. Ya vienen cargados con valores típicos.
                </p>
              )}
            </div>

            {avanzado && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.regla}`, borderRadius: 8, padding: '16px' }}>
                <div className="dos-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div><Etiqueta>Envío que absorbés</Etiqueta><Campo valor={envio} onChange={setEnvio} prefijo="$" chico /></div>
                  <div><Etiqueta>Packaging</Etiqueta><Campo valor={otros} onChange={setOtros} prefijo="$" chico /></div>
                </div>

                <Etiqueta nota="pisa la tabla de referencia">Comisión real del canal</Etiqueta>
                <Campo valor={comisionManual} onChange={setComisionManual} sufijo="%" chico />
                <p style={{ margin: '6px 0 16px', fontSize: 11, color: C.tinta3, lineHeight: 1.5 }}>
                  Vacío usa la tabla. El número exacto está en Costos de venta de tu cuenta.
                </p>

                {!canal.ml && (
                  <div style={{ marginBottom: 16 }}>
                    <Etiqueta>Plan de {canal.nombre}</Etiqueta>
                    <Selector valor={planes[canalKey]} onChange={(v) => setPlanes({ ...planes, [canalKey]: v })}>
                      {Object.entries(canal.planes).map(([k, v]) => <option key={k} value={k}>{k} — {v}%</option>)}
                    </Selector>
                  </div>
                )}

                <Etiqueta nota="qué porcentaje paga con cada medio">Mix de pagos</Etiqueta>
                {MEDIOS.map((m) => (
                  <div key={m.k} style={{ display: 'grid', gridTemplateColumns: '1fr 64px', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: C.tinta2 }}>{m.n}</span>
                    <Campo chico valor={mix[m.k]} onChange={(v) => setMix({ ...mix, [m.k]: v })} sufijo="%" />
                  </div>
                ))}

                <div style={{ marginTop: 16 }}>
                  <Casilla checked={inscriptoIIBB} onChange={setInscriptoIIBB}>Inscripto en Ingresos Brutos</Casilla>
                  {inscriptoIIBB && <Casilla checked={retencionesRecuperables} onChange={setRetencionesRecuperables}>Recupero las retenciones como pago a cuenta</Casilla>}
                  {ri && <Casilla checked={ivaRecuperable} onChange={setIvaRecuperable}>El costo trae IVA que computo</Casilla>}
                </div>

                <div className="dos-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                  {inscriptoIIBB && <div><Etiqueta>IIBB</Etiqueta><Campo valor={iibb} onChange={setIibb} sufijo="%" chico /></div>}
                  <div><Etiqueta>SIRTAC</Etiqueta><Campo valor={sirtac} onChange={setSirtac} sufijo="%" chico /></div>
                  {ri && <><div><Etiqueta>Ret. IVA</Etiqueta><Campo valor={retIVA} onChange={setRetIVA} sufijo="%" chico /></div>
                    <div><Etiqueta>Ret. Ganancias</Etiqueta><Campo valor={retGan} onChange={setRetGan} sufijo="%" chico /></div></>}
                  <div><Etiqueta nota="mensual">Costo del capital</Etiqueta><Campo valor={tasaCapital} onChange={setTasaCapital} sufijo="%" chico /></div>
                </div>
              </div>
            )}
          </div>

          {/* ════ RIGHT — RESULTADO ════ */}
          <div style={{ padding: '24px 28px 28px 24px' }}>

            {mejor && (
              <div style={{ background: '#ffffff', color: '#0a0a0a', padding: '20px 24px', marginBottom: 20, borderRadius: 8 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 10 }}>
                  Donde más barato podés vender
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {money(mejor.precio)}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>en {CANALES[mejor.k].nombre}</span>
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(10,10,10,0.10)', fontFamily: MONO, fontSize: 11.5, opacity: 0.65 }}>
                  Ganás {money(mejor.ganancia)} por unidad · {CANALES[mejor.k].variante}
                </div>
              </div>
            )}

            {lote && (
              <div className="ps-lote" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: C.regla, borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
                {[
                  { l: 'Invertido en el lote', v: money(lote.inversion) },
                  { l: `Ganancia por las ${u} u.`, v: money(lote.ganancia) },
                  { l: 'Ventas para recuperar', v: lote.recupero ? `${lote.recupero} u.` : '—' },
                ].map((x) => (
                  <div key={x.l} style={{ background: C.ficha, padding: '12px 14px' }}>
                    <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.tinta3, marginBottom: 5 }}>{x.l}</div>
                    <div style={{ fontFamily: MONO, fontSize: 15, color: C.tinta, fontWeight: 500 }}>{x.v}</div>
                  </div>
                ))}
              </div>
            )}

            {avisos.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                {avisos.map((a) => {
                  const col = a.tono === 'riesgo' ? C.sello : a.tono === 'ojo' ? C.verde : C.dorado
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: 11,
                      background: C.ficha,
                      border: `1px solid ${C.regla}`,
                      borderLeft: `3px solid ${col}`,
                      borderRadius: '0 8px 8px 0',
                      padding: '13px 15px', marginBottom: 8 }}>
                      <span className="late" style={{ width: 7, height: 7, borderRadius: '50%', background: col, flexShrink: 0, marginTop: 6 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4, color: C.tinta }}>{a.titulo}</div>
                        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: C.tinta2 }}>{a.cuerpo}</p>
                        {a.accion && (
                          <button type="button" onClick={a.accion.fn}
                            style={{ marginTop: 9, padding: '5px 12px', cursor: 'pointer', fontFamily: MONO, fontSize: 11, color: C.dorado, background: 'transparent', border: `1px solid rgba(217,158,0,0.4)`, borderRadius: 4 }}>
                            {a.accion.texto}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.tinta3, marginBottom: 8 }}>
              Precio necesario en cada canal para ganar {num(margen)}%
            </div>
            <div style={{ border: `1px solid ${C.regla}`, borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
              {ranking.map((f, i) => {
                const c = CANALES[f.k]
                const activo = f.k === canalKey
                return (
                  <div key={f.k} onClick={() => setCanalKey(f.k)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer',
                      borderTop: i === 0 ? 'none' : `1px solid ${C.regla}`,
                      borderLeft: activo ? `3px solid ${C.dorado}` : '3px solid transparent',
                      background: activo ? C.resalte : 'transparent',
                      transition: 'background 0.12s' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: activo ? 600 : 400, color: C.tinta }}>{c.nombre}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.tinta3 }}>
                        {c.variante}{f.comision != null ? ` · comisión ${f.comision}%` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {f.imposible
                        ? <span style={{ fontFamily: MONO, fontSize: 12, color: C.sello }}>no da margen</span>
                        : <>
                            <div style={{ fontFamily: MONO, fontSize: 15, color: C.tinta }}>{money(f.precio)}</div>
                            <div style={{ fontFamily: MONO, fontSize: 10, color: C.verde }}>ganás {money(f.ganancia)}</div>
                          </>}
                    </div>
                  </div>
                )
              })}
            </div>

            {sel.imposible ? (
              <div style={{ background: C.ficha,
                border: `1px solid ${C.regla}`,
                borderLeft: `3px solid ${C.sello}`,
                borderRadius: '0 8px 8px 0',
                padding: '18px 20px' }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.sello, marginBottom: 8 }}>No da margen</div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: C.tinta2 }}>
                  En este canal se va el {pct(sel.sobreVenta, 0)} del precio antes de tu ganancia.
                  Con {num(margen)}% encima no cierra. Bajá el margen o elegí otro canal.
                </p>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.tinta3, marginBottom: 8 }}>
                  Detalle en {canal.nombre} · {canal.variante}
                </div>
                <div style={{ background: C.ficha, border: `1px solid ${C.regla}`, borderRadius: 8, padding: '16px 20px 18px', marginBottom: 24 }}>
                  <Renglon concepto="Precio de venta" monto={sel.precio} fuerte />
                  {ri && <Renglon concepto="IVA dentro del precio" detalle="21%" monto={sel.ivaDebito} resta borde />}
                  <Renglon concepto={`Comisión ${canal.nombre}`} detalle={`${sel.comision}%`} monto={sel.comisionCanal} resta borde />
                  {sel.fijo > 0 && <Renglon concepto="Costo fijo por unidad" detalle="venta menor a $33.000" monto={sel.fijo} resta />}
                  {sel.arancelPago > 0 && <Renglon concepto="Costo de cobrar" detalle={`promedio ${pct(sel.p.arancel, 2)}`} monto={sel.arancelPago} resta />}
                  {!ri && sel.ivaCargos > 0 && <Renglon concepto="IVA sobre esos cargos" monto={sel.ivaCargos} resta />}
                  {sel.iibb > 0 && <Renglon concepto="Ingresos brutos" detalle={`${num(iibb)}%`} monto={sel.iibb} resta />}
                  {sel.retComoCosto > 0 && <Renglon concepto="Retenciones que no recuperás" monto={sel.retComoCosto} resta />}
                  {sel.finan > 0 && <Renglon concepto="Plata parada hasta cobrar" detalle={`${sel.p.dias.toFixed(0)} días`} monto={sel.finan} resta />}
                  {sel.envio > 0 && <Renglon concepto="Envío" monto={sel.envio} resta />}
                  <Renglon concepto="Costo del producto" detalle={ri && ivaRecuperable ? 'neto de IVA' : null} monto={sel.costoProd} resta borde />
                  {sel.otros > 0 && <Renglon concepto="Packaging" monto={sel.otros} resta />}
                  <Renglon concepto={ri ? 'Antes de Ganancias' : 'Te queda'} monto={sel.ganancia} fuerte borde />
                  {ri && <>
                    <Renglon concepto="Impuesto a las Ganancias" detalle="35%" monto={sel.gan35} resta />
                    <Renglon concepto="Te queda" monto={sel.gananciaFinal} fuerte borde />
                  </>}
                  {entrada.retencionesRecuperables && sel.retTotal > 0 && (
                    <Renglon tenue borde concepto="Retenciones a recuperar" detalle="no es costo, es plata trabada" monto={sel.retTotal} />
                  )}
                </div>

                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.tinta3, marginBottom: 8 }}>
                  A ese precio, según cómo te pague el cliente
                </div>
                <div style={{ border: `1px solid ${C.regla}`, borderRadius: 8, overflow: 'hidden' }}>
                  {sel.porMedio.map((m, i) => {
                    const malo = m.ganancia <= 0
                    return (
                      <div key={m.k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: i === 0 ? 'none' : `1px solid ${C.regla}` }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, color: C.tinta }}>{m.n}</div>
                          <div style={{ fontFamily: MONO, fontSize: 10, color: C.tinta3 }}>{(m.w * 100).toFixed(0)}% de tus ventas</div>
                        </div>
                        <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ fontFamily: MONO, fontSize: 13.5, color: malo ? C.sello : C.tinta }}>{money(m.ganancia)}</div>
                          <div style={{ fontFamily: MONO, fontSize: 10, color: malo ? C.sello : C.verde }}>{pct(m.margen)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '14px 28px 20px', borderTop: `1px solid ${C.regla}`, fontSize: 11.5, color: C.tinta3, lineHeight: 1.65 }}>
          Los valores por defecto son de referencia 2026. Mercado Libre ajusta comisiones por
          categoría y por provincia: el número exacto de tu publicación está en Costos de venta
          dentro de tu cuenta, y podés cargarlo en ajustes avanzados. No están incluidos
          publicidad, devoluciones ni almacenamiento.
        </div>
      </div>
    </div>
  )
}
