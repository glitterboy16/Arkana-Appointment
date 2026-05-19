# Fase 4 — Producción y endurecimiento

**Objetivo:** Conformidad RGPD, security headers completos, error boundaries, lazy loading y limpieza final antes de la entrega.

**Estado:** ✅ Completada (monitoreo externo pospuesto)
**Periodo:** mayo 2026
**Requisitos cubiertos:** RNF-04, RNF-12, RNF-15, RNF-21, RNF-30, RNF-37, RNF-41 → RNF-43

---

## Funcionalidades entregadas

| Tarea | Estado | Commit ancla |
|---|---|---|
| Tema claro / oscuro (RNF-21) | ✅ | `8201b5c` |
| Responsive 320 px → 1920 px (RNF-16) | ✅ | `1bb2ef0` |
| Política de privacidad `/privacidad` (RNF-41) | ✅ | `92b068c` |
| Términos de uso `/terminos` (RNF-41) | ✅ | `92b068c` |
| Aviso de cookies con opt-in RGPD (RNF-43) | ✅ | `92b068c`, `c6f5d84` (full-width) |
| Derecho al olvido (RNF-42) | ✅ Vía RPC `admin_delete_usuario`. | `c6f5d84` |
| Optimización del bundle (lazy loading + code-split por ruta) | ✅ | `92b068c` |
| Error boundaries en rutas críticas | ✅ Con log a `error_logs`. | `92b068c` |
| Security headers completos en `vercel.json` (CSP, HSTS, X-Frame, X-XSS, Referrer, Permissions) | ✅ | `92b068c` |

---

## Security headers en `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "X-Permitted-Cross-Domain-Policies", "value": "none" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://api.mapbox.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com; img-src 'self' data: blob: https://*.supabase.co https://*.mapbox.com https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        }
      ]
    }
  ]
}
```

---

## Lazy loading

Todas las páginas se importan con `React.lazy(...)` y se envuelven con un único `<Suspense fallback={<FullScreenLoader />}>` en `src/App.tsx`. El resultado en producción:

- `index` (núcleo + router + auth context): **≈ 496 KB** sin gzip, **≈ 148 KB** gzip.
- Cada página baja como chunk independiente entre 1 KB y 32 KB.
- El geocoder de Mapbox solo se carga cuando el negocio edita su dirección.

---

## Error boundaries

Componente `src/components/app/ErrorBoundary.tsx`. Se envuelve la app entera y, por separado, cada sección crítica (`/panel`, `/app`, `/admin`). Cuando un componente lanza:

1. Se muestra una pantalla amistosa con dos acciones (`Reintentar` y `Volver al inicio`).
2. Se inserta una fila en `error_logs` con contexto `boundary.<seccion>`, mensaje, stack recortado y `componentStack`.

---

## RGPD

- **Banner de cookies** (`CookieBanner.tsx`): barra full-width abajo con dos opciones — *Solo necesarias* y *Aceptar*. El consentimiento se persiste en `localStorage` con la clave `arkana.cookies.consent.v1`.
- **Política de privacidad y términos de uso**: páginas estáticas en español, enlazadas desde el footer y desde el propio banner.
- **Derecho al olvido**: el admin elimina al usuario por completo con un solo clic, sin dejar restos en `auth.users` ni en las tablas de la app.

---

## Monitoreo externo (roadmap)

| Herramienta | Estado | Sustituto en MVP |
|---|---|---|
| Sentry | 🔵 | Tabla `error_logs` consultable desde SQL. |
| Betterstack | 🔵 | — |
| Umami Analytics | 🔵 | — |

---

## Checklist de go-live

- [x] Security headers verificados y activos
- [x] HTTPS forzado (HSTS activo)
- [x] Variables de entorno en Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MAPBOX_TOKEN`)
- [x] Política de privacidad y términos accesibles desde el footer
- [x] Banner de cookies visible y persistido
- [x] Flujo de reserva probado end-to-end en producción
- [x] Bundle inicial < 200 KB gzip
- [x] LCP < 2,5 s en 4G
