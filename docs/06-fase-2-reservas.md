# Fase 2 — Disponibilidad y Reservas

**Objetivo:** Núcleo del producto. El cliente puede escanear el QR, ver disponibilidad real y completar una reserva (con o sin cuenta).

**Estado:** Pendiente  
**Requisitos cubiertos:** RF-16 → RF-27 · RNF-01 → RNF-05 · RNF-22 → RNF-24

---

## Funcionalidades

| ID | Descripción | Módulo |
|---|---|---|
| RF-16 | Definir horario semanal (franjas por día) | Disponibilidad |
| RF-17 | Bloquear días específicos (vacaciones, festivos) | Disponibilidad |
| RF-18 | Cálculo de disponibilidad real (horario – citas existentes) | Disponibilidad |
| RF-19 | Mostrar solo franjas libres según duración del servicio | Disponibilidad |
| RF-20 | Prevención de reservas solapadas | Disponibilidad |
| RF-21 | Acceso al perfil público via QR o URL directa | Reservas |
| RF-22 | Consulta de servicios con descripción, duración y precio | Reservas |
| RF-23 | Reserva de cita (servicio + fecha + franja) | Reservas |
| RF-24 | Reserva como invitado (nombre, teléfono, correo) | Reservas |
| RF-25 | Confirmación por WhatsApp al reservar | Notificaciones |
| RF-26 | Cancelación de cita por el cliente (2h de antelación mín.) | Reservas |
| RF-27 | Estado de la cita visible para el cliente | Reservas |

---

## Base de datos

### Tabla `disponibilidad`

```sql
create table disponibilidad (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid references negocios(id) on delete cascade not null,
  dia_semana  smallint not null check (dia_semana between 0 and 6), -- 0=lunes
  hora_inicio time not null,
  hora_fin    time not null,
  activo      boolean default true
);
```

### Tabla `bloqueos`

```sql
create table bloqueos (
  id         uuid primary key default gen_random_uuid(),
  negocio_id uuid references negocios(id) on delete cascade not null,
  fecha      date not null,
  motivo     text,
  created_at timestamptz default now()
);
```

### Tabla `citas`

```sql
create table citas (
  id               uuid primary key default gen_random_uuid(),
  negocio_id       uuid references negocios(id) on delete cascade not null,
  servicio_id      uuid references servicios(id) on delete set null,
  usuario_id       uuid references auth.users(id) on delete set null, -- null si invitado
  cliente_nombre   text not null,
  cliente_telefono text not null,
  cliente_email    text not null,
  fecha            date not null,
  hora_inicio      time not null,
  hora_fin         time not null,
  estado           text check (estado in ('pendiente','confirmada','completada','cancelada')) default 'pendiente',
  created_at       timestamptz default now()
);
```

### Función — validar solapamiento

```sql
create or replace function check_solapamiento(
  p_negocio_id uuid,
  p_fecha date,
  p_inicio time,
  p_fin time
) returns boolean language plpgsql as $$
begin
  return exists (
    select 1 from citas
    where negocio_id = p_negocio_id
      and fecha = p_fecha
      and estado not in ('cancelada')
      and hora_inicio < p_fin
      and hora_fin > p_inicio
  );
end;
$$;
```

---

## Seguridad

### RLS — citas

```sql
alter table citas enable row level security;

-- Negocio ve todas sus citas
create policy "Negocio ve sus citas"
  on citas for select using (
    exists (select 1 from negocios where id = negocio_id and user_id = auth.uid())
  );

-- Cliente registrado ve sus propias citas
create policy "Cliente ve sus citas"
  on citas for select using (auth.uid() = usuario_id);

-- Cualquiera puede crear una cita (incluye invitados via service role)
create policy "Inserción pública de citas"
  on citas for insert with check (true);

-- Solo el negocio puede cambiar el estado
create policy "Negocio actualiza estado"
  on citas for update using (
    exists (select 1 from negocios where id = negocio_id and user_id = auth.uid())
  );

-- Cliente puede cancelar su propia cita
create policy "Cliente cancela su cita"
  on citas for update using (
    auth.uid() = usuario_id and estado = 'cancelada'
  );
```

### RLS — disponibilidad y bloqueos

```sql
alter table disponibilidad enable row level security;

create policy "Lectura pública de disponibilidad"
  on disponibilidad for select using (activo = true);

create policy "Solo el dueño gestiona disponibilidad"
  on disponibilidad for all using (
    exists (select 1 from negocios where id = negocio_id and user_id = auth.uid())
  );

alter table bloqueos enable row level security;

create policy "Lectura pública de bloqueos"
  on bloqueos for select using (true);

create policy "Solo el dueño gestiona bloqueos"
  on bloqueos for all using (
    exists (select 1 from negocios where id = negocio_id and user_id = auth.uid())
  );
```

### CORS

Sin cambios respecto a Fase 1. Si se añaden Edge Functions para WhatsApp, incluir el header `Access-Control-Allow-Origin` dentro de la función:

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.arkanaappointments.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

---

## Herramientas

| Herramienta | Acción en esta fase |
|---|---|
| **Sentry** | Añadir breadcrumbs en el flujo de reserva para trazar errores paso a paso. |

```ts
// Ejemplo en el paso de reserva
Sentry.addBreadcrumb({
  category: 'reserva',
  message: 'Slot seleccionado',
  level: 'info',
  data: { fecha, hora_inicio },
})
```
