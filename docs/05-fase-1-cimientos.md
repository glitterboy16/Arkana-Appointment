# Fase 1 — Cimientos

**Objetivo:** Base funcional del sistema. Auth, perfiles, estructura de base de datos y conexión con Supabase.

**Estado:** ✅ Completada
**Periodo:** abril 2026
**Requisitos cubiertos:** RF-01, RF-02, RF-03, RF-04, RF-07, RF-09, RNF-06 → RNF-11, RNF-14, RNF-39, RNF-40

---

## Funcionalidades entregadas

| ID | Descripción | Commit ancla |
|---|---|---|
| RF-01 | Registro de negocio (email, contraseña, nombre y nombre del negocio). | `a0397a3` — conectar toda la app con Supabase: auth real, guards y datos reales. |
| RF-02 | Registro de cliente (email, contraseña, nombre, teléfono). | `573a3cf` — añadir teléfono al registro de cliente con validación. |
| RF-03 | Inicio de sesión con email y contraseña. | `a0397a3` |
| RF-04 | Cierre de sesión que invalida la sesión activa. | `a0397a3` |
| RF-07 | Modificación de datos personales (nombre, teléfono, foto). | `a57a351` — panel del cliente con perfil. |
| RF-09 | Asignación de rol al iniciar sesión + redirección al panel adecuado. El admin bypassa el selector. | `84c7813`, `d2eb2b2`, `85e0c31` |

---

## Base de datos

Las migraciones de esta fase viven en `supabase/migrations/` (carpeta fuera del repo por gitignore; se ejecutan manualmente desde el SQL Editor de Supabase).

### Tabla `usuarios`

```sql
create table usuarios (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text unique not null,
  nombre     text not null,
  telefono   text,
  foto_url   text,
  rol        rol_usuario not null default 'cliente',
  eliminado  boolean not null default false,
  eliminado_at timestamptz,
  created_at timestamptz default now()
);

create type rol_usuario as enum ('cliente', 'negocio', 'admin');
```

### Tabla `negocios`

```sql
create table negocios (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references usuarios(id) on delete cascade,
  nombre      text not null,
  slug        text unique not null,
  categoria   text,
  descripcion text,
  direccion   text,
  telefono    text,
  logo_url    text,
  lat         numeric,
  lng         numeric,
  rating      numeric default 0,
  resenas     integer default 0,
  created_at  timestamptz default now()
);
```

### Tabla `servicios`

```sql
create table servicios (
  id              uuid primary key default gen_random_uuid(),
  negocio_id      uuid not null references negocios(id) on delete cascade,
  nombre          text not null,
  duracion_min    integer not null,
  precio_centimos integer not null default 0,
  color           text default '#648DFF',
  activo          boolean not null default true,
  created_at      timestamptz default now()
);
```

---

## Seguridad

- HTTPS forzado por Vercel + HSTS añadido en `vercel.json` (`max-age=63072000; includeSubDomains; preload`).
- Contraseñas gestionadas por Supabase Auth (bcrypt).
- Variables sensibles fuera del repo (`.env.local`, carpeta `supabase/` ignorada).
- Tabla `error_logs` (añadida en Fase 3) lista para capturar incidencias de auth, perfil y reservas (`logError('auth.signup', …)`, `logError('cita.create', …)`, etc.).

> **Nota sobre RLS:** durante el MVP las políticas RLS están desactivadas en las tablas críticas (ver migración `004_destrabar_todo_dev.sql`) para evitar bloqueos durante el desarrollo. La autorización se aplica desde la capa de aplicación. Reactivar y endurecer las políticas es la primera tarea del roadmap post-MVP.

---

## Herramientas activadas

| Herramienta | Acción |
|---|---|
| **Supabase** | Proyecto creado en región EU. Auth + Postgres + Storage (bucket `avatares`). |
| **Vercel** | Conectado al repo de GitHub. Despliegue automático desde `main`. |
| **GitHub** | Repositorio en `glitterboy16/Arkana-Appointment`. |
