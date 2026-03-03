-- Base de datos completa para entorno limpio (Supabase)
-- Ejecutar en SQL Editor o como migracion unica.

create extension if not exists "pgcrypto";

-- =========================
-- ADMINISTRADORES
-- =========================
create table if not exists public.admin_users (
  user_id uuid primary key,
  created_at timestamp with time zone not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

create or replace function public.bootstrap_admin_user()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_users (user_id)
  values (auth.uid())
  on conflict do nothing;
$$;

drop policy if exists "bootstrap_first_admin" on public.admin_users;
create policy "bootstrap_first_admin"
on public.admin_users
for insert
with check (
  auth.uid() is not null
  and not exists (select 1 from public.admin_users)
  and user_id = auth.uid()
);

drop policy if exists "admin_manage_admin_users" on public.admin_users;
create policy "admin_manage_admin_users"
on public.admin_users
for all
using (public.is_admin())
with check (public.is_admin());

-- =========================
-- CLIENTES
-- =========================
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),

  dni varchar(12) not null,
  cod varchar(30) not null,

  repetir_codigo varchar(200),
  a_paterno varchar(120),
  a_materno varchar(120),
  nombre varchar(180),
  apellidos_y_nombres varchar(400),

  fecha_reclutamiento date,
  fecha_nac date,
  edad integer check (edad is null or edad >= 0),

  area varchar(120),
  descripcion_zona varchar(200),
  codigogrupotrabajo varchar(20),

  id_afp varchar(60),
  cuspp varchar(60),
  fecha_inicio_afiliacion date,
  porcentaje_comision numeric(6,3) check (
    porcentaje_comision is null or (porcentaje_comision >= 0 and porcentaje_comision <= 100)
  ),
  nueva_afiliacion boolean,

  grado_instruccion text,
  asignacion text,
  estado_actual varchar(60),

  sexo char(1) check (sexo is null or sexo in ('M','F')),
  estado_civil varchar(20) check (
    estado_civil is null or estado_civil in ('SOLTERO','CASADO','VIUDO','CONVIVIENTE','DIVORCIADO')
  ),

  direccion text,
  distrito varchar(120),
  provincia varchar(120),
  departamento varchar(120),

  cargo varchar(160),

  fecha_inicio_contrato date,
  fecha_termino_contrato date,

  remuneracion numeric(12,2) check (remuneracion is null or remuneracion >= 0),
  tipo_contrato varchar(200),
  planilla varchar(200),

  observaciones text,
  referido varchar(250),
  lugar varchar(200),
  cooperador varchar(200)
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'uq_clientes_dni') then
    alter table public.clientes add constraint uq_clientes_dni unique (dni);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'uq_clientes_cod') then
    alter table public.clientes add constraint uq_clientes_cod unique (cod);
  end if;
end $$;

create index if not exists ix_clientes_cuspp on public.clientes(cuspp);

