'use client'

import { useState } from 'react'
import { submitLead } from '../../lib/demo/api.js'

// Puerta de contacto: va después del costo y de la estrategia de precio, no
// antes. El visitante ya vio su número, así que pedirle el dato acá cuesta
// poco y deja la llamada cara de IA (el análisis) detrás de un lead real.
export default function LeadGate({ contexto, onDone }) {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const soloDigitos = whatsapp.replace(/\D/g, '')
  const valido = nombre.trim().length >= 2 && soloDigitos.length >= 8

  async function handleSubmit(e) {
    e.preventDefault()
    if (!valido || enviando) return
    setError('')
    setEnviando(true)
    try {
      await submitLead({
        nombre: nombre.trim(),
        whatsapp: whatsapp.trim(),
        contexto: contexto || undefined,
      })
      onDone()
    } catch (err) {
      setError(err.message || 'No se pudo guardar tu contacto. Probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="card">
      <div className="card__title">
        <span className="section-num">4</span>Un dato antes del análisis
      </div>
      <div className="card__subtitle">
        Dejanos tu nombre y WhatsApp y desbloqueás el análisis de comercialización
        para tu producto. Te escribimos solo por esto.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2">
          <div className="field">
            <label>Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              maxLength={60}
            />
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="11 2345-6789"
              autoComplete="tel"
              maxLength={30}
            />
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <button className="btn btn-gold btn-block mt" disabled={!valido || enviando}>
          {enviando ? <span className="spinner" /> : 'Ver el análisis de mi producto'}
        </button>
      </form>
    </div>
  )
}
