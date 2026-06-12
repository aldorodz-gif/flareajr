import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { loadMindsetBlocks, findBdrIdForMarket } from "../_shared/mindset.ts";
import { callGeminiGrounded, extractJson, GeminiError } from "../_shared/gemini.ts";
import {
  SIGNAL_TEMPLATES,
  HIRING_SIGNAL_TEMPLATES,
  tavilySearch,
  verifyUrlReachable,
  isBlockedFetchUrl,
  type TavilyHit,
} from "../_shared/tavily.ts";
import { expandGeo, type GeoScope, type GeoEntry } from "../_shared/geoExpand.ts";

type GeoTaggedHit = TavilyHit & { geo: string; geo_scope: GeoScope };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VERTICALS = [
  "Relocation & Mobility",
  "Project Teams & Consultants",
  "Government & Defense Contractors",
  "Tech",
  "Healthcare",
  "Construction & Field Services",
  "Intern Programs",
];

const asTrimmedString = (value: unknown) => typeof value === "string" ? value.trim() : "";

const normalizeLead = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  const lead = value as Record<string, unknown>;
  const company_name = asTrimmedString(lead.company_name);
  if (!company_name) return null;
  const recommended_titles = Array.isArray(lead.recommended_titles)
    ? lead.recommended_titles
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim()).slice(0, 5)
    : [];
  const scopeRaw = asTrimmedString(lead.geo_scope).toLowerCase();
  const allowedScopes: GeoScope[] = ["city", "suburb", "county", "metro", "state"];
  const geo_scope = (allowedScopes as string[]).includes(scopeRaw)
    ? (scopeRaw as GeoScope)
    : "city";
  return {
    company_name,
    vertical: asTrimmedString(lead.vertical) || "Unknown vertical",
    signal_type: asTrimmedString(lead.signal_type) || "Market signal",
    signal_detail: asTrimmedString(lead.signal_detail) || "Fresh market signal identified.",
    why_housing: asTrimmedString(lead.why_housing) || "Potential temporary housing demand needs validation.",
    recommended_titles,
    source_url: asTrimmedString(lead.source_url) || undefined,
    market: asTrimmedString(lead.market) || undefined,
    geo_scope,
  };
};

