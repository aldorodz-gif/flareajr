// Loads recent lead-feedback rows for a BDR and shapes them into prompt hints
// and a hard-exclusion list of downvoted companies.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface FeedbackContext {
  promptBlock: string;             // <600 chars, ready to append to system prompt
  excludeCompanies: string[];      // hard exclusion (permanent for this BDR)
}

export async function loadFeedbackContext(bdrId: string | null | undefined): Promise<FeedbackContext> {
  if (!bdrId) return { promptBlock: "", excludeCompanies: [] };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Last 50 ratings for prompt signals
  const { data: recent } = await supabase
    .from("lead_feedback")
    .select("rating, reason, company_name")
    .eq("bdr_id", bdrId)
    .order("created_at", { ascending: false })
    .limit(50);

  // ALL downvoted companies (hard, permanent exclusion)
  const { data: allDowns } = await supabase
    .from("lead_feedback")
    .select("company_name")
    .eq("bdr_id", bdrId)
    .eq("rating", "down");

  const excludeCompanies = Array.from(
    new Set((allDowns || []).map((r) => (r.company_name || "").trim()).filter(Boolean)),
  );

  if (!recent || recent.length === 0) {
    return { promptBlock: "", excludeCompanies };
  }

  // Top 3 down-reasons
  const reasonCounts = new Map<string, number>();
  const downCompanies = new Set<string>();
  const upCompanies = new Set<string>();
  for (const r of recent) {
    if (r.rating === "down") {
      downCompanies.add(r.company_name);
      if (r.reason) reasonCounts.set(r.reason, (reasonCounts.get(r.reason) || 0) + 1);
    } else if (r.rating === "up") {
      upCompanies.add(r.company_name);
    }
  }
  const topReasons = [...reasonCounts.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r]) => r);

  const upList = [...upCompanies].slice(0, 10);
  const downList = [...downCompanies].slice(0, 10);

  const parts: string[] = ["BDR FEEDBACK SIGNALS:"];
  if (upList.length) parts.push(`Prioritize signals like: ${upList.join(", ")}.`);
  if (topReasons.length) parts.push(`Avoid: ${topReasons.join("; ")}.`);
  if (downList.length) parts.push(`Never resurface: ${downList.join(", ")}.`);

  let block = parts.join(" ");
  if (block.length > 600) block = block.slice(0, 597) + "...";
  return { promptBlock: block, excludeCompanies };
}
