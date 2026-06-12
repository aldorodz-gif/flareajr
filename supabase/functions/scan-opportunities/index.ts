import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { loadMindsetBlocks } from "../_shared/mindset.ts";
import { callGeminiGrounded, extractJson, GeminiError } from "../_shared/gemini.ts";
import {
  SIGNAL_TEMPLATES,
  HIRING_SIGNAL_TEMPLATES,
  tavilySearch,
  verifyUrlReachable,
  isBlockedFetchUrl,
  type TavilyHit,
} from "../_shared/tavily.ts";

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
  "permit","plant","facility","data center","hospital","manufacturing","substation","fiber","broadband",
];
function isCompetitor(text: string) { const t = text.toLowerCase(); return COMPETITOR_KEYWORDS.some(k => t.includes(k)); }
function hasHousingNeed(text: string) { const t = text.toLowerCase(); return HOUSING_KEYWORDS.some(k => t.includes(k)); }

// SIGNAL_TEMPLATES, tavilySearch, verifyUrlReachable now imported from _shared/tavily.ts

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { bdr_id, action } = body as { bdr_id?: string; action?: string };

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // One-time cleanup: verify a chunk of opportunity rows, delete unreachable/missing URLs,
    // mark survivors verified=true. Call repeatedly with offset until done=true.
    if (action === "cleanup") {
      const chunk = Math.min(Number((body as any).chunk) || 80, 200);
      const offset = Math.max(Number((body as any).offset) || 0, 0);
      const { data: rows, error, count } = await supabase
        .from("opportunities")
        .select("id, source_url", { count: "exact" })
        .order("created_at", { ascending: true })
        .range(offset, offset + chunk - 1);
      if (error) throw error;
      let deleted = 0, kept = 0;
      const BATCH = 20;
      for (let i = 0; i < (rows || []).length; i += BATCH) {
        const batch = (rows || []).slice(i, i + BATCH);
        const results = await Promise.all(batch.map(async (r) => ({
          r, ok: r.source_url ? await verifyUrlReachable(r.source_url) : false,
        })));
        const toDelete = results.filter(x => !x.ok).map(x => x.r.id);
        const toKeep = results.filter(x => x.ok).map(x => x.r.id);
        if (toDelete.length) {
          await supabase.from("opportunities").delete().in("id", toDelete);
          deleted += toDelete.length;
        }
        if (toKeep.length) {
          await supabase.from("opportunities").update({ verified: true, last_verified: new Date().toISOString() }).in("id", toKeep);
          kept += toKeep.length;
        }
      }
      const processed = (rows || []).length;
      const nextOffset = offset + kept; // deletions shift indices; advance by kept only
      const done = processed < chunk;
      return new Response(JSON.stringify({ cleanup: true, deleted, kept, processed, total: count, offset, next_offset: nextOffset, done }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!bdr_id) return new Response(JSON.stringify({ error: "bdr_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
    if (!TAVILY_API_KEY) {
      return new Response(JSON.stringify({ error: "TAVILY_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: bdr, error: bdrErr } = await supabase.from("bdr_profiles").select("*").eq("id", bdr_id).maybeSingle();
    if (bdrErr || !bdr) throw new Error("BDR profile not found");

    const today = new Date().toISOString().split("T")[0];
    const verticals = (bdr.target_verticals as string[]) || [];
    const markets = ((bdr.markets as string[]) || []).filter(Boolean);
    const inv = (bdr.inventory_locations as Array<{name:string;city:string;state:string}>) || [];

    if (markets.length === 0) {
      return new Response(JSON.stringify({ error: "BDR has no markets configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1) Build queries — round-robin across ALL markets so every market is searched each run.
    const MAX_QUERIES = 9;
    // Per-market shuffled template list so each market gets different templates.
    const perMarketShuffles = new Map<string, string[]>(
      markets.map(m => [m, [...SIGNAL_TEMPLATES].sort(() => Math.random() - 0.5)])
    );
    const perMarketIdx = new Map<string, number>(markets.map(m => [m, 0]));
    const queries: string[] = [];
    while (queries.length < MAX_QUERIES) {
      let addedThisCycle = 0;
      for (const market of markets) {
        if (queries.length >= MAX_QUERIES) break;
        const shuf = perMarketShuffles.get(market)!;
        const i = perMarketIdx.get(market)!;
        if (i >= shuf.length) continue;
        queries.push(shuf[i].replace("{market}", market));
        perMarketIdx.set(market, i + 1);
        addedThisCycle++;
      }
      if (addedThisCycle === 0) break;
    }


    // 2) Run Tavily for each query, in parallel
    const tavilyResults = await Promise.all(queries.map(q => tavilySearch(TAVILY_API_KEY, q).then(hits => ({ q, hits }))));
    const allHits: TavilyHit[] = [];
    const seenUrls = new Set<string>();
    for (const { hits } of tavilyResults) {
      for (const h of hits) {
        if (seenUrls.has(h.url)) continue;
        seenUrls.add(h.url);
        // Trim content to keep prompt under model token budget
        allHits.push({ ...h, content: (h.content || "").slice(0, 350) });
        if (allHits.length >= 30) break;
      }
      if (allHits.length >= 30) break;
    }

    if (allHits.length === 0) {
      return new Response(JSON.stringify({ inserted: 0, skipped: 0, dropped_unverified: 0, total: 0, tavily_hits: 0, queries }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Get exclusion list (already-surfaced companies for this BDR)
    const { data: existingRows } = await supabase
      .from("opportunities")
      .select("company")
      .eq("assigned_bdr", bdr_id)
      .order("created_at", { ascending: false })
      .limit(200);
    const excludeCompanies = Array.from(new Set((existingRows || []).map(r => r.company))).slice(0, 150);

    // 4) Build the AI prompt — model evaluates ONLY the real Tavily results.
    // Keep prompt SHORT — large prompts cause MAX_TOKENS with empty output.
    const allowedUrls = allHits.map(h => h.url);
    const allowedUrlSet = new Set(allowedUrls);

    const systemPrompt = [
      "You evaluate real web search results and extract SMB corporate-housing leads for National Corporate Housing.",
      `Today: ${today}. BDR markets: ${markets.join(", ")}. Verticals: ${verticals.join(", ") || "all 7"}.`,
      "RULES:",
      "- Use ONLY the provided results. Never invent companies, URLs, or dates.",
      "- source_url MUST be copied verbatim from the input list.",
      "- Drop anything that isn't a real 30+ day housing opportunity.",
      "- 'company' must be SMB/SME (<~$500M rev). If the article is about an F500 project, name the SMB sub instead; reference the prime only in why_it_matters.",
      "- Skip other corporate housing providers (Synergy, Churchill, Mint House, Oakwood, AKA, Sonder).",
      excludeCompanies.length > 0 ? `- Skip already-surfaced: ${excludeCompanies.slice(0, 40).join(", ")}.` : "",
      "Vertical must be one of: Relocation, Consult, Govt, Tech, Healthcare, Construction, Interns.",
      "Suggest 3-5 buyer titles (PM, Field Ops, Procurement, HR — avoid C-suite). Score discovery_score, housing_fit_score, confidence_score 0-100.",
      'OUTPUT — ONLY this JSON in a ```json fence: { "leads": [ { "company": "...", "market": "City, ST", "project": "...", "vertical": "...", "signal_type": "...", "description": "...", "why_it_matters": "...", "estimated_stay": "...", "discovery_score": 0, "housing_fit_score": 0, "confidence_score": 0, "suggested_contacts": ["..."], "pitch_angle": "...", "key_talking_points": ["..."], "source_type": "news", "source_url": "https://...", "source_date": "YYYY-MM-DD" } ] }',
    ].filter(Boolean).join("\n");

    const userPrompt = [
      `Extract qualified SMB leads from these ${allHits.length} real Tavily results. source_url must match one of the urls below exactly.`,
      "```json",
      JSON.stringify(allHits),
      "```",
    ].join("\n");

    let leads: Array<{
      company: string; market: string; project: string; vertical: string; signal_type: string;
      description: string; why_it_matters: string; estimated_stay: string;
      discovery_score: number; housing_fit_score: number; confidence_score: number;
      suggested_contacts: string[]; pitch_angle: string; key_talking_points: string[];
      source_type: string; source_url: string; source_date?: string;
    }> = [];
    try {
      const text = await callGeminiGrounded({ systemPrompt, userPrompt, temperature: 0.3 });
      const parsed = extractJson<{ leads: typeof leads }>(text);
      leads = parsed.leads || [];
    } catch (e) {
      if (e instanceof GeminiError) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: e.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }

    // 5) Inventory proximity helpers (unchanged from prior implementation)
    const geoCache = new Map<string, { lat: number; lon: number } | null>();
    const geocode = async (city: string, state: string) => {
      const key = `${city.toLowerCase()},${state.toLowerCase()}`;
      if (geoCache.has(key)) return geoCache.get(key)!;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&country=USA&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
        const res = await fetch(url, { headers: { "User-Agent": "Flare-BDR-Toolkit/1.0" } });
        const arr = await res.json();
        const hit = Array.isArray(arr) && arr[0] ? { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) } : null;
        geoCache.set(key, hit);
        return hit;
      } catch { geoCache.set(key, null); return null; }
    };
    const haversineMiles = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const R = 3958.8;
      const dLat = toRad(b.lat - a.lat); const dLon = toRad(b.lon - a.lon);
      const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    };
    const CORE_PROXIMITY_STATES = new Set(['GA', 'TN']);
    const PROXIMITY_MILES = 25;
    const FALLBACK_CORE_INV: Array<{name:string;city:string;state:string}> = [
      { name: 'Stillhouse Vinings', city: 'Atlanta', state: 'GA' },
      { name: 'AMLI Arts Center', city: 'Atlanta', state: 'GA' },
      { name: 'Camden Music Row', city: 'Nashville', state: 'TN' },
    ];
    const bdrCore = inv.filter(i => i.state && CORE_PROXIMITY_STATES.has(i.state.toUpperCase()));
    const coreInv = bdrCore.length > 0 ? bdrCore : FALLBACK_CORE_INV;
    const STATE_NAME_TO_CODE: Record<string, string> = { georgia: 'GA', tennessee: 'TN', alabama: 'AL', florida: 'FL', 'south carolina': 'SC', 'north carolina': 'NC' };
    const normalizeStateToken = (raw: string) => {
      const t = raw.trim();
      if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
      return STATE_NAME_TO_CODE[t.toLowerCase()] ?? t.toUpperCase();
    };
    const pickNearestInventory = async (market: string | null) => {
      if (!market || coreInv.length === 0) return null;
      const parts = market.split(',').map(s => s.trim()).filter(Boolean);
      const leadState = normalizeStateToken(parts[parts.length - 1] ?? '');
      if (!CORE_PROXIMITY_STATES.has(leadState)) return null;
      const leadCity = parts.length > 1 ? parts[0] : '';
      if (!leadCity) return null;
      const leadGeo = await geocode(leadCity, leadState);
      if (!leadGeo) return null;
      let best: { item: typeof coreInv[number]; miles: number } | null = null;
      for (const i of coreInv) {
        if (!i.city || !i.state) continue;
        const g = await geocode(i.city, i.state);
        if (!g) continue;
        const miles = haversineMiles(leadGeo, g);
        if (!best || miles < best.miles) best = { item: i, miles };
      }
      if (best && best.miles <= PROXIMITY_MILES) {
        const m = Math.round(best.miles);
        return { label: `${best.item.name} (${best.item.city}, ${best.item.state}) — ~${m} mi`, miles: m };
      }
      return null;
    };

    // 6) Validate + insert
    let inserted = 0, skipped = 0, droppedUnverified = 0, droppedFakeUrl = 0;
    for (const o of leads) {
      const blob = `${o.company} ${o.description} ${o.project}`;
      if (!o.source_url) { droppedUnverified++; continue; }
      // Must be an EXACT match to a Tavily-returned URL — blocks AI fabrication.
      if (!allowedUrlSet.has(o.source_url)) { droppedFakeUrl++; continue; }
      if (isCompetitor(blob)) { skipped++; continue; }
      if (!hasHousingNeed(blob)) { skipped++; continue; }
      const reachable = await verifyUrlReachable(o.source_url);
      if (!reachable) { droppedUnverified++; continue; }

      const composite = (Number(o.discovery_score) * 0.4) + (Number(o.housing_fit_score) * 0.4) + (Number(o.confidence_score) * 0.2);
      const priority = composite >= 80 ? "Top Priority" : composite >= 65 ? "Strong Opportunity" : composite >= 45 ? "Early Signal" : "Watch List";
      const review_status = composite >= 75 ? "Ready Now" : composite >= 55 ? "Needs Review" : "Watch List";
      const confidence_label = o.confidence_score >= 75 ? "High" : o.confidence_score >= 50 ? "Medium" : "Low";
      const nearestResult = await pickNearestInventory(o.market);
      const nearest = nearestResult?.label ?? null;
      const nearestMiles = nearestResult?.miles ?? null;

      const { data: existing } = await supabase
        .from("opportunities")
        .select("id")
        .eq("company", o.company)
        .eq("market", o.market)
        .eq("project", o.project || "")
        .maybeSingle();

      const payload = {
        company: o.company,
        market: o.market,
        project: o.project || "",
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
        distance_to_inventory: nearestMiles,
        source_type: o.source_type,
        source_url: o.source_url,
        assigned_bdr: bdr_id,
        verified: true,
        last_verified: new Date().toISOString(),
      };

      if (existing) {
        await supabase.from("opportunities").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("opportunities").insert({ ...payload, status: "new" });
        inserted++;
      }
    }

    return new Response(JSON.stringify({
      inserted, skipped, dropped_unverified: droppedUnverified, dropped_fake_url: droppedFakeUrl,
      total: leads.length, tavily_hits: allHits.length, queries_run: queries.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("scan-opportunities error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