const normalizeTopVertical = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const vertical = asTrimmedString(row.vertical);
  if (!vertical) return null;
  const share = typeof row.share_pct === "number" ? row.share_pct : Number(row.share_pct);
  return {
    vertical,
    share_pct: Number.isFinite(share) ? Math.max(0, Math.min(100, Math.round(share))) : 0,
    driver: asTrimmedString(row.driver) || "Active market demand right now.",
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { state, city, vertical, exclude, bdr_id } = await req.json();
    if (!state || !city) {
      return new Response(JSON.stringify({ error: "State and city are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
    if (!TAVILY_API_KEY) {
      return new Response(JSON.stringify({ error: "TAVILY_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const market = `${city}, ${state}`;
    const today = new Date().toISOString().split("T")[0];
    const excludeList: string[] = Array.isArray(exclude) ? exclude.filter(Boolean).slice(0, 40) : [];

    // 1) Geo expansion: city + suburbs + county/metro + state-level signals.
    const geo = expandGeo(city, state);
    const wantsHiring = !vertical || vertical === "all" || /intern|hir/i.test(String(vertical));
    const templatePool = wantsHiring ? [...SIGNAL_TEMPLATES, ...HIRING_SIGNAL_TEMPLATES] : SIGNAL_TEMPLATES;
    const shuffleTemplates = () => [...templatePool].sort(() => Math.random() - 0.5);

    // Distribute MAX_QUERIES=12 across geo levels.
    //   ~4 city, ~3 suburbs, ~2 county/metro, ~3 state.
    const MAX_QUERIES = 12;
    const plan: Array<{ geo: GeoEntry; n: number }> = [];
    plan.push({ geo: geo.city, n: 4 });

    if (geo.suburbs.length > 0) {
      // Spread 3 queries across up to 3 distinct suburbs.
      const picks = [...geo.suburbs].sort(() => Math.random() - 0.5).slice(0, 3);
      for (const s of picks) plan.push({ geo: s, n: 1 });
    }
    if (geo.metro) plan.push({ geo: geo.metro, n: 1 });
    if (geo.county) plan.push({ geo: geo.county, n: 1 });
    plan.push({ geo: geo.state, n: 3 });

    const queryPlan: Array<{ q: string; geo: string; scope: GeoScope }> = [];
    for (const slot of plan) {
      const tpls = shuffleTemplates().slice(0, slot.n);
      for (const t of tpls) {
        if (queryPlan.length >= MAX_QUERIES) break;
        queryPlan.push({ q: t.replace("{market}", slot.geo.label), geo: slot.geo.label, scope: slot.geo.scope });
      }
      if (queryPlan.length >= MAX_QUERIES) break;
    }

    // 2) Run Tavily for each query in parallel, tag each hit with its query's geo.
    const tavilyResults = await Promise.all(queryPlan.map(p => tavilySearch(TAVILY_API_KEY, p.q)));
    const allHits: GeoTaggedHit[] = [];
    const seenUrls = new Set<string>();
    for (let i = 0; i < tavilyResults.length; i++) {
      const meta = queryPlan[i];
      for (const h of tavilyResults[i]) {
        if (seenUrls.has(h.url)) continue;
        seenUrls.add(h.url);
        allHits.push({
          ...h,
          content: (h.content || "").slice(0, 350),
          geo: meta.geo,
          geo_scope: meta.scope,
        });
        if (allHits.length >= 30) break;
      }
      if (allHits.length >= 30) break;
    }

    if (allHits.length === 0) {
      return new Response(JSON.stringify({ leads: [], top_verticals: [], tavily_hits: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Mindset block + prompt
    const resolvedBdrId = bdr_id || (await findBdrIdForMarket(city, state));
    const mindsetBlock = await loadMindsetBlocks(resolvedBdrId, 1500);
    const verticalScope = vertical && vertical !== "all"
      ? `Focus exclusively on the "${vertical}" vertical.`
      : `Cover any of these 7 verticals: ${VERTICALS.join(", ")}.`;

    const allowedUrlSet = new Set(allHits.map(h => h.url));
    const hitByUrl = new Map(allHits.map(h => [h.url, h] as const));

    const systemPrompt = [
      "You evaluate real web search results and extract SMB corporate-housing leads for National Corporate Housing.",
      `Today: ${today}. Primary market: ${market}. Scan covers the city, surrounding suburbs, county, metro, and statewide signals.`,
      verticalScope,
      mindsetBlock,
      "RULES:",
      "- Use ONLY the provided Tavily results. Never invent companies, URLs, or dates.",
      "- source_url MUST be copied verbatim from the input list.",
      "- Each input hit has 'geo' (e.g. 'Marietta, GA') and 'geo_scope' (city|suburb|county|metro|state). Copy them into each lead as 'market' and 'geo_scope' so the BDR sees the TRUE location of the signal, not the primary market.",
      "- 'company_name' must be SMB/SME (<~$500M rev). If the article is about an F500 project, name the SMB sub instead.",
      "- Skip other corporate housing providers (Synergy, Churchill, Mint House, Oakwood, AKA, Sonder).",
      excludeList.length ? `- Skip already-shown: ${excludeList.join(", ")}.` : "",
      `Use the 7 canonical vertical names exactly: ${VERTICALS.join(", ")}.`,
      "For recommended_titles: 3-5 job titles per lead — never C-suite.",
      'OUTPUT — ONLY this JSON in a ```json fence: { "leads": [ { "company_name": "...", "vertical": "...", "signal_type": "...", "signal_detail": "...", "why_housing": "...", "recommended_titles": ["..."], "source_url": "https://...", "market": "City, ST", "geo_scope": "city|suburb|county|metro|state" } ], "top_verticals": [ { "vertical": "...", "share_pct": 25, "driver": "..." } ] }',
    ].filter(Boolean).join("\n");

    const userPrompt = [
      `Extract qualified SMB leads from these ${allHits.length} real Tavily results across the ${market} area. source_url must match one of the urls below exactly.`,
      "```json",
      JSON.stringify(allHits),
      "```",
    ].join("\n");

    let result: { leads?: unknown[]; top_verticals?: unknown[] } = {};
    try {
      console.log(`dashboard-scan prompt sizes — system: ${systemPrompt.length}, user: ${userPrompt.length}, hits: ${allHits.length}`);
      const text = await callGeminiGrounded({ systemPrompt, userPrompt, temperature: 0.3 });
      result = extractJson(text);
    } catch (e) {
      if (e instanceof GeminiError) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: e.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }

    const rawLeads = Array.isArray(result.leads)
      ? result.leads.map(normalizeLead).filter((l): l is NonNullable<ReturnType<typeof normalizeLead>> => !!l)
      : [];

    // 4) Validate: source_url must be in Tavily allowed set. Then either verify reachability
    //    OR mark as job-board (skip the fetch but accept the signal).
    //    Always overwrite market/geo_scope from the cited hit so they reflect the
    //    true source location, not whatever the model echoed.
    const verifiedLeads: Array<typeof rawLeads[number] & { source_verified: boolean; source_label?: string }> = [];
    let droppedFakeUrl = 0, droppedUnverified = 0;
    for (const lead of rawLeads) {
      if (!lead.source_url) { droppedUnverified++; continue; }
      if (!allowedUrlSet.has(lead.source_url)) { droppedFakeUrl++; continue; }
      const hit = hitByUrl.get(lead.source_url)!;
      const enriched = { ...lead, market: hit.geo, geo_scope: hit.geo_scope };
      if (isBlockedFetchUrl(lead.source_url)) {
        verifiedLeads.push({
          ...enriched,
          source_verified: false,
          source_label: "Source: job board (link may require login)",
        });
        continue;
      }
      const ok = await verifyUrlReachable(lead.source_url);
      if (!ok) { droppedUnverified++; continue; }
      verifiedLeads.push({ ...enriched, source_verified: true });
    }

    const topVerticals = Array.isArray(result.top_verticals)
      ? result.top_verticals.map(normalizeTopVertical).filter((r): r is NonNullable<ReturnType<typeof normalizeTopVertical>> => !!r)
      : [];

    return new Response(JSON.stringify({
      leads: verifiedLeads,
      top_verticals: topVerticals,
      tavily_hits: allHits.length,
      queries_run: queryPlan.length,
      dropped_fake_url: droppedFakeUrl,
      dropped_unverified: droppedUnverified,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("dashboard-scan error:", e);
    const msg = e instanceof Error ? e.message : "Something went wrong. Try again.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
