const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Read VAPID public key from environment
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ vapidPublicKey: VAPID_PUBLIC_KEY }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
