'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { identifyNCM, getDolar } from '../../lib/demo/api.js'
import {
  calcAllRoutes,
  calcAllIntegral,
  ROUTES,
  PEQUEÑOS_ENVIOS,
  PE_LIMITS,
  INTEGRAL_THRESHOLD,
  INTEGRAL_VOL_RATE,
  fmtUSD,
  fmtARS,
} from '../../lib/demo/calc.js'
import RouteBreakdown from './RouteBreakdown.jsx'
import MarketingAnalysis from './MarketingAnalysis.jsx'
import PriceStrategy from './PriceStrategy.jsx'
import LeadGate from './LeadGate.jsx'

// ─────────────────────────────────────────────────────────────────────────
// COTIZADOR VEGROUP — demo pública dentro del landing:
//   1. El usuario escribe el producto y aprieta Identificar.
//   2. El servidor busca y elige la posición NCM (una sola llamada).
//   3. Se muestra y selecciona la de mayor probabilidad (con su %).
//   4. El usuario carga FOB, peso, dimensiones y elige el depósito.
//   5. Presiona COTIZAR y sale el resumen completo.
//   6. Deja su contacto y recibe el análisis de comercialización.
// ─────────────────────────────────────────────────────────────────────────

// Mismo destino que el CTA del landing (ver WHATSAPP_HREF en app/page.tsx).
const WA_PHONE = '5491176392303'
const waHref = (texto) => `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(texto)}`

// La API devuelve ncm + sufijo por separado; el resto de la calculadora
// trabaja con el SIM completo, como la base local del cotizador original.
function toRecord(x) {
  if (!x || !x.ncm) return null
  return {
    sim: x.sufijo ? `${x.ncm}.${x.sufijo}` : x.ncm,
    descripcion: x.descripcion || '',
    die: Number(x.die) || 0,
    te: Number(x.te) || 0,
    iva: Number(x.iva) || 0,
  }
}

// Vista previa bloqueada (DemoFlow.jsx): el flujo entero ya resuelto con un
// caso de ejemplo, para que se vean todas las etapas. Los números son de
// muestra y se renderizan borrosos; nunca se llama a la IA ni al TC real.
const PREVIEW = {
  producto: 'Auriculares bluetooth',
  form: { fob: '1200', pesoKg: '18', unidades: '100', largo: '50', ancho: '40', alto: '35', cajas: '2', dolarBN: '1500' },
  selected: { sim: '8518.30.00.900Z', descripcion: 'Auriculares, incluso combinados con micrófono', die: 20, te: 3, iva: 21 },
  ai: { confianza: 92, alternativas: [] },
  deposito: 'miami',
}

function previewResults() {
  const { form, selected } = PREVIEW
  return calcAllRoutes({ ...form, cajas: Number(form.cajas), die: selected.die, te: selected.te, iva: selected.iva })
}

