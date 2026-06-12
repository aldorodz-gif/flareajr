import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendAlert } from "../_shared/alerts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const result = await sendAlert({
      alertKey: "test_alert",
      subject: "FLARE: Test alert",
      body: "This is a manual test alert triggered from Settings > System Health. If you can read this, email delivery works.",
      functionName: "send-test-alert",
      force: true,
    });
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: result.sent ? 200 : 500,
    });
  } catch (e) {
    return new Response(JSON.stringify({ sent: false, error: e instanceof Error ? e.message : String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
