-- Migración: soporte para perfil de cliente
-- Ejecutar en Supabase SQL Editor

-- 1) Foto de perfil del usuario
alter table usuarios
  add column if not exists foto_url text;

-- 2) Vincular citas con usuario cliente (cuando reserva logueado)
alter table citas
  add column if not exists cliente_id uuid references usuarios(id) on delete set null;

create index if not exists idx_citas_cliente_id on citas(cliente_id);

-- 3) Bucket de avatares (storage)
insert into storage.buckets (id, name, public)
values ('avatares', 'avatares', true)
on conflict (id) do nothing;

-- 4) Políticas RLS del bucket avatares
-- Lectura pública (necesaria para que la foto se vea)
drop policy if exists "Avatares públicos" on storage.objects;
create policy "Avatares públicos"
  on storage.objects for select
  using (bucket_id = 'avatares');

-- Cada usuario solo puede subir/actualizar/borrar su propia carpeta
-- Convención: avatares/<user_id>/<archivo>
drop policy if exists "Usuario sube su avatar" on storage.objects;
create policy "Usuario sube su avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatares'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Usuario actualiza su avatar" on storage.objects;
create policy "Usuario actualiza su avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatares'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Usuario borra su avatar" on storage.objects;
create policy "Usuario borra su avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatares'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
