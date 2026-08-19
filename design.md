# Guía de Diseño y Estilos — VeGroup

Documenta el sistema visual **realmente implementado** en la landing (`app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/components/`).

> **Nota de historial:** la versión anterior de este documento describía un concepto de papelería aduanera ("Despacho, no dashboard": fondo manila `#EFEBE3`, Instrument Serif, sellos rojos, tags con perforación). Ese sistema fue **reemplazado por completo** en el commit `044606c` ("rediseño NEXOVA — dark cinematic") y ya no queda nada de él en el código. Este documento describe lo que hay hoy.
>
> **Segunda pasada:** la revisión anterior de este documento describía un `BlueprintSteps.tsx` — un contenedor marítimo 3D (`.bp-wrapper`/`.bp-viewport`/`.bp-stage`/`.bp-rotator`/`.bp-face`) para la sección "Cómo funciona". Ese componente **ya no existe** en `app/components/`: no hay ningún `.tsx` en el repo que importe o escriba esas clases. Las clases `.bp-*` siguen físicamente en `globals.css` (~530 líneas) pero son **CSS muerto** — ver §6. La sección `#problema` y la sección `#pilares-servicio` (ahora "OG Circle") se rehicieron con dos componentes nuevos, `ProblemStepper.tsx` y `OGCircleFeatures.tsx`, que no son un reemplazo visual del contenedor 3D — son mecanismos distintos, documentados en §3. Esta pasada además incorpora `AmbientAudio.tsx`, `WorldClocks.tsx`, `StoryCollapse.tsx` y el ticker de rutas (`.route-ticker`), ninguno de los cuales estaba en la versión anterior del documento.
>
> **Tercera pasada (esta revisión):** la calculadora vieja (`.calc-v2-*`, dos paneles inputs/resultados, terminal falsa, `AnimatedNumber`) **ya no existe en absoluto** — no quedó ni como CSS muerto, se borró. `CostCalculator.tsx` pasó a ser solo una fila de CTA que abre `DemoModal.tsx` (primer modal/dialog del repo, `createPortal` + focus trap) con un simulador real portado de otro repo de VeGroup, con backend propio (`app/api/demo/*`, IA de Anthropic, `@vercel/kv`) y su propio hoja de estilos (`app/styles/21-demo.css`, ~590 líneas, remapeada a los tokens dark de este sistema). Ver §3 y §6.

---

## 0. Concepto: "NEXOVA — dark cinematic"

Fondo casi negro, video de hero a pantalla completa, superficies de vidrio (`backdrop-filter`) y un único acento ámbar en gradiente. La referencia es SaaS premium / producto tecnológico, no papelería física.

Tres decisiones que atraviesan todo:
- **Dark mode como único modo.** No hay tema claro ni tokens de tema claro. `html` y `body` fijan `#050505`.
- **Jerarquía por opacidad de blanco, no por color.** Casi todo el texto y todos los bordes son `rgba(255,255,255, x)`. El color se reserva para el acento.
- **Un solo acento.** Ámbar `#d99e00 → #f5b813`, casi siempre como gradiente horizontal o como color plano al 100%. Aparece en CTAs, números de paso, barras de hover y highlights de texto.

---

## 1. Paleta de colores

Tokens en `:root` de `app/globals.css`.

| Rol | Variable CSS | Valor | Uso |
|---|---|---|---|
| Acento (inicio) | `--accent-from` | `#d99e00` | Color plano del acento; inicio del gradiente. |
| Acento (fin) | `--accent-to` | `#f5b813` | Fin del gradiente de CTAs y barras. |
| Acento 5% | `--accent-05` | `rgba(217,158,0,.05)` | Fondo de `.price-card.featured`. Remapeada también como `--gold-soft` dentro de `.vg-demo` (el Demo, ver §3/§6) — el bloque de precio sugerido de la calculadora vieja y el paso activo del blueprint que usaban este token **ya no existen** (código borrado, no CSS muerto). |
| Acento 40% | `--accent-40` | `rgba(217,158,0,.4)` | Borde de input en foco y arranque de `pulse-dot`. |
| Fondo de página | `--bg` | `#050505` | `html`, `body`, `.site-footer`, y color de texto sobre botones ámbar. |
| Superficie 1 | `--surface-1` | `#0a0a0a` | Tarjetas (`.problem-card-v2`, `.feature-card-v2`) y caras del contenedor 3D muerto. |
| Superficie 1 (hover) | `--surface-1-hover` | `#111111` | Hover de esas mismas tarjetas. |
| Superficie 2 | `--surface-2` | `#080808` | Panel de inputs de la calculadora. |
| Superficie 3 | `--surface-3` | `#060606` | Panel de resultados de la calculadora. |
| Champán | `--champagne` | `rgba(232,210,170,.88)` | Números del hero (`.num-card .number`). El único color de texto que no es blanco ni ámbar. |
| Error | `--danger` | `#ef4444` | Cruz de `.disqualify-list`. |
| Vidrio (fondo) | `--glass-bg` | `rgba(255,255,255,.04)` | Fondo de `.glass-card`. |
| Vidrio (borde) | `--glass-border` | `rgba(255,255,255,.08)` | Borde por defecto de tarjetas y separadores. |
| Vidrio (borde activo) | `--glass-border-active` | `rgba(255,255,255,.18)` | Borde en hover. |
| Texto principal | `--text-primary` | `rgba(255,255,255,.92)` | Headings y body principal. |
| Texto secundario | `--text-secondary` | `rgba(255,255,255,.5)` | `.lede`, descripciones. |
| Texto atenuado | `--text-muted` | `rgba(255,255,255,.46)` | Labels, disclaimers, metadata. |

Las tres superficies son el recurso principal del sistema para separar planos sin usar bordes: cuanto más oscuro, más al fondo.

**Colores que se dejan fuera de tokens a propósito:**
- `#25D366` — verde de marca de WhatsApp, usado solo en el **hover** de `.whatsapp-float` (ver §3). Es un color **externo** al sistema: lo fija WhatsApp, no NEXOVA. Meterlo en `:root` lo haría parecer parte de la paleta.
- `rgba(5,5,5,x)` — los velos del hero y del hangar. Es `--bg` con alfa, pero tokenizarlo pide `color-mix()` o un token por cada alfa.
- Las alfas del ámbar que aparecen **una sola vez** (`.07`, `.12`, `.15`, `.18`, `.22`, `.25`, `.30`, `.60`…) quedan literales en su regla: un token de un solo uso no aclara nada.
- `#ef4444` sigue inline en `CostCalculator.tsx:75` (el punto rojo de los tres puntos de "terminal" de la cabecera de la calculadora — hay un verde y un ámbar al lado, también inline), además de su token en `--danger`.

**Regla dura:** el ámbar nunca va como fondo pleno detrás de texto blanco. Cuando es fondo (`.btn-gradient`), el texto pasa a `--bg`.

**Nota — `.btn-whatsapp` es CSS muerto.** El documento anterior describía `.btn-whatsapp` (verde de marca, `box-shadow` de glow verde) como "la única pieza que rompe la paleta a propósito". Esa clase sigue en `globals.css` (líneas ~1239–1261) pero **ningún componente la usa hoy**: los links de WhatsApp del sitio (`page.tsx`, `FaqList.tsx`) son anclas con `style` inline (color `--accent-from`, no verde) o texto plano dentro de `.liquid-glass`/`.price-cta`. La única pieza que hoy rompe la paleta a propósito con verde de marca es `.whatsapp-float` (el botón flotante, ver §3), y lo hace de forma mucho más sutil: en reposo es vidrio gris, el verde `#25d366` solo aparece en `:hover`.

---

## 2. Tipografías

Se cargan como `<link>` en `app/layout.tsx` (no vía `next/font`), con `preconnect` a los tres orígenes y `preload` del woff2 de Helvetica Now Var. Las tres familias de Google Fonts viajan en **una sola URL**, con los nombres en orden alfabético: es lo que exige la API `css2`.

