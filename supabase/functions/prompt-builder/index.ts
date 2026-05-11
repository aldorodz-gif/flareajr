import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city, vertical, signal_type } = await req.json();
    if (!city || !vertical || !signal_type) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a prompt engineer for a corporate housing sales team that uses ChatGPT Agent Mode to find prospecting signals daily. Generate a tailored Agent Mode search prompt for the following inputs: City is ${city}, Vertical is ${vertical}, Signal type is ${signal_type}. The prompt should instruct ChatGPT Agent Mode to search for specific SMB and SME companies (roughly 10-1500 employees, under ~$500M revenue) in that city and vertical showing that signal type and surface opportunities for temporary housing, travel management, hotel programs, or destination services. HARD RULE: explicitly EXCLUDE Fortune 500, Fortune 1000, and large enterprise companies as targets — even if they show signals. When an SMB/SME is working with or contracted by an F500, return the SMB/SME, never the F500 itself. Format it as a ready-to-paste prompt with clear instructions, a minimum of 10 SMB/SME companies, and a structured output format showing company name, city, specific signal detail, most likely service line, and priority rated High Medium or Low. Keep it under 300 words. Return only the finished prompt text with no explanation or preamble.`;

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
          { role: "user", content: `Build a prompt for: City=${city}, Vertical=${vertical}, Signal=${signal_type}` },
        ],
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
    const prompt = data.choices?.[0]?.message?.content;
    if (!prompt) throw new Error("No content in response");

    return new Response(JSON.stringify({ prompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("prompt-builder error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
