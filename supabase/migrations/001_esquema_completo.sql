-- ════════════════════════════════════════════════════════════════════
-- 001 — Esquema completo: columnas, tablas auxiliares, RLS, Storage y Realtime
--
-- Ejecutar una sola vez sobre un proyecto Supabase recién creado
-- que ya tenga las tablas base (usuarios, negocios, servicios,
-- disponibilidad, citas) del esquema inicial.
-- Es idempotente: se puede correr varias veces sin error.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Columnas adicionales ─────────────────────────────────────────
alter table usuarios
  add column if not exists foto_url           text,
  add column if not exists eliminado          boolean     not null default false,
  add column if not exists eliminado_at       timestamptz;

alter table citas
  add column if not exists cliente_id uuid references usuarios(id) on delete set null;

alter table negocios
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- ─── Fix constraint dia_semana: JS (0-6) → ISO (1-7) ─────────────
update disponibilidad set dia_semana = 7 where dia_semana = 0;

alter table disponibilidad
  drop constraint if exists disponibilidad_dia_semana_check;

alter table disponibilidad
  add constraint disponibilidad_dia_semana_check
  check (dia_semana between 1 and 7);

-- ─── Enum: añadir 'completed' a estado_cita ──────────────────────
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'completed'
      and enumtypid = (select oid from pg_type where typname = 'estado_cita')
  ) then
    alter type estado_cita add value 'completed';
  end if;
end $$;

-- ─── Tablas auxiliares ────────────────────────────────────────────
create table if not exists disponibilidad_excepciones (
  id         uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios(id) on delete cascade,
  fecha      date not null,
  motivo     text,
  created_at timestamptz default now(),
  unique (negocio_id, fecha)
);

create table if not exists disponibilidad_bloques_excluidos (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid not null references negocios(id) on delete cascade,
  dia_semana  int  not null check (dia_semana between 1 and 7),
  hora_inicio time not null,
  hora_fin    time not null,
  created_at  timestamptz default now(),
  check (hora_fin > hora_inicio)
);

create table if not exists negocio_fotos (
  id         uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios(id) on delete cascade,
  foto_url   text not null,
  orden      int  default 0,
  created_at timestamptz default now()
);

-- ─── Índices ──────────────────────────────────────────────────────
create index if not exists idx_citas_cliente_id           on citas (cliente_id);
create index if not exists idx_citas_negocio_fecha        on citas (negocio_id, fecha);
create index if not exists idx_citas_negocio_estado       on citas (negocio_id, estado);
create index if not exists idx_disponibilidad_negocio_dia on disponibilidad (negocio_id, dia_semana);
create index if not exists idx_disp_exc_negocio_fecha     on disponibilidad_excepciones (negocio_id, fecha);
create index if not exists idx_disp_bloq_negocio_dia      on disponibilidad_bloques_excluidos (negocio_id, dia_semana);
create index if not exists idx_negocio_fotos_negocio      on negocio_fotos (negocio_id, orden);

-- ─── RLS ──────────────────────────────────────────────────────────
alter table usuarios                        enable row level security;
alter table negocios                        enable row level security;
alter table servicios                       enable row level security;
alter table disponibilidad                  enable row level security;
alter table citas                           enable row level security;
alter table disponibilidad_excepciones      enable row level security;
alter table disponibilidad_bloques_excluidos enable row level security;
alter table negocio_fotos                   enable row level security;

-- usuarios
drop policy if exists "Usuario lee su propia fila"      on usuarios;
create policy "Usuario lee su propia fila"    on usuarios for select using (auth.uid() = id);
drop policy if exists "Usuario inserta su propia fila"  on usuarios;
create policy "Usuario inserta su propia fila" on usuarios for insert with check (auth.uid() = id);
drop policy if exists "Usuario actualiza su propia fila" on usuarios;
create policy "Usuario actualiza su propia fila" on usuarios for update using (auth.uid() = id);

-- negocios
drop policy if exists "Negocios visibles públicamente" on negocios;
create policy "Negocios visibles públicamente" on negocios for select using (true);
drop policy if exists "Dueño inserta su negocio" on negocios;
create policy "Dueño inserta su negocio" on negocios for insert with check (auth.uid() = usuario_id);
drop policy if exists "Dueño actualiza su negocio" on negocios;
create policy "Dueño actualiza su negocio" on negocios for update using (auth.uid() = usuario_id);

-- servicios
drop policy if exists "Servicios públicos" on servicios;
create policy "Servicios públicos" on servicios for select using (true);
drop policy if exists "Dueño gestiona servicios" on servicios;
create policy "Dueño gestiona servicios" on servicios for all
  using (exists (select 1 from negocios where negocios.id = servicios.negocio_id and negocios.usuario_id = auth.uid()))
  with check (exists (select 1 from negocios where negocios.id = servicios.negocio_id and negocios.usuario_id = auth.uid()));

