import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { loadMindsetBlocks, findBdrIdForMarket } from "../_shared/mindset.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { state, city, vertical, exclude, bdr_id } = await req.json();
    if (!state || !city) {
      return new Response(JSON.stringify({ error: "State and city are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY is not configured");

    const verticalScope = vertical && vertical !== "all"
      ? `Focus exclusively on the "${vertical}" vertical.`
      : `Cover any of these 7 verticals: ${VERTICALS.join(", ")}.`;

    const today = new Date().toISOString().split("T")[0];
    const excludeList: string[] = Array.isArray(exclude) ? exclude.filter(Boolean).slice(0, 60) : [];

    const resolvedBdrId = bdr_id || (await findBdrIdForMarket(city, state));
    const mindsetBlock = await loadMindsetBlocks(resolvedBdrId);

    const systemPrompt = [
      "You are a market intelligence analyst for a corporate housing sales BDR at National Corporate Housing.",
      `Today is ${today}. The rep covers ${city}, ${state}.`,
      verticalScope,
      mindsetBlock,
      "OPERATING RULE: The OPERATOR MINDSET block above is load-bearing. Apply every rule, signal type, and target archetype it lists when you select leads — do not just acknowledge it, USE it on every lead.",
      "MISSION: Leave no stone unturned. Search the live web RIGHT NOW for SMB/SME companies with active 30+ day corporate housing demand signals in this market.",
      "Use real, verifiable companies you find in current news, press releases, contract awards (USASpending, SAM.gov), permits, EDC announcements, regional business journals, hospital/university expansion news, defense/DOE awards, BEAD broadband awards, county capital plans, state procurement portals, construction trade press, LinkedIn job posts.",
      "The 'company' field MUST be the SMB/SME executing the work — never an F500 / hospital system / utility / agency umbrella. When the umbrella project belongs to an F500, name the SMB sub doing the work.",
      "Always include a real source_url per lead. If you can only find a weaker source (e.g. company news page, press release) include it anyway — the BDR will verify and decide. Do NOT fabricate URLs.",
      excludeList.length
        ? `Exclude these already-shown companies: ${excludeList.join(", ")}.`
        : "Surface fresh, less-obvious SMBs — specialty subs, regional staffing firms, niche engineering shops, regional staffing firms, mid-tier consultancies.",
      "Return AT LEAST 12 leads (target 12-18) as a JSON object matching the schema. Quantity AND quality — we are paying for this scan, surface every credible SMB signal.",
      "Also rank which of the 7 canonical verticals are most active in this market right now (share % summing to 100).",
      "Use the 7 canonical vertical names exactly as listed.",
      "For recommended_titles: 3-5 job titles to target — never C-suite.",
    ].join(" ");

    const userPrompt = `Search current web sources and find 12-18 SMB/SME companies in ${city}, ${state} with active corporate housing demand signals (expansions, contract wins, hiring surges, project starts, mobilizations, subcontractor mobilizations under larger F500/utility/agency projects) in the last 90 days. Apply the OPERATOR MINDSET rules. Include source_url for each.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        temperature: 0.3,
        search_recency_filter: "month",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "market_scan",
            schema: {
              type: "object",
              properties: {
                leads: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company_name: { type: "string" },
                      vertical: { type: "string", enum: VERTICALS },
                      signal_type: { type: "string" },
                      signal_detail: { type: "string" },
                      why_housing: { type: "string" },
                      recommended_titles: { type: "array", items: { type: "string" } },
                      source_url: { type: "string" },
                    },
                    required: ["company_name", "vertical", "signal_type", "signal_detail", "why_housing", "recommended_titles", "source_url"],
                  },
                },
                top_verticals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      vertical: { type: "string", enum: VERTICALS },
                      share_pct: { type: "number" },
                      driver: { type: "string" },
                    },
                    required: ["vertical", "share_pct", "driver"],
                  },
                },
              },
              required: ["leads", "top_verticals"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Perplexity error", response.status, body);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401 || response.status === 402) {
        return new Response(JSON.stringify({ error: "Perplexity credit/auth issue. Check the connection." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in Perplexity response");

    const result = JSON.parse(content);
    const citations: string[] = Array.isArray(data.citations) ? data.citations : [];

    // Verify each lead's source_url actually loads AND mentions the company.
    // If the model-supplied URL fails, try the Perplexity citation list as a fallback.
    const verifyUrlMentionsCompany = async (url: string, company: string): Promise<boolean> => {
      try {
        const u = new URL(url);
        if (u.protocol !== "https:" && u.protocol !== "http:") return false;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: ctrl.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; FlareLeadVerifier/1.0)" },
        });
        clearTimeout(timer);
        if (!res.ok) return false;
        const text = (await res.text()).toLowerCase();
        const tokens = company.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 3);
        if (tokens.length === 0) return text.includes(company.toLowerCase());
        return tokens.some(t => text.includes(t));
      } catch {
        return false;
      }
    };

    const rawLeads: Array<{ company_name: string; source_url?: string; [k: string]: unknown }> = result.leads || [];
    const verifiedLeads: typeof rawLeads = [];
    let unverifiedCount = 0;
    for (const lead of rawLeads) {
      const candidates = [lead.source_url, ...citations].filter((u): u is string => !!u);
      let goodUrl: string | null = null;
      for (const url of candidates) {
        if (await verifyUrlMentionsCompany(url, lead.company_name)) {
          goodUrl = url;
          break;
        }
      }
      // SOFT verification: keep every lead. Only the BDR decides to archive or pipeline it.
      // If we can't verify, fall back to the model's URL (or first citation) and flag it as unverified.
      const fallbackUrl = goodUrl ?? lead.source_url ?? candidates[0] ?? null;
      if (!goodUrl) unverifiedCount++;
      verifiedLeads.push({ ...lead, source_url: fallbackUrl, url_verified: !!goodUrl });
    }
    result.leads = verifiedLeads;
    result.citations = citations;
    result.unverified_count = unverifiedCount;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dashboard-scan error:", e);
    const msg = e instanceof Error ? e.message : "Something went wrong. Try again.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