- **Helvetica Now Var** (`db.onlinewebfonts.com`) — fuente del `body`, fijada también inline en el `<body>` para evitar FOUT. Es la base de todo lo que no declara otra familia. Viene de un CDN de terceros, así que **no se puede migrar a `next/font`** (no lo puede self-hostear).
- **Montserrat** (Google Fonts, 300–900 + itálica 400) — títulos, números, labels en mayúscula, casi todo lo que lleva `font-weight: 700+`. El rango llega a 900 porque el CSS pide **800** (`.triage-v2-quote`, `.problem-num`, `.bp-detail-heading` — esta última en una clase hoy muerta, ver §6; `.calc-v2-total-value` pedía 800 en revisiones anteriores de este documento pero esa clase ya no existe, ver §3/§6) y **900** (`.feature-num-big`); mientras el `<link>` solo llegaba a 700 el navegador sintetizaba *faux bold*.
- **Inter** (Google Fonts, 300–600) — body copy dentro de `.elegant-section`: párrafos de tarjetas, checklists, respuestas de FAQ.
- **Cormorant Garamond** (Google Fonts, solo **300**) — serif de los números del hero (`.num-card .number`). Un único peso, que es el único que la regla usa.

### Deuda tipográfica: saldada

El CSS declaraba tres familias que ningún `<link>` traía, herencia del commit `9e1aeb5` (que introdujo Outfit + Plus Jakarta Sans) y su revert `114c973`: el revert sacó la carga pero dejó las referencias. Resuelto en las dos direcciones posibles:

| Declarada en | Familia | Resolución |
|---|---|---|
| `.num-card .number` | `Cormorant Garamond` | **Se carga.** Antes caía a `Georgia, serif`. |
| `.nav-logo` | `Outfit` | **Declaración borrada.** Hereda Helvetica Now Var del `body`, que es lo que ya renderizaba vía el fallback `sans-serif`. |
| `.nav-logo .tm`, `.nav-links a` | `Plus Jakarta Sans` | **Declaración borrada.** Ídem. |

**Regla:** ninguna regla puede nombrar una familia que el `<link>` no traiga. O se agrega al `<link>` (un peso por uso real, no el rango entero), o se borra la declaración y se hereda del `body`.

### Escalas

- `h1` — `clamp(48px, 7vw, 100px)`, peso 900, `line-height: .95`, `letter-spacing: -.03em`. El `h1` del hero sobreescribe inline a `clamp(36px, 6.5vw, 84px)`.
- `h2` — `clamp(36px, 5vw, 64px)`, peso 800. Dentro de `.elegant-section` pasa a Montserrat 700 **en mayúsculas**.
- `h3` — `clamp(18px, 2vw, 22px)`, peso 700.
- `.lede` — `clamp(15px, 1.6vw, 18px)`, `max-width: 52ch`, color secundario.
- `.tag-label` — 10px, `letter-spacing: .28em`, mayúsculas, con borde inferior. Es el rótulo que abre cada sección.

---

## 3. Componentes y patrones

### Superficies

- **`.film-grain`** — grano de película + viñeta. Un único `<div>` en `layout.tsx`, primer hijo del `<body>`, 100% CSS (sin `'use client'`, cero JS antes del LCP). Ver §4.
- **`.liquid-glass`** — botón de vidrio: fondo `rgba(255,255,255,.04)`, `backdrop-filter: blur(12px)` y un borde de gradiente simulado con `::before` + `mask-composite: exclude` (más brillante arriba y abajo, invisible al medio). Es el CTA secundario del sitio: lo usan el CTA del hero, el de Principiante, el CTA de cierre de `ProblemStepper` y el CTA del menú mobile.
- **`.gradient-border`** — el **segundo** borde por máscara del sistema, y **no** una variante del anterior: `.liquid-glass::before` es un `linear-gradient` estático y vertical, esto es un `conic-gradient` que gira. Solo comparten el truco de recorte (`-webkit-mask` de dos capas + `mask-composite: exclude`, que vacía el centro y deja el anillo del `padding`). Ver §4 para el movimiento.
  - **Regla dura: máximo DOS elementos en toda la página.** Hoy lo lleva uno solo — `.price-card.featured` (el comentario del propio `page.tsx` lo confirma: "único elemento de la página que lo lleva hoy... queda lugar para uno más"). `.calc-v2-wrapper` era el segundo en revisiones anteriores de este documento; se borró junto con toda la calculadora vieja (ver §3/§6), así que el cupo de "uno más" está libre. Un tercero y el recurso deja de señalar jerarquía y pasa a ser ruido.
  - El anillo (1,5px) se dibuja **por dentro** del borde de 1px que el elemento ya tenía (`--glass-border` en la calculadora, ámbar 30% en la featured). Como el cónico es transparente en ~la mitad de la vuelta, donde no hay barrido se sigue viendo el borde base: lee como un borde continuo con un brillo que lo recorre, no como doble borde.
  - En `.price-card` va en `::before` porque **`::after` ya está tomado** por el reflejo especular del tilt (z-index 1).
  - `.liquid-glass::before` **no se toca**: lo usan el CTA del hero, el de Principiante y el del menú mobile.
- **`.btn-gradient`** — CTA primario: gradiente ámbar horizontal, texto `#050505`, peso 700. Se levanta 1px en hover.
- **`.glass-card`** — contenedor genérico de vidrio con `blur(10px)`; en hover sube el borde a `--glass-border-active`. Solo lo usan las dos tarjetas de precio.
  - **Excepción, y era un bug:** `.price-card.featured` solo pisaba el `border-color` de `.glass-card`, pero `.glass-card:hover` lo volvía a subir a `--glass-border-active` (blanco 18%) — o sea que **al pasar el mouse la tarjeta destacada perdía su identidad ámbar y se volvía blanca**, justo en el momento de mayor intención de compra. Nunca se notó porque en reposo el borde ámbar al 30% es tenue. Hoy `.price-card.featured:hover` lo sube a ámbar 45%: en hover el ámbar **sube, no se va**.
- **`.whatsapp-float`** — el CTA final de WhatsApp del sitio hoy es este botón flotante (`WhatsAppFloat.tsx`, esquina inferior derecha, `position: fixed`), no `.btn-whatsapp` (ver nota en §1: esa clase quedó muerta). En reposo es vidrio gris (`rgba(15,15,15,.6)` + `blur(10px)`, borde blanco 12%); recién en `:hover` pasa a verde de marca (`#25d366`, borde y color) y se levanta 2px. Lleva un anillo `.whatsapp-float-ping` que pulsa cada 2,8s (`scale` + `opacity`, apagado bajo `prefers-reduced-motion`) para llamar la atención sin badge ni tooltip. Deliberadamente discreto: "aparece quieto en la esquina y solo reacciona al hover, para no competir con los CTAs principales de cada sección" (comentario del propio componente).

### Grillas de contenido (todas en variante "v2")

Comparten un mismo patrón: grilla con `gap: 1–2px` sobre un fondo `rgba(255,255,255,.06)`, de modo que **el gap dibuja las líneas divisorias** en vez de usar `border`. Contenedor con `border-radius: 20px` y `overflow: hidden`.

- **`.triage-v2-strip`** — tira de 3 columnas full-bleed con bordes laterales, renderizada directo en `page.tsx` (sin componente propio). Cada columna tiene número fantasma arriba a la derecha, cita en Montserrat 800, subtítulo y CTA; en hover se pinta la barra ámbar inferior (`scaleX(0) → 1`, `cubic-bezier(.16,1,.3,1)`), sube la opacidad del número y el CTA abre su `gap`.
- **`.problems-grid-v2`** — 2×2. Número grande ámbar al 12% de opacidad, título, cuerpo, barra ámbar inferior en hover. **Ya no es el modo por defecto de `#problema`** (ver "Piezas específicas" → `ProblemStepper`): hoy es el modo "ver los 4 de una", una vía de escape explícita desde el paso a paso. El markup y la clase son exactamente los mismos de antes.
- **`.features-grid-v2`** — 3 columnas (→2 en 900px, →1 en 560px). Número gigante fantasma posicionado arriba a la derecha, categoría en ámbar con `letter-spacing: .28em`, título y cuerpo. En hover aparece `.feature-shine` (ver abajo). Es la grilla de `OGCircleFeatures.tsx` (ver "Piezas específicas"): la clase no cambió, pero ahora convive con un riel lateral en mobile y un tour animado en desktop.