-- disponibilidad
drop policy if exists "Disponibilidad pública" on disponibilidad;
create policy "Disponibilidad pública" on disponibilidad for select using (true);
drop policy if exists "Dueño gestiona disponibilidad" on disponibilidad;
create policy "Dueño gestiona disponibilidad" on disponibilidad for all
  using (exists (select 1 from negocios where negocios.id = disponibilidad.negocio_id and negocios.usuario_id = auth.uid()))
  with check (exists (select 1 from negocios where negocios.id = disponibilidad.negocio_id and negocios.usuario_id = auth.uid()));

-- excepciones y bloqueos
drop policy if exists "Excepciones públicas" on disponibilidad_excepciones;
create policy "Excepciones públicas" on disponibilidad_excepciones for select using (true);
drop policy if exists "Dueño gestiona excepciones" on disponibilidad_excepciones;
create policy "Dueño gestiona excepciones" on disponibilidad_excepciones for all
  using (exists (select 1 from negocios where negocios.id = disponibilidad_excepciones.negocio_id and negocios.usuario_id = auth.uid()))
  with check (exists (select 1 from negocios where negocios.id = disponibilidad_excepciones.negocio_id and negocios.usuario_id = auth.uid()));

drop policy if exists "Bloqueos públicos" on disponibilidad_bloques_excluidos;
create policy "Bloqueos públicos" on disponibilidad_bloques_excluidos for select using (true);
drop policy if exists "Dueño gestiona bloqueos" on disponibilidad_bloques_excluidos;
create policy "Dueño gestiona bloqueos" on disponibilidad_bloques_excluidos for all
  using (exists (select 1 from negocios where negocios.id = disponibilidad_bloques_excluidos.negocio_id and negocios.usuario_id = auth.uid()))
  with check (exists (select 1 from negocios where negocios.id = disponibilidad_bloques_excluidos.negocio_id and negocios.usuario_id = auth.uid()));

-- negocio_fotos
drop policy if exists "Fotos públicas" on negocio_fotos;
create policy "Fotos públicas" on negocio_fotos for select using (true);
drop policy if exists "Dueño gestiona fotos" on negocio_fotos;
create policy "Dueño gestiona fotos" on negocio_fotos for all
  using (exists (select 1 from negocios where negocios.id = negocio_fotos.negocio_id and negocios.usuario_id = auth.uid()))
  with check (exists (select 1 from negocios where negocios.id = negocio_fotos.negocio_id and negocios.usuario_id = auth.uid()));

-- citas
drop policy if exists "Reserva pública crea cita" on citas;
create policy "Reserva pública crea cita" on citas for insert with check (true);
drop policy if exists "Cliente lee sus citas" on citas;
create policy "Cliente lee sus citas" on citas for select using (auth.uid() = cliente_id);
drop policy if exists "Dueño negocio lee sus citas" on citas;
create policy "Dueño negocio lee sus citas" on citas for select
  using (exists (select 1 from negocios where negocios.id = citas.negocio_id and negocios.usuario_id = auth.uid()));
drop policy if exists "Dueño negocio actualiza sus citas" on citas;
create policy "Dueño negocio actualiza sus citas" on citas for update
  using (exists (select 1 from negocios where negocios.id = citas.negocio_id and negocios.usuario_id = auth.uid()));

-- ─── Storage buckets ──────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('avatares',       'avatares',       true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('fotos-negocios', 'fotos-negocios', true) on conflict (id) do nothing;

drop policy if exists "Avatares públicos"        on storage.objects;
create policy "Avatares públicos"    on storage.objects for select using (bucket_id = 'avatares');
drop policy if exists "Usuario sube su avatar"   on storage.objects;
create policy "Usuario sube su avatar" on storage.objects for insert
  with check (bucket_id = 'avatares' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Usuario actualiza su avatar" on storage.objects;
create policy "Usuario actualiza su avatar" on storage.objects for update
  using (bucket_id = 'avatares' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Usuario borra su avatar"  on storage.objects;
create policy "Usuario borra su avatar" on storage.objects for delete
  using (bucket_id = 'avatares' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Fotos negocio públicas"   on storage.objects;
create policy "Fotos negocio públicas"   on storage.objects for select using (bucket_id = 'fotos-negocios');
drop policy if exists "Subir foto negocio"        on storage.objects;
create policy "Subir foto negocio"       on storage.objects for insert with check (bucket_id = 'fotos-negocios');
drop policy if exists "Actualizar foto negocio"   on storage.objects;
create policy "Actualizar foto negocio"  on storage.objects for update using (bucket_id = 'fotos-negocios');
drop policy if exists "Borrar foto negocio"       on storage.objects;
create policy "Borrar foto negocio"      on storage.objects for delete using (bucket_id = 'fotos-negocios');

-- ─── Realtime ─────────────────────────────────────────────────────
alter table citas replica identity full;

do $$
begin
  begin alter publication supabase_realtime add table citas;                          exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table disponibilidad_excepciones;     exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table disponibilidad_bloques_excluidos; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table negocio_fotos;                  exception when duplicate_object then null; end;
end$$;

notify pgrst, 'reload schema';
