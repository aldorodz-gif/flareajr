import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { company, signal, buyer_title, service_line, tone, vary } = await req.json();
    if (!company || !signal || !buyer_title || !service_line) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isArticle = signal.startsWith("Article:");
    const varyInstruction = vary ? " Use a different tone and angle than a typical first outreach — vary the approach while keeping the same rules." : "";

    const articleInstructions = isArticle ? `
ARTICLE ANALYSIS INSTRUCTIONS — THIS IS CRITICAL:
You have been given a scraped article about ${company}. You MUST:
1. Read the article content deeply. Identify the SPECIFIC event, announcement, initiative, hire, expansion, contract, partnership, or news it describes.
2. Your email MUST reference the specific detail from the article — not a vague summary. Name the project, the location, the contract value, the new hire, whatever the article is about.
3. Connect that specific detail to a housing/travel/lodging need that would logically follow. Be concrete: "a 200-person construction crew mobilizing to [City]" not "your growing team."
4. The subject line MUST reference the specific article topic — not generic words like "partnership" or "growth."

SUGGESTED TARGETS — You MUST also suggest 3-5 specific job titles at ${company} who would be the best people to reach based on what the article describes. Think about:
- Who is responsible for the project/initiative mentioned in the article?
- Who handles logistics, travel, or housing for the type of work described?
- Who would feel the pain of NOT having housing/travel solved?
For each title, give a one-sentence reason why they're a good target based on the article.` : "";

    const referenceEmail = `Here are real outreach emails from top-performing BDRs at NCH. Use the one closest to the signal's industry as a style and tone reference — match the warmth, specificity, and professional-but-human feel:

SPORTS REFERENCE:
"My name is Cedrick Teves, and I work with National Corporate Housing, a trusted partner of the NBA Foundation for Fellowship Housing. We also support NBA teams across the country with their housing needs. I came across the Chicago Bulls rotational program and wanted to reach out. I understand that housing may not be directly provided, but we'd love to be a resource for your fellows, as well as for any player or staff housing needs that may arise. We specialize in fully furnished, flexible accommodations for interns, fellows, players, and staff. Whether it's short-term stays or longer assignments, we offer turnkey housing with flexible lease terms, consolidated billing, and options tailored to your team's schedule and preferences. I truly appreciate your help in connecting me with the right individual for this."

THEATER / PERFORMING ARTS REFERENCE:
"I'm reaching out as many theater companies prepare for upcoming productions, rehearsals, and extended runs. I work with arts organizations to provide fully furnished housing for stays of 30+ nights, supporting: cast members during rehearsal and performance runs, directors and creative teams, production and technical crew, touring staff and visiting performers. We offer flexible, move-in ready accommodations in convenient locations — making it easy for your team to settle in and focus on the production, not logistics."

Key patterns to replicate: lead with a credibility anchor (partnership, existing relationship, or industry knowledge), reference the specific signal or program you found, acknowledge the buyer's reality before pitching, close with a warm connector ask. For theater specifically, emphasize the recurring seasonal nature — multiple productions means an ongoing relationship, not a one-time booking. Adapt these patterns to the specific signal and company — do NOT copy these emails verbatim.`;

    const verticalPlaybooks: Record<string, string> = {
      "Construction & Field Services": "Buyer thinks in crews, mobilization windows, and per diem leakage — not 'housing.' Speak ops language: headcount, site, schedule. Pain: crews self-booking hotels, blown budgets, no-shows on day one. Reference the specific project, location, or contract.",
      "Healthcare": "Buyer owns clinician fill rates and candidate experience. Housing is a recruiting/retention lever, not a perk. Pain: coordinator burnout, lost candidates over bad housing, inconsistent quality. Frame as protecting their fill rate.",
      "Tech": "Buyer is mobility, people ops, or program manager. Housing ties to employee experience, intern season, program velocity. Pain: policy gaps, exception volume, intern cohort scaling. Frame as protecting candidate experience.",
      "Government & Defense Contractors": "Buyer is a program manager or contracts lead. Housing is a contract-readiness and cleared-personnel staging issue. Pain: vendor consolidation, compliance, ramp timing on award. Frame around contract milestones.",
      "Relocation & Mobility": "Buyer is a mobility leader — housing is the most visible piece of the employee experience they own. Pain: exception volume, RMC frustration, exec escalations, employee NPS. Frame as policy consistency.",
      "Project Teams & Consultants": "Buyer is engagement/delivery leader. Housing = consultant productivity day one. Pain: inconsistent housing across cities, billable-time leakage, rotating teams. Frame as protecting utilization.",
      "Intern Programs": "Buyer is university recruiting or program lead. Intern housing is a brand and retention story. Pain: cohort scaling, decline rates tied to housing, coordinator overload. Frame as protecting offer-acceptance.",
    };
    const playbookKey = Object.keys(verticalPlaybooks).find(k => service_line && (service_line === k || service_line.toLowerCase().includes(k.toLowerCase().split(' ')[0])));
    const playbook = (playbookKey && verticalPlaybooks[playbookKey]) || "Anchor on the buyer's operational reality. Lead with their problem, not your product.";

    const salesMindset = `
SALES OPERATING MINDSET — internalize before writing a single word:

You are not sending outreach. You are reducing uncertainty for a real human with a real operational problem you just detected via a real signal. The signal is the entire reason this email is relevant — if you don't anchor on it specifically, you're just another cold email.

Buyer psychology:
- People buy emotionally, justify logically. Lead with their stress, risk, timeline — not features.
- Questions create connection. Pitching creates resistance.
- Social proof reduces risk. Reference peer/industry patterns when natural — never fabricate clients.
- Simplicity wins. One idea per sentence. If a 4-inch screen can't scan it in 2 seconds, cut it.
- Stories beat features. Reference the specific project, hire, contract, expansion — make them picture it.
- Trust = relevance + timing. The signal IS the timing. Use it.
- Relevance beats volume. Timing beats persistence. Clarity beats complexity.

Rules of engagement (top BDR patterns):
- Sentence 1 MUST prove homework — reference specific signal/article detail by name (project, city, headcount, contract, leader, date). No generic openers ever.
- Sentence 2 names the operational pain THEY are about to feel — not a pitch. Show you understand their world.
- Sentence 3: what NCH does, plain English, outcome-first, ONE sentence. No feature lists. No company history.
- Sentence 4: low-friction ask. Vary it: "worth a quick intro?" / "open to me sending a one-pager?" / "are you the right person, or should I find someone else?" Avoid "15 min to learn about us."
- Vary tone across emails. Sound like a sharp colleague texting, not a templated SDR.
- Banned phrases: "I hope this finds you well," "I wanted to reach out," "Just circling back," "synergy," "leverage," "best-in-class," "value proposition," "circle up," "touch base," "quick question" as opener.
- Banned moves: company history, feature dumps, three-paragraph emails, multiple CTAs, vague "growth/partnership" framing.

VERTICAL PLAYBOOK — ${service_line}:
${playbook}
`;

    const housingFramework = `
CORPORATE HOUSING PROSPECTING INTELLIGENCE FRAMEWORK — apply on top of everything above. The goal of this email is to START a relevant business conversation, NOT close the sale.

PRIORITIZE BUSINESS OUTCOMES over property/feature talk:
- cost control, relocation speed, workforce flexibility, project continuity, employee comfort, reduced operational friction, hotel cost reduction, simplified relocation, traveling staff support, temporary assignments, workforce deployment, project-based housing, executive relocation, staffing support, insurance housing, government contractor housing, travel nurse housing.
- NEVER lead with luxury, amenities, "best-in-class," or apartment marketing language.

FIRST EMAIL STRUCTURE (in order):
1. Personalized opener tied to the signal
2. Relevant operational problem they're about to feel
3. Brief solution positioning (one line, outcome-first)
4. Low-friction CTA

LENGTH & READABILITY:
- 50–125 words total. Skimmable in under 20 seconds.
- Short paragraphs (1–2 sentences max). No large blocks. No attachments. No multiple links.
- Mobile-first: CTA visible without scrolling.

CTA RULES — pick ONE, low-pressure, binary-friendly. Good examples:
- "Would it make sense to send over options?"
- "Open to seeing availability?"
- "Would a backup housing partner be helpful?"
- "Should I send pricing examples?"
- "Would it be worth a brief conversation?"
AVOID: "book a demo," aggressive scheduling, multiple CTAs, long calendar asks.

SUBJECT LINE: 3–7 natural words. Examples: "Temporary housing support," "Project housing options," "Relocation housing," "Traveling employee stays," "Extended stay alternative." Never use FREE, LIMITED TIME, DISCOUNT, GUARANTEED, or excessive caps/punctuation.

TONE: consultative, operational, confident, concise, helpful, non-pushy. Avoid hype, jargon, excessive adjectives, overly formal writing.
`;

    const TONE_GUIDES: Record<string, string> = {
      direct: "TONE: DIRECT. Sharp and confident. No throat-clearing. Every sentence cuts. Short words, strong verbs. Sound like a senior rep who respects the buyer's time.",
      warm: "TONE: WARM. Human, conversational, like writing to a colleague you respect. Use contractions. A touch of empathy or acknowledgment of their workload. Never saccharine — warm, not cheesy.",
      analytical: "TONE: ANALYTICAL. Lead with a specific number, metric, or operational detail from the signal. Sound measured and informed. Imply you've done math on their situation. No hype words.",
      consultative: "TONE: CONSULTATIVE. Curious and advisory. Ask one sharp question that reframes the problem. Sound like a peer with pattern recognition across similar accounts, not a vendor pitching.",
      bold: "TONE: BOLD. Pattern-interrupt. Open with a contrarian observation or sharp prediction. Confident but never arrogant. Earn the read in the first 6 words.",
    };
    const toneGuide = TONE_GUIDES[tone as string] || TONE_GUIDES.direct;

    const systemPrompt = `You are an elite BDR writing first-touch outreach for National Corporate Housing (temporary housing, travel management, hotel programs, destination services). Target: ${buyer_title} at ${company}. Signal: ${signal}. Service line: ${service_line}.

${salesMindset}

${housingFramework}

${toneGuide}

HARD CONSTRAINTS: 50–125 words. Max 4 short sentences/paragraphs. Mobile-first — CTA visible without scrolling on a 4-inch screen. Subject line: 3–7 natural words referencing the specific signal (never generic like "partnership" or "growth"). One clear low-friction CTA. Goal is to START a conversation, not close.${varyInstruction}
${articleInstructions}

${referenceEmail}`;

    // Build tool schema — include suggested_targets when article is provided
    const emailProperties: Record<string, unknown> = {
      subject: { type: "string", description: "Primary 3-7 word subject line referencing the specific signal" },
      subject_alternatives: {
        type: "array",
        description: "Exactly 3 ALTERNATIVE subject lines (different from primary), each 3-7 natural words, each tailored to the specific signal. No generic words like 'partnership' or 'growth'. No FREE/caps/punctuation gimmicks.",
        items: { type: "string" },
        minItems: 3,
        maxItems: 3,
      },
      body: { type: "string", description: "Email body, 50-125 words, max 4 short sentences. Must reference specific details from the signal." },
    };
    const required = ["subject", "subject_alternatives", "body"];

    if (isArticle) {
      emailProperties.suggested_targets = {
        type: "array",
        description: "3-5 recommended job titles to target at this company based on the article, with reasoning",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Specific job title (e.g. 'VP of Construction Operations')" },
            reason: { type: "string", description: "One sentence explaining why this person is a good target based on the article" },
          },
          required: ["title", "reason"],
          additionalProperties: false,
        },
      };
      emailProperties.article_insight = {
        type: "string",
        description: "One sentence summarizing the key detail from the article that creates a housing/travel need",
      };
      required.push("suggested_targets", "article_insight");
    }

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
            description: "Generate a sales outreach email with optional target suggestions",
            parameters: {
              type: "object",
              properties: emailProperties,
              required,
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