export default function AgentQuote({ onClose, preview = false }) {
  const [regimen, setRegimen] = useState('general') // 'general' | 'pequeños' | 'integral'
  const [producto, setProducto] = useState(preview ? PREVIEW.producto : '')
  const [form, setForm] = useState(preview ? PREVIEW.form : {
    fob: '',
    pesoKg: '',
    unidades: '',
    largo: '',
    ancho: '',
    alto: '',
    cajas: '1',
    dolarBN: '',
  })
  const [deposito, setDeposito] = useState(preview ? PREVIEW.deposito : null) // id de ruta elegida
  const [dolarInfo, setDolarInfo] = useState(null)

  // Detección de NCM: siempre a pedido del usuario. El auto-debounce del
  // cotizador original disparaba la llamada de IA en cada pausa al tipear.
  const [detStatus, setDetStatus] = useState(preview ? 'done' : 'idle') // idle | detecting | done | error
  const [detError, setDetError] = useState('')
  const [cuota, setCuota] = useState(false) // 429: simulación gratis ya usada
  const [ai, setAi] = useState(preview ? PREVIEW.ai : null)
  const [selected, setSelected] = useState(preview ? PREVIEW.selected : null) // posición elegida
  const runId = useRef(0)

  const [results, setResults] = useState(preview ? previewResults : null) // se genera al presionar COTIZAR
  const [refNumber, setRefNumber] = useState(preview ? 'VG-00000000-0000' : '')
  const [leadOk, setLeadOk] = useState(preview)
  const [precioSugerido, setPrecioSugerido] = useState(null)

  const set = (field) => (e) =>
    setForm((s) => ({ ...s, [field]: e.target.value }))

  // Cambio de régimen: setea o limpia la NCM fija.
  // En la vista previa el régimen nunca cambia y este reset de montaje
  // borraría el caso de ejemplo.
  const firstRegimen = useRef(true)
  useEffect(() => {
    if (preview && firstRegimen.current) {
      firstRegimen.current = false
      return
    }
    setResults(null)
    setCuota(false)
    if (regimen === 'pequeños') {
      setSelected(PEQUEÑOS_ENVIOS)
      setDetStatus('done')
      setAi(null)
      setDetError('')
    } else {
      setSelected(null)
      setDetStatus('idle')
      setAi(null)
      setDetError('')
    }
  }, [regimen, preview])

  // TC BNA automático al entrar (editable por si la fuente falla).
  useEffect(() => {
    if (preview) return
    let alive = true
    getDolar()
      .then((d) => {
        if (!alive || !d) return
        setDolarInfo(d)
        setForm((s) => (s.dolarBN === '' ? { ...s, dolarBN: String(d.valor) } : s))
      })
      .catch(() => {}) // si falla, el campo queda a mano
    return () => {
      alive = false
    }
  }, [preview])

  // Editar el producto invalida la NCM detectada: cotizar con la posición de
  // otro producto daría un número creíble y equivocado.
  function handleProducto(e) {
    setProducto(e.target.value)
    if (regimen === 'general' && detStatus !== 'idle') {
      runId.current++
      setDetStatus('idle')
      setAi(null)
      setSelected(null)
      setDetError('')
      setResults(null)
    }
  }

  async function detect() {
    const q = producto.trim()
    if (q.length < 3 || detStatus === 'detecting') return
    const id = ++runId.current
    setDetStatus('detecting')
    setDetError('')
    setCuota(false)
    setAi(null)
    setSelected(null)
    setResults(null)

    try {
      const res = await identifyNCM(q)
      if (id !== runId.current) return // llegó una búsqueda más nueva
      const record = toRecord(res)
      if (!record) throw new Error('No se pudo determinar la posición arancelaria. Probá con otras palabras.')
      setAi(res)
      setSelected(record)
      setDetStatus('done')
    } catch (err) {
      if (id !== runId.current) return
      if (err.status === 429) {
        setCuota(true)
        const prev = err.data?.resultadoPrevio
        const record = toRecord(prev)
        if (record) {
          setAi(prev)
          setSelected(record)
          setDetStatus('done')
        } else {
          setDetStatus('idle')
        }
        return
      }
      setDetStatus('error')
      setDetError(err.message || 'Error inesperado.')
    }
  }

  const datosCompletos = regimen === 'integral'
    ? Number(form.pesoKg) > 0 &&
      Number(form.largo) > 0 &&
      Number(form.ancho) > 0 &&
      Number(form.alto) > 0
    : Number(form.fob) > 0 &&
      Number(form.pesoKg) > 0 &&
      Number(form.unidades) > 0 &&
      Number(form.largo) > 0 &&
      Number(form.ancho) > 0 &&
      Number(form.alto) > 0

  const pequeñosOk = regimen !== 'pequeños' || (
    Number(form.fob) <= PE_LIMITS.maxFob &&
    Number(form.unidades) <= PE_LIMITS.maxUnidades
  )

  const ready = regimen === 'integral'
    ? datosCompletos && deposito
    : detStatus === 'done' && selected && datosCompletos && deposito && pequeñosOk

  const cajas = Math.max(1, Math.round(Number(form.cajas) || 1))

  // 5) COTIZAR: se calcula y se muestra el resumen del depósito elegido.
  function handleQuote(e) {
    e?.preventDefault()
    if (!ready) return
    const inp = {
      pesoKg: form.pesoKg,
      cajas,
      largo: form.largo,
      ancho: form.ancho,
      alto: form.alto,
      unidades: form.unidades || '1',
      dolarBN: form.dolarBN,
    }
    const res = regimen === 'integral'
      ? calcAllIntegral(inp)
      : calcAllRoutes({ ...inp, fob: form.fob, die: selected.die, te: selected.te, iva: selected.iva })
    setResults(res)
    const d = new Date()
    setRefNumber(
      `VG-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`,
    )
    requestAnimationFrame(() => {
      document.getElementById('agente-resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const currentResult =
    results && deposito ? results.results.find((x) => x.route === deposito) : null

  // Resumen de texto para mandarle a VEGROUP por WhatsApp.
  function whatsappText() {
    if (!currentResult) return 'Hola, vengo de la web de VeGroup. Quiero cotizar una importación.'
    const r = currentResult
    if (regimen === 'integral') {
      return [
        `Hola, vengo de la calculadora de VeGroup (${refNumber}).`,
        `Courier integral todo incluido`,
        producto ? `Producto: ${producto}` : null,
        `Depósito: ${r.label} (${r.pais}) · ${r.tiempoEstimado}`,
        `${r.pesoReal.toFixed(1)} kg · ${fmtUSD(r.rate)}/kg${r.excesoVol > 0 ? ` + ${r.excesoVol.toFixed(1)} kg vol. × ${fmtUSD(INTEGRAL_VOL_RATE)}/kg` : ''}`,
        `TOTAL: ${fmtUSD(r.totalUSD)}`,
        r.totalPesos != null ? `Total en pesos: ${fmtARS(r.totalPesos)}` : null,
      ].filter(Boolean).join('\n')
    }
    return [
      `Hola, vengo de la calculadora de VeGroup (${refNumber}).`,
      `Producto: ${producto}`,
      `Posición NCM: ${selected?.sim}${regimen === 'pequeños' ? ' (Pequeños envíos · franquicia)' : ''}`,
      `Depósito: ${r.label} (${r.pais}) · ${r.tiempoEstimado}`,
      `FOB ${fmtUSD(Number(form.fob))} · ${form.pesoKg} kg · ${form.unidades} unidades`,
      `TOTAL: ${fmtUSD(r.totalUSD)}`,
      r.totalPesos != null ? `Total en pesos: ${fmtARS(r.totalPesos)}` : null,
      `Costo por unidad: ${fmtUSD(r.costoPorUnidad)}`,
    ].filter(Boolean).join('\n')
  }

  const resumenCostos = useMemo(() => {
    if (!results || !deposito || regimen === 'integral') return null
    const r = results.results.find((x) => x.route === deposito)
    if (!r) return null
    return {
      rutaMasConveniente: r.label,
      costoRealEfectivo: Number(r.costoRealEfectivo.toFixed(2)),
      costoPorUnidad: Number(r.costoPorUnidad.toFixed(2)),
      unidades: r.unidades,
      monedaCosto: 'USD',
    }
  }, [results, deposito, regimen])

  // Costo real puesto en mano (USD → ARS con el TC del día) para arrancar
  // la calculadora de estrategia de venta con el número que ya resolvió
  // la calculadora madre.
  const costoPorUnidadARS = useMemo(() => {
    if (!resumenCostos) return null
    const tc = Number(form.dolarBN) || dolarInfo?.valor || 0
    if (!tc) return null
    return resumenCostos.costoPorUnidad * tc
  }, [resumenCostos, form.dolarBN, dolarInfo])

  // Estable: PriceStrategy lo usa como dependencia de un efecto y una función
  // nueva por render lo dispararía en loop.
  const handlePrecioSugerido = useCallback((v) => setPrecioSugerido(v), [])

  function pickAlternative(alt) {
    const rec = toRecord(alt)
    if (rec) {
      setSelected(rec)
      setResults(null)
    }
  }

  return (
    <>
      {/* ── Selector de régimen ─────────────────────────────────────────── */}
      <div className="regime-selector">
        <div
          className={`regime-option ${regimen === 'integral' ? 'active' : ''}`}
          onClick={() => setRegimen('integral')}
        >
          <div className="regime-option__title">Courier integral</div>
          <div className="regime-option__desc">Todo incluido · tarifa por kg · sin aranceles</div>
        </div>
        <div
          className={`regime-option ${regimen === 'pequeños' ? 'active' : ''}`}
          onClick={() => setRegimen('pequeños')}
        >
          <div className="regime-option__title">Pequeños envíos</div>
          <div className="regime-option__desc">
            FOB ≤ US$ {PE_LIMITS.maxFob} · hasta {PE_LIMITS.maxUnidades} unidades · franquicia
          </div>
        </div>
        <div
          className={`regime-option ${regimen === 'general' ? 'active' : ''}`}
          onClick={() => setRegimen('general')}
        >
          <div className="regime-option__title">Courier comercial</div>
          <div className="regime-option__desc">Cualquier monto · detección automática de NCM</div>
        </div>
      </div>

      {/* ── 1. Producto → la IA detecta la NCM ──────────────────────────── */}
      {regimen !== 'integral' && (
      <div className="card">
        <div className="card__title">
          <span className="section-num">1</span>Producto
        </div>
        <div className="card__subtitle">
          {regimen === 'pequeños'
            ? 'Escribí tu producto. La posición arancelaria se asigna automáticamente bajo el régimen de pequeños envíos.'
            : 'Escribí tu producto y apretá Identificar. La IA busca la posición arancelaria correcta en la base oficial AFIP/Malvina (33.000 posiciones).'}
        </div>

        <div className="field">
          <input
            value={producto}
            onChange={handleProducto}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && regimen === 'general') {
                e.preventDefault()
                detect()
              }
            }}
            placeholder="Ej: zapas, gimbal, auriculares bluetooth, celu…"
            aria-label="Producto"
            maxLength={120}
          />
        </div>

        {regimen === 'general' && (
          <button
            type="button"
            className="btn btn-gold mt"
            onClick={detect}
            disabled={producto.trim().length < 3 || detStatus === 'detecting'}
          >
            {detStatus === 'detecting' ? <span className="spinner" /> : 'Identificar posición arancelaria'}
          </button>
        )}

        {/* ── Pequeños envíos: NCM fija ─────────────────────────────────── */}
        {regimen === 'pequeños' && selected && (
          <div className="ncm-hit mt">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              <div className="ncm-hit__code">{selected.sim}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Régimen simplificado · franquicia
              </div>
            </div>
            <div style={{ marginTop: 4 }}>{selected.descripcion}</div>
            <div className="chips">
              <span className="chip" style={{ cursor: 'default', color: 'var(--green)', borderColor: 'rgba(47,122,70,.35)' }}>
                DIE {selected.die}%
              </span>
              <span className="chip" style={{ cursor: 'default', color: 'var(--green)', borderColor: 'rgba(47,122,70,.35)' }}>
                TE {selected.te}%
              </span>
              <span className="chip" style={{ cursor: 'default', color: 'var(--green)', borderColor: 'rgba(47,122,70,.35)' }}>
                IVA {selected.iva}%
              </span>
            </div>
          </div>
        )}

        {/* ── Courier comercial (régimen general): detección con IA ──────── */}
        {regimen === 'general' && detStatus === 'detecting' && (
          <div className="alert info mt">
            <span className="spinner" style={{ marginRight: 8 }} />
            La IA está detectando la posición arancelaria…
          </div>
        )}
        {regimen === 'general' && detStatus === 'error' && <div className="alert error mt">{detError}</div>}

        {regimen === 'general' && cuota && (
          <div className="alert info mt">
            Ya usaste tu simulación gratis. {selected ? 'Abajo queda el último resultado que generaste. ' : ''}
            Escribinos y hacemos la cotización completa con vos.{' '}
            <a
              className="btn btn-ghost mt"
              href={waHref('Hola, vengo de la calculadora de VeGroup y quiero cotizar una importación.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hablar por WhatsApp
            </a>
          </div>
        )}

        {regimen === 'general' && detStatus === 'done' && ai && selected && (
          <div className="ncm-hit mt">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              <div className="ncm-hit__code">{selected.sim}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Probabilidad: <strong style={{ color: 'var(--gold)' }}>{ai.confianza}%</strong> · seleccionada
              </div>
            </div>
            <div style={{ marginTop: 4 }}>{selected.descripcion}</div>
            <div className="confidence-bar">
              <span style={{ width: `${ai.confianza}%` }} />
            </div>
            <div className="chips">
              <span className="chip" style={{ cursor: 'default', color: 'var(--red)', borderColor: 'rgba(239,83,80,.35)' }}>
                DIE {selected.die}%
              </span>
              <span className="chip" style={{ cursor: 'default', color: 'var(--red)', borderColor: 'rgba(239,83,80,.35)' }}>
                TE {selected.te}%
              </span>
              <span className="chip" style={{ cursor: 'default', color: 'var(--green)', borderColor: 'rgba(53,194,106,.35)' }}>
                IVA {selected.iva}%
              </span>
            </div>
            {ai.fuente === 'local' && (
              <div className="hint" style={{ marginTop: 10 }}>
                Estimación por coincidencia de texto (sin IA disponible en este momento): mirá la probabilidad y revisá las alternativas.
              </div>
            )}
            {ai.razonamiento && <div className="hint" style={{ marginTop: 10 }}>💡 {ai.razonamiento}</div>}

            {ai.alternativas?.length > 0 && (
              <div className="mt">
                <div className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.6px' }}>
                  Alternativas
                </div>
                {ai.alternativas.map((alt) => {
                  const rec = toRecord(alt)
                  if (!rec) return null
                  return (
                    <div
                      key={rec.sim}
                      className={`candidate ${selected.sim === rec.sim ? 'selected' : ''}`}
                      onClick={() => pickAlternative(alt)}
                    >
                      <div>
                        <strong style={{ color: 'var(--gold)' }}>{rec.sim}</strong> — {rec.descripcion}
                        {alt.motivo && <div className="hint">{alt.motivo}</div>}
                      </div>
                      <div className="muted" style={{ whiteSpace: 'nowrap' }}>
                        DIE {rec.die}% · TE {rec.te}%
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* ── Datos del envío + depósito ─────────────────────────────────── */}
      <div className="card">
        <div className="card__title">
          <span className="section-num">{regimen === 'integral' ? '1' : '2'}</span>
          {regimen === 'integral' ? 'Courier integral — todo incluido' : 'Datos del envío'}
        </div>
        <div className="card__subtitle">
          {regimen === 'integral'
            ? 'Tarifa neta por kg. Sin impuestos, sin handling, sin aranceles. Solo peso y volumen.'
            : 'Cargá los datos de tu paquete y elegí a qué depósito VEGROUP lo enviás.'}
        </div>

        <form onSubmit={handleQuote}>
          {regimen !== 'integral' && (
          <div className="grid grid-3">
            <div className="field">
              <label>Precio FOB (USD)</label>
              <input type="number" min="0" step="0.01" value={form.fob} onChange={set('fob')} placeholder="0.00" />
            </div>
            <div className="field">
              <label>Peso del paquete (kg)</label>
              <input type="number" min="0" step="0.01" value={form.pesoKg} onChange={set('pesoKg')} placeholder="0" />
            </div>
            <div className="field">
              <label>Unidades totales</label>
              <input type="number" min="1" step="1" value={form.unidades} onChange={set('unidades')} placeholder="1" />
            </div>
          </div>
          )}

          {regimen === 'integral' && (
          <div className="grid grid-2">
            <div className="field">
              <label>Peso del paquete (kg)</label>
              <input type="number" min="0" step="0.01" value={form.pesoKg} onChange={set('pesoKg')} placeholder="0" />
            </div>
            <div className="field">
              <label>Unidades (opcional)</label>
              <input type="number" min="1" step="1" value={form.unidades} onChange={set('unidades')} placeholder="1" />
            </div>
          </div>
          )}

          <div className="grid grid-2 mt">
            <div className="field">
              <label>Dimensiones por caja (cm)</label>
              <div className="grid grid-3">
                <input type="number" min="0" step="0.1" value={form.largo} onChange={set('largo')} placeholder="Largo" />
                <input type="number" min="0" step="0.1" value={form.ancho} onChange={set('ancho')} placeholder="Ancho" />
                <input type="number" min="0" step="0.1" value={form.alto} onChange={set('alto')} placeholder="Alto" />
              </div>
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label>Cajas / bultos</label>
                <input type="number" min="1" step="1" value={form.cajas} onChange={set('cajas')} placeholder="1" />
              </div>
              <div className="field">
                <label>TC BNA{dolarInfo?.fecha ? ` · ${new Date(dolarInfo.fecha).toLocaleDateString('es-AR')}` : ''}</label>
                <input
                  type="number" min="0" step="0.01"
                  value={form.dolarBN}
                  onChange={set('dolarBN')}
                  placeholder={dolarInfo ? String(dolarInfo.valor) : 'Cargando…'}
                />
              </div>
            </div>
          </div>

          <div className="mt">
            <label>¿A qué depósito enviás?</label>
            <div className="routes" style={{ marginTop: 8 }}>
              {ROUTES.map((r) => (
                <div
                  key={r.id}
                  className="route-card"
                  onClick={() => setDeposito(r.id)}
                  style={{
                    cursor: 'pointer',
                    outline: deposito === r.id ? '2px solid var(--gold)' : 'none',
                  }}
                >
                  <div className="route-card__name">{r.label}</div>
                  <div className="route-card__pais" style={{ fontSize: 11 }}>
                    📍 {r.direccion}
                  </div>
                  {regimen === 'integral' ? (
                    <div className="route-card__unit" style={{ marginTop: 6 }}>
                      ≥{INTEGRAL_THRESHOLD} kg: US$ {r.integral.mayor}/kg · &lt;{INTEGRAL_THRESHOLD} kg: US$ {r.integral.menor}/kg · {r.tiempoEstimado}
                    </div>
                  ) : (
                    <div className="route-card__unit" style={{ marginTop: 6 }}>
                      Flete US$ {r.freightPerKg}/kg · {r.tiempoEstimado}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {regimen === 'pequeños' && Number(form.fob) > PE_LIMITS.maxFob && Number(form.fob) > 0 && (
            <div className="alert error mt">
              El FOB supera US$ {PE_LIMITS.maxFob}. Este envío no califica para pequeños envíos — usá el régimen general.
            </div>
          )}
          {regimen === 'pequeños' && Number(form.unidades) > PE_LIMITS.maxUnidades && (
            <div className="alert error mt">
              Más de {PE_LIMITS.maxUnidades} unidades. Este envío no califica para pequeños envíos — usá el régimen general.
            </div>
          )}

          <button className="btn btn-gold btn-block mt" disabled={!ready}>
            Cotizar
          </button>
          {detStatus === 'done' && !deposito && datosCompletos && (
            <div className="hint" style={{ marginTop: 8 }}>Elegí un depósito para cotizar.</div>
          )}
        </form>
      </div>

      {/* ── Resumen ──────────────────────────────────────────────────── */}
      <div id="agente-resultado">
        {results && deposito && regimen === 'integral' && currentResult && (
          <div className="card">
            <div className="card__title">
              <span className="section-num">2</span>Resumen — Courier integral · {currentResult.label}
            </div>
            <div className="card__subtitle">
              Tarifa todo incluido. Tiempo estimado {currentResult.tiempoEstimado}.
            </div>

            <div className="breakdown">
              <div className="line">
                <span>Peso real · {fmtUSD(currentResult.rate)}/kg ({currentResult.pesoReal >= INTEGRAL_THRESHOLD ? `≥${INTEGRAL_THRESHOLD} kg` : `<${INTEGRAL_THRESHOLD} kg`})</span>
                <strong>{fmtUSD(currentResult.base)}</strong>
              </div>
              {currentResult.excesoVol > 0 && (
                <div className="line">
                  <span>Volumétrico excedente · {currentResult.excesoVol.toFixed(1)} kg × {fmtUSD(INTEGRAL_VOL_RATE)}/kg</span>
                  <strong>{fmtUSD(currentResult.volCost)}</strong>
                </div>
              )}
            </div>

            {currentResult.excesoVol > 0 && (
              <div className="alert info">
                Peso volumétrico ({currentResult.pesoVolumetrico.toFixed(1)} kg) supera al real ({currentResult.pesoReal.toFixed(1)} kg). Excedente: {currentResult.excesoVol.toFixed(1)} kg.
              </div>
            )}

            <div className="total-box">
              <div>
                <div className="k">Total USD</div>
                <div className="v gold">{fmtUSD(currentResult.totalUSD)}</div>
              </div>
              {currentResult.totalPesos != null && (
                <div>
                  <div className="k">Total en pesos</div>
                  <div className="v">{fmtARS(currentResult.totalPesos)}</div>
                </div>
              )}
              <div>
                <div className="k">Costo por kg</div>
                <div className="v">{fmtUSD(currentResult.costoPorKg)}</div>
              </div>
              {Number(form.unidades) > 0 && (
                <div>
                  <div className="k">Costo por unidad</div>
                  <div className="v">{fmtUSD(currentResult.costoPorUnidad)}</div>
                </div>
              )}
            </div>

            {(() => {
              const otras = results.results.filter((r) => r.route !== currentResult.route)
              return otras.length > 0 && (
                <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
                  Referencia otras rutas:{' '}
                  {otras.map((r, i) => (
                    <span key={r.route}>
                      {i > 0 && ' · '}
                      {r.label} {fmtUSD(r.totalUSD)} ({r.tiempoEstimado})
                    </span>
                  ))}
                </p>
              )
            })()}
          </div>
        )}

        {results && deposito && regimen !== 'integral' && (
          <>
            <RouteBreakdown data={results} routeId={deposito} />

            <PriceStrategy
              costoInicial={costoPorUnidadARS}
              unidadesInicial={resumenCostos?.unidades}
              onPrecioSugerido={handlePrecioSugerido}
            />

            {leadOk ? (
              <MarketingAnalysis
                producto={producto}
                costoUnitario={costoPorUnidadARS != null ? Math.round(costoPorUnidadARS) : null}
                precioSugerido={precioSugerido != null ? Math.round(precioSugerido) : null}
                onLeadRequired={() => setLeadOk(false)}
                preview={preview}
                whatsappHref={waHref(whatsappText())}
              />
            ) : (
              <LeadGate
                contexto={producto ? `Calculadora demo · ${producto}${selected?.sim ? ` · NCM ${selected.sim}` : ''}` : 'Calculadora demo'}
                onDone={() => setLeadOk(true)}
              />
            )}
          </>
        )}

        {currentResult && (regimen === 'integral' || leadOk) && (
          <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              className="btn btn-gold"
              href={waHref(whatsappText())}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClose?.()}
            >
              📲 Quiero hacerlo con VEGROUP
            </a>
            <span className="muted" style={{ fontSize: 12 }}>
              Cotización N° {refNumber} — te llega con todos los datos cargados.
            </span>
          </div>
        )}
      </div>
    </>
  )
}
