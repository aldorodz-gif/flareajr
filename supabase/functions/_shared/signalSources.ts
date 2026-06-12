// Shared helper: load active signal-source domains so scanner functions can
// target high-value industry publications via Tavily's include_domains param.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

let cache: { at: number; domains: string[] } | null = null;
const TTL_MS = 5 * 60 * 1000;

export async function loadActiveSignalDomains(): Promise<string[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.domains;
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase
      .from("signal_sources")
      .select("domain")
      .eq("active", true);
    if (error) {
      console.warn("loadActiveSignalDomains error", error.message);
      return cache?.domains || [];
    }
    const domains = (data || []).map((r: { domain: string }) => r.domain).filter(Boolean);
    cache = { at: Date.now(), domains };
    return domains;
  } catch (e) {
    console.warn("loadActiveSignalDomains threw", e instanceof Error ? e.message : e);
    return cache?.domains || [];
  }
}
