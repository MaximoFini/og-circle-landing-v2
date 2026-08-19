# Resumen Ejecutivo — VeGroup / Outsider Jota
**Versión:** 2.2 — 09/08/2026
**Estado:** Spec unificado para arranque de desarrollo

---

## 1. Qué es la plataforma

Outsider Jota es una plataforma cerrada para personas en Argentina (20-40 años) que quieren importar y vender online. Combina formación en video con acceso a herramientas operativas reales: calculadora de costos de importación, directorio de agentes de compra en China, red de profesionales, tracking de envíos y servicios financieros.

El acceso se vende en **2 niveles** (Principiante / Avanzado) con **pago único y acceso de por vida** al nivel comprado. Todos los niveles incluyen el contenido formativo completo.

**Lanzamiento previsto:** segunda quincena de agosto 2026.

---

## 2. Pantallas y funcionalidades

### 2.1 Landing page pública
- Descripción de la plataforma, propuesta de valor y precios de cada nivel
- CTA de registro / compra
- Página pública, sin login requerido para verla
- Separada de la plataforma privada (post-login)

### 2.2 Registro, login y checkout
- Registro con email + contraseña y login social (Google y Apple)
- Recuperación de contraseña por email
- Selección de nivel al registrarse: Principiante ($75.000 ARS) o Avanzado ($125.000 ARS)
- Pago con Mercado Pago — automático vía webhook, activa el acceso instantáneamente
- Pago por transferencia bancaria o USDT — el usuario sube el comprobante; un administrador confirma el pago manualmente desde el panel de administración antes de que se active el acceso
- Flujo de upgrade: usuarios con nivel Principiante pueden subir a Avanzado pagando $60.000 ARS adicionales ($135.000 ARS total)
- Los precios viven en variables de configuración para poder modificarlos sin tocar código

### 2.3 Inicio (Dashboard)
- Ticker superior con información de depósitos/CUIT y botón de carga de packing list / proforma FOB
- Stats del usuario: nivel activo, videos completados, envíos activos
- Stage 1: 8 videos de importaciones — se muestran con estado "próximamente" hasta que los videos estén grabados y disponibles
- Banner con acceso directo a la calculadora de costos
- Stage 2: 3 videos para armar tienda (Tienda Nube, Shopify, ambas con Claude Code) — mismo criterio que Stage 1
- Directorio de 6 agentes de compra en China + video explicativo
- Banner de comunidad
- Sección de profesionales al servicio (4 perfiles: contable, automatizaciones, agencia MKT, UGC creator)
- Sección de servicios financieros (pagos al exterior, gestión financiera, calculadora de costos locales)
- El contenido restringido por nivel queda bloqueado visualmente con indicación del nivel necesario para desbloquearlo

### 2.4 Calculadora
- Enlace directo a la calculadora ya construida en `vegroup.vercel.app/calculadora` — no se reconstruye
- Pendiente: confirmar si se migra al mismo dominio de la plataforma o se mantiene externa

### 2.5 Comunidad
- Feed tipo foro: publicar, dar like, comentar
- Widget lateral con miembros activos / en línea

### 2.6 Tracking de envíos
- Integración con Traxcargo vía enlace directo — mismo modelo que la calculadora, sin API ni reconstrucción
- Pendiente: confirmar con Traxcargo si el enlace acepta parámetros por número de seguimiento, para pre-cargar el número desde la plataforma

### 2.7 Perfil
- Datos del usuario y nivel activo
- Accesos habilitados según nivel
- Accesos rápidos: mis envíos, documentos, cerrar sesión
- Soporte vía link directo a WhatsApp (no API — solo `wa.me`)

### 2.8 Panel de administración
- Confirmación manual de pagos por transferencia bancaria y USDT (con visualización del comprobante subido)
- Gestión de usuarios: ver nivel activo, activar o cambiar nivel manualmente
- Gestión de contenido: agentes de compra, videos, profesionales, servicios
- Actualización de precios sin tocar código

---

## 3. Matriz de acceso por nivel

| Recurso | Principiante ($75k) | Avanzado ($125k) |
|---|:---:|:---:|
| Stage 1 completo (8 videos) | ✓ | ✓ |
| Calculadora de costos | ✓ | ✓ |
| Comunidad | ✓ | ✓ |
| Profesionales al servicio | ✓ | ✓ |
| Servicios financieros | ✓ | ✓ |
| Depósito Miami + China | — | ✓ |
| Depósito España | — | ✓ |
| Agente de muestras | — | ✓ |
| Agente de volumen / fábricas | — | ✓ |
| Flete + despacho gestionado | — | ✓ |
| Traxcargo tracking | — | ✓ |
| Marítimo (m³) | — | ✓ |
| SWIFT para pagos a China | — | ✓ |


