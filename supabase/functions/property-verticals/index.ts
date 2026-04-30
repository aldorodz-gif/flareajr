import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { property } = await req.json();
    if (!property?.name || !property?.city || !property?.state) {
      return new Response(JSON.stringify({ error: "property {name, address, city, state} required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = [
      "You are a market intelligence analyst for a National Corporate Housing BDR.",
      `Today is ${today}.`,
      "Given a single Core Inventory property (apartment community NCH operates), identify the TOP 5 verticals — from the 7 canonical NCH verticals — that this specific property's submarket should be prospected for.",
      "Then for the top 2 verticals, surface concrete nearby company/employer ANGLES the BDR can prospect (industry clusters, named anchor employers, hospitals, military installations, studios, hubs, project sites, etc.).",
      "Use the 7 canonical names exactly:",
      VERTICALS.join(", "),
      "Be SUBMARKET-SPECIFIC. Reference real local anchors near the property (e.g. Star Metals/Tyler Perry near West Midtown ATL, Vanderbilt/HCA near Midtown Nashville, Redstone Arsenal near Huntsville, Ft. Benning near Columbus GA, Truist Park near Cumberland/Battery, Hartsfield/film studios near Fayetteville/Trilith, etc.) when you genuinely know them. Do not invent dates or dollar amounts.",
      "For each top vertical also give a 'why_here' sentence and 3-5 recommended job titles to target.",
    ].join(" ");

    const userPrompt = `Property: ${property.name}\nAddress: ${property.address ?? ""}\nCity: ${property.city}, ${property.state} ${property.zip ?? ""}\n\nReturn the ranked verticals + nearby prospect angles.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "property_verticals",
            description: "Return ranked verticals and nearby prospecting angles for the property.",
            parameters: {
              type: "object",
              properties: {
                angle: { type: "string", description: "1-2 sentence summary of why this property's submarket is a corporate housing fit." },
                top_verticals: {
                  type: "array",
                  minItems: 5, maxItems: 5,
                  items: {
                    type: "object",
                    properties: {
                      vertical: { type: "string", enum: VERTICALS },
                      why_here: { type: "string" },
                      recommended_titles: { type: "array", items: { type: "string" } },
                    },
                    required: ["vertical", "why_here", "recommended_titles"],
                    additionalProperties: false,
                  },
                },
                nearby_targets: {
                  type: "array",
                  minItems: 2, maxItems: 4,
                  description: "Concrete nearby employer/cluster angles to prospect.",
                  items: {
                    type: "object",
                    properties: {
                      vertical: { type: "string", enum: VERTICALS },
                      anchor: { type: "string", description: "Named cluster, employer, base, hospital, studio, project, etc." },
                      summary: { type: "string" },
                      target_titles: { type: "array", items: { type: "string" } },
                      signals: { type: "array", items: { type: "string" }, description: "Likely demand triggers (hiring surges, project starts, pilot season, etc.)." },
                    },
                    required: ["vertical", "anchor", "summary", "target_titles", "signals"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["angle", "top_verticals", "nearby_targets"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "property_verticals" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
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
    console.error("property-verticals error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Something went wrong" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
