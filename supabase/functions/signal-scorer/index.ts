import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { signal } = await req.json();
    if (!signal || typeof signal !== "string") {
      return new Response(JSON.stringify({ error: "Signal text is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a signal scoring tool for a corporate housing sales team. The company sells temporary housing, travel management, hotel programs, and destination services to businesses. When given a news headline, LinkedIn post, or business signal, score it HIGH, MEDIUM, or LOW based on whether it implies real physical people movement that would create demand for those services.

Industry-specific guidance:
- Theater / Performing Arts: Production seasons, rehearsal periods (3-4 weeks before opening), and runs of 30+ days are HIGH signals because they require furnished housing for cast, directors, creative teams, production crew, and touring staff. Single-night touring stops or one-off performances are LOW. LORT theaters and regional repertory companies with multiple productions per season are especially strong.
- Construction: Mobilizations, contract awards, phased builds are HIGH.
- Defense: Program ramps, deployments, contract transitions are HIGH.
- Energy: Planned outages, turnarounds, storm response are HIGH.
- Healthcare: Travel nurse cohorts, physician relocations are MEDIUM-HIGH.
- Sports: Player housing, fellowship programs, seasonal roster moves are HIGH.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Score this signal: ${signal}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "score_signal",
            description: "Score a business signal for corporate housing demand",
            parameters: {
              type: "object",
              properties: {
                score: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
                reason: { type: "string", description: "One sentence in plain language with no jargon" },
                service_line: { type: "string", enum: ["Temporary Housing", "Travel", "Hotels", "Destination Services", "None"] },
              },
              required: ["score", "reason", "service_line"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "score_signal" } },
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
    console.error("signal-scorer error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
