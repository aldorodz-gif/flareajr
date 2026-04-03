import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { company, signal, buyer_title, service_line, vary } = await req.json();
    if (!company || !signal || !buyer_title || !service_line) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const varyInstruction = vary ? " Use a different tone and angle than a typical first outreach — vary the approach while keeping the same rules." : "";

    const referenceEmail = `Here is a real outreach email from a top-performing BDR at NCH. Use it as a style and tone reference — match the warmth, specificity, and professional-but-human feel:

"My name is Cedrick Teves, and I work with National Corporate Housing, a trusted partner of the NBA Foundation for Fellowship Housing. We also support NBA teams across the country with their housing needs.

I came across the Chicago Bulls rotational program and wanted to reach out. I understand that housing may not be directly provided, but we'd love to be a resource for your fellows, as well as for any player or staff housing needs that may arise.

We specialize in fully furnished, flexible accommodations for interns, fellows, players, and staff. Whether it's short-term stays or longer assignments, we offer turnkey housing with flexible lease terms, consolidated billing, and options tailored to your team's schedule and preferences.

I truly appreciate your help in connecting me with the right individual for this."

Key patterns to replicate: lead with a credibility anchor (partnership, existing relationship), reference the specific signal or program you found, acknowledge the buyer's reality before pitching, close with a warm connector ask. Adapt these patterns to the specific signal and company — do NOT copy this email verbatim.`;

    const systemPrompt = `You are a sales email writer for National Corporate Housing, a company that provides temporary housing, travel management, hotel programs, and destination services to businesses. Write a first outreach email to the ${buyer_title} at ${company}, referencing the signal: ${signal}. The service line is ${service_line}. Rules: under 100 words total, maximum 4 sentences, written like one person texting a colleague not like a sales email. First sentence references the specific signal directly, no generic openers. Second sentence names their likely problem without pitching anything. Third sentence says what NCH does in one plain English sentence, outcome first. Fourth sentence is a low friction ask for a 10 to 15 minute call. No "I hope this email finds you well." No "I wanted to reach out." No company history. No feature lists. Also write a 2 to 4 word subject line that references the specific signal.${varyInstruction}

${referenceEmail}`;

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
          { role: "user", content: `Write the email now.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "write_email",
            description: "Generate a sales outreach email",
            parameters: {
              type: "object",
              properties: {
                subject: { type: "string", description: "2-4 word subject line" },
                body: { type: "string", description: "Email body, under 100 words, max 4 sentences" },
              },
              required: ["subject", "body"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "write_email" } },
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
    console.error("email-generator error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
