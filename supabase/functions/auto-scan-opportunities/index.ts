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

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const ran_at = new Date().toISOString();

  try {
    const { data: bdrs, error } = await supabase.from("bdr_profiles").select("id, name");
    if (error) throw error;

    const results: Array<{ bdr: string; ok: boolean; inserted?: number; error?: string }> = [];
    let leads_inserted = 0;
    let errors = 0;

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
        const ok = res.ok && !json.error;
        if (ok) leads_inserted += Number(json.inserted || 0);
        else errors++;
        results.push({ bdr: bdr.name, ok, inserted: json.inserted, error: json.error });
        await new Promise((r) => setTimeout(r, 20000));
      } catch (e) {
        errors++;
        results.push({ bdr: bdr.name, ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    }

    // Write a one-row summary so admins can see overnight runs.
    await supabase.from("scan_runs").insert({
      ran_at,
      bdrs_scanned: (bdrs || []).length,
      leads_inserted,
      errors,
      details: results,
    });

    return new Response(JSON.stringify({ ran_at, results, leads_inserted, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-scan error:", e);
    await supabase.from("scan_runs").insert({
      ran_at,
      bdrs_scanned: 0,
      leads_inserted: 0,
      errors: 1,
      details: { error: e instanceof Error ? e.message : String(e) },
    }).then(() => {}, () => {});
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
