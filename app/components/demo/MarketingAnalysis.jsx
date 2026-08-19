'use client'

import { useState } from 'react'
import { analyzeProduct } from '../../lib/demo/api.js'

// Análisis de marketing/comercialización con IA, posterior al cálculo.
// Solo se monta con el lead ya cargado; si el server igual responde 403
// (por ejemplo, cookie perdida) avisamos al padre para volver a mostrar el gate.
export default function MarketingAnalysis({
  producto,
  costoUnitario,
  precioSugerido,
  onLeadRequired,
  whatsappHref,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cuota, setCuota] = useState(false)
  const [data, setData] = useState(null)
  const [contexto, setContexto] = useState('')

  async function run() {
    if (loading) return
    setError('')
    setCuota(false)
    setLoading(true)
    try {
      const res = await analyzeProduct({
        producto,
        costoUnitario,
        precioSugerido,
        contexto: contexto.trim() || undefined,
      })
      setData(res)
    } catch (err) {
      if (err.status === 403 && err.motivo === 'lead_requerido') {
        onLeadRequired?.()
        return
      }
      if (err.status === 429) {
        setCuota(true)
        return
      }
      setError(err.message || 'No se pudo generar el análisis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card__title">
        <span className="section-num">5</span>Análisis de comercialización (IA)
      </div>
      <div className="card__subtitle">
        Estrategia de marketing y precio sugerido para el mercado argentino, en base al costo real.
      </div>

      <div className="field">
        <label>Contexto adicional (opcional)</label>
        <textarea
          rows={2}
          value={contexto}
          onChange={(e) => setContexto(e.target.value)}
          placeholder="Ej: apuntamos a e-commerce, competencia con producto local, temporada alta…"
          maxLength={300}
        />
      </div>

      <button className="btn btn-gold btn-block mt" onClick={run} disabled={loading || !producto}>
        {loading ? <span className="spinner" /> : 'Generar análisis de marketing'}
      </button>

      {error && <div className="alert error">{error}</div>}

      {cuota && (
        <div className="alert info">
          Por hoy llegaste al límite de análisis gratuitos. Escribinos y lo armamos con vos.{' '}
          <a className="btn btn-ghost mt" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            Hablar por WhatsApp
          </a>
        </div>
      )}

      {data && (
        <div className="mkt-grid mt">
          <Block title="Público objetivo" full>
            <p>{data.publicoObjetivo}</p>
          </Block>
          <Block title="Ángulos de venta">
            <ul>{(data.angulosVenta || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </Block>
          <Block title="Ideas de contenido">
            <ul>{(data.ideasContenido || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </Block>
          <Block title="Campaña sugerida" full>
            <p>{data.campanaSugerida}</p>
          </Block>
          <Block title="Precio sugerido">
            <p>{data.precioSugerido}</p>
          </Block>
          <Block title="Riesgo principal">
            <p>{data.riesgoPrincipal}</p>
          </Block>
        </div>
      )}
    </div>
  )
}

function Block({ title, children, full }) {
  return (
    <div className={`mkt-block ${full ? 'full' : ''}`}>
      <h4>{title}</h4>
      {children}
    </div>
  )
}
