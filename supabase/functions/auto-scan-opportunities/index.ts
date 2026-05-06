import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Background scheduler: loops every BDR profile and triggers scan-opportunities.
// Designed to be hit by pg_cron several times per day so leads are pulled "while you sleep".
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: bdrs, error } = await supabase.from("bdr_profiles").select("id, name");
    if (error) throw error;

    const results: Array<{ bdr: string; ok: boolean; inserted?: number; error?: string }> = [];

    for (const bdr of bdrs || []) {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/scan-opportunities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({ bdr_id: bdr.id }),
        });
        const json = await res.json().catch(() => ({}));
        results.push({ bdr: bdr.name, ok: res.ok, inserted: json.inserted, error: json.error });
        // small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        results.push({ bdr: bdr.name, ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    }

    return new Response(JSON.stringify({ ran_at: new Date().toISOString(), results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-scan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
