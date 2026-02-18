const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const url = new URL(req.url);
  const numero = url.searchParams.get("numero")?.trim() ?? "";
  if (!/^\d{8}$/.test(numero)) {
    return jsonResponse(400, { error: "El DNI debe tener 8 digitos" });
  }

  const token = Deno.env.get("RENIEC_TOKEN");
  if (!token) {
    return jsonResponse(500, { error: "RENIEC_TOKEN no configurado" });
  }

  const apiBase = (Deno.env.get("RENIEC_API_URL") ?? "https://api.decolecta.com/v1/reniec").replace(/\/$/, "");
  const target = `${apiBase}/dni?numero=${encodeURIComponent(numero)}`;

  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        token,
      },
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("RENIEC proxy error:", error);
    return jsonResponse(502, { error: "No se pudo consultar RENIEC" });
  }
});
