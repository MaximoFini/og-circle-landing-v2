'use client';

import { ArrowRight } from 'lucide-react';
import DemoModal, { OPEN_DEMO_EVENT } from './DemoModal';

/**
 * CTA hacia la demo real, pegado a la grilla de OG Circle (page.tsx): no es
 * su propia seccion, es la entrada a uno de los 6 beneficios que ya lista
 * esa grilla (`02 · Calculadora de Costos`). El div lleva `id="calculadora"`
 * porque el link "Demo" del nav (SiteHeader.tsx) y el fallback sin-JS del
 * propio <a> de abajo siguen apuntando ahi.
 */
export default function CostCalculator() {
  return (
    <>
      <div id="calculadora" className="calc-demo-cta-row">
        <p className="calc-demo-intro">
          Probá el simulador de costos real, gratis. Esto es apenas uno de los beneficios de <strong>OG Circle</strong>.
        </p>

        {/* Sin JS, cae en un scroll benigno al propio bloque. Con JS, abre
            el modal via CustomEvent y no navega. */}
        <a
          href="#calculadora"
          className="liquid-glass calc-demo-cta"
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent(OPEN_DEMO_EVENT));
          }}
        >
          Probar Demo <ArrowRight size={14} />
        </a>
        <p className="calc-demo-microcopy">1 simulación gratis · sin registro</p>
      </div>

      <DemoModal />
    </>
  );
}
