# VeGroup / Outsider Jota — Plan de Implementación
**Versión:** 2.2 — 09/08/2026
**Distribución de features por fase**

---

## Fase 01 — Validación

Se construye una landing page que presenta la plataforma completa: con diseño, descripción de cada nivel, precios y un botón de compra. Cuando el usuario hace clic en comprar, en lugar de ir al checkout, entra a una lista de espera con un beneficio por ser early adopter (10% de descuento al momento del lanzamiento). El objetivo es confirmar que hay demanda real antes de invertir en el desarrollo de la plataforma completa.

- Landing page que presenta la plataforma como si ya estuviera desarrollada
- Botón de compra que deriva a lista de espera (no a un checkout real)
- Formulario de lista de espera con descuento del 10% para los primeros en anotarse
- Medición de clics, conversiones y nivel de interés por nivel de acceso

---

## Fase 02 — MVP para cobrar

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

---

## Fase 03 — Primeros usuarios pagando

Con ingresos reales y los primeros usuarios activos, se incorporan métodos de pago alternativos, herramientas operativas clave y se completa el panel de administración para que el equipo pueda gestionar la plataforma de forma autónoma.

- Transferencia bancaria y USDT como método de pago (manual vía panel)
- Flujo de upgrade entre niveles
- Ticker superior con depósitos/CUIT y carga de packing list / proforma FOB
- Tracking vía enlace de Traxcargo
- Panel de administración completo: gestión de contenido, precios y pagos manuales

---

## Fase 04 — Post-tracción

Tracción significa que el modelo de negocio está probado: hay usuarios activos, pagos y demanda sostenida en el tiempo. Post-tracción es la etapa en la que el producto ya funciona y se invierte en features que mejoran la experiencia y la retención, no en validar si el negocio tiene sentido (eso ya está probado).

- Comunidad: feed, publicar y widget lateral de miembros activos
- Likes y comentarios en comunidad
- Video hosting definitivo (Vimeo o Mux) cuando los videos estén grabados
- Mejoras al panel de administración según necesidades operativas
