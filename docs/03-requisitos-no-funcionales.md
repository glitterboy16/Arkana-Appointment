# 3. Requisitos no funcionales

Los requisitos no funcionales definen **cómo** debe comportarse el sistema: atributos de calidad, restricciones técnicas y exigencias del entorno. Se numeran con el prefijo `RNF-XX`.

> **Leyenda de estado**
> · ✅ Cubierto en el MVP
> · 🟡 Cubierto de forma parcial
> · 🔵 Pospuesto a roadmap

## 3.1. Rendimiento

| ID | Requisito | Métrica objetivo | Estado |
|---|---|---|---|
| RNF-01 | Tiempo de carga inicial (LCP) en 4G. | < 2,5 s | ✅ Lazy loading por ruta + chunks por página. |
| RNF-02 | Tiempo de respuesta de una reserva. | < 1,5 s | ✅ |
| RNF-03 | Consulta de disponibilidad horaria. | < 500 ms | ✅ Índices `idx_citas_negocio_fecha` y `idx_disponibilidad_negocio_dia` en migración 011. |
| RNF-04 | Bundle inicial minificado y comprimido (gzip). | < 300 KB inicial | 🟡 El index inicial es ≈148 KB gzip; el chunk del geocoder de Mapbox (≈500 KB gzip) solo se carga al editar la dirección del negocio. |
| RNF-05 | Soportar al menos 500 reservas/día por negocio sin degradación. | 500/día | ✅ |

## 3.2. Seguridad

| ID | Requisito | Estado |
|---|---|---|
| RNF-06 | Toda la comunicación va por **HTTPS** (forzado por Vercel + HSTS). | ✅ |
| RNF-07 | Las contraseñas no se guardan en claro. Las gestiona Supabase Auth con bcrypt. | ✅ |
| RNF-08 | Cada usuario solo accede a sus datos según su rol. La autorización se aplica desde la capa de aplicación y, en producción, se reactivará **RLS** sobre las tablas críticas. | 🟡 En el MVP las políticas RLS quedan desactivadas a nivel base de datos para evitar bloqueos durante el desarrollo; los filtros se aplican en cliente. Endurecer las políticas es la primera tarea del roadmap. |
| RNF-09 | Las páginas privadas verifican sesión antes de mostrar contenido (`AppLayout`, `ClienteLayout`, `AdminLayout`). | ✅ |
| RNF-10 | Las claves privadas no llegan al navegador. Solo se exponen `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_MAPBOX_TOKEN` (claves públicas). | ✅ |
| RNF-11 | Los archivos con datos sensibles (`.env.local`, `supabase/`) están en `.gitignore`. | ✅ |
| RNF-12 | Cumplimiento RGPD: política de privacidad, términos de uso, banner de cookies y derecho al olvido. | ✅ |
| RNF-13 | Enlace de recuperación de contraseña expira en 1 h. | 🔵 Recuperación por correo pospuesta. |
| RNF-14 | Registro de **eventos clave** en la tabla `error_logs`: errores de auth, reservas, carga del panel admin, etc. | ✅ |
| RNF-15 | **Security headers** completos en `vercel.json`: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy. | ✅ |

## 3.3. Usabilidad y accesibilidad

| ID | Requisito | Estado |
|---|---|---|
| RNF-16 | Interfaz **responsive** de 320 px a 1920 px. | ✅ Sidebar drawer en móvil, loaders animados, grids fluidos. |
| RNF-17 | Flujo de reserva en menos de 5 pasos desde el QR hasta la confirmación. | ✅ QR → selección servicio → fecha y franja → datos de contacto → confirmación (4 pasos). |
| RNF-18 | WCAG 2.1 nivel AA en contraste, navegación por teclado y etiquetas. | 🟡 Se aplica contraste y semántica básica; auditoría WCAG formal queda en roadmap. |
| RNF-19 | Mensajes de error **comprensibles**, sin trazas técnicas. Traducción automática de los códigos típicos de Supabase. | ✅ |
| RNF-20 | Soporte multiidioma (mín. español e inglés). | 🔵 MVP en español. |
| RNF-21 | **Tema claro y oscuro** unificado en toda la app con transiciones suaves. | ✅ |

## 3.4. Disponibilidad y fiabilidad

| ID | Requisito | Métrica | Estado |
|---|---|---|---|
| RNF-22 | Disponibilidad mensual del servicio. | ≥ 99 % | ✅ Uptime heredado de Vercel + Supabase. |
| RNF-23 | Degradación con elegancia: una operación que falla muestra un mensaje y registra el incidente en `error_logs` sin romper la sesión. | — | ✅ |
| RNF-24 | Backups automáticos en la base de datos. | Diario, retención 7 días | ✅ Plan gratuito de Supabase. |

## 3.5. Mantenibilidad

| ID | Requisito | Estado |
|---|---|---|
| RNF-25 | TypeScript en modo estricto (`strict: true`). | ✅ |
| RNF-26 | Separación por capas: `pages/`, `components/`, `contexts/`, `layouts/`, `lib/`, `hooks/`. | ✅ |
| RNF-27 | Estrategia de ramas: `main` (producción, despliega a Vercel) + `feature/*` para cada tanda de trabajo, con merge `--no-ff`. | ✅ |
| RNF-28 | Cada cambio sube primero a su rama y se integra cuando está estable. | ✅ |
| RNF-29 | README y carpeta `docs/` actualizados con la documentación funcional, técnica y los manuales de despliegue, usuario y técnico. | ✅ |
| RNF-30 | **Error boundaries** en rutas críticas (`/panel`, `/app`, `/admin`) que registran el error en `error_logs` y permiten reintentar sin recargar. | ✅ |

## 3.6. Compatibilidad

| ID | Requisito | Estado |
|---|---|---|
| RNF-31 | Funcionamiento en Chrome, Firefox, Safari y Edge (últimas 2 versiones) y en móvil con iOS 15+ o Android 10+. | ✅ |

## 3.7. Despliegue y entorno

| ID | Requisito | Estado |
|---|---|---|
| RNF-37 | Despliegue de producción en **Vercel** con integración continua desde `main`. | ✅ |
| RNF-38 | Despliegues de vista previa por rama / Pull Request. | ✅ Las ramas `feature/*` generan preview deployment automático. |
| RNF-39 | Base de datos y autenticación en **Supabase** (región EU). | ✅ |
| RNF-40 | Gestión de variables de entorno en Vercel (producción) y `.env.local` (desarrollo). | ✅ Tres variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MAPBOX_TOKEN`. |

## 3.8. Legal y conformidad

| ID | Requisito | Estado |
|---|---|---|
| RNF-41 | Política de privacidad y términos de uso accesibles desde cualquier página. | ✅ Enlaces en el footer; rutas `/privacidad` y `/terminos`. |
| RNF-42 | Conservación de datos personales solo el tiempo necesario; eliminación a petición del titular. | ✅ El admin elimina por completo al usuario vía RPC `admin_delete_usuario` (borra `auth.users`, `public.usuarios` y sus negocios asociados en una sola transacción). |
| RNF-43 | Aviso de cookies conforme al RGPD. | ✅ |

## 3.9. Monitoreo (roadmap)

| ID | Requisito | Estado |
|---|---|---|
| RNF-44 | Captura de errores en producción con Sentry. | 🔵 Se reemplaza por la tabla `error_logs` visible desde el panel admin. |
| RNF-45 | Uptime monitoring con Betterstack. | 🔵 |
| RNF-46 | Analíticas privacy-first con Umami. | 🔵 |
