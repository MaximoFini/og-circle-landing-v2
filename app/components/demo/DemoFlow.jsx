'use client'

import AgentQuote from './AgentQuote.jsx'

// Punto de entrada del contrato entre DemoModal.tsx y la demo portada.
// Todo el markup vive dentro de .vg-demo (scope de app/styles/21-demo.css);
// overlay, backdrop y boton de cerrar son responsabilidad de DemoModal.
export default function DemoFlow({ onClose }) {
  return (
    <div className="vg-demo">
      <AgentQuote onClose={onClose} />
    </div>
  )
}
