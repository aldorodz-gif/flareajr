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

    // 1) Build queries from scan input. Include hiring templates when scope is "all" or an intern/hiring vertical.
    const wantsHiring = !vertical || vertical === "all" || /intern|hir/i.test(String(vertical));
    const templatePool = wantsHiring ? [...SIGNAL_TEMPLATES, ...HIRING_SIGNAL_TEMPLATES] : SIGNAL_TEMPLATES;
    const shuffled = [...templatePool].sort(() => Math.random() - 0.5);
    const MAX_QUERIES = 9;
    const queries = shuffled.slice(0, MAX_QUERIES).map(t => t.replace("{market}", market));

    // 2) Run Tavily for each query in parallel.
    const tavilyResults = await Promise.all(queries.map(q => tavilySearch(TAVILY_API_KEY, q)));
    const allHits: TavilyHit[] = [];
    const seenUrls = new Set<string>();
    for (const hits of tavilyResults) {
      for (const h of hits) {
        if (seenUrls.has(h.url)) continue;
        seenUrls.add(h.url);
        allHits.push({ ...h, content: (h.content || "").slice(0, 350) });
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

    const systemPrompt = [
      "You evaluate real web search results and extract SMB corporate-housing leads for National Corporate Housing.",
      `Today: ${today}. Market: ${market}.`,
      verticalScope,
      mindsetBlock,
      "RULES:",
      "- Use ONLY the provided Tavily results. Never invent companies, URLs, or dates.",
      "- source_url MUST be copied verbatim from the input list.",
      "- 'company_name' must be SMB/SME (<~$500M rev). If the article is about an F500 project, name the SMB sub instead.",
      "- Skip other corporate housing providers (Synergy, Churchill, Mint House, Oakwood, AKA, Sonder).",
      excludeList.length ? `- Skip already-shown: ${excludeList.join(", ")}.` : "",
      `Use the 7 canonical vertical names exactly: ${VERTICALS.join(", ")}.`,
      "For recommended_titles: 3-5 job titles per lead — never C-suite.",
      'OUTPUT — ONLY this JSON in a ```json fence: { "leads": [ { "company_name": "...", "vertical": "...", "signal_type": "...", "signal_detail": "...", "why_housing": "...", "recommended_titles": ["..."], "source_url": "https://..." } ], "top_verticals": [ { "vertical": "...", "share_pct": 25, "driver": "..." } ] }',
    ].filter(Boolean).join("\n");

    const userPrompt = [
      `Extract qualified SMB leads from these ${allHits.length} real Tavily results for ${market}. source_url must match one of the urls below exactly.`,
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
    const verifiedLeads: Array<typeof rawLeads[number] & { source_verified: boolean; source_label?: string }> = [];
    let droppedFakeUrl = 0, droppedUnverified = 0;
    for (const lead of rawLeads) {
      if (!lead.source_url) { droppedUnverified++; continue; }
      if (!allowedUrlSet.has(lead.source_url)) { droppedFakeUrl++; continue; }
      if (isBlockedFetchUrl(lead.source_url)) {
        verifiedLeads.push({
          ...lead,
          source_verified: false,
          source_label: "Source: job board (link may require login)",
        });
        continue;
      }
      const ok = await verifyUrlReachable(lead.source_url);
      if (!ok) { droppedUnverified++; continue; }
      verifiedLeads.push({ ...lead, source_verified: true });
    }

    const topVerticals = Array.isArray(result.top_verticals)
      ? result.top_verticals.map(normalizeTopVertical).filter((r): r is NonNullable<ReturnType<typeof normalizeTopVertical>> => !!r)
      : [];

    return new Response(JSON.stringify({
      leads: verifiedLeads,
      top_verticals: topVerticals,
      tavily_hits: allHits.length,
      queries_run: queries.length,
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