#### Tilt con reflejo especular (`[data-tilt]` + `TiltGrid.tsx`)

Las tres grillas de tarjetas —`.problems-grid-v2`, `.features-grid-v2` y `.prices-container`— comparten un solo mecanismo. `TiltGrid.tsx` es un wrapper cliente que envuelve la grilla y monta **un único listener de `pointermove` delegado**, con throttle por `requestAnimationFrame`; sube desde el target hasta la tarjeta que es hija directa de la grilla y le escribe cuatro custom properties: `--mx`/`--my` (posición del cursor en %) y `--rx`/`--ry` (rotación derivada, máximo **±5°** desde el centro). No renderiza nada más que el `<div>` de la grilla, así que el markup sigue siendo server-rendered.

- La tarjeta **solo lleva `transform` mientras el puntero está encima** (`[data-tilting]`). En reposo el transform es `none` a propósito: un elemento con transform 3D queda promovido a capa y su texto se rasteriza a escala, que es de dónde sale el clásico "texto borroso" de las tarjetas 3D.
- Entrada 0.1s lineal (para que siga al cursor sin lag), salida 0.5s `cubic-bezier(.16,1,.3,1)`; las dos duraciones se conmutan con `--tilt-dur`/`--tilt-ease` desde el propio `transition` de cada tarjeta.
- En las dos grillas donde el `gap` dibuja la divisoria, la tarjeta inclinada se levanta un **2,6%** (`--tilt-lift`) y sube a `z-index: 3`: eso tapa los ~4px que la rotación le roba al borde interior y evita que se abra una costura contra la vecina. En `.prices-container` (gap 20px, sin costuras) el lift es 1 y solo entra la sombra.
- **`.feature-shine`** es el reflejo especular que sigue al cursor, y la misma definición la comparten `.problem-card-v2::after` y `.price-card::after`. Son dos fuentes superpuestas: una blanca chica y ajustada (170px, 6%) sobre un halo ámbar más ancho (340px, 5,5%) — blanco a baja alfa + rim light ámbar, que es la regla del sistema. Sin JS (puntero grueso, reduced-motion) los valores caen a `20%/16%`, o sea el radial de esquina fijo original.
- Desactivado entero en `pointer: coarse` y bajo `prefers-reduced-motion`: ahí no se monta ni un listener. El reflejo en hover sí se mantiene bajo reduced-motion, porque es un fundido de opacidad y no un desplazamiento.
- `TiltGrid` acepta además una prop `lantern` (solo la usa `.problems-grid-v2`, es decir el modo "ver todos" de `ProblemStepper`) que escribe `data-lantern` sobre la grilla desde el mismo `bind()`. Es el único gancho de la linterna (ver abajo): así hereda exacto las dos condiciones que ya deciden si corre el tilt, en vez de duplicar los `matchMedia`.

#### La linterna sobre los problemas (`[data-lantern]` + `.problem-card-v2::before`)

Las 4 tarjetas de `.problems-grid-v2` se atenúan **mientras el puntero está dentro de la grilla**, y un halo que sigue al cursor devuelve el texto a opacidad plena a su paso. Todo el efecto es CSS: se dibuja con las mismas `--mx`/`--my` que ya escribe `TiltGrid` para el tilt, sin un solo listener ni observer nuevo. **Hoy solo se ve en el modo "ver los 4 de una" de `ProblemStepper`** (ver abajo) — el modo por defecto, paso a paso, no usa esta grilla ni este mecanismo.

- **Es un velo, no una opacidad.** El `::before` de la tarjeta es una capa del **mismo color que el fondo** (`--surface-1`) al 55%, con un agujero recortado por `mask-image: radial-gradient(260px circle at var(--mx) var(--my), …)`. Sobre ese fondo el resultado es idéntico pixel a pixel a poner `opacity: .45` en el contenido: `0.55·10 + 0.45·120 = 59.6`, o sea el 45% de 120 sobre el mismo fondo.
- **Por qué velo y no `opacity` sobre `.problem-content`:** `--mx`/`--my` son porcentajes relativos a la **tarjeta**, y `.problem-content` es un hijo que arranca abajo del número fantasma. El mismo 50% cae a alturas distintas en los dos, así que un `mask-image` sobre el contenido dejaba el halo desfasado en vertical. El velo va en la tarjeta, donde las coordenadas ya son las correctas.
- **`::before` y no `::after`:** `::after` es el reflejo especular compartido con `.feature-shine` y `.price-card::after`, y **no se toca**. De paso ese reflejo ya es el "halo ámbar que sigue al cursor": sumar un segundo glow ámbar sería duplicarlo. La linterna aporta el **revelado**; el ámbar lo pone el `::after` que ya estaba.
- **En las tarjetas sin cursor la máscara queda opaca entera.** El fallback de las custom properties es `var(--mx, -200%)`: el centro del agujero cae muy afuera de la tarjeta, así que se atenúan sin halo.
- **Piso de opacidad 45%, no 25%.** 25% dejaba el cuerpo de texto por debajo de cualquier umbral de lectura.
- **El DOM nunca se toca.** El markup de las 4 tarjetas es el mismo de siempre: el atenuado es una capa encima, nunca `display:none`, `visibility:hidden` ni contenido condicional.
- **Fail-safe:** todo cuelga de `[data-lantern]`, atributo que sólo escribe `TiltGrid` y sólo con `(hover:hover) and (pointer:fine)` y sin reduced-motion. Sin JS, en puntero grueso o con la preferencia activa el atributo no existe y el contenido se ve entero.

### Piezas específicas

