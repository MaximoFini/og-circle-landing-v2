'use client'

import { ArrowRight, Lock } from 'lucide-react'
import AgentQuote from './AgentQuote.jsx'

// Punto de entrada del contrato entre DemoModal.tsx y la demo portada.
// Todo el markup vive dentro de .vg-demo (scope de app/styles/21-demo.css);
// overlay, backdrop y boton de cerrar son responsabilidad de DemoModal.
//
// Vista previa bloqueada (pedido del cliente): el simulador se muestra para
// que se entienda la forma del flujo, pero datos, variables y tarifas quedan
// borrosos y nada es interactivo. `inert` saca todo del foco y de los clicks;
// el blur selectivo vive en `.vg-demo-locked` (21-demo.css). El CTA lleva a
// #precios en vez de al registro: la plataforma solo acepta una lista cerrada
// de origenes (lib/site.ts) y no hay uno para la demo. La navegación la hace
// DemoModal (`onNavigate`) despues de cerrar: con un <a> comun, el modal
// devolvia el foco al boton disparador y la pagina saltaba de vuelta.
export default function DemoFlow({ onClose, onNavigate }) {
  return (
    <div className="vg-demo">
      <div className="vg-demo-locked" inert="" aria-hidden="true">
        <AgentQuote onClose={onClose} preview />
      </div>

      <div className="vg-demo-lock-panel">
        <Lock size={18} aria-hidden="true" />
        <p>
          Simulador completo dentro de <strong>OG Circle</strong>.
        </p>
        <a
          href="#precios"
          className="btn btn-gold"
          onClick={(e) => {
            if (!onNavigate) return
            e.preventDefault()
            onNavigate('#precios')
          }}
        >
          Ver qué incluye <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
