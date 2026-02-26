-- Migration: Add SECURITY DEFINER to marcar_contrato_firmado and allow INSERTs on firmas for authenticated users
-- Apply this in Supabase SQL editor (run as a project admin)

-- 1) Redefine marcar_contrato_firmado as SECURITY DEFINER
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
$$ language plpgsql security definer
set search_path = public;

-- 2) Create RLS policy to allow authenticated users to insert into firmas
-- This policy assumes the application connects as the authenticated role.
-- It enforces that contrato_id is present and that for 'capturada' origen a firma_url is provided.
drop policy if exists allow_insert_firmas_authenticated on public.firmas;

create policy allow_insert_firmas_authenticated
on public.firmas
for insert
using (auth.role() = 'authenticated')
with check (
  auth.role() = 'authenticated'
  and contrato_id is not null
  and (
    (origen = 'capturada' and firma_url is not null and length(trim(firma_url)) > 0)
    or origen = 'reutilizada'
  )
);

-- 3) Optional: ensure cliente_firmas table has the unique partial index (should already exist)
-- create unique index if not exists ux_cliente_firma_activa on public.cliente_firmas(cliente_id) where activa = true;

-- IMPORTANT: After running this migration, verify the function owner is a trusted role (the DB admin/owner).
-- If needed, run: ALTER FUNCTION public.marcar_contrato_firmado() OWNER TO postgres; (or your admin role)