- **`.nav-header`** — cápsula flotante: `position: fixed`, `top: 16px`, centrada con `translateX(-50%)`, `max-width: 1200px`, `border-radius: 9999px`, fondo `rgba(10,10,10,.45)` con `blur(16px)`, sombra proyectada + `inset` de highlight superior. Links y CTA aparecen recién en `≥1024px`; abajo de eso queda logo + hamburguesa. La cápsula además **trackea el scroll de la página** (ver "El nav como tracking del scroll", §4), y desde el commit `6791834` lleva un **barco viajando sobre esa misma franja de progreso** (`.nav-progress-track` / `.nav-progress-boat`, ver abajo).
- **`.nav-progress-boat`** — un buque de carga (SVG inline en `SiteHeader.tsx`: casco + contenedores apilados + puente de mando, no un velero — coherente con lo que VeGroup mueve) que viaja horizontalmente sobre el mismo inset de 32px que el hilo de progreso ámbar (`.nav-header::after`), posicionado con la misma `--progress` en CSS puro: no tiene estado ni listener propio. Lleva un bamboleo propio (`nav-boat-bob`, 2.6s `ease-in-out infinite`) independiente de su avance — el mismo patrón que después reutiliza el avión de `OGCircleFeatures` (`og-tour-plane-bob`).
- **`.mobile-nav-overlay`** — overlay full-screen con `blur(12px)`, animado por opacidad. Los links entran escalonados con `transitionDelay` calculado en `SiteHeader.tsx` (`350ms + idx*50`), y el cierre espera 500ms antes de desmontar.
- **`.calc-demo-cta-row`** (`CostCalculator.tsx`) — todo lo que queda in-page de la vieja calculadora: una fila simple con el texto "Probá el simulador de costos real, gratis" y un botón `.liquid-glass` ("Probar Demo") que dispara el modal por `CustomEvent` en vez de navegar. El panel de terminal falsa (tres puntos rojo/ámbar/verde), los dos paneles inputs/resultados y `AnimatedNumber` que describían revisiones anteriores de este documento **ya no existen** — no es CSS muerto, el componente entero se reescribió.
- **`.vg-demo` / `DemoModal.tsx`** (`app/styles/21-demo.css`, ~590 líneas) — el simulador real, portado de otro repo de VeGroup (`emilianoverabusiness-blip/vegroup`, commit `5bbca48`) y adaptado a este sistema de diseño en vez de traer su propia paleta: el original era "papel" (crema/tinta/dorado, `radius: 0`); acá cada variable de `.vg-demo` se remapea a los tokens dark existentes (`--paper: var(--surface-1)`, `--gold: var(--accent-from)`, etc.) para que un cambio de paleta del sitio se propague solo, sin literales nuevos. Tipografías también alineadas: `--font: Inter`, `--serif: Montserrat` — no se suma una tercera familia. Únicas dos excepciones de color, explícitamente recalibradas para fondo oscuro (los originales estaban tuneados para crema y quedaban apagados sobre `--surface-1`): verde `#4ade80` y rojo `#f87171` de estado (éxito/error), con el mismo piso de contraste ≥4.5:1 que ya exige `01-base.css` para `--text-muted`.
  - **`DemoModal.tsx`** es el **primer modal/dialog de todo el repo**: `createPortal` a `document.body`, `role="dialog"` + `aria-modal`, scroll lock (`body.style.overflow`), foco atrapado con Tab/Shift+Tab, cierre por Escape y devolución de foco al elemento que abrió el modal. Dos estados igual que el overlay mobile del nav (`open` monta/desmonta, `visible` dispara el fade sin desaparecer de golpe), con la duración espejada entre el `setTimeout` de JS y la transición CSS de `.vg-demo-modal-overlay`.
  - En mobile (`≤640px`) el diálogo pasa de tarjeta flotante a hoja full-bleed (`.vg-demo-modal-dialog`), mismo criterio que ya usa `.mobile-nav-overlay`.
  - El contenido interno (`DemoFlow` → `AgentQuote`, 717 + 772 líneas entre los dos) se carga con `next/dynamic({ ssr: false })` — mismo patrón que `Moon.tsx` — con un estado `loading` propio (`.vg-demo-modal-loading`, "Cargando simulador…") mientras baja el chunk.
- **`ProblemStepper.tsx`** (`#problema`) — reemplaza la exhibición simultánea de las 4 tarjetas de problema por una secuencia de a una: el usuario ve un problema, toca "Sí" o "No" (la respuesta no se guarda en ningún lado — es puro gesto de compromiso), y cualquiera de las dos opciones avanza al siguiente. Al llegar al 4°, un cierre corto con CTA hacia `#pilares-servicio`. Un `role="tablist"` de puntos numerados arriba permite saltar a cualquier paso. Regla dura del componente: **nunca ocultar contenido sin una salida a la vista completa** — el botón "Ver los 4 de una →" cambia a la grilla `.problems-grid-v2` de siempre (mismo markup, misma linterna). Por qué: en la grilla el usuario escaneaba los cuatro títulos en diagonal y seguía de largo; uno por vez fuerza a leer, y en mobile (la mayoría del tráfico, vía Instagram) saca de encima el scroll largo de cuatro tarjetas apiladas.
- **`OGCircleFeatures.tsx`** (`#pilares-servicio`) — la guía que dirige la mirada por las 6 features de OG Circle (`.features-grid-v2`), con dos mecanismos que **nunca corren juntos**:
  - **Mobile (`≤560px`):** scroll-driven. Un `IntersectionObserver` con banda central (mismo patrón que la sección activa del nav) marca la card que cruza el centro del viewport como "activa" (`data-og-active`): se ilumina y el punto correspondiente de un riel lateral (`.og-rail`) se enciende. Spotlight — solo una activa a la vez.
  - **Desktop (`≥901px`):** un tour automático, **una sola vez**, disparado al entrar la sección en viewport (mismo patrón "un reveal, una vez" que `SectionReveal`). Un ícono de avión (SVG inline) recorre las 6 cards siguiendo una curva Catmull-Rom con un "bulge" aleatorio por tramo — nunca la misma forma dos veces — calculada desde la posición **real** de las cards medida con `getBoundingClientRect`. El highlight de cada card no se agenda con timers a tiempo fijo: un loop de `requestAnimationFrame` lee la posición real del avión sobre el `<path>` SVG (`getPointAtLength`) con un solver exacto de `cubic-bezier(.45,.05,.55,.95)` — la misma curva que el CSS usa para mover el avión — así el highlight nunca se desincroniza del avión sea cual sea la duración del vuelo (17s). Al terminar, el avión desaparece y la línea (`.og-tour-line`) queda de fondo, tenue, permanente.
  - **Tablet (`561–900px`):** ninguno de los dos — grilla normal sin riel ni tour. Es el rango con menos tráfico real y ninguno de los dos mecanismos calzaba limpio en 2 columnas.
  - `prefers-reduced-motion`: ninguno de los dos mecanismos se monta.
