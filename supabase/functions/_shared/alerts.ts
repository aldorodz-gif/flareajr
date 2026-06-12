// Shared alerting helper. Emails system failures via Resend with throttling
// (max one email per alert_key per 6 hours) and an admin on/off toggle.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const THROTTLE_HOURS = 6;
const DEFAULT_RECIPIENT = "aldorodz@gmail.com";

let _client: ReturnType<typeof createClient> | null = null;
function client() {
  if (_client) return _client;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

async function getSetting(key: string): Promise<unknown> {
  const c = client(); if (!c) return null;
  const { data } = await c.from("system_settings").select("value").eq("key", key).maybeSingle();
  return (data as { value?: unknown } | null)?.value ?? null;
}

export async function sendAlert(opts: {
  alertKey: string;
  subject: string;
  body: string;
  functionName?: string;
  force?: boolean; // bypass throttle (used by test button)
}): Promise<{ sent: boolean; reason?: string }> {
  try {
    const c = client();
    if (!c) return { sent: false, reason: "no_supabase_client" };

    // Toggle check
    if (!opts.force) {
      const enabled = await getSetting("alerts_enabled");
      if (enabled === false) return { sent: false, reason: "alerts_disabled" };
    }

    // Throttle: skip if same alert_key within last 6 hours
    if (!opts.force) {
      const since = new Date(Date.now() - THROTTLE_HOURS * 3600 * 1000).toISOString();
      const { data: recent } = await c
        .from("alert_log")
        .select("id")
        .eq("alert_key", opts.alertKey)
        .gte("sent_at", since)
        .limit(1);
      if (recent && recent.length > 0) return { sent: false, reason: "throttled" };
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) return { sent: false, reason: "no_resend_key" };

    const recipientSetting = await getSetting("alerts_recipient");
    const recipient = (typeof recipientSetting === "string" && recipientSetting.includes("@"))
      ? recipientSetting
      : DEFAULT_RECIPIENT;

    const when = new Date().toISOString();
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;color:#0F172A;max-width:560px;">
        <h2 style="margin:0 0 12px;color:#DC2626;">${escapeHtml(opts.subject)}</h2>
        <p style="margin:0 0 16px;color:#475569;">A FLARE system event triggered this alert.</p>
        <table style="font-size:13px;border-collapse:collapse;width:100%;">
          <tr><td style="padding:6px 0;color:#64748B;width:120px;">Function</td><td>${escapeHtml(opts.functionName || "—")}</td></tr>
          <tr><td style="padding:6px 0;color:#64748B;">Alert key</td><td><code>${escapeHtml(opts.alertKey)}</code></td></tr>
          <tr><td style="padding:6px 0;color:#64748B;">When</td><td>${when}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:16px 0;" />
        <pre style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:12px;font-size:12px;white-space:pre-wrap;">${escapeHtml(opts.body)}</pre>
        <p style="margin:16px 0 0;font-size:12px;color:#64748B;">
          Check <b>Settings &rsaquo; System Health</b> for usage charts, recent errors, and overnight scan runs.
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FLARE Alerts <onboarding@resend.dev>",
        to: [recipient],
        subject: opts.subject,
        html,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.warn("Resend alert failed:", res.status, txt.slice(0, 300));
      return { sent: false, reason: `resend_${res.status}` };
    }

    await c.from("alert_log").insert({
      alert_key: opts.alertKey,
      subject: opts.subject,
      body: opts.body,
      recipient,
    });

    return { sent: true };
  } catch (e) {
    console.warn("sendAlert error:", e instanceof Error ? e.message : e);
    return { sent: false, reason: "exception" };
  }
}

// Count recent gemini 429s to decide if we should alert. Returns true if > threshold.
export async function geminiRecent429Count(): Promise<number> {
  const c = client(); if (!c) return 0;
  const since = new Date(Date.now() - 3600 * 1000).toISOString();
  const { count } = await c
    .from("api_usage")
    .select("id", { count: "exact", head: true })
    .eq("service", "gemini")
    .eq("success", false)
    .eq("error_code", "429")
    .gte("created_at", since);
  return count || 0;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
