// Fire-and-forget logger for external API usage.
// Writes one row per call to public.api_usage via the service role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

let _client: ReturnType<typeof createClient> | null = null;
function client() {
  if (_client) return _client;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export function logApiUsage(opts: {
  service: "gemini" | "tavily" | "lovable_gateway";
  function_name?: string;
  success: boolean;
  error_code?: string | null;
}) {
  try {
    const c = client();
    if (!c) return;
    // fire-and-forget — never block the caller
    c.from("api_usage").insert({
      service: opts.service,
      function_name: opts.function_name ?? null,
      success: opts.success,
      error_code: opts.error_code ?? null,
      calls: 1,
    }).then(({ error }) => {
      if (error) console.warn("usageLog insert failed:", error.message);
    });
  } catch (e) {
    console.warn("usageLog error:", e instanceof Error ? e.message : e);
  }
}
