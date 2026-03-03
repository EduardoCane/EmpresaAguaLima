-- Soporte: agregar un administrador por email (manual)
-- Uso:
-- 1) Cambia el valor de v_email por el correo real del usuario.
-- 2) Ejecuta todo el script en Supabase SQL Editor.

do $$
declare
  v_email text := 'admin@ejemplo.com'; -- <- reemplazar
  v_user_id uuid;
begin
  select u.id
  into v_user_id
  from auth.users u
  where lower(u.email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    raise exception 'No existe un usuario en auth.users con el email: %', v_email;
  end if;

  insert into public.admin_users (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  raise notice 'OK: usuario % agregado (o ya existia) en public.admin_users', v_email;
end;
$$;

-- Verificacion rapida
select
  au.user_id,
  u.email,
  (u.email_confirmed_at is not null) as email_verified,
  au.created_at
from public.admin_users au
left join auth.users u on u.id = au.user_id
order by au.created_at desc;
