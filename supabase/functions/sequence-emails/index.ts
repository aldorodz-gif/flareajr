// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 5-touch cadence with the strategic angle for each step.
const STEPS = [
  {
    key: "email_1_intro",
    day: 1,
    angle:
      "Email 1 — INTRO. Anchor on the specific signal/source detail by name. Show you've done the homework. State the operational problem they're about to feel and one-sentence outcome NCH delivers. One soft CTA.",
  },
  {
    key: "email_2_value",
    day: 3,
    angle:
      "Email 2 — VALUE / PROOF. Re-anchor on the same signal but lead with one peer/industry pattern (no fabricated names) showing a measurable outcome. Different opener than Email 1. Different CTA wording.",
  },
  {
    key: "email_3_angle",
    day: 7,
    angle:
      "Email 3 — NEW ANGLE. Pivot to a different lens on the same signal: ops / cost-per-night / per-diem leakage / executive relocation / risk. Pattern-interrupt subject line. Acknowledge the silence without guilt-tripping.",
  },
  {
    key: "email_4_social",
    day: 14,
    angle:
      "Email 4 — SOCIAL / INDUSTRY PATTERN. Reference a broader pattern across similar SMBs in their vertical and city/region. Frame as 'here is what we're seeing across the market'. Curiosity-led CTA, not a meeting ask.",
  },
  {
    key: "email_5_breakup",
    day: 21,
    angle:
      "Email 5 — CLOSE / BREAKUP. Short, low pressure, gracious. Acknowledge timing may be wrong. Leave the door open and ask for a redirect to the right person. Subject line signals it is the last note.",
  },
];

const TONE_GUIDES: Record<string, string> = {
  direct: "Sharp, confident, no throat-clearing. Strong verbs. Senior-rep voice.",
  warm: "Human, conversational, contractions, peer-to-peer. Never saccharine.",
  analytical: "Lead with a number / operational detail. Measured, informed.",
  consultative: "Curious and advisory. One sharp reframing question.",
  bold: "Pattern-interrupt opener. Contrarian observation. Earn the read in 6 words.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      company,
      vertical,
      signal_type,
      signal_detail,
      why_housing,
      buyer_title,
      source_url,
      city,
      tone,
    } = await req.json();

    if (!company || !buyer_title || !signal_detail) {
      return new Response(
        JSON.stringify({ error: "company, buyer_title, signal_detail are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY is not configured");

    const toneGuide = TONE_GUIDES[(tone as string) || "direct"];

    const groundingNote = source_url
      ? `Cross-check the company on the live web before drafting. Anchor at minimum Email 1 on the verifiable detail in the source URL: ${source_url}`
      : "Cross-check the company on the live web before drafting and anchor Email 1 on the freshest verifiable detail you can find.";

    const systemPrompt = `You are an elite BDR at National Corporate Housing writing a 5-touch email sequence to ${buyer_title} at ${company} (SMB/SME, vertical: ${vertical || "unknown"}, market: ${city || "unknown"}).

SIGNAL THAT TRIGGERED THIS SEQUENCE
Type: ${signal_type || "n/a"}
Detail: ${signal_detail}
Housing relevance: ${why_housing || "n/a"}

${groundingNote}

OPERATING RULES (apply to every email):
- 50–125 words, max 4 short sentences. Mobile-first.
- Sentence 1 proves homework on the SPECIFIC signal — never generic.
- Outcome-first product line. No feature dumps. No company history.
- One low-friction CTA. Vary the CTA wording across the 5 emails.
- Banned phrases: "I hope this finds you well", "just circling back", "synergy", "leverage", "best-in-class", "value proposition", "touch base", "quick question" as opener.
- Subject line 3-7 natural words, never clickbait, never ALL CAPS, never "FREE".
- Tone for this rep: ${toneGuide}
- Each email MUST be visibly different from the others — different opener, different angle, different CTA wording. Do NOT repeat phrases.

CADENCE STRATEGY:
${STEPS.map((s, i) => `${i + 1}. Day ${s.day} — ${s.angle}`).join("\n")}

Return EXACTLY 5 emails in order matching the cadence above.`;

    const userPrompt = `Search the live web for the most recent verifiable context on ${company}${city ? ` in ${city}` : ""} related to: "${signal_detail}". Then draft the 5-email sequence. Each email gets a unique subject and body. Anchor at least Email 1 on a real, current detail you find.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        temperature: 0.5,
        search_recency_filter: "month",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "email_sequence",
            schema: {
              type: "object",
              properties: {
                emails: {
                  type: "array",
                  minItems: 5,
                  maxItems: 5,
                  items: {
                    type: "object",
                    properties: {
                      step_key: {
                        type: "string",
                        enum: STEPS.map((s) => s.key),
                      },
                      day: { type: "integer" },
                      subject: { type: "string" },
                      body: { type: "string" },
                    },
                    required: ["step_key", "day", "subject", "body"],
                  },
                },
              },
              required: ["emails"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("Perplexity error", response.status, txt);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401 || response.status === 402) {
        return new Response(JSON.stringify({ error: "Perplexity credit/auth issue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Perplexity error ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content from Perplexity");
    const parsed = JSON.parse(content);

    // Normalize/sort by canonical day order in case the model reorders.
    const order = new Map(STEPS.map((s, i) => [s.key, i] as const));
    const emails = (parsed.emails as any[])
      .filter((e) => order.has(e.step_key))
      .sort((a, b) => (order.get(a.step_key)! - order.get(b.step_key)!));

    return new Response(
      JSON.stringify({ emails, citations: data.citations ?? [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("sequence-emails error", e);
    const msg = e instanceof Error ? e.message : "Something went wrong.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
