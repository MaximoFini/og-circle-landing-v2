import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import SiteHeader from './components/SiteHeader';
import HeroParallax from './components/HeroParallax';
import WhatsAppFloat from './components/WhatsAppFloat';
import NumbersBar from './components/NumbersBar';
import SectionReveal from './components/SectionReveal';
import HeroVideo from './components/HeroVideo';
import { buildStructuredData } from './lib/structured-data';

/* Canvas de Three.js: nunca se pre-renderiza en el servidor (no tiene
   sentido, es WebGL) y se carga como chunk separado — `three` +
   `@react-three/fiber` no deberian entrar al bundle del render inicial. */
const Moon = dynamic(() => import('./components/Moon'), { ssr: false });

/* Below-the-fold: se code-splitean en chunks separados para que su JS
   no bloquee el primer paint. El HTML se sigue renderizando en el
   servidor (ssr: true por defecto) — solo el JS de hidratacion se
   difiere. */
const ProblemStepper = dynamic(() => import('./components/ProblemStepper'));
const OGCircleFeatures = dynamic(() => import('./components/OGCircleFeatures'));
const CostCalculator = dynamic(() => import('./components/CostCalculator'));
const StoryCollapse = dynamic(() => import('./components/StoryCollapse'));
const FaqList = dynamic(() => import('./components/FaqList'));
const WorldClocks = dynamic(() => import('./components/WorldClocks'));
const TiltGrid = dynamic(() => import('./components/TiltGrid'));

const WHATSAPP_MESSAGE = `Hola, vengo de la web de VeGroup.
Producto:
Desde: China / Miami / España
Peso aproximado: `;

