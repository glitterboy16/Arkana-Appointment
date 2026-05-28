-- ════════════════════════════════════════════════════════════════════
-- 003 — WhatsApp (opt-in) + notificaciones persistentes
--
-- Requiere que 001 y 002 estén aplicados.
-- Es idempotente: se puede correr varias veces sin error.
-- ════════════════════════════════════════════════════════════════════

-- ─── Opt-in WhatsApp ─────────────────────────────────────────────
alter table negocios
  add column if not exists whatsapp_activado boolean not null default true;

alter table usuarios
  add column if not exists whatsapp_activado boolean not null default true;

-- ─── Tabla whatsapp_log ───────────────────────────────────────────
create table if not exists whatsapp_log (
  id                    uuid primary key default gen_random_uuid(),
  cita_id               uuid references citas(id) on delete cascade,
  destinatario_tipo     text not null check (destinatario_tipo in ('negocio', 'cliente')),
  destinatario_telefono text not null,
  evento                text not null check (evento in ('new', 'confirmed', 'cancelled', 'rescheduled')),
  cuerpo                text not null,
  estado                text not null default 'pending' check (estado in ('pending', 'sent', 'failed')),
  error                 text,
  intentos              int  not null default 0,
  provider_message_id   text,
  created_at            timestamptz not null default now(),
  sent_at               timestamptz
);

create index if not exists idx_wa_log_cita_id    on whatsapp_log (cita_id);
create index if not exists idx_wa_log_estado     on whatsapp_log (estado);
create index if not exists idx_wa_log_created_at on whatsapp_log (created_at desc);

-- ─── Tabla notificaciones ─────────────────────────────────────────
create table if not exists notificaciones (
  id         uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  cita_id    uuid references citas(id) on delete cascade,
  kind       text not null check (kind in ('cita_nueva', 'cita_confirmada', 'cita_cancelada', 'cita_reagendada')),
  titulo     text not null,
  detalle    text not null,
  leida      boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notif_usuario_created on notificaciones (usuario_id, created_at desc);
create index if not exists idx_notif_usuario_unread  on notificaciones (usuario_id) where leida = false;

-- RLS: cada usuario solo ve y gestiona sus propias notificaciones
alter table notificaciones enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='notificaciones' and policyname='notif_select_propias') then
    create policy notif_select_propias on notificaciones for select using (usuario_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='notificaciones' and policyname='notif_update_propias') then
    create policy notif_update_propias on notificaciones for update using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='notificaciones' and policyname='notif_delete_propias') then
    create policy notif_delete_propias on notificaciones for delete using (usuario_id = auth.uid());
  end if;
end$$;

-- Realtime para notificaciones
alter table notificaciones replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table notificaciones;
  exception when duplicate_object then null;
  end;
end$$;

-- ─── Trigger trg_citas_notify ────────────────────────────────────
create or replace function trg_citas_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor        uuid := auth.uid();
  v_negocio_user uuid;
  v_negocio_nom  text;
  v_servicio_nom text;
  v_fecha_fmt    text;
begin
  select usuario_id, nombre into v_negocio_user, v_negocio_nom
    from negocios where id = new.negocio_id;

  v_fecha_fmt := to_char(new.fecha, 'DD/MM') || ' a las ' || to_char(new.hora_inicio, 'HH24:MI');

  if tg_op = 'INSERT' then
    if v_actor is null or v_actor <> v_negocio_user then
      select nombre into v_servicio_nom from servicios where id = new.servicio_id;
      insert into notificaciones (usuario_id, cita_id, kind, titulo, detalle)
      values (v_negocio_user, new.id, 'cita_nueva',
              'Nueva cita de ' || new.cliente_nombre,
              coalesce(v_servicio_nom, 'Servicio') || ' · ' || v_fecha_fmt);
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- Reagendado
    if (old.fecha <> new.fecha or old.hora_inicio <> new.hora_inicio)
       and new.cliente_id is not null
       and (v_actor is null or v_actor <> new.cliente_id)
    then
      insert into notificaciones (usuario_id, cita_id, kind, titulo, detalle)
      values (new.cliente_id, new.id, 'cita_reagendada',
              v_negocio_nom || ' reagendó tu cita',
              'Nueva fecha: ' || v_fecha_fmt);
    end if;

    -- Cambios de estado
    if old.estado <> new.estado then
      if new.estado = 'confirmed' and new.cliente_id is not null
         and (v_actor is null or v_actor <> new.cliente_id)
      then
        insert into notificaciones (usuario_id, cita_id, kind, titulo, detalle)
        values (new.cliente_id, new.id, 'cita_confirmada',
                v_negocio_nom || ' confirmó tu cita', v_fecha_fmt);
      end if;

      if new.estado = 'cancelled' then
        if (v_actor is null or v_actor = v_negocio_user) and new.cliente_id is not null then
          insert into notificaciones (usuario_id, cita_id, kind, titulo, detalle)
          values (new.cliente_id, new.id, 'cita_cancelada',
                  v_negocio_nom || ' canceló tu cita', v_fecha_fmt);
        end if;
        if v_actor is not null and v_actor = new.cliente_id then
          insert into notificaciones (usuario_id, cita_id, kind, titulo, detalle)
          values (v_negocio_user, new.id, 'cita_cancelada',
                  new.cliente_nombre || ' canceló su cita', v_fecha_fmt);
        end if;
      end if;
    end if;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_citas_notify on citas;
create trigger trg_citas_notify
  after insert or update on citas
  for each row execute function trg_citas_notify();
