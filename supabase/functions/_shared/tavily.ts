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

// General opportunity-signal templates. {market} replaced with each market.
export const SIGNAL_TEMPLATES = [
  "new construction permits {market}",
  "data center project announcement {market}",
  "hospital expansion {market}",
  "manufacturing plant opening {market}",
  "company relocation announcement {market}",
  "office lease expansion {market}",
  "government contract award {market}",
  "substation construction {market}",
  "fiber broadband deployment {market}",
  "infrastructure groundbreaking {market}",
  "training cohort program {market}",
  "subcontractor awarded {market}",
];

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
