# Fase 1 — Cimientos

**Objetivo:** Base funcional del sistema. Auth, perfil de negocio, generación de QR y estructura de base de datos principal.

**Estado:** Pendiente  
**Requisitos cubiertos:** RF-01 → RF-15 · RNF-06 → RNF-14

---

## Funcionalidades

| ID | Descripción | Módulo |
|---|---|---|
| RF-01 | Registro de negocio (email, contraseña, nombre, rubro) | Auth |
| RF-02 | Registro de cliente (email, contraseña, nombre) | Auth |
| RF-03 | Inicio de sesión con email/contraseña | Auth |
| RF-04 | Cierre de sesión | Auth |
| RF-05 | Recuperación de contraseña por correo | Auth |
| RF-06 | Actualización de contraseña desde enlace | Auth |
| RF-07 | Modificación de datos personales (nombre, correo, avatar) | Auth |
| RF-08 | Validación de formato email + contraseña segura | Auth |
| RF-09 | Asignación de rol al iniciar sesión + redirección al panel | Auth |
| RF-10 | Edición del perfil público del negocio | Negocio |
| RF-11 | Catálogo de servicios (nombre, descripción, duración, precio) | Negocio |
| RF-12 | Activar/desactivar servicios | Negocio |
| RF-13 | Generación automática de código QR único por negocio | QR |
| RF-14 | Descarga del QR en PNG y SVG | QR |
| RF-15 | URL pública única `/negocio/:codigoQr` | Routing |

---

## Base de datos

### Tabla `negocios`

```sql
create table negocios (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  nombre      text not null,
  descripcion text,
  rubro       text,
  direccion   text,
  telefono    text,
  logo_url    text,
  qr_code     text unique,
  activo      boolean default true,
  created_at  timestamptz default now()
);
```

### Tabla `servicios`

```sql
create table servicios (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid references negocios(id) on delete cascade not null,
  nombre      text not null,
  descripcion text,
  duracion    integer not null, -- minutos
  precio      numeric(10,2),
  activo      boolean default true,
  created_at  timestamptz default now()
);
```

### Tabla `perfiles`

```sql
create table perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text,
  avatar_url text,
  rol        text check (rol in ('cliente','empresa','admin')) default 'cliente',
  created_at timestamptz default now()
);
```

> Trigger: al crear un usuario en `auth.users` → insertar fila en `perfiles` automáticamente.

---

## Seguridad

### RLS — Row Level Security

```sql
-- negocios
alter table negocios enable row level security;

create policy "Lectura pública de negocios activos"
  on negocios for select using (activo = true);

create policy "Solo el dueño puede editar su negocio"
  on negocios for update using (auth.uid() = user_id);

create policy "Solo empresa puede crear negocio"
  on negocios for insert with check (
    auth.uid() = user_id and
    exists (select 1 from perfiles where id = auth.uid() and rol = 'empresa')
  );

-- servicios
alter table servicios enable row level security;

create policy "Lectura pública de servicios activos"
  on servicios for select using (activo = true);

create policy "Solo el dueño puede gestionar sus servicios"
  on servicios for all using (
    exists (select 1 from negocios where id = negocio_id and user_id = auth.uid())
  );

-- perfiles
alter table perfiles enable row level security;

create policy "Cada usuario ve solo su perfil"
  on perfiles for select using (auth.uid() = id);

create policy "Cada usuario edita solo su perfil"
  on perfiles for update using (auth.uid() = id);
```

### CORS

Configurar en el dashboard de Supabase → **API Settings → Allowed Origins**:

```
https://www.arkanaappointments.com
https://arkanaappointments.com
http://localhost:5173  (solo development)
```

### Security Headers

Añadir en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

> CSP completo se añadirá en Fase 4 una vez todos los orígenes externos estén definidos.

---

## Herramientas (setup inicial)

| Herramienta | Acción en esta fase |
|---|---|
| **Sentry** | Instalar `@sentry/react` y configurar DSN. Captura errores de JS desde el primer deploy. |

```bash
npm install @sentry/react
```

> Ver `04-stack-dependencias.md` para la configuración completa de Sentry.
