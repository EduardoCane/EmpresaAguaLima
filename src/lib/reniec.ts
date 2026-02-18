const DECOLECTA_RENIEC_DOMAIN = "api.decolecta.com";

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/$/, "");

const resolveReniecBase = () => {
  const configuredBase = (import.meta.env.VITE_RENIEC_API_URL as string | undefined)?.trim();
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();

  if (configuredBase && !configuredBase.includes(DECOLECTA_RENIEC_DOMAIN)) {
    return normalizeBaseUrl(configuredBase);
  }

  if (supabaseUrl) {
    return `${normalizeBaseUrl(supabaseUrl)}/functions/v1/reniec-proxy`;
  }

  if (configuredBase) {
    return normalizeBaseUrl(configuredBase);
  }

  return "/reniec";
};

const isSupabaseEdgeFunctionUrl = (base: string) =>
  /\/functions\/v1\/[^/?#]+$/i.test(base);

export interface ReniecLookupResult {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  documentNumber: string;
}

export async function lookupReniecByDni(dni: string, signal?: AbortSignal): Promise<ReniecLookupResult> {
  if (!/^\d{8}$/.test(dni)) {
    throw new Error("El DNI debe tener exactamente 8 digitos");
  }

  const base = resolveReniecBase();
  const requestUrl = isSupabaseEdgeFunctionUrl(base)
    ? `${base}?numero=${encodeURIComponent(dni)}`
    : `${base}/dni?numero=${encodeURIComponent(dni)}`;

  const response = await fetch(requestUrl, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("DNI no encontrado");
    }
    throw new Error(`RENIEC respondio ${response.status}`);
  }

  const payload = await response.json();
  const data = payload?.data ?? payload;

  const nombre = (data?.first_name || data?.nombres || data?.nombre || "").trim();
  const apellidoPaterno = (data?.first_last_name || data?.apellido_paterno || data?.a_paterno || data?.apepat || "").trim();
  const apellidoMaterno = (data?.second_last_name || data?.apellido_materno || data?.a_materno || data?.apemat || "").trim();

  if (!nombre && !apellidoPaterno && !apellidoMaterno) {
    throw new Error("Respuesta de RENIEC sin nombres");
  }

  return {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    documentNumber: String(data?.document_number || dni).trim(),
  };
}