const WHATSAPP_HREF = `https://wa.me/5491176392303?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildStructuredData()) }}
      />
      <SiteHeader />

      <main id="top">

        {/* ══════════════════════════════════════════
            HERO — Full-screen cinematic video
            A6 · cuatro planos en Z: video / polvo / texto / numeros
            A5 · el suelo del hangar nace en su borde inferior
        ══════════════════════════════════════════ */}
        <section className="hero-stage">
          {/* Plano 1 — video de fondo (el mas lejano) */}
          <div className="hero-layer hero-layer--video" aria-hidden="true">
            <HeroVideo />
          </div>

          {/* Gradient overlay to darken bottom and blend with page */}
          <div className="hero-veil" aria-hidden="true" />

          {/* Plano 1.5 — cielo: luna y cometas, detras del polvo.
              La luna es Three.js real (`components/Moon.tsx`), no CSS: una
              esfera con la textura fotografica de la Luna y una luz
              direccional que calcula el terminador de verdad. */}
          <div className="hero-layer hero-layer--sky" aria-hidden="true">
            <div className="hero-moon">
              <Moon />
            </div>
            <span className="comet comet--a" />
            <span className="comet comet--b" />
            <span className="comet comet--c" />
          </div>

          {/* Plano 2 — polvo en suspension */}
          <div className="hero-layer hero-layer--dust" aria-hidden="true">
            <span className="dust dust--a" />
            <span className="dust dust--b" />
          </div>

          {/* A5 — Hangar: el suelo de perspectiva infinita */}
          <div className="hangar" aria-hidden="true">
            <div className="hangar-plane">
              <div className="hangar-lines" />
            </div>
            <div className="hangar-haze" />
          </div>

          {/* Hero content */}
          <div className="hero-content">
            {/* Plano 3 — h1 + CTA */}
            <div className="hero-layer hero-layer--text">
              <h1
                className="glow-text"
                style={{
                  fontSize: 'clamp(36px, 6.5vw, 84px)',
                  fontWeight: 600,
                  lineHeight: 0.98,
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  marginBottom: '28px',
                  maxWidth: '19ch',
                }}
              >
                Aprendé a importar de China, Miami o España y armar tu e-commerce en Argentina.
              </h1>

              <div className="hero-cta-wrapper">
                <a
                  href="#problema"
                  className="liquid-glass"
                  style={{
                    color: '#fff',
                    fontSize: '13px',
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                    padding: '14px 36px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  Quiero aprender <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Plano 4 — numbers bar (el mas cercano)
                B4 · el markup de los tres numeros se mudo a `NumbersBar.tsx`
                porque el conteo cambia su texto y eso lo tiene que manejar
                React. Es un componente cliente, pero sigue saliendo del server
                con sus valores FINALES: sin JS se leen 6 / 3 / +5. */}
            <div className="hero-layer hero-layer--numbers">
              <NumbersBar />
            </div>
          </div>

          <HeroParallax />
        </section>

        {/* ══════════════════════════════════════════
            TRIAGE — Los tres perfiles
        ══════════════════════════════════════════ */}
        <div className="elegant-section">
          <section className="triage-v2-section">
            <div className="triage-v2-strip">
              {[
                { num: '01', quote: '"Nunca importé nada."', href: '#nosotros' },
                { num: '02', quote: '"Ya importé y me fue mal."', href: '#problema' },
                { num: '03', quote: '"Importo y quiero escalar."', href: '#pilares-servicio' },
              ].map((item, i) => (
                <a key={i} href={item.href} className="triage-v2-col">
                  <span className="triage-v2-num" aria-hidden="true">{item.num}</span>
                  <p className="triage-v2-quote">{item.quote}</p>
                  <span className="triage-v2-cta">
                    Empezá por acá
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                  <div className="triage-v2-bar" aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════
            MARQUEE — Ticker de rutas / destinos
            CSS puro. La pista se duplica para un
            loop continuo sin salto.
        ══════════════════════════════════════════ */}
          <div className="route-ticker" aria-hidden="true">
            <div className="route-ticker-track">
              {/* Grupo 1 — original */}
              <div className="route-ticker-group">
                <div className="route-ticker-item">
                  <span className="ticker-city">Guangzhou</span>
                  <span className="ticker-ref">China</span>
                </div>
                <span className="route-ticker-sep" />
                <div className="route-ticker-item">
                  <span className="ticker-city">Miami</span>
                  <span className="ticker-ref">Florida · USA</span>
                </div>
                <span className="route-ticker-sep" />
                <div className="route-ticker-item">
                  <span className="ticker-city">Barcelona</span>
                  <span className="ticker-ref">España</span>
                </div>
                <span className="route-ticker-sep" />
                <div className="route-ticker-item">
                  <span className="ticker-city">Belgrano</span>
                  <span className="ticker-ref">CABA · Argentina</span>
                </div>
                <span className="route-ticker-sep" />
              </div>
              {/* Grupo 2 — duplicado para el loop sin corte */}
              <div className="route-ticker-group" aria-hidden="true">
                <div className="route-ticker-item">
                  <span className="ticker-city">Guangzhou</span>
                  <span className="ticker-ref">China</span>
                </div>
                <span className="route-ticker-sep" />
                <div className="route-ticker-item">
                  <span className="ticker-city">Miami</span>
                  <span className="ticker-ref">Florida · USA</span>
                </div>
                <span className="route-ticker-sep" />
                <div className="route-ticker-item">
                  <span className="ticker-city">Barcelona</span>
                  <span className="ticker-ref">España</span>
                </div>
                <span className="route-ticker-sep" />
                <div className="route-ticker-item">
                  <span className="ticker-city">Belgrano</span>
                  <span className="ticker-ref">CABA · Argentina</span>
                </div>
                <span className="route-ticker-sep" />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
            PROBLEMA
        ══════════════════════════════════════════ */}
          <section className="section-pad" id="problema">
            <div className="wrap">
              <span className="tag-label">Prueba de Realidad</span>
              <h2 style={{ marginBottom: '16px' }}>
                Ya sabés que importando ganás.<br />
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>El problema nunca fue ese.</span>
              </h2>
              <ProblemStepper />
            </div>
          </section>

          {/* ══════════════════════════════════════════
            PILARES / FEATURES
        ══════════════════════════════════════════ */}
          <section className="section-pad" id="pilares-servicio">
            <div className="wrap">
              <span className="tag-label">Infraestructura</span>
              <h2 style={{ marginBottom: '16px' }}><span className="text-gradient">OG Circle</span>: lo que ponemos a tu disposición</h2>

              <OGCircleFeatures />

              {/* La demo real vive acá, pegada a la grilla que ya la lista como
                el beneficio 02 — no es su propia seccion, es una de las 6. */}
              <CostCalculator />
            </div>
          </section>

          {/* ══════════════════════════════════════════
            QUIÉNES SOMOS
        ══════════════════════════════════════════ */}
          <section className="section-pad" id="nosotros">
            <div className="wrap">
              <div className="founder-grid">
                <div>
                  <span className="tag-label">Fundadores</span>
                  <h2 style={{ marginBottom: '20px' }}>Quiénes Somos</h2>
                  <p className="lede">
                    VeGroup es un importador con años de trayectoria operando fletes internacionales entre Asia, Europa y Argentina. Armamos OG Circle porque mis conocidos me pedían el contacto de mis agentes de confianza y no había una forma segura de integrarlos al flujo de trabajo diario sin una plataforma de soporte.
                  </p>
                  <StoryCollapse />
                </div>
                <div className="founder-photo-placeholder">
                  <Users size={32} style={{ color: 'var(--accent-from)', opacity: 0.7 }} aria-hidden="true" />
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                    Foto de los fundadores
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
            NO ES PARA VOS
        ══════════════════════════════════════════ */}
          <section className="section-pad" id="no-es-para-vos">
            <div className="wrap">
              <span className="tag-label">Antes de anotarte</span>
              <h2 style={{ marginBottom: '24px' }}>Esto no es para vos si:</h2>
              <ul className="disqualify-list">
                <li>
                  Buscás traer 2 kg para uso personal. En ese caso nosotros lo gestionamos,{' '}
                  <a
                    href={WHATSAPP_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-from)', textDecoration: 'underline', textUnderlineOffset: '3px', transition: 'opacity 0.2s' }}
                  >
                    escribinos por WhatsApp
                  </a>.
                </li>
                <li>Esperás ganar sin poner capital. El mínimo real arranca en USD 800–1.000.</li>
                <li>Vivís fuera de Argentina. La red que damos es local.</li>
              </ul>
            </div>
          </section>

          {/* ══════════════════════════════════════════
            PRECIOS
        ══════════════════════════════════════════ */}
          <section className="section-pad" id="precios" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="wrap">
              <span className="tag-label" style={{ display: 'block', textAlign: 'center' }}>Membresía</span>
              <h2 style={{ textAlign: 'center', marginBottom: '12px' }}>Pago único. Acceso de por vida.</h2>

              <TiltGrid className="prices-container">
                {/* Principiante */}
                <div className="price-card glass-card" data-tilt>
                  <span className="price-tag">PRINCIPIANTE</span>
                  <div className="price-amount">
                    <span className="currency">$</span>
                    <span className="num">75.000</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
                    ARS
                  </div>
                  <ul className="price-features">
                    <li>Formación completa (11 videos)</li>
                    <li>Calculadora de costos en vivo</li>
                    <li>Acceso a red de profesionales</li>
                    <li>Soporte de servicios financieros básicos</li>
                  </ul>
                  <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="price-cta liquid-glass" style={{ color: '#fff', display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', fontWeight: 600, fontSize: '13px', letterSpacing: '0.06em' }}>
                    Anotarme en Principiante
                  </a>
                </div>

                {/* Avanzado */}
                {/* C2 — `.gradient-border`: unico elemento de la pagina que lo
                  lleva hoy (regla: maximo DOS antes de que deje de leerse
                  como jerarquia). Queda lugar para uno mas. */}
                <div className="price-card glass-card featured gradient-border" data-tilt>
                  <span className="price-tag">AVANZADO · MÁS PEDIDO</span>
                  <div className="price-amount">
                    <span className="currency">$</span>
                    <span className="num">125.000</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
                    ARS
                  </div>
                  <ul className="price-features">
                    <li><strong>Todo lo de Principiante</strong></li>
                    <li>Acceso a depósitos en Miami, China y España</li>
                    <li>Agente de muestras y de volumen</li>
                    <li>Flete + despacho gestionado por VeGroup</li>
                    <li>Tracking internacional & cuenta cambiaria SWIFT</li>
                  </ul>
                  <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="price-cta btn-gradient" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', color: '#050505' }}>
                    Anotarme en Avanzado →
                  </a>
                </div>
              </TiltGrid>

              <p style={{ fontSize: '13px', textAlign: 'center', marginTop: '28px', color: 'rgba(255,255,255,0.3)' }}>
                * Podés empezar en Principiante y hacer el upgrade a Avanzado abonando únicamente la diferencia + $10.000.
              </p>
            </div>
          </section>

          {/* ══════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════ */}
          <section className="section-pad">
            <div className="wrap">
              <span className="tag-label">Respuestas Rápidas</span>
              <h2 style={{ marginBottom: '0' }}>Preguntas Frecuentes</h2>
              <FaqList />
            </div>
          </section>

          {/* C3 — Reveal de los 8 h2 de seccion. No renderiza nada y se engancha
            despues del primer paint: el markup de los titulos es
            server-rendered y su estado por defecto es visible. */}
          <SectionReveal />

        </div>{/* end elegant-section */}
      </main>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="site-footer">
        {/* Mismo campo de estrellas del hero (`.hero-layer--dust`), reusado
            como fondo puro decoracion: el contenido real del footer sigue
            siendo DOM normal encima. */}
        <div className="hero-layer hero-layer--dust footer-stars" aria-hidden="true">
          <span className="dust dust--a" />
          <span className="dust dust--b" />
        </div>

        <div className="wrap footer-content">
          <div className="footer-brand">
            <a href="#top" className="footer-logo">
              <Image src="/images/logo-icon.png" alt="" width={36} height={41} className="footer-logo-icon" />
              <span className="footer-logo-text">
                OG CIRCLE
                <span className="footer-logo-sub">by VeGroup</span>
              </span>
            </a>
            <span className="footer-copy">© 2026 VeGroup</span>
            <span className="footer-attribution">
              Textura lunar: NASA / Solar System Scope (CC BY 4.0)
            </span>
            <span className="footer-links">
              <Link href="/terminos" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>Términos y Condiciones</Link>
              {' · '}
              <Link href="/privacidad" style={{ color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>Política de Privacidad</Link>
            </span>
          </div>

          {/* Relojes en tiempo real — BUE · CAN · MIA */}
          <WorldClocks />

          <div className="footer-contact">
            <span className="footer-contact-title">VEGROUP.COM.AR</span>
            <span>AMENÁBAR 2049 · BELGRANO, CABA</span>
            <span>
              <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-from)', transition: 'opacity 0.2s' }}>
                +54 9 11 7639-2303
              </a>
              {' · '}
              <a href="https://www.instagram.com/vegroup_courier/" target="_blank" rel="noopener noreferrer" style={{ transition: 'color 0.2s' }}>
                INSTAGRAM
              </a>
            </span>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />
    </>
  );
}
