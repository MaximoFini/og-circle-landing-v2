'use client';

import { useState } from 'react';
import TiltGrid from './TiltGrid';

/**
 * "El Problema", paso a paso en vez de grilla.
 *
 * Reemplaza las cuatro tarjetas simultaneas por una secuencia: se muestra un
 * problema por vez, el usuario responde Si/No (la respuesta no se guarda en
 * ningun lado — es puro gesto de compromiso, "¿esto te pasó?"), y esa misma
 * respuesta avanza al siguiente. Al terminar el 4to, un cierre corto con CTA
 * a OG Circle.
 *
 * Por que: en la version de grilla el usuario escanea los cuatro titulos en
 * diagonal y sigue de largo. Uno por vez fuerza a leer — y en mobile, que es
 * de donde viene la mayoria del trafico (Instagram), saca de encima el
 * scroll largo de cuatro tarjetas apiladas.
 *
 * La via de escape (`viewAll`) es una regla dura de cualquier personalizacion
 * de este sitio: nunca ocultar contenido sin una salida a la vista completa.
 * En modo "ver todos" es exactamente la grilla `.problems-grid-v2` de antes,
 * sin cambios — mismo markup, misma linterna de B5.
 */

const PROBLEMS = [
  { num: '01', title: 'No sabés cuánto te sale realmente', body: 'Sumaste el flete. Faltaban arancel, IVA, tasa estadística y despacho. Tu 40% de margen era en realidad un 4%.' },
  { num: '02', title: 'No sabés en quién confiar', body: 'Buscar un agente de compras en Instagram o Alibaba es una lotería. Y la ficha económica la ponés vos.' },
  { num: '03', title: 'No sabés cómo pagarles', body: 'Mandar dinero a fábricas chinas sin una cuenta SWIFT o una estructura cambiaria formal es la mitad del problema.' },
  { num: '04', title: '¿Y ahora dónde lo vendés?', body: 'Sin una tienda optimizada, fotos o tráfico digital, la mercadería te queda guardada en el living.' },
] as const;

const TOTAL = PROBLEMS.length;

export default function ProblemStepper() {
  const [step, setStep] = useState(0); // 0..TOTAL-1 = problema activo, TOTAL = cierre
  const [viewAll, setViewAll] = useState(false);

  const isClosing = step === TOTAL;

  if (viewAll) {
    return (
      <>
        <TiltGrid className="problems-grid-v2" lantern>
          {PROBLEMS.map((card) => (
            <div key={card.num} className="problem-card-v2" data-tilt>
              <span className="problem-num">{card.num}</span>
              <div className="problem-content">
                <h3 className="problem-title">{card.title}</h3>
                <p className="problem-body">{card.body}</p>
              </div>
              <div className="problem-line" aria-hidden="true" />
            </div>
          ))}
        </TiltGrid>
        <button type="button" className="problem-stepper-toggle" onClick={() => { setViewAll(false); setStep(0); }}>
          ← Volver al paso a paso
        </button>
      </>
    );
  }

  return (
    <div className="problem-stepper">
      <div className="problem-stepper-dots" role="tablist" aria-label="Problemas">
        {PROBLEMS.map((p, i) => (
          <button
            key={p.num}
            type="button"
            role="tab"
            aria-selected={!isClosing && i === step}
            aria-label={`Problema ${p.num}: ${p.title}`}
            className="problem-stepper-dot"
            data-active={!isClosing && i === step ? '' : undefined}
            data-done={isClosing || i < step ? '' : undefined}
            onClick={() => setStep(i)}
          >
            {p.num}
          </button>
        ))}
      </div>

      {!isClosing ? (
        <TiltGrid className="problem-stepper-stage">
          <div className="problem-card-v2 problem-stepper-card" data-tilt key={step}>
            <span className="problem-num">{PROBLEMS[step].num}</span>
            <div className="problem-content">
              <h3 className="problem-title">{PROBLEMS[step].title}</h3>
              <p className="problem-body">{PROBLEMS[step].body}</p>
            </div>
            <div className="problem-stepper-actions">
              <span className="problem-stepper-prompt">¿Te pasa esto?</span>
              <div className="problem-stepper-buttons">
                <button
                  type="button"
                  className="problem-stepper-btn"
                  onClick={() => setStep((s) => Math.min(s + 1, TOTAL))}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className="problem-stepper-btn problem-stepper-btn--no"
                  onClick={() => setStep((s) => Math.min(s + 1, TOTAL))}
                >
                  No
                </button>
              </div>
            </div>
            <div className="problem-line" aria-hidden="true" />
          </div>
        </TiltGrid>
      ) : (
        <div className="problem-stepper-closing" key="closing">
          <p className="problem-stepper-closing-text">
            Ya viste los 4. Todos tienen la misma solución.
          </p>
          <a href="#pilares-servicio" className="problem-stepper-cta liquid-glass">
            Conocé OG Circle →
          </a>
        </div>
      )}

      <button type="button" className="problem-stepper-toggle" onClick={() => setViewAll(true)}>
        Ver los 4 de una →
      </button>
    </div>
  );
}