- **`AmbientAudio.tsx`** — un botón mute/unmute (`Volume2`/`VolumeX` de `lucide-react`) que vive en `.nav-cta-group` junto al CTA de escritorio (`.nav-audio-toggle`). Controla un `<audio loop preload="none">` con `/audio/hero-theme.mp3`. Arranca muteado porque los navegadores bloquean el autoplay con sonido; recién al primer click el usuario decide activarlo (`audio.muted = false; audio.volume = 0.35; audio.play()`). `preload="none"` para no gastar ancho de banda hasta que alguien lo pida. No hay audio en mobile — el toggle solo está en el grupo de CTA de escritorio, que ya se oculta abajo de 1024px junto con el resto de `.nav-links`/`.nav-cta`.
- **`StoryCollapse.tsx`** (dentro de `#nosotros`) — un botón "Ver la historia completa ↓" que expande un `<ol>` de timeline (`.story-timeline`) con una entrada por año 2022–2025. **Contenido pendiente:** las cuatro entradas están hoy con placeholder literal ("Contenido próximamente.") tanto en el título como en el texto — no hay copy real todavía. El collapse en sí es un simple `useState` sin animación de altura (aparece/desaparece por render condicional), consistente con que no es una pieza de movimiento del sistema.
- **`WorldClocks.tsx`** (footer) — cuatro relojes en tiempo real: BUE (Buenos Aires), BCN (Barcelona/Madrid), GZH (Guangzhou) y MIA (Miami), vía `Intl.DateTimeFormat` nativo, sin dependencias. Actualiza una vez por minuto (se alinea al próximo cambio de minuto con `setTimeout`, no hace polling cada segundo porque solo muestra `HH:MM`). SSR-safe: el server emite `--:--` en las cuatro y el cliente corrige en el primer render — mismo fail-safe de "arrancar en un placeholder inerte" que ya usan `NumbersBar` (aunque ahí el placeholder es el valor final, no un guion; ver más abajo). Un punto junto a cada zona se pone verde (`.wc-dot--on`) si la hora local de esa zona cae en horario laboral (09:00–18:00).
- **`.hero-stage`** (`page.tsx` + `HeroParallax.tsx`) — el hero tiene **cuatro planos** (`.hero-layer--video`, `.hero-layer--sky`, `.hero-layer--dust`, `.hero-layer--text`, `.hero-layer--numbers` — cinco capas en el DOM, contando la del cielo) que responden al scroll del hero (`--hsp`, ver §4): el video se aleja y desatura, el texto y la barra de números suben y se desvanecen. No hay parallax de puntero — se probó y se sacó por sensación de traqueteo del video de fondo al mover el mouse. El velo de gradiente (`.hero-veil`) queda fijo al stage: si se moviera, la unión con el `#050505` de la sección de abajo dejaría de coincidir.
- **`.hero-layer--sky` / `Moon.tsx`** — capa entre el video y el polvo con la luna del hero y tres cometas CSS (`.comet--a/b/c`). La luna **no es CSS**: es una esfera real de Three.js (`@react-three/fiber`), con la textura fotográfica de la Luna (`public/textures/moon-2k.jpg`, NASA vía Solar System Scope, licencia CC BY 4.0 — el comentario del propio componente indica que "requiere atribución visible en algún lugar del sitio, ej. footer/créditos"; **no verificado en este documento si esa atribución ya existe en `page.tsx`** — no se encontró en el footer actual, punto para confirmar con el equipo) y una luz direccional que calcula el terminador (límite luz/sombra) de verdad, no un degradé fingido. El canvas **no se monta en pantallas `<481px`** (es un adorno, no vale la GPU de un teléfono de gama baja) y bajo `prefers-reduced-motion` se monta pero congelado (`frameloop: 'demand'`, sin rotación) — sigue siendo la luna real, solo que quieta. Se carga siempre vía `next/dynamic({ ssr: false })` desde `page.tsx`, nunca importada directo, para que `three`/`@react-three/fiber` no entren al chunk del render inicial.
- **`.route-ticker`** — marquee horizontal entre el triage y `#problema`, 100% CSS (sin componente, sin `'use client'`): dos grupos idénticos de 4 ciudades (Guangzhou/China, Miami/Florida·USA, Barcelona/España, Belgrano/CABA·Argentina) uno detrás del otro en `.route-ticker-track`, desplazados con una animación infinita — el segundo grupo (`aria-hidden`) es lo que permite el loop sin salto cuando el primero termina de salir.
- **`.hero-layer--dust`** — el plano de polvo: dos mosaicos (`.dust--a` / `.dust--b`) de 6 y 5 `radial-gradient` de 1–1,9px de blanco, con tamaños de mosaico distintos (300×260 y 430×380) y derivas de 52s y 88s. Se reutiliza tal cual, sin cambios, como fondo del **footer** (`.footer-stars`, ver abajo).
- **`.footer-stars`** — el mismo `.hero-layer--dust` del hero, montado de nuevo dentro de `<footer className="site-footer">` como decoración pura: el contenido real del footer (logo, `WorldClocks`, dirección, contacto) sigue siendo DOM normal por encima, en `z-index: 1`. Reusar la clase en vez de crear una nueva evita duplicar la definición de las 11 `radial-gradient` y las dos derivas.
- **`.hangar`** — el suelo de perspectiva infinita, nace en el borde inferior del hero. `perspective: 1100px` con `perspective-origin: 50% 100%` y un `.hangar-plane` de 800px con `rotateX(62deg)` pivotando sobre su borde cercano; el punto de fuga real cae 585px por encima del borde inferior, muy por arriba del alto del contenedor, así que **nunca se ve un horizonte duro**. La celda es rectangular a propósito —110px de ancho de bahía contra 64px de profundidad—: cuadrada quedaba una retícula de 20 columnas que se leía como Tron. Líneas de blanco al **9%** nominal (las transversales a 1,6px, porque la perspectiva las comprime en vertical y a 1px se les cae el alfa). Dos máscaras independientes: una **en espacio del plano** que apaga la grilla con la profundidad, y otra **en espacio de pantalla** sobre el contenedor que apaga los costados y suaviza el borde superior. `.hangar-haze` es la neblina del punto de fuga: blanco al 3% debajo de ámbar al 6%. `.hangar::before` es un velo oscuro que hunde el último tercio del hero hacia el `#050505` de la página.
- **`.numbers-bar`** (`NumbersBar.tsx`) — 3 métricas del hero. En `≤680px` colapsa a una lista vertical y los números bajan de `clamp(44px,6vw,76px)` a 18px, alineados en fila con su label. Los números **se cuentan solos** al entrar en viewport (ver §4).
- **`.glow-text`** — dos `text-shadow` ámbar muy difusos (80px y 160px). Solo en el `h1` del hero.
- **`.text-gradient`** — texto en gradiente ámbar: `background-clip: text` + `-webkit-text-fill-color: transparent`. Es una clase (no inline) para poder animarle el barrido (§4). Lleva `background-size: 200% 100%` y las **dos** puntas del recorrido son ámbar visible, así que si la animación no corre el texto se lee igual.

### `.elegant-section`

Wrapper que envuelve **todo el `<main>` desde el triage hacia abajo** (el hero queda afuera). No cambia layout: solo reasigna tipografías — `h2`/`h3` y labels a Montserrat, párrafos y listas a Inter. Fue la forma de aplicar el pase tipográfico "premium" (`ac2a468`) sin reescribir cada regla.

Tenía además un `opacity: .85` sobre `p`, `li` y `.lede` que **se borró** (ver §7). Dos motivos: apagaba un 15% todo el body copy de la mitad inferior del sitio sobre texto que ya era secundario, y `opacity` crea stacking context — en `.price-card`, que es `[data-tilt]` con un `::after` de reflejo especular en `z-index: 1`, un `<p>` con opacidad propia interactúa mal con ese reflejo. **El escalón de jerarquía lo da el alfa del color, no una capa encima.** Nótese que la regla solo alcanzaba a `p`/`li`/`.lede`: los `<span>` (como `.triage-v2-sub`) nunca la recibieron, así que su alfa declarado siempre fue su contraste real.

---

## 4. Movimiento

No hay librería de animación ni scroll-jacking. Solo se anima `transform`, `opacity`, `filter`, `clip-path`, `background-position` y `offset-distance` — nada que dispare layout. El presupuesto del sistema es duro: **nada se desplaza más de 24px ni rota más de 12°** (salvo las dos piezas narrativas que se mueven sobre un `<path>` propio — el barco del nav y el avión de OG Circle — que son la excepción explícita al presupuesto porque son el punto central de su propia sección, no un acompañamiento).

