import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { company, signal, buyer_title, service_line, current_subject, exclude } = await req.json();
    if (!company || !signal || !buyer_title || !service_line) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const excludeList = [current_subject, ...(Array.isArray(exclude) ? exclude : [])].filter(Boolean);

    const systemPrompt = `You generate subject lines for cold outreach emails for National Corporate Housing.

Target: ${buyer_title} at ${company}
Signal: ${signal}
Service line: ${service_line}

RULES:
- Exactly 3 subject lines, each 3-7 natural words
- Each MUST reference a specific detail from the signal (project, city, headcount, contract, hire, expansion, etc.)
- Tone: consultative, operational. Sound like a sharp colleague, not a vendor.
- BANNED: generic words ("partnership", "growth", "synergy", "quick question"), FREE/LIMITED/GUARANTEED, ALL CAPS, excessive punctuation, emojis
- Vary angle across the 3 (e.g. one names the project, one names the pain, one asks a question)
${excludeList.length ? `- DO NOT repeat or paraphrase any of these already-used subjects:\n${excludeList.map(s => `  • ${s}`).join("\n")}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate 3 fresh subject line alternatives now." },
        ],
        tools: [{
          type: "function",
          function: {
            name: "subject_alternatives",
            description: "Return 3 fresh subject line alternatives",
            parameters: {
              type: "object",
              properties: {
                subject_alternatives: {
                  type: "array",
                  description: "Exactly 3 subject lines, 3-7 words each",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["subject_alternatives"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "subject_alternatives" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");
    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("subject-alternatives error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
