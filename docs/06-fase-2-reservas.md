# Fase 2 — Disponibilidad y Reservas

**Objetivo:** Núcleo del producto. Disponibilidad real, reserva desde el perfil público (con o sin cuenta) y portal del cliente.

**Estado:** ✅ Completada
**Periodo:** abril – mayo 2026
**Requisitos cubiertos:** RF-10 → RF-16, RF-18 → RF-24, RF-26, RF-27, RNF-01, RNF-02, RNF-03, RNF-17

---

## Funcionalidades entregadas

| ID | Descripción | Commit ancla |
|---|---|---|
| RF-10 | Perfil del negocio editable (nombre, descripción, categoría, dirección, teléfono, mapa, logotipo, galería). | `3fad2c2`, `f512646` |
| RF-11 | Catálogo de servicios (nombre, duración, precio, color). | `a0397a3` |
| RF-12 | Activar/desactivar servicios sin borrarlos. | `a0397a3` |
| RF-13 | Generación automática del **código QR** con logo de Arkana. | `1e4f0ee`, `e4a9ae5` |
| RF-14 | Descarga del QR en PNG desde el panel del negocio. | `e4a9ae5` |
| RF-15 | URL pública única por negocio: `/n/:slug`. | `a0397a3` |
| RF-16 | Horario semanal por día (`disponibilidad`). | `a0397a3` |
| RF-18 | Cálculo de disponibilidad real cruzando horario, duración y citas existentes. | `a0397a3` |
| RF-19 | Mostrar solo franjas libres según la duración del servicio. | `a0397a3` |
| RF-20 | Prevención de reservas solapadas (consulta atómica al insertar). | `a0397a3` |
| RF-21 | Acceso al perfil público vía QR o URL directa. | `a0397a3` |
| RF-22 | Consulta pública de servicios con duración y precio. | `a0397a3` |
| RF-23 | Reserva de cita seleccionando servicio, fecha y franja. | `a0397a3` |
| RF-24 | Reserva como invitado (nombre, teléfono, email). | `a0397a3` |
| RF-26 | Cancelación de la propia cita desde el portal del cliente. | `53a2fc7` |
| RF-27 | Estado de la cita visible: `nueva`, `pendiente`, `confirmada`, `cancelada`, `completada`. | `a0397a3`, `92b068c` (estado `completed`) |

Adicional a los requisitos originales:

- **Buscador de negocios** desde `/app/buscar`, con búsqueda por nombre, categoría, servicio y dirección. Commit `4ada523`.
- **Tema claro y oscuro** unificado en toda la app. Commit `8201b5c`.
- **App 100 % responsive** con sidebar drawer en móvil y loaders animados. Commit `1bb2ef0`.

---

## Base de datos

### Tabla `disponibilidad`

```sql
create table disponibilidad (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid not null references negocios(id) on delete cascade,
  dia_semana  smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin    time not null,
  activo      boolean not null default true
);
```

### Tabla `citas`

```sql
create table citas (
  id               uuid primary key default gen_random_uuid(),
  negocio_id       uuid not null references negocios(id) on delete cascade,
  servicio_id      uuid references servicios(id) on delete set null,
  cliente_id       uuid references usuarios(id) on delete set null, -- null si invitado
  cliente_nombre   text not null,
  cliente_telefono text not null,
  cliente_email    text,
  fecha            date not null,
  hora_inicio      time not null,
  estado           estado_cita not null default 'new',
  notas            text,
  created_at       timestamptz default now()
);

create type estado_cita as enum ('new', 'pending', 'confirmed', 'cancelled', 'completed');
```

### Tablas auxiliares (migración 005)

- `disponibilidad_excepciones` — días sueltos abiertos fuera del horario habitual.
- `disponibilidad_bloqueos` — días específicos cerrados (vacaciones, festivos). Esquema listo; UI pospuesta al roadmap.
- `negocio_fotos` — galería de fotos del negocio.

---

## Integraciones

- **Mapbox** — visualización de la ubicación del negocio en el perfil público y en la ficha del cliente. Token público `VITE_MAPBOX_TOKEN`. Style `mapbox://styles/mapbox/dark-v11`. Commit `cb9d8dc`.
- **`qrcode.react`** — generación del QR del negocio en el panel, con logo de Arkana superpuesto.

---

## Rendimiento

- Índices añadidos en migración 011 para acelerar la consulta de disponibilidad:
  - `idx_citas_negocio_fecha` — listado y huecos por fecha.
  - `idx_citas_negocio_estado` — filtros del panel.
  - `idx_disponibilidad_negocio_dia` — cálculo de horario semanal.
