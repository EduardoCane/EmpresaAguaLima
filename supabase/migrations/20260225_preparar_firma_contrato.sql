-- Migration: Replace preparar_firma_contrato function to run as SECURITY DEFINER
-- Run this in Supabase SQL editor or via psql to apply the change.

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

-- IMPORTANT: verify the owner of this function in the target DB. The function must be owned
-- by a role that has permission to update/insert into the target tables (for example the
-- DB admin role used by Supabase). If the function owner is a low-privilege role, the
-- SECURITY DEFINER will not help. After applying, test saving a contract with a captured
-- signature and confirm it succeeds.
