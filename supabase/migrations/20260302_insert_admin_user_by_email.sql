-- Inserta un administrador en public.admin_users a partir de un email existente en auth.users
-- Uso:
-- 1) Crea el usuario en Supabase Authentication -> Users (si aun no existe)
-- 2) Reemplaza el valor de v_email
-- 3) Ejecuta este script en SQL Editor

do $$
declare
  v_email text := 'tu_correo@gmail.com';
  v_user_id uuid;
begin
  select u.id
  into v_user_id
  from auth.users u
  where u.email = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'No existe usuario en auth.users con email: %', v_email;
  end if;

  insert into public.admin_users (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;
end;
$$;

-- Verificacion
select
  au.user_id,
  u.email,
  au.created_at
from public.admin_users au
join auth.users u on u.id = au.user_id
order by au.created_at desc;
