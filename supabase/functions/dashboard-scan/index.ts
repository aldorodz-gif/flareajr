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
    const { state, city, vertical, exclude } = await req.json();
    if (!state || !city) {
      return new Response(JSON.stringify({ error: "State and city are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const verticalScope = vertical && vertical !== "all"
      ? `Focus exclusively on the "${vertical}" vertical.`
      : `Cover any of these 7 verticals: ${VERTICALS.join(", ")}.`;

    const today = new Date().toISOString().split("T")[0];

    // Variety: rotate signal focus + add a randomized seed so consecutive scans don't return the same leads.
    const focusRotations = [
      "Lean into CONTRACT AWARDS, government & defense subs, and federal/state-funded projects.",
      "Lean into CONSTRUCTION & PHASED PROJECTS — surface specialty subs (MEP, commissioning, controls).",
      "Lean into CORPORATE EXPANSIONS, HQ relocations, and brand-new facility openings.",
      "Lean into TECH IMPLEMENTATIONS, SaaS rollouts, and consulting deployments.",
      "Lean into HEALTHCARE — equipment installs, hospital expansions, traveling clinical staff.",
      "Lean into ENERGY, INFRASTRUCTURE, utility & substation mobilizations.",
      "Lean into BROADBAND / FIBER / OSP buildouts and BEAD-funded projects.",
      "Lean into MANUFACTURING / PLANT LAUNCHES and supplier ramp-ups.",
    ];
    const focus = focusRotations[Math.floor(Math.random() * focusRotations.length)];
    const varietySeed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const excludeList: string[] = Array.isArray(exclude) ? exclude.filter(Boolean).slice(0, 60) : [];

    const systemPrompt = [
      "You are a market intelligence analyst for a corporate housing sales BDR at National Corporate Housing.",
      `Today is ${today}.`,
      `The rep covers ${city}, ${state}.`,
      verticalScope,
      "Surface 8 high-confidence prospect signals — companies in this market that likely need 30+ day corporate housing in the next 90 days.",
      "Signal types include: announced expansions, new office openings, large project wins, government contract awards, hiring surges, mergers, hospital staffing initiatives, construction project starts, intern cohort announcements, etc.",
      focus,
      excludeList.length
        ? `CRITICAL: DO NOT return any of these companies — they were already shown. Find DIFFERENT companies (different specialty subs, different niche firms, different program managers): ${excludeList.join(", ")}.`
        : "Surface fresh, less-obvious SMBs — go beyond the top 10 most-known firms in this market.",
      `Variety seed: ${varietySeed}. Use this to diversify your selection across scans.`,
      "ALSO return a ranked breakdown of which of the 7 canonical verticals are MOST active in this market right now (share percentages summing to 100).",
      "Only use the 7 canonical vertical names exactly as listed.",
      "For each lead, give: company_name, vertical (one of the 7), signal_type (e.g. 'Expansion', 'Contract Win', 'Hiring Surge', 'Project Award'), signal_detail (1 specific sentence), why_housing (one sentence on the housing/travel implication), and recommended_titles (3-5 job titles to target).",
      "Do not fabricate specific dollar amounts or dates you cannot reasonably infer; keep claims plausible and generic when uncertain.",
      "Return ONLY valid JSON via the tool call.",
    ].join(" ");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.9,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Scan ${city}, ${state} for active corporate housing demand signals.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "market_scan",
            description: "Return market scan results",
            parameters: {
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
                    },
                    required: ["company_name", "vertical", "signal_type", "signal_detail", "why_housing", "recommended_titles"],
                    additionalProperties: false,
                  },
                },
                top_verticals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      vertical: { type: "string", enum: VERTICALS },
                      share_pct: { type: "number" },
                      driver: { type: "string", description: "One short sentence on why this vertical is hot here." },
                    },
                    required: ["vertical", "share_pct", "driver"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["leads", "top_verticals"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "market_scan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dashboard-scan error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
