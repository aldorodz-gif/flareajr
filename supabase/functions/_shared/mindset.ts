// Shared helper: load global + per-BDR mindset blocks for prompt injection.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function loadMindsetBlocks(bdrId?: string | null, maxChars: number = 1500): Promise<string> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: globalRows } = await supabase
      .from("bdr_mindsets")
      .select("label, content")
      .is("bdr_id", null)
      .order("created_at", { ascending: true });

    let bdrRows: Array<{ label: string; content: string }> = [];
    if (bdrId) {
      const { data } = await supabase
        .from("bdr_mindsets")
        .select("label, content")
        .eq("bdr_id", bdrId)
        .order("created_at", { ascending: true });
      bdrRows = data || [];
    }

    const sections: string[] = [];
    for (const r of globalRows || []) {
      sections.push(`=== GLOBAL MINDSET — ${r.label} ===\n${r.content}`);
    }
    for (const r of bdrRows) {
      sections.push(`=== BDR-SPECIFIC MINDSET — ${r.label} ===\n${r.content}`);
    }

    if (!sections.length) return "";
    let combined = sections.join("\n\n");
    if (combined.length > maxChars) {
      const slice = combined.substring(0, maxChars);
      const breakAt = slice.lastIndexOf("\n\n");
      const cut = breakAt > 200 ? breakAt : slice.lastIndexOf("\n");
      combined = (cut > 200 ? slice.substring(0, cut) : slice) + "\n[mindset truncated for length]";
    }
    return [
      "",
      "============================================================",
      "OPERATOR MINDSET (load-bearing rules — follow these strictly):",
      "============================================================",
      combined,
      "============================================================",
      "",
    ].join("\n");
  } catch (e) {
    console.error("loadMindsetBlocks error:", e);
    return "";
  }
}

// Lookup a BDR id by city/state when caller doesn't pass bdr_id.
// Picks the first BDR whose markets array mentions the city or state.
export async function findBdrIdForMarket(city: string, state: string): Promise<string | null> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data } = await supabase.from("bdr_profiles").select("id, markets");
    const needle = (city || "").toLowerCase();
    const stateNeedle = (state || "").toLowerCase();
    for (const row of data || []) {
      const ms: string[] = (row.markets || []) as string[];
      for (const m of ms) {
        const lm = (m || "").toLowerCase();
        if (needle && lm.includes(needle)) return row.id;
        if (stateNeedle && lm.includes(`, ${stateNeedle}`)) return row.id;
        if (stateNeedle && lm === stateNeedle) return row.id;
      }
    }
    return null;
  } catch {
    return null;
  }
}
