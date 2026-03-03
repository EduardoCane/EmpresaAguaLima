create extension if not exists "pgcrypto";

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
    raise exception 'No autorizado para actualizar contraseñas';
  end if;

  if new_password is null or length(trim(new_password)) < 6 then
    raise exception 'La contraseña debe tener al menos 6 caracteres';
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
    raise exception 'No puedes eliminar el último administrador';
  end if;

  delete from public.admin_users
  where user_id = target_user_id;

  delete from auth.users
  where id = target_user_id;
end;
$$;

-- drop previous definition because return type changed
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

revoke all on function public.admin_update_user_password(uuid, text) from public;
revoke all on function public.admin_delete_user(uuid) from public;
revoke all on function public.list_admin_users() from public;

grant execute on function public.admin_update_user_password(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.list_admin_users() to authenticated;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
