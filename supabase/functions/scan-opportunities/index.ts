import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPETITOR_KEYWORDS = [
  "corporate housing","furnished apartments","serviced apartments","extended stay provider","temporary housing",
  "synergy","churchill","mint house","oakwood","aka ","sonder","national corporate housing",
];

const HOUSING_KEYWORDS = [
  "project","contract","construction","deployment","relocation","intern","on-site","on site",
  "travel team","implementation","field crew","commissioning","installation","residency","temporary assignment",
  "rotational","mobilization","field service","crew","consult","expansion","new office","hiring surge",
];

function isCompetitor(text: string) {
  const t = text.toLowerCase();
  return COMPETITOR_KEYWORDS.some(k => t.includes(k));
}
function hasHousingNeed(text: string) {
  const t = text.toLowerCase();
  return HOUSING_KEYWORDS.some(k => t.includes(k));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bdr_id } = await req.json();
    if (!bdr_id) return new Response(JSON.stringify({ error: "bdr_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: bdr, error: bdrErr } = await supabase.from("bdr_profiles").select("*").eq("id", bdr_id).maybeSingle();
    if (bdrErr || !bdr) throw new Error("BDR profile not found");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const today = new Date().toISOString().split("T")[0];
    const verticals = (bdr.target_verticals as string[]) || [];
    const markets = (bdr.markets as string[]) || [];
    const inv = (bdr.inventory_locations as Array<{name:string;city:string;state:string}>) || [];

    const systemPrompt = [
      "You are a sales intelligence analyst for a corporate housing BDR at National Corporate Housing.",
      `Today is ${today}.`,
      `BDR markets: ${markets.join(", ")}.`,
      `BDR target verticals: ${verticals.join(", ") || "all 7 verticals"}.`,
      `BDR inventory near: ${inv.map(i => `${i.city}, ${i.state}`).join("; ") || "n/a"}.`,
      "CRITICAL TARGETING: The buyer is the SMB CONTRACTOR, SUBCONTRACTOR, VENDOR, IMPLEMENTATION PARTNER, STAFFING FIRM, or CONSULTING FIRM that is actually executing the work — NOT the prime owner, government agency, hospital system, university, or Fortune 500 client.",
      "Example: if Boeing wins a $500M Air Force contract in Huntsville, do NOT return Boeing or the Air Force. Return the SMB engineering firms, subcontractors, IT integrators, construction subs, and consulting groups (10-1000 employees) that Boeing will hire to execute the work and need to fly people in for 30+ days.",
      "Example: if a hospital builds a new wing, do NOT return the hospital. Return the mechanical contractor, electrical sub, medical equipment installer, or commissioning firm.",
      "Example: if a city wins a federal grant, do NOT return the city. Return the engineering consultancy, environmental firm, or construction manager doing the work.",
      "Always name the SMB executing the work and explain in 'why_it_matters' which larger project/client is driving their travel/housing need.",
      "Each opportunity must be a real SMB (10-1000 employees) sending people on-site for 30+ days.",
      "NEVER include other corporate housing providers (Synergy, Churchill, Mint House, Oakwood, AKA, Sonder, etc.).",
      "Score each on three 0-100 dimensions: discovery_score (signal strength), housing_fit_score (likelihood of 30+ day stay need), confidence_score (data freshness/validation).",
      "Suggest 3-5 contact titles at the SMB (Project Manager, Field Ops Manager, Travel Coordinator, HR/Talent, Program Manager — avoid C-suite).",
      "Return ONLY via the tool call.",
    ].join(" ");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Scan opportunities for ${markets.join(", ")}.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_opportunities",
            parameters: {
              type: "object",
              properties: {
                opportunities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company: { type: "string" },
                      market: { type: "string" },
                      project: { type: "string" },
                      vertical: { type: "string" },
                      signal_type: { type: "string" },
                      description: { type: "string" },
                      why_it_matters: { type: "string" },
                      estimated_stay: { type: "string" },
                      discovery_score: { type: "number" },
                      housing_fit_score: { type: "number" },
                      confidence_score: { type: "number" },
                      suggested_contacts: { type: "array", items: { type: "string" } },
                      pitch_angle: { type: "string" },
                      key_talking_points: { type: "array", items: { type: "string" } },
                      source_type: { type: "string" },
                    },
                    required: ["company","market","project","vertical","signal_type","description","why_it_matters","estimated_stay","discovery_score","housing_fit_score","confidence_score","suggested_contacts","pitch_angle","key_talking_points","source_type"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["opportunities"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_opportunities" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const tc = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) throw new Error("No tool call returned");
    const { opportunities } = JSON.parse(tc.function.arguments);

    let inserted = 0;
    let skipped = 0;
    for (const o of opportunities) {
      const blob = `${o.company} ${o.description} ${o.project}`;
      if (isCompetitor(blob)) { skipped++; continue; }
      if (!hasHousingNeed(blob)) { skipped++; continue; }

      const composite = (Number(o.discovery_score) * 0.4) + (Number(o.housing_fit_score) * 0.4) + (Number(o.confidence_score) * 0.2);
      const priority = composite >= 80 ? "Top Priority" : composite >= 65 ? "Strong Opportunity" : composite >= 45 ? "Early Signal" : "Reject";
      if (priority === "Reject") { skipped++; continue; }
      const review_status = composite >= 75 ? "Ready Now" : composite >= 55 ? "Needs Review" : "Watch List";
      const confidence_label = o.confidence_score >= 75 ? "High" : o.confidence_score >= 50 ? "Medium" : "Low";
      const nearest = inv[0]?.name ?? null;

      // Dedupe
      const { data: existing } = await supabase
        .from("opportunities")
        .select("id")
        .eq("company", o.company)
        .eq("market", o.market)
        .eq("project", o.project)
        .maybeSingle();

      const payload = {
        company: o.company,
        market: o.market,
        project: o.project,
        vertical: o.vertical,
        signal_type: o.signal_type,
        description: o.description,
        why_it_matters: o.why_it_matters,
        estimated_stay: o.estimated_stay,
        discovery_score: Math.round(o.discovery_score),
        housing_fit_score: Math.round(o.housing_fit_score),
        confidence_score: Math.round(o.confidence_score),
        priority,
        review_status,
        confidence_label,
        suggested_contacts: o.suggested_contacts,
        pitch_angle: o.pitch_angle,
        key_talking_points: o.key_talking_points,
        nearest_inventory: nearest,
        near_core_inventory: !!nearest,
        source_type: o.source_type,
        assigned_bdr: bdr_id,
        last_verified: new Date().toISOString(),
      };

      if (existing) {
        await supabase.from("opportunities").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("opportunities").insert({ ...payload, status: "new" });
        inserted++;
      }
    }

    return new Response(JSON.stringify({ inserted, skipped, total: opportunities.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-opportunities error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