- **Hero** — video de fondo (`autoPlay muted loop playsInline preload="metadata"`) servido desde CloudFront, con `poster="/images/hero-poster.jpg"` (frame 0 del propio video, 1920×1086, 80 kB) para que no haya rectángulo negro si CloudFront tarda, y un `linear-gradient` de 4 paradas encima que lo funde con el `#050505` de la página en el borde inferior.
- **Scroll del hero (`--hsp`, 0 → 1 sobre los primeros 100vh)** — el video se aleja (`scale` −4%) y se desatura (`saturate` −55%, `brightness` −22%) mientras el texto sube 22px y la barra de números 12px, los dos fundiéndose. `--hsp` está registrado con `@property` y, donde el navegador soporta `animation-timeline: scroll()`, **lo resuelve el compositor sin un solo listener de scroll**; el `@supports` es la ruta rápida y `HeroParallax.tsx` detecta lo mismo con `CSS.supports` para no montar el fallback en JS al pedo.
- **`hangar-drift`** — la grilla del hangar se desplaza hacia el observador un mosaico de profundidad (64px) cada 9s, lineal e infinito. Se anima `background-position` y no `transform` a propósito: el plano mide 800×2270px y promoverlo a capa de composición costaría una textura enorme, mientras que repintar la franja visible sale barato.
- **`dust-a` / `dust-b`** — deriva vertical del polvo, 52s y 88s, exactamente un mosaico por ciclo para que el loop no tenga salto. Es `transform`, o sea compositor puro. Corre igual en el hero y en `.footer-stars` (misma clase reutilizada, ver §3).
- **La luna del hero** rota sobre su eje Y con `useFrame` de `@react-three/fiber` (`+= delta * 0.045` rad/frame), no con CSS — es geometría 3D real, no un sprite. Se congela bajo `prefers-reduced-motion` (ver §3).
- **Tilt de tarjetas** — ver §3. Entrada 0.1s lineal, salida 0.5s `cubic-bezier(.16,1,.3,1)`, máximo 5°.
- **Hover** — transiciones de 0.2–0.45s. Las barras de acento usan `cubic-bezier(.16,1,.3,1)`; el resto, `ease`.
- **`gradient-border-spin`** — el `conic-gradient` de `.gradient-border` da una vuelta cada **8s, lineal**. No lleva el easing del sistema a propósito: es un barrido continuo, no algo que "llega a lugar". Anima un único custom property, `--angle`, registrado con `@property`. Corre sobre exactamente **dos** elementos y su costo de pintado cae a cero cuando salen de pantalla, igual que `hangar-drift`.
- **Progreso de scroll del nav (`--progress`, 0 → 1 sobre el scroll de la página entera)** — ver "El nav como tracking del scroll" abajo. Mismo par CSS-first / JS-fallback que `--hsp`. El barco (`.nav-progress-boat`) se posiciona con la misma `--progress` y además bambolea con `nav-boat-bob` (2.6s `ease-in-out infinite`), independiente de su avance sobre la franja.
- **El avión de OG Circle (`og-tour-plane`)** — recorre un `<path>` SVG medido de las 6 cards reales con `offset-path`/`offset-distance` durante 17s con `cubic-bezier(.45,.05,.55,.95)`, y bambolea con `og-tour-plane-bob` mientras avanza — mismo patrón que el barco del nav (ver §3). Corre **una sola vez** por carga de página, solo en desktop (`≥901px`) y nunca bajo `prefers-reduced-motion`.
- **`num-flash`** — el destello ámbar de 0.6s `ease-out` en el borde inferior de cada `.num-card` cuando su contador termina. Arranca y termina en `opacity: 0`, así que se apaga solo.
- **`heading-reveal` + `text-gradient-sweep`** — el reveal de los h2, 0.7s con el easing del sistema, y el barrido del gradiente 0.9s `ease-out` con 200ms de retraso. El barrido anima `background-position`, que no dispara layout ni reflow del texto.
- **Grano de película (`.film-grain`)** — **no se anima**, y esa es la decisión de diseño: un grano animado es un repintado full-viewport por frame. Por eso tampoco tiene entrada en el bloque de `prefers-reduced-motion` (no hay movimiento que apagar).
- **`whatsapp-ping`** — el anillo de `.whatsapp-float` se expande y desvanece cada 2.8s (`scale` 1→1.5, `opacity` .5→0). Apagado bajo `prefers-reduced-motion` (`animation: none; display: none`).
- **Los relojes del footer y el toggle de audio no animan nada por CSS/rAF**: `WorldClocks` re-renderiza texto una vez por minuto vía `setTimeout`, y `AmbientAudio` solo cambia el ícono (`Volume2`/`VolumeX`) al tocar. Ninguno de los dos entra en el presupuesto de movimiento del sistema ni en la tabla de degradación de abajo, porque no hay nada que degradar.
- `scroll-behavior: smooth` en `html`, para los anclas de la nav.

### Custom properties registrados (`@property`)

Son **tres**, y los tres existen porque un custom property sin registrar no es animable:

| Property | `syntax` | `inherits` | Por qué |
|---|---|---|---|
| `--hsp` | `<number>` | **`true`** | Lo escribe `.hero-stage` y lo leen sus planos hijos: tiene que bajar por el árbol. |
| `--angle` | `<angle>` | **`false`** | Lo consume únicamente el `::before` que lo declara. Si heredara, cualquier `.gradient-border` anidado —o cualquier hijo— arrastraría el ángulo del padre y quedarían sincronizados por accidente. |
| `--progress` | `<number>` | **`true`** | Lo escribe `.nav-header` y lo leen su `::after` y el barco. **No es opcional:** un pseudo-elemento hereda de su elemento originador, así que con `inherits: false` el `::after` recibiría el `initial-value` (0) y el hilo no se movería nunca. |

### Grano de película y viñeta

Capa fija (`position: fixed; inset: 0; pointer-events: none`) que cubre todo el contenido.

- **`z-index: 99`, no 9999.** El techo del sitio es `.nav-header` (100). Con 9999 el grano quedaría por encima de la cápsula del nav, que es `backdrop-filter: blur(16px)`, y sobre un vidrio esmerilado el ruido se lee como **suciedad**, no como grano. Con 99 el grano cubre todo el contenido —incluido `.mobile-nav-overlay`, que está en 40— y deja limpia la única pieza que tiene que estarlo.
- **Sin `mix-blend-mode`.** Se evaluaron `overlay` y `soft-light` y fallan por lo mismo: los dos son no-ops en 50% de gris y su delta escala con la luminancia del fondo. Con blending normal el aporte no depende del fondo y la textura queda pareja. **El repo sigue sin un solo `mix-blend-mode`.**
- **La receta del ruido está medida**, no estimada (feTurbulence → canvas → `getImageData`, 25.600 muestras). `color-interpolation-filters='sRGB'` es obligatorio. Resultado a `opacity: .032` sobre `#050505`: **+2,4/255 de levantado del negro y ±1,8/255 de grano a 1σ**. Ese ±1,8 es ~1 LSB, la amplitud exacta de dithering que **rompe el banding** del `linear-gradient` de 4 paradas de `.hero-veil`.

Va en el `<body>` y **no** en `.hero-stage`: bajo `@supports (animation-timeline: scroll())` el stage recibe `hero-scroll` con `animation-fill-mode: both`, y un hijo ahí quedaría atado al parallax sin motivo.

### Reveal de los h2

Los `h2` de `.elegant-section` se revelan con `clip-path: inset()` abriéndose de abajo hacia arriba + `filter: blur(4px)` que resuelve + `opacity`. Sin desplazamiento: el `clip-path` ya da la sensación de entrada.

- **No se usa `animation-timeline: view()`.** Una view timeline **scrubea** contra la posición de scroll, así que al volver hacia arriba el reveal se deshace — y el requisito es que cada h2 se revele **una sola vez**. Por eso hay **un solo mecanismo** (`IntersectionObserver` + animación por tiempo, en `SectionReveal.tsx`) y no el par CSS-first/JS-fallback de `--hsp`.
- **El estado por defecto es VISIBLE.** No existe ninguna regla base que esconda un h2: lo oculto vive detrás de `[data-reveal='pending']`, atributo que solo escribe `SectionReveal.tsx`. Si el JS no corre, los h2 quedan como los renderizó el server.
- **Tres estados, todos escritos por JS:** `pending` (abajo del fold, escondido, esperando), `in` (entró, anima una vez) y `done` (ya estaba en pantalla al cargar → visible, **sin** animar).
- Cada elemento se hace `unobserve` en su primer disparo: once-only por construcción.

### El nav como tracking del scroll

La cápsula flotante hace dos cosas a la vez, con dos mecanismos independientes que viven en un solo `useEffect` de `SiteHeader.tsx`.

**1. Hilo de progreso (+ barco).** Un hilo ámbar de 2px en el borde inferior de la cápsula que se llena con el progreso de scroll de la **página entera** (no del hero), con un buque de carga viajando sobre esa misma franja (ver §3, `.nav-progress-boat`).

- Va en `.nav-header::after` y no en un hijo del JSX porque el `<nav>` está **siempre montado**, así que el hilo funciona igual en desktop y en mobile.
- **`scaleX()`, no `width`:** `width` dispara layout en cada frame de scroll.
- **Inset de 32px a cada lado** = el radio efectivo de la cápsula. Así el hilo cae sobre el tramo **recto** del borde inferior.
- **Mismo par CSS-first / JS-fallback que `--hsp`:** donde el navegador soporta `animation-timeline: scroll(root block)` lo resuelve el compositor; el fallback es **un** listener de `scroll` en `window`, `passive`, throttleado por rAF.

**2. Sección activa.** El link de la sección que cruza el centro del viewport sube de blanco 60% a blanco pleno y le aparece un punto ámbar de 4px debajo.

