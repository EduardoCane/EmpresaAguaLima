create or replace function public.submit_mobile_signature(
  p_target_id uuid,
  p_firma_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente_id uuid;
begin
  if p_target_id is null then
    raise exception 'ID objetivo requerido';
  end if;

  if p_firma_url is null or length(trim(p_firma_url)) = 0 then
    raise exception 'firma_url es obligatoria';
  end if;

  select c.cliente_id
  into v_cliente_id
  from public.contratos c
  where c.id = p_target_id
  limit 1;

  if v_cliente_id is null then
    select cl.id
    into v_cliente_id
    from public.clientes cl
    where cl.id = p_target_id
    limit 1;
  end if;

  if v_cliente_id is null then
    raise exception 'No existe contrato ni cliente para el ID recibido';
  end if;

  update public.cliente_firmas
  set activa = false
  where cliente_id = v_cliente_id
    and activa = true;

  insert into public.cliente_firmas (cliente_id, firma_url, activa)
  values (v_cliente_id, p_firma_url, true);
end;
$$;

revoke all on function public.submit_mobile_signature(uuid, text) from public;
grant execute on function public.submit_mobile_signature(uuid, text) to anon;
grant execute on function public.submit_mobile_signature(uuid, text) to authenticated;
