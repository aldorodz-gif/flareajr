// Shared Tavily + URL verification helpers.
// Used by scan-opportunities and dashboard-scan so both pipelines behave identically.
import { logApiUsage } from "./usageLog.ts";
import { sendAlert } from "./alerts.ts";


export type TavilyHit = {
  title: string;
  url: string;
  content: string;
  published_date?: string;
};

// Sites that block automated fetching. We still let Tavily surface them
// (they're real signals), but we skip the reachability check and label them
// in the UI as "job board (link may require login)".
export const BLOCKED_FETCH_DOMAINS = [
  "indeed.com",
  "linkedin.com",
  "glassdoor.com",
  "ziprecruiter.com",
];

export function isBlockedFetchUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BLOCKED_FETCH_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

// Opportunity-signal templates, grouped by category so each scan run
// can sample across verticals instead of stacking on construction.
export const SIGNAL_TEMPLATES_BY_CATEGORY: Record<string, string[]> = {
  construction: [
    "new construction permits {market}",
    "data center project announcement {market}",
    "manufacturing plant opening {market}",
    "infrastructure groundbreaking {market}",
    "subcontractor awarded {market}",
    "substation construction {market}",
    "fiber broadband deployment {market}",
  ],
  corporate_movement: [
    "company relocation announcement {market}",
    "office lease expansion {market}",
    "new headquarters {market}",
    "company expanding operations {market}",
  ],
  govt_defense: [
    "government contract award {market}",
    "defense contractor expansion {market}",
    "military base project {market}",
  ],
  healthcare: [
    "hospital expansion {market}",
    "new medical facility {market}",
    "travel nurse demand {market}",
    "clinical rotation program {market}",
  ],
  education_interns: [
    "internship program {market}",
    "university expansion {market}",
    "summer intern cohort {market}",
    "training program launch {market}",
  ],
  sports_entertainment: [
    "film production filming {market}",
    "sports team training facility {market}",
    "major event coming to {market}",
    "concert residency production {market}",
  ],
  disaster_restoration: [
    "storm damage restoration {market}",
    "apartment fire displacement {market}",
    "disaster recovery crews {market}",
  ],
  professional_services: [
    "consulting firm new office {market}",
    "law firm expansion {market}",
    "M&A integration project {market}",
  ],
  energy_utilities: [
    "solar project construction {market}",
    "grid upgrade project {market}",
    "pipeline project {market}",
  ],
};

// Flat list kept for back-compat with existing imports.
export const SIGNAL_TEMPLATES: string[] = Object.values(SIGNAL_TEMPLATES_BY_CATEGORY).flat();

// Pick templates spread ACROSS categories. Round-robins category buckets
// (shuffled internally) and caps any one category at `maxPerCategory`.
export function sampleSignalTemplatesAcrossCategories(
  count: number,
  maxPerCategory = 2,
  extraPool?: string[],
): string[] {
  const buckets = Object.entries(SIGNAL_TEMPLATES_BY_CATEGORY).map(([cat, tpls]) => ({
    cat,
    pool: [...tpls].sort(() => Math.random() - 0.5),
    taken: 0,
  }));
  if (extraPool && extraPool.length > 0) {
    buckets.push({ cat: "_extra", pool: [...extraPool].sort(() => Math.random() - 0.5), taken: 0 });
  }
  const order = buckets.sort(() => Math.random() - 0.5);
  const out: string[] = [];
  let progressed = true;
  while (out.length < count && progressed) {
    progressed = false;
    for (const b of order) {
      if (out.length >= count) break;
      if (b.taken >= maxPerCategory) continue;
      if (b.pool.length === 0) continue;
      out.push(b.pool.shift()!);
      b.taken++;
      progressed = true;
    }
  }
  return out;
}

// Hiring / internship templates that target press releases & news (not job boards).
export const HIRING_SIGNAL_TEMPLATES = [
  "company internship program announcement {market}",
  "{market} company expanding hiring news",
  "summer internship cohort {market} press release",
  "new graduate program {market}",
];

export async function tavilySearch(
  apiKey: string,
  query: string,
  maxResults = 10,
  functionName?: string,
  includeDomains?: string[],
): Promise<TavilyHit[]> {
  try {
    const body: Record<string, unknown> = {
      api_key: apiKey,
      query,
      search_depth: "basic",
      topic: "news",
      days: 30,
      max_results: maxResults,
      include_answer: false,
    };
    if (includeDomains && includeDomains.length > 0) {
      body.include_domains = includeDomains;
    }
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn("Tavily error", res.status, body.slice(0, 200));
      logApiUsage({ service: "tavily", function_name: functionName, success: false, error_code: String(res.status) });
      sendAlert({
        alertKey: "tavily_down",
        subject: "FLARE: Tavily search issue",
        body: `Tavily returned ${res.status}.\nQuery: ${query}\nBody: ${body.slice(0, 300)}`,
        functionName,
      });
      return [];
    }
    const data = await res.json();
    logApiUsage({ service: "tavily", function_name: functionName, success: true });
    return (data?.results || []).map((r: any) => ({
      title: r.title || "",
      url: r.url || "",
      content: r.content || "",
      published_date: r.published_date || undefined,
    })).filter((r: TavilyHit) => r.url && r.title);
  } catch (e) {
    console.warn("Tavily fetch failed", e instanceof Error ? e.message : e);
    logApiUsage({ service: "tavily", function_name: functionName, success: false, error_code: "exception" });
    sendAlert({
      alertKey: "tavily_down",
      subject: "FLARE: Tavily search issue",
      body: `Tavily fetch threw: ${e instanceof Error ? e.message : String(e)}\nQuery: ${query}`,
      functionName,
    });
    return [];
  }
}

// Verify URL is reachable. Try HEAD first; fall back to GET for hosts that reject HEAD.
export async function verifyUrlReachable(url: string): Promise<boolean> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 7000);
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FlareLeadVerifier/1.0)" },
      });
      clearTimeout(timer);
      if (res.ok) return true;
      if (method === "HEAD" && (res.status === 405 || res.status === 403 || res.status === 400)) continue;
    } catch {
      if (method === "GET") return false;
    }
  }
  return false;
}