- **Un solo `IntersectionObserver`**, con `rootMargin: -30% 0px -30% 0px` (ajustado desde `-45%/-45%` en el commit `99f6ffd` — "fix: adjust nav scroll spy rootMargin for shorter sections like Nosotros" — porque la banda de 10vh original era demasiado angosta para que la sección `#nosotros`, más corta que el resto, llegara a cruzarla). Hoy deja una banda de ~40vh centrada en el viewport.
- **`NAV_LINKS` tiene hoy 5 entradas**, no 4: `#problema`, `#pilares-servicio`, `#calculadora`, `#nosotros`, `#precios` (el nav ganó el link a `#pilares-servicio`/OG Circle en un commit reciente — ver `git log` de `SiteHeader.tsx`). `#no-es-para-vos` sigue siendo la única sección de `page.tsx` sin link propio: en ese tramo ninguna sección está en la banda y el highlight **desaparece**, que es lo correcto.
- Si dos secciones cruzan la banda a la vez, gana la última en orden de documento. Nunca hay más de un link marcado: el estado es un único id.
- El punto es un `::after` **absoluto**: aparecer y desaparecer no mueve un pixel del layout del nav. El highlight no es sólo visual: también se escribe `aria-current`.

### Los números del hero que se cuentan solos

`6`, `3` y `+5` cuentan desde 0 con `easeOutExpo` (900ms) al entrar la `.numbers-bar` en viewport, escalonados **0 / 120 / 240ms**, y cada uno dispara `num-flash` en su borde inferior al terminar.

- **`NumbersBar.tsx` es un componente cliente propio.** El `h1`, el CTA y el video —el LCP real— siguen siendo server-only.
- **El valor por defecto es el FINAL.** Mismo fail-safe que el reveal de los h2: el estado inicial del hook es el string final, así que eso es lo que emite el server y lo que ve cualquiera sin JS.
- **Un solo `IntersectionObserver`, sobre el contenedor** y no sobre los tres números, con `unobserve` en el primer disparo.
- Bajo `prefers-reduced-motion` no se monta ni el observer: los tres quedan en su valor final, sin conteo y sin flash.

### Degradación

| | Desktop | Mobile / `pointer: coarse` | `prefers-reduced-motion` |
|---|---|---|---|
| Hangar | grilla + deriva hacia el observador | grilla estática, 140px de alto, celda más chica | grilla estática |
| Parallax del hero | 4 planos, scroll | 4 planos, solo scroll; sin `translateZ` ni `scale` | todo quieto, opacidad plena, video pausado en su primer frame (= el `poster`) |
| Luna del hero | esfera 3D real, rota | no se monta el canvas (`<481px`) | se monta pero congelada (`frameloop: 'demand'`, sin rotación) |
| Polvo / footer-stars | 2 mosaicos derivando | visible pero quieto, opacidad 0.4 | quieto |
| Tilt + reflejo | sigue al cursor | sin tilt; el reflejo queda en su origen fijo | sin tilt; el reflejo en hover se mantiene |
| Grano + viñeta | igual en los tres casos — no se anima, así que no hay nada que degradar |||
| `.gradient-border` | cónico girando cada 8s | ídem | sin barrido: se reemplaza por el gradiente ámbar plano del sistema |
| Reveal de los h2 | `clip-path` + blur al entrar, una vez | ídem | no se escribe ni un atributo: quedan visibles y quietos |
| Hilo de progreso + barco del nav | se llena con el scroll de la página | ídem (el `<nav>` está montado en todos los tamaños) | apagado entero: `display: none` y el JS no se engancha |
| Sección activa del nav | blanco pleno + punto ámbar | ídem | se mantiene (es color, no movimiento); el punto pierde el escalado de entrada y queda sólo el fundido |
| Contador de los números | cuenta 0 → valor, escalonado, + flash | ídem | no se monta ni el observer: valores finales, sin conteo ni flash |
| Linterna de "ver todos" en `#problema` | velo al 55% + halo que sigue al cursor | apagada: las 4 tarjetas se leen completas, siempre | apagada, ídem |
| Riel/tour de OG Circle | riel apagado (no es mobile), tour de avión una vez | riel de spotlight scroll-driven, sin tour | ninguno de los dos se monta: la grilla de 6 features se lee completa y estática |
| Ping de `.whatsapp-float` | pulsa cada 2.8s | ídem | apagado (`display: none`) |

El bloque `@media (prefers-reduced-motion: reduce)` es el último del archivo y por eso el bloque del eje Z va **deliberadamente antes**: `@media` no suma especificidad, así que si estuviera después le ganaría y la preferencia del usuario quedaría sin efecto.

En `.gradient-border` **no alcanza con `animation: none`**: sin animación el cónico se congela en `--angle: 0deg` y su arco transparente deja un tramo del canto sin dibujar. Por eso además se reemplaza por el gradiente ámbar plano, que cierra el anillo entero.

---

## 5. Layout y responsive

- **`.wrap`** — `max-width: 1240px`, `padding-inline: clamp(20px, 5vw, 72px)`.
- **`.section-pad`** — `padding-block: clamp(72px, 10vw, 140px)`.
- Breakpoints en uso: **1024px** (nav desktop), **940px** (colapso genérico de grillas: precios + founder grid), **901px** y **560px** (tour/riel de `OGCircleFeatures`, ver §3 y §4), **900px** y **560px** (colapso de columnas de `.features-grid-v2`), **720px** (triage, calculadora, problemas), **680px** (numbers bar y degradación del hangar), **640px** (tamaño de `.whatsapp-float`).

Los pares que quedan apareados a propósito: `680px` (la `.numbers-bar` colapsa junto con el hangar, que vive en el mismo hero) y el par `901px`/`560px` de `OGCircleFeatures` (el tour de desktop y el riel de mobile son mutuamente excluyentes — nunca hay un rango intermedio donde corran los dos, ni un hueco donde no corra ninguno salvo la banda 561–900px, que es deliberada).

**Nota:** el 1024px que antes apagaba el "3D del blueprint" ya no aplica a nada — ese breakpoint en la sección `.bp-*` de `globals.css` sigue en el CSS (es CSS muerto, ver §6) pero no lo consume ningún componente montado.

---

## 6. Estado del build