-- =========================
-- CONTRATOS
-- =========================
create table if not exists public.contratos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id),

  contenido text not null default '',
  estado varchar(20) not null default 'borrador',
  firmado boolean not null default false,
  firmado_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  ficha_datos jsonb not null default '{}'::jsonb,
  contrato_intermitente jsonb not null default '{}'::jsonb,
  contrato_temporada_plan jsonb not null default '{}'::jsonb,
  sistema_pensionario jsonb not null default '{}'::jsonb,
  reglamentos jsonb not null default '{}'::jsonb,
  consentimiento_informado jsonb not null default '{}'::jsonb,
  induccion jsonb not null default '{}'::jsonb,
  cuenta_bancaria jsonb not null default '{}'::jsonb,
  declaracion_conflicto_intereses jsonb not null default '{}'::jsonb,
  acuerdo_confidencialidad jsonb not null default '{}'::jsonb,
  carta_no_soborno jsonb not null default '{}'::jsonb,
  declaracion_parentesco jsonb not null default '{}'::jsonb,
  dj_patrimonial jsonb not null default '{}'::jsonb
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_ficha_datos_obj') then
    alter table public.contratos
      add constraint ck_contratos_ficha_datos_obj
      check (jsonb_typeof(ficha_datos) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_contrato_intermitente_obj') then
    alter table public.contratos
      add constraint ck_contratos_contrato_intermitente_obj
      check (jsonb_typeof(contrato_intermitente) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_contrato_temporada_plan_obj') then
    alter table public.contratos
      add constraint ck_contratos_contrato_temporada_plan_obj
      check (jsonb_typeof(contrato_temporada_plan) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_sistema_pensionario_obj') then
    alter table public.contratos
      add constraint ck_contratos_sistema_pensionario_obj
      check (jsonb_typeof(sistema_pensionario) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_reglamentos_obj') then
    alter table public.contratos
      add constraint ck_contratos_reglamentos_obj
      check (jsonb_typeof(reglamentos) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_consentimiento_informado_obj') then
    alter table public.contratos
      add constraint ck_contratos_consentimiento_informado_obj
      check (jsonb_typeof(consentimiento_informado) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_induccion_obj') then
    alter table public.contratos
      add constraint ck_contratos_induccion_obj
      check (jsonb_typeof(induccion) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_cuenta_bancaria_obj') then
    alter table public.contratos
      add constraint ck_contratos_cuenta_bancaria_obj
      check (jsonb_typeof(cuenta_bancaria) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_declaracion_conflicto_intereses_obj') then
    alter table public.contratos
      add constraint ck_contratos_declaracion_conflicto_intereses_obj
      check (jsonb_typeof(declaracion_conflicto_intereses) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_acuerdo_confidencialidad_obj') then
    alter table public.contratos
      add constraint ck_contratos_acuerdo_confidencialidad_obj
      check (jsonb_typeof(acuerdo_confidencialidad) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_carta_no_soborno_obj') then
    alter table public.contratos
      add constraint ck_contratos_carta_no_soborno_obj
      check (jsonb_typeof(carta_no_soborno) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_declaracion_parentesco_obj') then
    alter table public.contratos
      add constraint ck_contratos_declaracion_parentesco_obj
      check (jsonb_typeof(declaracion_parentesco) = 'object');
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ck_contratos_dj_patrimonial_obj') then
    alter table public.contratos
      add constraint ck_contratos_dj_patrimonial_obj
      check (jsonb_typeof(dj_patrimonial) = 'object');
  end if;
end $$;

create index if not exists ix_contratos_cliente_fecha
  on public.contratos(cliente_id, created_at desc);

create index if not exists ix_contratos_estado
  on public.contratos(estado);

create index if not exists ix_contratos_pendientes_cliente_fecha
  on public.contratos(cliente_id, created_at desc)
  where firmado = false;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_10_contratos_set_updated_at on public.contratos;
create trigger trg_10_contratos_set_updated_at
before update on public.contratos
for each row
execute function public.set_updated_at();

create or replace function public.bloquear_contrato_firmado()
returns trigger as $$
begin
  if old.firmado = true then
    raise exception 'El contrato ya esta firmado y no puede editarse';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_00_bloquear_edicion_contrato on public.contratos;
create trigger trg_00_bloquear_edicion_contrato
before update on public.contratos
for each row
execute function public.bloquear_contrato_firmado();

-- =========================
-- FIRMAS
-- =========================
create table if not exists public.cliente_firmas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  firma_url text not null,
  activa boolean not null default true,
  created_at timestamp with time zone not null default now()
);

create unique index if not exists ux_cliente_firma_activa
  on public.cliente_firmas(cliente_id)
  where activa = true;

create table if not exists public.firmas (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  cliente_firma_id uuid references public.cliente_firmas(id),
  firma_url text not null,
  origen varchar(20) not null default 'capturada'
    check (origen in ('capturada','reutilizada')),
  created_at timestamp with time zone not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'uq_firmas_contrato') then
    alter table public.firmas add constraint uq_firmas_contrato unique (contrato_id);
  end if;
end $$;

create or replace function public.preparar_firma_contrato()
returns trigger as $$
declare
  v_cliente_id uuid;
  v_activa_id uuid;
  v_activa_url text;
begin
  select cliente_id into v_cliente_id
  from public.contratos
  where id = new.contrato_id;

  if v_cliente_id is null then
    raise exception 'Contrato no existe';
  end if;

  if new.origen = 'reutilizada' then
    select id, firma_url
    into v_activa_id, v_activa_url
    from public.cliente_firmas
    where cliente_id = v_cliente_id and activa = true
    order by created_at desc
    limit 1;

    if v_activa_id is null then
      raise exception 'El cliente no tiene una firma guardada para reutilizar';
    end if;

    new.cliente_firma_id := coalesce(new.cliente_firma_id, v_activa_id);
    new.firma_url := coalesce(new.firma_url, v_activa_url);
  else
    if new.firma_url is null or length(trim(new.firma_url)) = 0 then
      raise exception 'firma_url es obligatoria cuando origen = capturada';
    end if;

    update public.cliente_firmas
    set activa = false
    where cliente_id = v_cliente_id and activa = true;

    insert into public.cliente_firmas (cliente_id, firma_url, activa)
    values (v_cliente_id, new.firma_url, true)
    returning id into new.cliente_firma_id;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_preparar_firma_contrato on public.firmas;
create trigger trg_preparar_firma_contrato
before insert on public.firmas
for each row
execute function public.preparar_firma_contrato();

create or replace function public.marcar_contrato_firmado()
returns trigger as $$
begin
  update public.contratos
  set firmado = true,
      firmado_at = coalesce(firmado_at, now()),
      estado = 'firmado'
  where id = new.contrato_id;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_marcar_contrato_firmado on public.firmas;
create trigger trg_marcar_contrato_firmado
after insert on public.firmas
for each row
execute function public.marcar_contrato_firmado();

-- =========================
-- RLS
-- =========================
alter table public.clientes enable row level security;
alter table public.contratos enable row level security;
alter table public.cliente_firmas enable row level security;
alter table public.firmas enable row level security;

drop policy if exists "admin_full_access_clientes" on public.clientes;
create policy "admin_full_access_clientes"
on public.clientes
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_full_access_contratos" on public.contratos;
create policy "admin_full_access_contratos"
on public.contratos
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_full_access_cliente_firmas" on public.cliente_firmas;
create policy "admin_full_access_cliente_firmas"
on public.cliente_firmas
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_full_access_firmas" on public.firmas;
create policy "admin_full_access_firmas"
on public.firmas
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists allow_insert_firmas_authenticated on public.firmas;
create policy allow_insert_firmas_authenticated
on public.firmas
for insert
with check (
  auth.role() = 'authenticated'
  and contrato_id is not null
  and (
    (origen = 'capturada' and firma_url is not null and length(trim(firma_url)) > 0)
    or origen = 'reutilizada'
  )
);

-- =========================
-- RPCs: GESTION ADMIN
-- =========================
create or replace function public.admin_update_user_password(target_user_id uuid, new_password text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester_is_admin boolean;
  target_is_admin boolean;
  updated_hash text;
begin
  select exists(
    select 1
    from public.admin_users
    where user_id = auth.uid()
  ) into requester_is_admin;

  if not requester_is_admin then
    raise exception 'No autorizado para actualizar contrasenas';
  end if;

  if new_password is null or length(trim(new_password)) < 6 then
    raise exception 'La contrasena debe tener al menos 6 caracteres';
  end if;

  select exists(
    select 1
    from public.admin_users
    where user_id = target_user_id
  ) into target_is_admin;

  if not target_is_admin then
    raise exception 'El usuario objetivo no es administrador';
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = timezone('utc', now())
  where id = target_user_id
  returning encrypted_password into updated_hash;

  if not found then
    raise exception 'No existe el usuario en auth.users';
  end if;

  if updated_hash is null or updated_hash <> extensions.crypt(new_password, updated_hash) then
    raise exception 'No se pudo validar la nueva contraseña';
  end if;
end;
$$;

create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester_is_admin boolean;
  total_admins integer;
  target_is_admin boolean;
begin
  select exists(
    select 1
    from public.admin_users
    where user_id = auth.uid()
  ) into requester_is_admin;

  if not requester_is_admin then
    raise exception 'No autorizado para eliminar usuarios';
  end if;

  select exists(
    select 1
    from public.admin_users
    where user_id = target_user_id
  ) into target_is_admin;

  if not target_is_admin then
    raise exception 'El usuario objetivo no es administrador';
  end if;

  select count(*)
  from public.admin_users
  into total_admins;

  if total_admins <= 1 then
    raise exception 'No puedes eliminar el ultimo administrador';
  end if;

  delete from public.admin_users
  where user_id = target_user_id;

  delete from auth.users
  where id = target_user_id;
end;
$$;

drop function if exists public.list_admin_users();

create or replace function public.list_admin_users()
returns table(
  user_id uuid,
  created_at timestamp with time zone,
  email text,
  email_verified boolean
)
language sql
security definer
set search_path = public, auth
as $$
  select
    au.user_id,
    au.created_at,
    u.email,
    (u.email_confirmed_at is not null) as email_verified
  from public.admin_users au
  left join auth.users u on u.id = au.user_id
  where public.is_admin()
  order by au.created_at desc;
$$;

revoke all on function public.bootstrap_admin_user() from public;
revoke all on function public.admin_update_user_password(uuid, text) from public;
revoke all on function public.admin_delete_user(uuid) from public;
revoke all on function public.list_admin_users() from public;

grant execute on function public.bootstrap_admin_user() to authenticated;
grant execute on function public.admin_update_user_password(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.list_admin_users() to authenticated;

-- =========================
-- PERMISOS BASE (evita 403 con RLS)
-- =========================
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant usage, select on sequences to authenticated;

alter default privileges in schema public
grant execute on functions to authenticated;
