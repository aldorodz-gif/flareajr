// Shared helper: call Gemini with Google Search grounding and parse a JSON response.
// Gemini's `google_search` tool gives the model live web search at query time.
// Note: responseSchema cannot be combined with grounding tools, so we instruct the
// model to return JSON in the prompt and then extract/parse it defensively.
import { logApiUsage } from "./usageLog.ts";

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
  functionName?: string;
}): Promise<string> {
  const directKey = Deno.env.get("GEMINI_API_KEY");
  const gatewayKey = Deno.env.get("LOVABLE_API_KEY");
  const fn = opts.functionName;

  if (directKey) {
    try {
      const out = await callDirectGemini({ ...opts, key: directKey });
      logApiUsage({ service: "gemini", function_name: fn, success: true });
      return out;
    } catch (error) {
      const status = error instanceof GeminiError ? error.status : 500;
      logApiUsage({ service: "gemini", function_name: fn, success: false, error_code: String(status) });
      if (!(error instanceof GeminiError)) throw error;

      const shouldFallback =
        error.status === 400 ||
        error.status === 402 ||
        error.status === 429 ||
        error.status === 503 ||
        /GEMINI_API_KEY|Gemini API error: 400|Gemini auth\/credit issue|Rate limited by Gemini|Empty response from Gemini/i.test(error.message);

      if (!shouldFallback || !gatewayKey) {
        throw error;
      }

      console.warn("Direct Gemini call failed, falling back to Lovable AI gateway:", error.message);
    }
  }

  if (!gatewayKey) {
    throw new GeminiError("No AI backend configured for scan requests", 500);
  }

  try {
    const out = await callViaLovableGateway(opts, gatewayKey);
    logApiUsage({ service: "lovable_gateway", function_name: fn, success: true });
    return out;
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    logApiUsage({ service: "lovable_gateway", function_name: fn, success: false, error_code: String(status) });
    throw err;
  }
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
    if (res.status >= 500) throw new GeminiError(`Gemini API error: ${res.status}`, 503);
    throw new GeminiError(`Gemini API error: ${res.status}`, 500);
  }

  const data = await res.json();
  const finishReason = data?.candidates?.[0]?.finishReason;
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  if (!text) {
    console.error("Empty Gemini response. finishReason:", finishReason, "payload head:", JSON.stringify(data).slice(0, 800));
    if (finishReason === "MAX_TOKENS") {
      throw new GeminiError("Prompt too large for model output budget", 413);
    }
    // 503 so the outer handler falls back to the Lovable AI gateway
    throw new GeminiError(`Empty response from Gemini (finishReason: ${finishReason || "unknown"})`, 503);
  }
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

// Defensive JSON extraction — handles ```json fences, leading prose, trailing text,
// trailing commas, and truncated responses.
export function extractJson<T = unknown>(text: string): T {
  let t = text.trim();
  // Prefer fenced block if present
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();

  const firstObj = t.indexOf("{");
  const firstArr = t.indexOf("[");
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  if (start === -1) {
    console.error("extractJson: no JSON found. Raw response head:", text.slice(0, 500));
    throw new Error("No JSON found in response");
  }

  const open = t[start];
  const close = open === "{" ? "}" : "]";

  // Walk the string respecting strings/escapes to find the matching close.
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  let slice: string;
  if (end !== -1) {
    slice = t.slice(start, end + 1);
  } else {
    // Truncated — try to repair by closing open structures.
    slice = repairTruncatedJson(t.slice(start));
  }

  // Strip trailing commas before } or ]
  slice = slice.replace(/,(\s*[}\]])/g, "$1");

  try {
    return JSON.parse(slice) as T;
  } catch (e) {
    console.error("extractJson: JSON.parse failed. Slice head:", slice.slice(0, 500));
    console.error("Raw response head:", text.slice(0, 500));
    throw new Error("Malformed JSON in response");
  }
}

function repairTruncatedJson(s: string): string {
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }
  let out = s;
  if (inStr) out += '"';
  // Drop a trailing partial token like `"company_name": "Acm` already handled; remove trailing comma/colon
  out = out.replace(/[,:]\s*$/, "");
  while (stack.length) out += stack.pop();
  return out;
}
