-- ════════════════════════════════════════════════════════════════════
-- 002 — Panel de administración: rol admin, RPCs y usuario inicial
--
-- Requiere que 001 esté aplicado.
-- Es idempotente: se puede correr varias veces sin error.
-- ════════════════════════════════════════════════════════════════════

-- ─── Enum: añadir 'admin' a rol_usuario ──────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'admin'
      and enumtypid = (select oid from pg_type where typname = 'rol_usuario')
  ) then
    alter type rol_usuario add value 'admin';
  end if;
end $$;

-- ─── Soft-delete en usuarios ──────────────────────────────────────
-- (columnas ya creadas en 001; este bloque es por idempotencia)
alter table usuarios
  add column if not exists eliminado    boolean     not null default false,
  add column if not exists eliminado_at timestamptz;

-- ─── Helper es_admin() ───────────────────────────────────────────
create or replace function public.es_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- ─── RPC: admin_delete_usuario ────────────────────────────────────
create or replace function public.admin_delete_usuario(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_caller_rol text;
begin
  if auth.uid() is null then
    raise exception 'No autenticado' using errcode = '28000';
  end if;

  select rol::text into v_caller_rol from public.usuarios where id = auth.uid();

  if v_caller_rol is null or v_caller_rol <> 'admin' then
    raise exception 'Solo un admin puede eliminar usuarios' using errcode = '42501';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Un admin no puede eliminarse a sí mismo' using errcode = '22023';
  end if;

  delete from public.negocios  where usuario_id = p_user_id;
  delete from public.usuarios  where id = p_user_id;
  delete from auth.users       where id = p_user_id;
end;
$$;

revoke all on function public.admin_delete_usuario(uuid) from public, anon;
grant execute on function public.admin_delete_usuario(uuid) to authenticated;

-- ─── RPC: admin_create_usuario ────────────────────────────────────
create or replace function public.admin_create_usuario(
  p_email          text,
  p_password       text,
  p_nombre         text,
  p_rol            text,
  p_telefono       text default null,
  p_nombre_negocio text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_slug    text;
begin
  if not public.es_admin() then
    raise exception 'Acceso denegado';
  end if;

  if exists (select 1 from auth.users where email = p_email) then
    raise exception 'Este email ya está registrado' using errcode = '23505';
  end if;

  insert into auth.users (
    id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    aud, role, confirmation_token, recovery_token
  ) values (
    gen_random_uuid(),
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre', p_nombre, 'rol', p_rol),
    'authenticated', 'authenticated', '', ''
  )
  returning id into v_user_id;

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data, created_at, updated_at
  ) values (
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    'email',
    jsonb_build_object('sub', v_user_id::text, 'email', p_email, 'email_verified', true, 'phone_verified', false),
    now(), now()
  );

  insert into public.usuarios (id, email, nombre, rol, telefono, eliminado)
  values (v_user_id, p_email, p_nombre, p_rol::rol_usuario, p_telefono, false)
  on conflict (id) do update set rol = excluded.rol, nombre = excluded.nombre;

  update public.usuarios set telefono = p_telefono where id = v_user_id;

  if p_rol = 'negocio' and p_nombre_negocio is not null and p_nombre_negocio <> '' then
    v_slug := regexp_replace(lower(p_nombre_negocio), '[^a-z0-9]+', '-', 'g')
              || '-' || substring(gen_random_uuid()::text, 1, 4);
    insert into public.negocios (usuario_id, nombre, slug)
    values (v_user_id, p_nombre_negocio, v_slug);
  end if;

  return v_user_id;
end;
$$;

revoke all on function public.admin_create_usuario(text,text,text,text,text,text) from public, anon;
grant execute on function public.admin_create_usuario(text,text,text,text,text,text) to authenticated;

-- ─── Reparar usuarios sin identidad (si los hay) ─────────────────
insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
  now(), now()
from auth.users u
left join auth.identities i on i.user_id = u.id
where i.id is null;

-- ─── Usuario administrador inicial ───────────────────────────────
-- Credenciales: admin@arkana-appointments.com / admintfg
do $$
declare
  v_admin_id uuid;
  v_email    text := 'admin@arkana-appointments.com';
  v_password text := 'admintfg';
begin
  select id into v_admin_id from auth.users where email = v_email;

  if v_admin_id is null then
    v_admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id, 'authenticated', 'authenticated',
      v_email, crypt(v_password, gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), v_admin_id,
      jsonb_build_object('sub', v_admin_id::text, 'email', v_email),
      'email', v_admin_id::text, now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password  = crypt(v_password, gen_salt('bf')),
           email_confirmed_at  = coalesce(email_confirmed_at, now()),
           updated_at          = now()
     where id = v_admin_id;
  end if;

  insert into usuarios (id, email, nombre, rol, telefono, eliminado)
  values (v_admin_id, v_email, 'Administrador Arkana', 'admin', null, false)
  on conflict (id) do update
    set rol = 'admin', eliminado = false, nombre = excluded.nombre;
end $$;
