# Fase 4 — Producción y Monitoreo

**Objetivo:** Pulido final, cumplimiento RGPD, security headers completos, monitoreo activo en producción y rendimiento optimizado.

**Estado:** Pendiente  
**Requisitos cubiertos:** RNF-01 → RNF-05 · RNF-16 → RNF-21 · RNF-22 → RNF-24 · RNF-37 → RNF-43

---

## Funcionalidades

| Tarea | Descripción |
|---|---|
| Tema claro / oscuro | Persistido en `localStorage`, detecta preferencia del SO (RNF-21) |
| Accesibilidad WCAG 2.1 AA | Contraste, navegación por teclado, labels en formularios (RNF-18) |
| Responsive 320px → 1920px | Revisión final en todos los breakpoints (RNF-16) |
| Política de privacidad | Página pública `/privacidad` (RNF-41) |
| Términos de uso | Página pública `/terminos` (RNF-41) |
| Aviso de cookies | Banner conforme a RGPD (RNF-43) |
| Derecho al olvido | Flujo para que el usuario solicite borrar sus datos (RNF-42) |
| Optimización de bundle | Lazy loading de rutas, análisis con `vite-bundle-visualizer` (RNF-04) |
| Error boundaries | Componentes `<ErrorBoundary>` en rutas críticas |

---

## Base de datos

### Tabla `solicitudes_baja`

```sql
create table solicitudes_baja (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id),
  email      text not null,
  motivo     text,
  estado     text check (estado in ('pendiente','procesada')) default 'pendiente',
  created_at timestamptz default now()
);
```

### Índices de rendimiento

```sql
-- Mejorar consultas de disponibilidad
create index idx_citas_negocio_fecha on citas(negocio_id, fecha);
create index idx_disponibilidad_negocio on disponibilidad(negocio_id, dia_semana);
create index idx_bloqueos_negocio_fecha on bloqueos(negocio_id, fecha);
```

---

## Seguridad

### Security Headers completos — `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "X-Permitted-Cross-Domain-Policies", "value": "none" },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.umami.is; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://sentry.io https://o*.ingest.sentry.io; img-src 'self' data: blob: https://*.supabase.co; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

> Ajustar el `script-src` y `connect-src` según los dominios reales de Betterstack y Umami en producción.

### CORS — revisión final

Verificar en Supabase dashboard que solo están los orígenes de producción. Eliminar `localhost` del listado de orígenes permitidos antes del go-live.

### RLS — solicitudes_baja

```sql
alter table solicitudes_baja enable row level security;

create policy "Usuario crea su propia solicitud de baja"
  on solicitudes_baja for insert with check (auth.uid() = user_id);

create policy "Solo admin gestiona solicitudes de baja"
  on solicitudes_baja for select using (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'admin')
  );
```

---

## Herramientas de monitoreo

### Betterstack — Uptime Monitoring

| Config | Valor |
|---|---|
| URL monitoreada | `https://www.arkanaappointments.com` |
| Intervalo de chequeo | 1 min |
| Alerta | Email + canal configurado si uptime < 99% |
| Status page | Pública en Betterstack (`status.arkanaappointments.com` futuro) |

> **Dependencia:** No requiere paquete npm. Se configura desde el dashboard de Betterstack apuntando a la URL de producción.

### Sentry — Producción

| Config | Valor |
|---|---|
| Paquete | `@sentry/react` (instalado en Fase 1) |
| DSN | Variable de entorno `VITE_SENTRY_DSN` |
| Sample rate | `tracesSampleRate: 0.2` en producción (20%) |
| Release tracking | Integración con Vercel para asociar releases a deploys |
| Alertas activas | Error rate > 1% en 5 min · Errores nuevos no vistos antes |

```ts
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  environment: import.meta.env.MODE,
})
```

### Umami Analytics — Privacy-first

| Config | Valor |
|---|---|
| Paquete | Script externo (sin npm) |
| Datos | Sin cookies, cumple RGPD out-of-the-box |
| Script | `<script defer src="https://analytics.umami.is/script.js" data-website-id="...">` |
| Eventos clave trackeados | `reserva_completada`, `qr_escaneado`, `registro_negocio`, `cancelacion_cita` |

```html
<!-- index.html -->
<script
  defer
  src="https://analytics.umami.is/script.js"
  data-website-id="UMAMI_WEBSITE_ID"
></script>
```

```ts
// Trackear evento desde React
declare const umami: { track: (event: string, data?: object) => void }

umami.track('reserva_completada', { servicio: servicioNombre })
```

---

## Checklist de go-live

- [ ] Security Headers activos y verificados en [securityheaders.com](https://securityheaders.com)
- [ ] HTTPS forzado (HSTS activo)
- [ ] CORS solo con origen de producción
- [ ] RLS activo en todas las tablas
- [ ] Variables de entorno en Vercel (no en código)
- [ ] Sentry DSN configurado y recibiendo eventos
- [ ] Betterstack monitor activo
- [ ] Umami script en `index.html`
- [ ] Política de privacidad y términos accesibles
- [ ] Banner de cookies visible
- [ ] Flujo de reserva probado end-to-end en producción
- [ ] Bundle size < 300 KB (RNF-04)
- [ ] LCP < 2.5 s en 4G (RNF-01)