---

## 4. Stack técnico

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend + backend | Next.js (App Router) en Vercel | Mismo ecosistema que la calculadora existente |
| Base de datos | Supabase (PostgreSQL) | Auth out-of-the-box, storage, Row-Level Security para control de acceso por nivel |
| Pagos | SDK oficial de Mercado Pago | Automatización completa vía webhooks |
| Videos | YouTube no listado (lanzamiento) | Gratis, rápido, sin integración compleja — migrable a Vimeo o Mux en el futuro |
| Storage | Supabase Storage | Comprobantes de pago, packing lists, proformas FOB |
| Emails transaccionales | Resend o SendGrid | Bienvenida, confirmación de pago, reset de contraseña |

La seguridad de acceso por niveles se implementa con Row-Level Security directamente en la base de datos desde el schema inicial — un usuario Principiante no puede obtener contenido de Avanzado aunque haga una consulta directa.

---

## 5. Requisitos legales antes del lanzamiento

Los siguientes documentos son responsabilidad de Jota. El programador los integra como páginas estáticas dentro de la plataforma cuando Jota los entregue. Son un blocker para habilitar cobros.

- **Términos y Condiciones**
- **Política de Privacidad**
- **Política de Reembolsos** — legalmente obligatoria en Argentina para ventas online

La facturación AFIP aplica únicamente a los cobros procesados por Mercado Pago.

---

## 6. Preguntas pendientes

| # | Pregunta | Impacto |
|---|---|---|
| 2 | ¿El enlace de Traxcargo acepta parámetros por número de seguimiento? | Define cómo funciona el módulo de tracking |

---

## 7. Alcance por fases

### Fase 1 — Validación

Se construye una landing page que presenta la plataforma completa: con diseño, descripción de cada nivel, precios y un botón de compra. Cuando el usuario hace clic en comprar, en lugar de ir al checkout, entra a una lista de espera con un beneficio por ser early adopter (10% de descuento al momento del lanzamiento). El objetivo es confirmar que hay demanda real antes de invertir en el desarrollo de la plataforma completa.

- Landing page que presenta la plataforma como si ya estuviera desarrollada
- Botón de compra que deriva a lista de espera (no a un checkout real)
- Formulario de lista de espera con descuento del 10% para los primeros en anotarse
- Medición de clics, conversiones y nivel de interés por nivel de acceso

### Fase 2 — MVP para cobrar

MVP significa Minimum Viable Product: la versión más simple del producto que ya permite generar ingresos reales. No tiene todas las funcionalidades, pero sí las suficientes para que un usuario pueda registrarse, pagar y acceder al valor central de la plataforma. Esta fase se construye solo si la Fase 1 confirma que hay demanda.

- Registro + login (email + contraseña + Google/Apple) y recuperación de contraseña
- Checkout con Mercado Pago (automático vía webhook)
- Panel de administración mínimo: activación de nivel y gestión de usuarios
- Dashboard básico con Stage 1 y Stage 2 (con placeholders hasta que los videos estén listos)
- Enlace a la calculadora existente
- Directorio de agentes de compra en China
- Sección de profesionales al servicio
- Sección de servicios financieros
- Perfil básico: datos del usuario, nivel activo, accesos habilitados, soporte vía link de WhatsApp
- Páginas legales: Términos y Condiciones, Política de Privacidad, Política de Reembolsos (el contenido lo entrega Jota)
- Emails transaccionales: bienvenida, confirmación de pago, reset de contraseña

### Fase 3 — Primeros usuarios pagando

Con ingresos reales y los primeros usuarios activos, se incorporan métodos de pago alternativos, herramientas operativas clave y se completa el panel de administración para que el equipo pueda gestionar la plataforma de forma autónoma.

- Transferencia bancaria y USDT como método de pago (manual vía panel)
- Flujo de upgrade entre niveles
- Ticker superior con depósitos/CUIT y carga de packing list / proforma FOB
- Tracking vía enlace de Traxcargo
- Panel de administración completo: gestión de contenido, precios y pagos manuales

### Fase 4 — Post-tracción

Tracción significa que el modelo de negocio está probado: hay usuarios activos, pagos y demanda sostenida en el tiempo. Post-tracción es la etapa en la que el producto ya funciona y se invierte en features que mejoran la experiencia y la retención, no en validar si el negocio tiene sentido (eso ya está probado).

- Comunidad: feed, publicar y widget lateral de miembros activos
- Likes y comentarios en comunidad
- Video hosting definitivo (Vimeo o Mux) cuando los videos estén grabados
- Mejoras al panel de administración según necesidades operativas

