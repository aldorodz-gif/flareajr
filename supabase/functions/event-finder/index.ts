import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city, vertical, timeframe } = await req.json();
    if (!city || !vertical) {
      return new Response(JSON.stringify({ error: "City and vertical are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const tf = timeframe || "next 3 months";
    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = [
      "You are a networking event researcher for a corporate housing sales team at National Corporate Housing.",
      "Today is " + today + ".",
      "Find real, verified networking events, conferences, trade shows, and industry meetups for a BDR prospecting in the " + vertical + " vertical that are PHYSICALLY LOCATED IN " + city + " within the " + tf + ".",
      "CRITICAL RULES:",
      "1) Every event MUST be held IN " + city + ". Do NOT include events in other cities, nearby cities, or virtual-only events.",
      "2) Only include events that have NOT yet occurred. Every event date must be on or after " + today + ". Do NOT include any past events.",
      "3) Only include REAL events from REAL organizations with VERIFIABLE online presence. Do NOT invent or fabricate events. If you are not confident an event is real, OMIT it entirely.",
      "4) URL RULES — THIS IS THE MOST IMPORTANT RULE:",
      "   - ONLY provide URLs you are CERTAIN are real, active websites.",
      "   - Use the HOMEPAGE of the hosting organization (e.g. https://www.denver.org, https://www.aia.org, https://www.smps.org).",
      "   - Do NOT guess or construct event-specific URLs like '/events/2026' or '/conference-2026' — these are almost always wrong.",
      "   - If you cannot confidently provide a real, working URL, set url to an empty string.",
      "   - NEVER fabricate a URL. A missing URL is far better than a broken one.",
      "5) Focus on well-known recurring events from established organizations: national associations with local chapters, chambers of commerce, convention & visitors bureaus, major industry trade shows.",
      "For each event return: event name, date or date range, location or venue, why it matters for corporate housing sales, the type of attendees likely present, and a suggested outreach angle.",
      "Find at least 8 events. Focus on events where decision-makers in " + vertical + " gather.",
      "ALL events must take place within " + city + " city limits.",
      "Return ONLY valid JSON, no explanation."
    ].join(" ");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Find networking events for " + vertical + " in " + city + " within the " + tf + "." },
        ],
        tools: [{
          type: "function",
          function: {
            name: "list_events",
            description: "Return a list of networking events",
            parameters: {
              type: "object",
              properties: {
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Event name" },
                      date: { type: "string", description: "Date or date range" },
                      location: { type: "string", description: "Venue or location" },
                      why: { type: "string", description: "Why it matters for corporate housing sales" },
                      attendees: { type: "string", description: "Type of attendees" },
                      angle: { type: "string", description: "Suggested outreach angle" },
                      priority: { type: "string", enum: ["High", "Medium", "Low"], description: "Priority for prospecting" },
                      url: { type: "string", description: "Homepage URL of the hosting organization. Empty string if unsure." },
                    },
                    required: ["name", "date", "location", "why", "attendees", "angle", "priority"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["events"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "list_events" } },
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
    console.error("event-finder error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});