- **El sitio dejó de ser 100% estático.** `app/api/demo/*` (4 rutas: `identify`, `dolar`, `lead`, `analyze`) es el primer backend propio del repo — corren en `runtime: 'nodejs'`, llaman a la API de Anthropic (Claude Sonnet 5 para clasificación NCM, Haiku 4.5 para el análisis de marketing — la elección de modelo está atada al costo: Haiku es ~5× más barato y acá alcanza porque es redacción, no razonamiento fino) y a `dolarapi.com` para la cotización oficial. Rate limiting propio sobre **`@vercel/kv`** (nueva dependencia). El resto de la landing (hero, precios, FAQ, nav, footer) sigue sin tocar ningún servidor.
- **Motor de cálculo portado, no reescrito.** `app/lib/demo/calc.js` y `app/lib/demo/ncmSearch.js` son copias literales (comentario explícito en cabecera, con hash de commit de origen) de otro repo de VeGroup — la instrucción del propio archivo es "no editar acá: cualquier cambio se hace upstream y se vuelve a copiar". Quien toque estos dos archivos debería saber que rompe esa paridad.
- **Tailwind está configurado pero desactivado.** `tailwind.config.js` y `postcss.config.mjs` siguen en el repo, pero las directivas `@tailwind` fueron removidas de `globals.css`: el markup usa CSS propio + estilos inline, y el único output que generaba eran ~1.4 kB de utilidades sin usar. El reset lo provee el bloque `*, *::before, *::after`.
- **Iconos** — `lucide-react` (`ArrowRight`, `Users` en `page.tsx`; `Menu`, `X` en `SiteHeader.tsx`; `Volume2`, `VolumeX` en `AmbientAudio.tsx`). El resto de los íconos (flechas de CTA, el buque del nav, el avión de OG Circle, el logo de WhatsApp) son SVG inline.
- **CSS muerto — corrección respecto a la revisión anterior de este documento.** La revisión previa afirmaba que ya no quedaba CSS muerto en el repo. Hoy sí queda, y es sustancial:
  - **`.bp-*`** (`.bp-wrapper`, `.bp-sidebar`, `.bp-nav-*`, `.bp-viewport`, `.bp-stage`, `.bp-rotator`, `.bp-face*`, `.bp-detail-*`, `.bp-checklist*`, ~530 líneas entre `globals.css:2020` y `globals.css:2508`, más su bloque de `prefers-reduced-motion` propio cerca del final del archivo) — era el contenedor marítimo 3D de `BlueprintSteps.tsx`. Ese componente **ya no existe** en `app/components/` y ningún `.tsx` del repo importa ni escribe esas clases hoy. El comentario de `app/layout.tsx` (línea ~50) todavía menciona `.bp-detail-heading` al explicar por qué Montserrat carga el peso 800 — la mención sigue siendo técnicamente cierta (la regla CSS existe y pide ese peso) pero es una referencia a una clase sin uso visual.
  - **`.btn-whatsapp`** (`globals.css:1239–1261`) — ver nota en §1. Ningún componente la referencia; el CTA de WhatsApp real es `.whatsapp-float`.
  - El resto de los bloques v1 documentados en la revisión anterior (`.blueprint-container` / `.blueprint-nav*` / `.step-*`, `.calc-container` / `.calc-form` / `.calc-group` / `.result-row`, `.triage-grid` / `.triage-panel` / `.triage-link`, `.faq-container`, `.problems-grid` / `.problem-card` sin sufijo `-v2`) siguen borrados, según la propia nota que los documenta en `globals.css:751`. El markup vivo usa las variantes `-v2` (más `.problem-stepper-*`, `.og-*`, `.route-ticker*`, `.wc-*`, `.story-*`, `.whatsapp-float*`, `.ambient-audio-toggle`, `.nav-progress-*`). `.faq-list` y sus hijos **sí** están en uso (no son parte de `.faq-container`).
- **Assets — corregido respecto a la revisión anterior.** La revisión previa listaba `public/videos/step_1..4.mp4` y `public/images/step_*.png` como assets sin usar. **Esos archivos ya no están en el repo** (`public/` hoy solo tiene tres archivos, los tres en uso):
  - `public/images/hero-poster.jpg` (1920×1086, 80 kB) — frame 0 del video del hero, extraído con ffmpeg. El único video del sitio es el del hero y es remoto (CloudFront).
  - `public/audio/hero-theme.mp3` — pista ambiental que activa `AmbientAudio.tsx`, cargada con `preload="none"` (no se descarga hasta que el usuario la activa).
  - `public/textures/moon-2k.jpg` — textura de la luna del hero (`Moon.tsx`), NASA vía Solar System Scope, CC BY 4.0. **Punto sin verificar:** el propio comentario del componente pide una atribución visible en el sitio (footer/créditos) y no se encontró ese crédito en `page.tsx`; confirmar con el equipo si falta agregarlo o si ya se resolvió por otra vía (términos de uso, página aparte, etc.).
  - No quedan assets propios sin referenciar.

---

## 7. Accesibilidad — puntos abiertos

### Contraste — resuelto

Todo el texto secundario y los labels llegan a **4.5:1** (WCAG 2.1 AA, texto normal). Los ratios se calculan componiendo el `rgba` real sobre el fondo real, no sobre negro puro:

| Regla | Antes | Después | Fondo |
|---|---|---|---|
| `--text-muted` (`.num-card .label`) | 2.34:1 (α .28) | **4.62:1** (α .46) | `--bg` |
| `.triage-v2-sub` | 3.07:1 (α .35) | **4.62:1** (α .46) | `--bg` |
| `.triage-v2-cta` | 2.53:1 (α .30) | **4.62:1** (α .46) | `--bg` |
| `.feature-body` | 3.22:1 (α .42) | **4.50:1** (α .45) | `--surface-1` |
| `.problem-body` | 3.54:1 | **4.50:1** | `--surface-1` |
| `.lede` en `.elegant-section` | 4.07:1 | **5.30:1** | `--bg` |

Las dos últimas no cambiaron de color: subieron al borrarse el `opacity: .85` de `.elegant-section` (ver §3).

**Alfas mínimas de referencia** para 4.5:1 con blanco puro, por fondo: `--bg` → **0.4529**; `--surface-1` → **0.4500**; `--surface-3` → **0.4523**; `--surface-2` → **0.4512**. De ahí que sobre la página el piso sea `.46` y sobre las tarjetas alcance `.45`.

Sin tocar: `--text-primary` (17.1:1) y el ámbar `#d99e00` sobre `--bg` (8.3:1) ya cumplían de sobra.

Quedan por debajo de AA, fuera del alcance de este pase: `.bp-nav-sub` (α .30, en CSS muerto — no impacta a ningún usuario real, ver §6). Los `.calc-v2-*` que documentaban revisiones anteriores de este apartado ya no existen (ver nota de historial arriba y §3/§6): el contraste del Demo nuevo (`.vg-demo`, `DemoModal.tsx`) **no fue auditado todavía** — punto abierto, ver abajo.

### Otros

- Los elementos decorativos (barras, números fantasma, gradientes) ya llevan `aria-hidden="true"` de forma consistente — incluidos los planos decorativos del hero, el hangar, `.footer-stars`, el riel/línea de OG Circle y el barco del nav.
- **Punto abierto, asumido a conciencia — la linterna de "ver todos" en `#problema`.** Mientras el puntero está dentro de la grilla, el texto de las tarjetas que no están bajo el halo cae a un 45% de su valor compuesto: `.problem-body` pasa de 4.50:1 a ~1.9:1 y `.problem-title` de 17.1:1 a ~4.3:1. Es la única regla del sitio que baja texto por debajo de AA a propósito. Se acota con cuatro cosas: el DOM está siempre completo, el piso es 45% y no el 25% de la idea original, el efecto **sólo existe mientras el puntero está en la grilla**, y está apagado entero bajo `pointer: coarse`, `prefers-reduced-motion` y sin JS. Con `ProblemStepper` como modo por defecto, la mayoría de las visitas ya ni pasa por este modo — solo quien toca explícitamente "Ver los 4 de una".
- **Resuelto:** el video del hero ya respeta `prefers-reduced-motion`. Sale del server con `autoPlay` para no perder tiempo de LCP, y `HeroParallax.tsx` le saca el atributo y lo pausa en `t=0` si la preferencia está activa (también reacciona al `change` del media query, sin recargar).
- **`AmbientAudio.tsx`** expone `aria-pressed` y un `aria-label` que cambia según el estado ("Activar música" / "Silenciar música") — patrón correcto de toggle accesible.
- **`WorldClocks.tsx`** lleva `aria-label="Horarios de nuestras oficinas"` en el contenedor y un `title` descriptivo por reloj ("BUE: Horario laboral activo…"); el punto de estado también lleva su propio `aria-label`.
- **Punto sin verificar:** el Demo (`DemoModal.tsx` → `AgentQuote.jsx` y el resto de `app/components/demo/`) no pasó por una auditoría de accesibilidad ni de contraste — sí tiene los fundamentals del propio modal (foco atrapado, `role="dialog"`, `aria-modal`, Escape, devolución de foco, ver §3), pero el contenido interno (inputs, resultados, análisis de IA) es código portado de otro repo, no auditado en este documento.
- **Punto sin verificar:** no se auditó el foco de teclado del tour de `OGCircleFeatures` ni de los estados `data-og-active`/`data-lantern` — son puramente visuales (no cambian el orden de tabulación ni el contenido accesible), pero no se confirmó con un lector de pantalla real que el avión/riel decorativos no generen ruido adicional más allá del `aria-hidden` que ya llevan.
