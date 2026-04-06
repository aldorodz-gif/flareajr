import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { vertical, signal, goal } = await req.json();
    if (!vertical || !signal) {
      return new Response(JSON.stringify({ error: "Vertical and signal are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const goalText = goal || "build authority and generate inbound leads";

    const systemPrompt = `You are a LinkedIn content strategist for a corporate housing BDR at National Corporate Housing. Create a 5-post LinkedIn content strategy for someone prospecting in the ${vertical} vertical who has spotted this signal: "${signal}". The goal is to ${goalText}. For each post, provide: a hook (first line that stops the scroll), the full post body (under 150 words, written in first person, conversational and authentic — not salesy), suggested hashtags (3-5), best day/time to post, and the strategic intent behind the post. The 5 posts should follow a narrative arc: 1) Industry insight post (show you understand their world), 2) Signal commentary post (reference the trend without pitching), 3) Value-add post (share a framework or tip relevant to the vertical), 4) Social proof / story post (a brief case-study style anecdote about NCH helping a similar company), 5) Soft CTA post (invite conversation, not a meeting). Each post should feel like it was written by a real human who works in corporate housing, not a marketing team. Return ONLY valid JSON.`;

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
          { role: "user", content: `Build a LinkedIn strategy for ${vertical}, signal: ${signal}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_strategy",
            description: "Generate a LinkedIn post strategy",
            parameters: {
              type: "object",
              properties: {
                posts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      number: { type: "number", description: "Post number 1-5" },
                      type: { type: "string", description: "Post type (e.g. Industry Insight, Signal Commentary)" },
                      hook: { type: "string", description: "First line / scroll-stopper" },
                      body: { type: "string", description: "Full post body, under 150 words" },
                      hashtags: { type: "array", items: { type: "string" }, description: "3-5 hashtags" },
                      best_time: { type: "string", description: "Best day/time to post" },
                      intent: { type: "string", description: "Strategic intent behind this post" },
                    },
                    required: ["number", "type", "hook", "body", "hashtags", "best_time", "intent"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["posts"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_strategy" } },
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
    console.error("linkedin-strategy error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
