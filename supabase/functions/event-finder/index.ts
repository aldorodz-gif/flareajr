import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiGrounded, extractJson, GeminiError } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEARCH_USER_AGENT = "Mozilla/5.0 (compatible; LovableEventVerifier/1.0; +https://lovable.dev)";
const DISALLOWED_HOSTS = [
  "duckduckgo.com",
  "google.com",
  "bing.com",
  "yahoo.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
  "youtube.com",
  "tiktok.com",
  "wikipedia.org",
];
const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "your",
  "their",
  "next",
  "near",
  "event",
  "events",
  "official",
  "chapter",
]);

interface EventItem {
  name: string;
  date: string;
  location: string;
  why: string;
  attendees: string;
  angle: string;
  priority: string;
  url?: string;
  organization?: string;
}

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

interface ValidatedUrl {
  ok: boolean;
  url: string;
  title: string;
  text: string;
}

const unique = <T>(items: T[]) => [...new Set(items)];

const decodeHtmlEntities = (value: string) => value
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&#x27;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const stripHtml = (value: string) => value
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const normalizeText = (value: string) => decodeHtmlEntities(stripHtml(value))
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const tokenize = (value: string) => unique(
  normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
);

const countMatches = (value: string, tokens: string[]) => {
  const normalized = normalizeText(value);
  return unique(tokens.filter((token) => normalized.includes(token))).length;
};

const extractHostname = (value: string) => {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};

const isDisallowedHost = (hostname: string) => DISALLOWED_HOSTS.some(
  (blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`),
);

const ensureHttpUrl = (value?: string) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return "";
};

const looksLikeBlankPage = (value: string) => {
  const normalized = normalizeText(value);
  return !normalized || normalized.length < 60 || /(domain for sale|buy this domain|parked free|under construction|coming soon|page not found|404 not found|website is for sale)/.test(normalized);
};

const fetchWithTimeout = (url: string, init: RequestInit = {}, timeoutMs = 8000) => fetch(url, {
  ...init,
  signal: AbortSignal.timeout(timeoutMs),
  headers: {
    "User-Agent": SEARCH_USER_AGENT,
    "Accept-Language": "en-US,en;q=0.9",
    ...(init.headers ?? {}),
  },
});

const unwrapSearchResultUrl = (href: string) => {
  const decoded = decodeHtmlEntities(href);
  if (decoded.startsWith("//duckduckgo.com/l/?")) {
    const wrapped = new URL(`https:${decoded}`);
    return wrapped.searchParams.get("uddg") ? decodeURIComponent(wrapped.searchParams.get("uddg")!) : "";
  }
  if (decoded.startsWith("/l/?")) {
    const wrapped = new URL(`https://duckduckgo.com${decoded}`);
    return wrapped.searchParams.get("uddg") ? decodeURIComponent(wrapped.searchParams.get("uddg")!) : "";
  }
  if (decoded.startsWith("http://") || decoded.startsWith("https://")) return decoded;
  return "";
};

async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(searchUrl, {
      headers: { Accept: "text/html,application/xhtml+xml" },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const pattern = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>([\s\S]{0,1500}?)(?:<a[^>]*class="result__snippet"[^>]*>|<div[^>]*class="result__snippet"[^>]*>)([\s\S]*?)<\/(?:a|div)>/gi;
    const results: SearchResult[] = [];

    for (const match of html.matchAll(pattern)) {
      const url = ensureHttpUrl(unwrapSearchResultUrl(match[1] ?? ""));
      const title = decodeHtmlEntities(stripHtml(match[2] ?? ""));
      const snippet = decodeHtmlEntities(stripHtml(match[4] ?? ""));
      const hostname = extractHostname(url);

      if (!url || !hostname || isDisallowedHost(hostname)) continue;
      if (!title && !snippet) continue;

      results.push({ url, title, snippet });
      if (results.length >= 5) break;
    }

    return results;
  } catch (error) {
    console.warn("searchWeb failed:", error);
    return [];
  }
}

