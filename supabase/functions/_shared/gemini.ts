// Shared helper: call Gemini with Google Search grounding and parse a JSON response.
// Gemini's `google_search` tool gives the model live web search at query time.
// Note: responseSchema cannot be combined with grounding tools, so we instruct the
// model to return JSON in the prompt and then extract/parse it defensively.

const DIRECT_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "google/gemini-3-flash-preview";

export class GeminiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function callGeminiGrounded(opts: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}): Promise<string> {
  const directKey = Deno.env.get("GEMINI_API_KEY");
  const gatewayKey = Deno.env.get("LOVABLE_API_KEY");

  if (directKey) {
    try {
      return await callDirectGemini({ ...opts, key: directKey });
    } catch (error) {
      if (!(error instanceof GeminiError)) throw error;

      const shouldFallback =
        error.status === 400 ||
        error.status === 402 ||
        /GEMINI_API_KEY|Gemini API error: 400|Gemini auth\/credit issue/i.test(error.message);

      if (!shouldFallback || !gatewayKey) {
        throw error;
      }

      console.warn("Direct Gemini call failed, falling back to Lovable AI gateway:", error.message);
    }
  }

  if (!gatewayKey) {
    throw new GeminiError("No AI backend configured for scan requests", 500);
  }

  return await callViaLovableGateway(opts, gatewayKey);
}

async function callDirectGemini(
  opts: { systemPrompt: string; userPrompt: string; temperature?: number; key: string },
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${DIRECT_MODEL}:generateContent?key=${opts.key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: opts.userPrompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: opts.temperature ?? 0.4,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Gemini error", res.status, body.slice(0, 500));
    if (res.status === 429) throw new GeminiError("Rate limited by Gemini. Try again shortly.", 429);
    if (res.status === 401 || res.status === 403) throw new GeminiError("Gemini auth/credit issue. Check GEMINI_API_KEY.", 402);
    if (res.status === 400) throw new GeminiError("Gemini API error: 400", 400);
    throw new GeminiError(`Gemini API error: ${res.status}`, 500);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  if (!text) throw new GeminiError("Empty response from Gemini", 500);
  return text;
}

async function callViaLovableGateway(
  opts: { systemPrompt: string; userPrompt: string; temperature?: number },
  gatewayKey: string,
): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: FALLBACK_MODEL,
      temperature: opts.temperature ?? 0.4,
      messages: [
        { role: "system", content: `${opts.systemPrompt}\n\nReturn only the requested JSON payload.` },
        { role: "user", content: opts.userPrompt },
      ],
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Lovable AI fallback error", response.status, body.slice(0, 500));
    if (response.status === 429) throw new GeminiError("AI rate limited. Try again shortly.", 429);
    if (response.status === 402) throw new GeminiError("AI credits exhausted.", 402);
    throw new GeminiError(`AI gateway error: ${response.status}`, 500);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) throw new GeminiError("Empty response from AI gateway", 500);
  return text;
}

// Defensive JSON extraction — handles ```json fences, leading prose, trailing text.
export function extractJson<T = unknown>(text: string): T {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  // Find first { or [ and matching last } or ]
  const firstObj = t.indexOf("{");
  const firstArr = t.indexOf("[");
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  if (start === -1) throw new Error("No JSON found in response");
  const open = t[start];
  const close = open === "{" ? "}" : "]";
  const end = t.lastIndexOf(close);
  if (end <= start) throw new Error("Malformed JSON in response");
  const slice = t.slice(start, end + 1);
  return JSON.parse(slice) as T;
}
