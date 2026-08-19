# BASE-DE-DATOS.md

Estructura de datos extraída del brief técnico (`inicio-proyecto/brief-tecnico-programador.md`, sección 4). Es un punto de partida sugerido por Jota, **no definitivo**.

## Stack sugerido

Postgres gestionado (Supabase o Neon) — Supabase además resuelve auth (email/password + Google/Apple OAuth) out-of-the-box.

## Modelo de datos

```
users
  id, email, password_hash, oauth_provider, oauth_id,
  full_name, phone, level (principiante|avanzado|profesional),
  level_status (active|pending_payment|expired), created_at

payments
  id, user_id, method (mercadopago|transferencia|usdt),
  amount, currency, status (pending|confirmed|rejected),
  proof_url (comprobante subido, para transferencia/usdt),
  mp_payment_id (si es Mercado Pago), confirmed_by, confirmed_at

agents (agentes de compra en China)
  id, name, avatar_url, rating, review_count,
  work_methods (array: WeChat, 1688, Video call, Fábricas...),
  contact_info

community_posts
  id, user_id, text, created_at
community_likes
  id, post_id, user_id
community_comments
  id, post_id, user_id, text, created_at

shipments (tracking)
  id, user_id, tracking_code, origin, status,
  steps (json: [{title, sub, state, date}])

video_progress
  id, user_id, video_id, stage, watched_at
```

## Matriz de niveles de acceso

Referencia para el campo `users.level` y qué desbloquea cada uno:

| Recurso | Principiante | Avanzado | Profesional |
|---|:---:|:---:|:---:|
| Depósito Miami + China | — | ✓ | ✓ |
| Depósito España | — | — | ✓ |
| Agente de muestras | — | ✓ | ✓ |
| Agente de volumen / fábricas | — | — | ✓ |
| Flete + despacho gestionado | — | ✓ | ✓ |
| Traxcargo tracking | — | ✓ | ✓ |
| Marítimo (m³) | — | — | ✓ |
| SWIFT para pagos a China | — | — | ✓ |

Todos los niveles incluyen Stage 1 completo y acceso a los 4 sistemas base (calculadora, comunidad, profesionales, servicios financieros). Los precios de cada nivel todavía no están definidos — el checkout debe soportar que se carguen/cambien fácil desde el código o una variable de configuración, ya que no hay panel admin.

## Nota sobre pagos por transferencia / USDT

Mercado Pago se automatiza de punta a punta (webhook). Transferencia bancaria y USDT requieren verificación manual antes de activar `payments.status = confirmed` — como no hay panel de administración, se resuelve con un mini-endpoint/script que marca el pago como confirmado, o se posterga y solo se habilita Mercado Pago para el lanzamiento (ver sección 8 del brief).