async function validateUrl(url: string): Promise<ValidatedUrl> {
  const candidate = ensureHttpUrl(url);
  if (!candidate) return { ok: false, url: "", title: "", text: "" };

  try {
    const response = await fetchWithTimeout(candidate, {
      redirect: "follow",
      headers: { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
    });
    const finalUrl = response.url || candidate;
    const hostname = extractHostname(finalUrl);

    if (!hostname || isDisallowedHost(hostname)) {
      return { ok: false, url: finalUrl, title: "", text: "" };
    }

    const contentType = response.headers.get("content-type") || "";
    const rawHtml = contentType.includes("html") || response.status === 403
      ? await response.text().catch(() => "")
      : "";
    const title = decodeHtmlEntities(stripHtml(rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""));
    const text = decodeHtmlEntities(stripHtml(rawHtml)).slice(0, 3000);
    const okStatus = (response.status >= 200 && response.status < 400) || (response.status === 403 && rawHtml.length > 200);

    if (!okStatus || looksLikeBlankPage(`${title} ${text}`)) {
      return { ok: false, url: finalUrl, title, text };
    }

    return { ok: true, url: finalUrl, title, text };
  } catch (error) {
    console.warn("validateUrl failed:", url, error);
    return { ok: false, url: candidate, title: "", text: "" };
  }
}

function scoreEvidence(event: EventItem, city: string, text: string, url: string) {
  const eventTokens = tokenize(event.name).slice(0, 8);
  const orgTokens = tokenize(event.organization ?? "").slice(0, 6);
  const cityTokens = tokenize(city.split(",")[0] ?? city).slice(0, 4);
  const locationTokens = tokenize(event.location).slice(0, 5);
  const evidence = `${text} ${extractHostname(url).replace(/\./g, " ")}`;
  const normalizedEvidence = normalizeText(evidence);

  const nameMatches = countMatches(normalizedEvidence, eventTokens);
  const orgMatches = countMatches(normalizedEvidence, orgTokens);
  const cityMatches = countMatches(normalizedEvidence, cityTokens);
  const locationMatches = countMatches(normalizedEvidence, locationTokens);

  let score = (nameMatches * 4) + (orgMatches * 3) + (cityMatches * 2) + locationMatches;
  if (/(conference|expo|summit|meeting|networking|luncheon|forum|trade show|congress|association)/.test(normalizedEvidence)) {
    score += 2;
  }

  return { score, nameMatches, orgMatches, cityMatches };
}

async function verifyEvent(event: EventItem, city: string): Promise<EventItem | null> {
  const cityText = city.split(",")[0]?.trim() || city;
  const locationEvidence = `${event.location} ${event.why} ${event.attendees}`;

  if (countMatches(locationEvidence, tokenize(cityText).slice(0, 4)) === 0) {
    return null;
  }

  const query = [event.name, event.organization, cityText].filter(Boolean).join(" ");
  const searchResults = await searchWeb(query);
  const bestSearchResult = searchResults
    .map((result) => ({
      result,
      ...scoreEvidence(event, city, `${result.title} ${result.snippet}`, result.url),
    }))
    .sort((a, b) => b.score - a.score)[0];

  const [validatedOriginal, validatedSearch] = await Promise.all([
    event.url ? validateUrl(event.url) : Promise.resolve(null),
    bestSearchResult?.score >= 6 ? validateUrl(bestSearchResult.result.url) : Promise.resolve(null),
  ]);

  const candidates = [
    validatedOriginal?.ok
      ? {
          url: validatedOriginal.url,
          ...scoreEvidence(
            event,
            city,
            `${searchResults.map((item) => `${item.title} ${item.snippet}`).join(" ")} ${validatedOriginal.title} ${validatedOriginal.text}`,
            validatedOriginal.url,
          ),
        }
      : null,
    validatedSearch?.ok
      ? {
          url: validatedSearch.url,
          ...scoreEvidence(
            event,
            city,
            `${bestSearchResult?.result.title ?? ""} ${bestSearchResult?.result.snippet ?? ""} ${validatedSearch.title} ${validatedSearch.text}`,
            validatedSearch.url,
          ),
        }
      : null,
  ]
    .filter((candidate): candidate is { url: string; score: number; nameMatches: number; orgMatches: number; cityMatches: number } => Boolean(candidate))
    .sort((a, b) => b.score - a.score);

  const bestCandidate = candidates[0];
  if (!bestCandidate || bestCandidate.score < 6 || (bestCandidate.nameMatches < 2 && bestCandidate.orgMatches < 2)) {
    return null;
  }

  return {
    ...event,
    url: bestCandidate.url,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city, vertical, timeframe } = await req.json();
    if (!city || !vertical) {
      return new Response(JSON.stringify({ error: "City and vertical are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const tf = timeframe || "next 3 months";
    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = [
      "You are a networking event researcher for a corporate housing sales team at National Corporate Housing.",
      "Today is " + today + ".",
      "Use Google Search to find real, verified networking events, conferences, trade shows, and industry meetups for a BDR prospecting in the " + vertical + " vertical that are PHYSICALLY LOCATED IN " + city + " within the " + tf + ".",
      "CRITICAL RULES:",
      "1) Every event MUST be held IN " + city + ". Do NOT include events in other cities, nearby cities, or virtual-only events.",
      "2) Only include events that have NOT yet occurred. Every event date must be on or after " + today + ".",
      "3) Only include REAL events from REAL organizations with VERIFIABLE online presence — confirm via Google Search.",
      "4) URL RULES: ONLY provide URLs returned by your Google Search results. Use the homepage of the hosting organization when in doubt. NEVER fabricate a URL — empty string is better than broken.",
      "5) Include the hosting organization name for every event.",
      "6) Prefer fewer high-confidence events over a longer list of uncertain events.",
      "7) Focus on well-known recurring events from established organizations: national associations with local chapters, chambers of commerce, convention & visitors bureaus, major industry trade shows.",
      "Find up to 8 high-confidence events. Focus on events where decision-makers in " + vertical + " gather.",
      "",
      "OUTPUT FORMAT — return ONLY a JSON object inside a ```json code fence, no prose:",
      '{ "events": [ { "name": "...", "organization": "...", "date": "YYYY-MM-DD or range", "location": "venue, ' + city + '", "why": "...", "attendees": "...", "angle": "...", "priority": "High|Medium|Low", "url": "https://..." } ] }',
    ].join(" ");

    let result: { events?: EventItem[] };
    try {
      const text = await callGeminiGrounded({
        systemPrompt,
        userPrompt: "Find networking events for " + vertical + " in " + city + " within the " + tf + ". Return JSON matching the schema.",
        temperature: 0.3,
      });
      result = extractJson(text);
    } catch (e) {
      if (e instanceof GeminiError) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: e.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }
    const rawEvents: EventItem[] = Array.isArray(result?.events) ? result.events : [];
    const verifiedEvents = (await Promise.all(rawEvents.map((event) => verifyEvent(event, city))))
      .filter((event): event is EventItem => Boolean(event));

    return new Response(JSON.stringify({ events: verifiedEvents }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("event-finder error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});