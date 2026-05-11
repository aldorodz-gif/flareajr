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

    // Pull companies we've already surfaced for this BDR so we don't return them again
    const { data: existingRows } = await supabase
      .from("opportunities")
      .select("company")
      .eq("assigned_bdr", bdr_id)
      .order("created_at", { ascending: false })
      .limit(200);
    const excludeCompanies = Array.from(new Set((existingRows || []).map(r => r.company))).slice(0, 150);

    // Rotate signal focus + source emphasis each scan to force variety
    const focusRotations = [
      "Focus this scan on CONTRACT AWARDS and government/defense subcontractors.",
      "Focus this scan on CONSTRUCTION & PHASED PROJECTS — prioritize subs, MEP contractors, commissioning firms.",
      "Focus this scan on CORPORATE EXPANSIONS, RELOCATIONS, and new facility openings.",
      "Focus this scan on TRAINING COHORTS, intern programs, and rotational workforce moves.",
      "Focus this scan on TECH IMPLEMENTATIONS, SaaS rollouts, and consulting deployments.",
      "Focus this scan on HEALTHCARE projects — equipment installs, hospital expansions, traveling clinical staff.",
      "Focus this scan on ENERGY, INFRASTRUCTURE, and utility project mobilizations.",
    ];
    const focus = focusRotations[Math.floor(Math.random() * focusRotations.length)];
    const variety = `Variety seed: ${Date.now()}-${Math.floor(Math.random() * 100000)}.`;

    const systemPrompt = [
      "You are a sales intelligence analyst for a corporate housing BDR at National Corporate Housing.",
      `Today is ${today}.`,
      `BDR markets: ${markets.join(", ")}.`,
      `BDR target verticals: ${verticals.join(", ") || "all 7 verticals"}.`,
      `BDR inventory near: ${inv.map(i => `${i.city}, ${i.state}`).join("; ") || "n/a"}.`,
      "MISSION: Search for new business movements that could create 30+ day corporate housing demand. Leave no stone unturned — use every public source you can reason about: news, press releases, contract awards (USASpending, SAM.gov), permits, EDC announcements, LinkedIn job posts, career pages, hiring surges, regional business journals, university/hospital expansion news, defense and DOE contract awards, construction trade press, etc.",
      focus,
      "PRIORITIZE these signal types: expansions, relocations, contract awards, phased construction, project mobilizations, training cohorts, temporary workforce movements, large group activity likely to require extended stays.",
      "IGNORE: generic hiring news, short hotel-only event traffic, conference attendees, day visitors, single-person business travel.",
      "TARGET PROFILE: SMB and SME ONLY (roughly 10-1500 employees, under ~$500M revenue). Two acceptable types: (1) SMB/SME companies with a direct 30+ day signal of their own, AND (2) SMB/SME contractors / subs / vendors / staffing / consulting firms executing work for a larger prime. Both valid.",
      "HARD EXCLUSION: Never return Fortune 500, Fortune 1000, or any large enterprise as the target company — even if they have a clear housing signal. They are too slow to close. When the signal traces back to a large prime (Boeing, hospital system, federal agency, Fortune 500), name the SMB/SME executing the work and reference the prime ONLY in 'why_it_matters'. The 'company' field must always be the SMB/SME.",
      "NEVER include other corporate housing providers (Synergy, Churchill, Mint House, Oakwood, AKA, Sonder, etc.).",
      excludeCompanies.length > 0
        ? `CRITICAL: DO NOT return any of these companies — they have already been surfaced. Find DIFFERENT companies: ${excludeCompanies.join(", ")}.`
        : "",
      "Surface FRESH, less-obvious SMBs — go beyond the top 10 most-known firms in each market. Dig into specialty subs, regional staffing firms, niche engineering shops, mid-tier consultancies.",
      "OUTPUT — tight and scannable: company name, city, signal, housing use case, estimated stay (e.g. '60-90 days', '6 month rotation'), priority High/Medium/Low.",
      "Summarize WHY each suggests a 30+ day need in one short sentence in 'why_it_matters'. No fluff.",
      "RETURN AT LEAST 12 OPPORTUNITIES per scan, all DIFFERENT from the exclusion list above.",
      "Score each 0-100: discovery_score, housing_fit_score, confidence_score.",
      "Set priority High/Medium/Low based on housing-need likelihood.",
      "Suggest 3-5 contact titles (PM, Field Ops, Travel Coordinator, HR/Talent, Program Manager — avoid C-suite).",
      variety,
      "Return ONLY via the tool call.",
    ].filter(Boolean).join(" ");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 1.0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Scan opportunities for ${markets.join(", ")}. Today is ${today}. Return 12+ NEW companies not in the exclusion list.` },
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

    // Geocode helper using OpenStreetMap Nominatim (free, no key). Cached per request.
    const geoCache = new Map<string, { lat: number; lon: number } | null>();
    const geocode = async (city: string, state: string): Promise<{ lat: number; lon: number } | null> => {
      const key = `${city.toLowerCase()},${state.toLowerCase()}`;
      if (geoCache.has(key)) return geoCache.get(key)!;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&country=USA&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
        const res = await fetch(url, { headers: { "User-Agent": "Flare-BDR-Toolkit/1.0" } });
        const arr = await res.json();
        const hit = Array.isArray(arr) && arr[0] ? { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) } : null;
        geoCache.set(key, hit);
        return hit;
      } catch {
        geoCache.set(key, null);
        return null;
      }
    };
    const haversineMiles = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const R = 3958.8;
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lon - a.lon);
      const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    };

    // Pick the inventory closest to this lead's market. Returns name, city, state, and miles.
    const pickNearestInventory = async (
      market: string | null
    ): Promise<{ label: string; miles: number | null } | null> => {
      if (!market || inv.length === 0) return null;
      const parts = market.split(',').map(s => s.trim());
      const leadCity = parts[0] ?? '';
      const leadState = parts[parts.length - 1] ?? '';
      const leadGeo = leadCity && leadState ? await geocode(leadCity, leadState) : null;

      if (leadGeo) {
        let best: { item: typeof inv[number]; miles: number } | null = null;
        for (const i of inv) {
          if (!i.city || !i.state) continue;
          const g = await geocode(i.city, i.state);
          if (!g) continue;
          const miles = haversineMiles(leadGeo, g);
          if (!best || miles < best.miles) best = { item: i, miles };
        }
        if (best) {
          const m = Math.round(best.miles);
          return { label: `${best.item.name} (${best.item.city}, ${best.item.state}) — ~${m} mi`, miles: m };
        }
      }

      // Fallback: city/state name match without distance
      const cityMatch = inv.find(i => i.city?.toLowerCase() === leadCity.toLowerCase());
      if (cityMatch) return { label: `${cityMatch.name} (${cityMatch.city}, ${cityMatch.state})`, miles: null };
      const stateMatch = inv.find(i => i.state?.toLowerCase() === leadState.toLowerCase());
      if (stateMatch) return { label: `${stateMatch.name} (${stateMatch.city}, ${stateMatch.state})`, miles: null };
      return null;
    };

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
      const nearestResult = await pickNearestInventory(o.market);
      const nearest = nearestResult?.label ?? null;
      const nearestMiles = nearestResult?.miles ?? null;

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
