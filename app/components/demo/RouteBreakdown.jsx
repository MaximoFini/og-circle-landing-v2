'use client'

import { useState } from 'react'
import { fmtUSD, fmtARS, LABELS } from '../../lib/demo/calc.js'

// Mismo orden de líneas que la planilla madre (B17–B26 y B30). El FOB se
// muestra aparte (es lo que se paga al proveedor, no a VEGROUP) para que no
// se confunda con los gastos de destino al sumarlos.
const DESTINO_ORDER = [
  'flete',
  'tca',
  'cargoFijo',
  'comisionSeguro',
  'handlingDestino',
  'handlingOrigen',
  'volumetrico',
  'derechos',
  'estadistica',
  'comisionVegroup',
]
const GREEN_ORDER = ['iva']

// Resumen de la cotización. Con `routeId` muestra el desglose del depósito
// elegido (y las otras rutas como referencia); sin él, las 3 rutas clickeables.
export default function RouteBreakdown({ data, routeId }) {
  const { results, mejorRuta } = data
  const [active, setActive] = useState(routeId || mejorRuta)
  const current = results.find((r) => r.route === (routeId || active)) || results[0]
  const otras = results.filter((r) => r.route !== current.route)

  return (
    <div className="card">
      <div className="card__title">
        <span className="section-num">3</span>
        {routeId ? `Resumen — depósito ${current.label}` : 'Costo por ruta'}
      </div>
      <div className="card__subtitle">
        Costo real puesto acá: lo que le pagás al proveedor (FOB) más lo que pagás en destino (sin IVA recuperable).
        {routeId
          ? ` Tiempo estimado ${current.tiempoEstimado}.`
          : ' La ruta más conveniente aparece destacada.'}
      </div>

      {!routeId && (
        <div className="routes">
          {results.map((r) => (
            <div
              key={r.route}
              className={`route-card ${r.route === mejorRuta ? 'best' : ''}`}
              style={{ cursor: 'pointer', outline: r.route === active ? '1px solid var(--gold)' : 'none' }}
              onClick={() => setActive(r.route)}
            >
              {r.route === mejorRuta && <div className="route-card__badge">MÁS CONVENIENTE</div>}
              <div className="route-card__name">{r.label}</div>
              <div className="route-card__pais">
                {r.pais} · flete {fmtUSD(r.freightPerKg)}/kg · {r.tiempoEstimado}
              </div>
              <div className="route-card__big">{fmtUSD(r.costoRealEfectivo)}</div>
              <div className="route-card__unit">{fmtUSD(r.costoPorUnidad)} / unidad</div>
            </div>
          ))}
        </div>
      )}

      {/* Desglose detallado */}
      <div className="mt">
        <div className="card__title" style={{ marginTop: 8 }}>
          Desglose — {current.label} <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>· tiempo estimado {current.tiempoEstimado}</span>
        </div>
        <div className="legend">
          <span>
            <span className="dot" style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--red)' }} />
            No recuperable (costo real)
          </span>
          <span>
            <span className="dot" style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--green)' }} />
            Recuperable (crédito fiscal)
          </span>
        </div>

        <div className="breakdown">
          <div className="line" style={{ opacity: 0.75 }}>
            <span>{LABELS.cif}</span>
            <strong>{fmtUSD(current.cif)}</strong>
          </div>

          <div className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.6px', margin: '14px 0 4px' }}>
            Lo que le pagás a tu proveedor
          </div>
          <div className="line red">
            <span>
              <span className="dot" />
              {LABELS.fob}
            </span>
            <strong>{fmtUSD(current.fob)}</strong>
          </div>

          <div className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.6px', margin: '14px 0 4px' }}>
            Lo que pagás en destino (gastos de importación VEGROUP)
          </div>
          {DESTINO_ORDER.map((k) => (
            <div className="line red" key={k}>
              <span>
                <span className="dot" />
                {LABELS[k]}
              </span>
              <strong>{fmtUSD(current.noRecuperable[k])}</strong>
            </div>
          ))}
          <div className="subtotal" style={{ borderTop: '1px solid var(--rule)', fontSize: 13, fontWeight: 500 }}>
            <span>Subtotal gastos en destino</span>
            <span style={{ color: 'var(--red)' }}>{fmtUSD(current.totalGastosDestino)}</span>
          </div>

          <div className="subtotal">
            <span>Total no recuperable (proveedor + destino)</span>
            <span style={{ color: 'var(--red)' }}>{fmtUSD(current.totalNoRecuperable)}</span>
          </div>

          {GREEN_ORDER.map((k) => (
            <div className="line green" key={k}>
              <span>
                <span className="dot" />
                {LABELS[k]}
              </span>
              <strong>{fmtUSD(current.recuperable[k])}</strong>
            </div>
          ))}
          <div className="subtotal">
            <span>Total recuperable</span>
            <span style={{ color: 'var(--green)' }}>{fmtUSD(current.totalRecuperable)}</span>
          </div>
        </div>

        {current.volumen > 0 && (
          <div className="alert info">
            ⚠️ Peso volumétrico ({current.pesoVolumetrico.toFixed(1)} kg) supera al real: se cobran{' '}
            {current.volumen.toFixed(1)} kg de exceso volumétrico.
          </div>
        )}

        <div className="total-box total-box-2">
          <div>
            <div className="k">Lo que pagás a tu proveedor</div>
            <div className="v gold">{fmtUSD(current.fob)}</div>
          </div>
          <div>
            <div className="k">Lo que pagás en destino</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 6 }}>
              <div>
                <div className="k" style={{ marginBottom: 2 }}>Con IVA</div>
                <div className="v gold" style={{ fontSize: 17 }}>
                  {fmtUSD(current.totalGastosDestino + current.recuperable.iva)}
                </div>
              </div>
              <div>
                <div className="k" style={{ marginBottom: 2 }}>Sin IVA</div>
                <div className="v gold" style={{ fontSize: 17 }}>{fmtUSD(current.totalGastosDestino)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="total-box" style={{ marginTop: 1 }}>
          <div>
            <div className="k">Total USD</div>
            <div className="v">{fmtUSD(current.totalUSD)}</div>
          </div>
          {current.totalPesos != null && (
            <div>
              <div className="k">Total en pesos</div>
              <div className="v">{fmtARS(current.totalPesos)}</div>
            </div>
          )}
          <div>
            <div className="k">Costo por kg</div>
            <div className="v">{fmtUSD(current.costoPorKg)}</div>
          </div>
          <div>
            <div className="k">Costo real puesto acá — proveedor + destino (sin IVA)</div>
            <div className="v gold">{fmtUSD(current.costoRealEfectivo)}</div>
          </div>
          <div>
            <div className="k">Costo por unidad</div>
            <div className="v gold">{fmtUSD(current.costoPorUnidad)}</div>
          </div>
        </div>

        {routeId && otras.length > 0 && (
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Referencia otras rutas:{' '}
            {otras.map((r, i) => (
              <span key={r.route}>
                {i > 0 && ' · '}
                {r.label} {fmtUSD(r.costoRealEfectivo)} ({r.tiempoEstimado})
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  )
}
