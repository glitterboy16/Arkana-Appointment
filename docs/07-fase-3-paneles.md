# Fase 3 — Paneles y Notificaciones

**Objetivo:** Gestión completa para el negocio y el administrador. Notificaciones WhatsApp activas e interfaz en múltiples idiomas.

**Estado:** Pendiente  
**Requisitos cubiertos:** RF-28 → RF-45 · RNF-19 → RNF-20 · RNF-25 → RNF-29

---

## Funcionalidades

### Panel del negocio

| ID | Descripción |
|---|---|
| RF-28 | Listado de citas filtrable por fecha y estado |
| RF-29 | Confirmar, rechazar o cancelar citas |
| RF-30 | Marcar cita como completada |
| RF-31 | Detalle de cita (datos del cliente y servicio) |
| RF-32 | Notificación WhatsApp al cliente en cada cambio de estado |
| RF-33 | Vista calendario (día / semana) |

### Panel de administración

| ID | Descripción |
|---|---|
| RF-34 | Listado de negocios con filtros (estado, rubro) |
| RF-35 | Crear, editar, suspender o eliminar negocios |
| RF-36 | Listado de usuarios (clientes y empresas) |
| RF-37 | Crear, editar o eliminar usuarios |
| RF-38 | Métricas agregadas (negocios activos, citas del día, nuevos usuarios) |

### Notificaciones WhatsApp

| ID | Descripción |
|---|---|
| RF-39 | Notificación al crear cita (a cliente y negocio) |
| RF-40 | Notificación al modificar estado de cita |
| RF-41 | Notificación al cancelar cita |
| RF-42 | Plantillas editables desde el panel admin |

### Internacionalización

| ID | Descripción |
|---|---|
| RF-43 | Soporte multiidioma mínimo: español + inglés |
| RF-44 | Detección automática del idioma del navegador |
| RF-45 | Cambio manual de idioma persistido en localStorage |

---

## Base de datos

### Tabla `notificaciones_log`

```sql
create table notificaciones_log (
  id           uuid primary key default gen_random_uuid(),
  cita_id      uuid references citas(id) on delete cascade not null,
  tipo         text check (tipo in ('creacion','confirmacion','cancelacion','modificacion')),
  destinatario text not null, -- número WhatsApp
  estado       text check (estado in ('enviado','fallido','pendiente')) default 'pendiente',
  error        text,
  created_at   timestamptz default now()
);
```

### Tabla `plantillas_whatsapp`

```sql
create table plantillas_whatsapp (
  id        uuid primary key default gen_random_uuid(),
  tipo      text unique not null,
  mensaje   text not null,
  activa    boolean default true,
  updated_at timestamptz default now()
);
```

### Tabla `audit_log`

```sql
create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id),
  accion      text not null, -- 'login','reserva','cancelacion','suspension_usuario'
  tabla       text,
  registro_id uuid,
  ip          text,
  created_at  timestamptz default now()
);
```

---

## Seguridad

### RLS — tablas de administración

```sql
-- notificaciones_log: solo admin y negocio dueño
alter table notificaciones_log enable row level security;

create policy "Negocio ve sus notificaciones"
  on notificaciones_log for select using (
    exists (
      select 1 from citas c
      join negocios n on n.id = c.negocio_id
      where c.id = cita_id and n.user_id = auth.uid()
    )
  );

create policy "Admin ve todas las notificaciones"
  on notificaciones_log for select using (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'admin')
  );

-- audit_log: solo admin
alter table audit_log enable row level security;

create policy "Solo admin accede al audit_log"
  on audit_log for select using (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'admin')
  );

-- plantillas_whatsapp: lectura para todos, escritura solo admin
alter table plantillas_whatsapp enable row level security;

create policy "Lectura pública de plantillas"
  on plantillas_whatsapp for select using (activa = true);

create policy "Solo admin edita plantillas"
  on plantillas_whatsapp for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'admin')
  );
```

### CORS — Edge Functions WhatsApp

Cada Supabase Edge Function de notificación debe incluir los headers CORS y manejar el preflight:

```ts
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  // lógica de notificación...
})
```

### Security Headers — actualización

Añadir en `vercel.json` el header `X-Permitted-Cross-Domain-Policies` y reforzar `Referrer-Policy`:

```json
{ "key": "X-Permitted-Cross-Domain-Policies", "value": "none" }
```

---

## Herramientas

| Herramienta | Acción en esta fase |
|---|---|
| **Sentry** | Configurar alertas para errores en notificaciones WhatsApp fallidas (`notificaciones_log.estado = 'fallido'`). Añadir context de usuario autenticado al iniciar sesión. |
| **Umami Analytics** | Instalar script en `index.html`. Trackear eventos clave: `reserva_completada`, `qr_escaneado`, `panel_negocio_abierto`. |

```ts
// Sentry — identificar usuario autenticado
Sentry.setUser({ id: user.id, email: user.email, role: perfil.rol })

// Umami — evento de reserva
umami.track('reserva_completada', { negocio_id, servicio_id })
```

> Ver `04-stack-dependencias.md` para la configuración completa de Umami.
