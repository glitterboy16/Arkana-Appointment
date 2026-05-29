# Requisitos no funcionales

Los requisitos no funcionales definen **cómo** debe comportarse el sistema: atributos de calidad, restricciones técnicas y exigencias del entorno.

> **Leyenda de estado**
> · ✅ Cubierto en el MVP
> · 🟡 Cubierto de forma parcial
> · 🔵 Pospuesto a roadmap

---

## Rendimiento

| ID | Requisito | Métrica | Estado |
|---|---|---|---|
| RNF-01 | Tiempo de carga inicial (LCP) en 4G. | < 2,5 s | ✅ Lazy loading por ruta + chunks por página. |
| RNF-02 | Tiempo de respuesta de una reserva. | < 1,5 s | ✅ |
| RNF-03 | Consulta de disponibilidad horaria. | < 500 ms | ✅ Índices en `citas` y `disponibilidad`. |
| RNF-04 | Bundle inicial minificado y comprimido. | < 300 KB gzip | 🟡 Index inicial ≈ 148 KB gzip; chunk del geocoder de Mapbox solo se carga al editar dirección. |
| RNF-05 | Soportar ≥ 500 reservas/día por negocio sin degradación. | — | ✅ |

---

## Seguridad

| ID | Requisito | Estado |
|---|---|---|
| RNF-06 | Toda la comunicación va por HTTPS (forzado por Vercel + HSTS). | ✅ |
| RNF-07 | Las contraseñas se almacenan con bcrypt gestionado por Supabase Auth. | ✅ |
| RNF-08 | RLS activa en tablas críticas; operaciones admin ejecutadas con `SECURITY DEFINER`. | 
| RNF-09 | Las páginas privadas verifican sesión y email confirmado antes de mostrar contenido. | ✅ `AppLayout`, `ClienteLayout` y `AdminLayout` con guardas de rol + email. |
| RNF-10 | Las claves privadas no llegan al navegador. Solo se exponen las claves públicas de Supabase y Mapbox. | ✅ |
| RNF-11 | Archivos con datos sensibles (`.env`, configuración interna) excluidos del repositorio. | ✅ |
| RNF-12 | Cumplimiento RGPD: política de privacidad, términos, banner de cookies y derecho al olvido. | ✅ |
| RNF-13 | Recuperación de contraseña por correo con enlace de uso único. | ✅ |
| RNF-14 | Registro de eventos clave en la tabla `whatsapp_log` y `notificaciones`. | ✅ |
| RNF-15 | Security headers completos en `vercel.json`: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. | ✅ |
| RNF-16 | Verificación de email obligatoria antes de acceder a la app. | ✅ Gate en `AppLayout` y `ClienteLayout`. |
| RNF-17 | Integridad de slots: no pueden existir dos citas activas para el mismo negocio, fecha y hora. | ✅ Índice único parcial en base de datos (`WHERE estado <> 'cancelled'`). |

---

## Usabilidad y accesibilidad

| ID | Requisito | Estado |
|---|---|---|
| RNF-18 | Interfaz responsive de 320 px a 1920 px. | ✅ Sidebar drawer en móvil, grids fluidos. |
| RNF-19 | Flujo de reserva en ≤ 5 pasos desde el QR. | ✅ QR → servicio → fecha/hora → datos → confirmación (4 pasos). |
| RNF-20 | WCAG 2.1 nivel AA en contraste, navegación por teclado y etiquetas semánticas. | 🟡 Contraste y semántica básica cubiertos; auditoría formal en roadmap. |
| RNF-21 | Mensajes de error comprensibles, sin trazas técnicas. | ✅ |
| RNF-22 | Tema claro y oscuro en toda la app. | ✅ |

---

## Disponibilidad y fiabilidad

| ID | Requisito | Métrica | Estado |
|---|---|---|---|
| RNF-23 | Disponibilidad mensual del servicio. | ≥ 99 % | ✅ Uptime heredado de Vercel + Supabase. |
| RNF-24 | Degradación con elegancia: operación fallida → mensaje de error sin romper la sesión. | — | ✅ |
| RNF-25 | Backups automáticos de la base de datos. | Diario, 7 días | ✅ Plan gratuito de Supabase. |

---

## Mantenibilidad

| ID | Requisito | Estado |
|---|---|---|
| RNF-26 | TypeScript en modo estricto. | ✅ |
| RNF-27 | Separación por capas: `pages/`, `components/`, `contexts/`, `layouts/`, `lib/`, `hooks/`. | ✅ |
| RNF-28 | Estrategia de ramas: `main` (producción) + `feature/*` para cada tanda de trabajo. | ✅ |
| RNF-29 | Documentación funcional, técnica y manuales actualizados en `docs/`. | ✅ |
| RNF-30 | Error boundaries en rutas críticas que capturan el error y permiten reintentar sin recargar. | ✅ |

---

## Compatibilidad

| ID | Requisito | Estado |
|---|---|---|
| RNF-31 | Chrome, Firefox, Safari y Edge (últimas 2 versiones) · iOS 15+ · Android 10+. | ✅ |

---

## Despliegue

| ID | Requisito | Estado |
|---|---|---|
| RNF-32 | Despliegue continuo desde `main` en Vercel. | ✅ |
| RNF-33 | Base de datos y auth en Supabase (región EU). | ✅ |
| RNF-34 | Variables de entorno gestionadas en Vercel (producción) y `.env.local` (desarrollo). | ✅ |

---

## Legal y conformidad

| ID | Requisito | Estado |
|---|---|---|
| RNF-35 | Política de privacidad y términos accesibles desde cualquier página. | ✅ Footer en todas las páginas; rutas `/privacidad` y `/terminos`. |
| RNF-38 | Eliminación completa de datos a petición del titular (derecho al olvido). | ✅ RPC `admin_delete_usuario` borra en cascada auth, perfil y negocios. |
| RNF-37 | Aviso de cookies conforme al RGPD. | ✅ |
| RNF-38 | Páginas de estado, seguridad y sobre el proyecto accesibles públicamente. | ✅ `/estado`, `/seguridad`, `/sobre-nosotros`. |

---
