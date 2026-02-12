const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Read from environment, with fallback to check if it's a placeholder
  let vapidKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
  
  // Log for debugging
  console.log("[get-vapid-key] VAPID_PUBLIC_KEY length:", vapidKey.length, "starts with:", vapidKey.substring(0, 5));
  
  // If env var contains literal placeholder name, it wasn't set correctly
  if (!vapidKey || vapidKey === "VAPID_PUBLIC_KEY" || vapidKey.length < 20) {
    return new Response(JSON.stringify({ error: "VAPID key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ vapidPublicKey: vapidKey }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
