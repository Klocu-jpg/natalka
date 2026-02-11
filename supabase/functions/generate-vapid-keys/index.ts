const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Generate ECDSA P-256 key pair (VAPID standard)
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    // Export public key as raw (uncompressed point, 65 bytes)
    const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    const publicKeyBase64Url = arrayBufferToBase64Url(publicKeyRaw);

    // Export private key as JWK, then extract 'd' parameter
    const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    const privateKeyBase64Url = privateKeyJwk.d!;

    // Store keys using Supabase Management API via service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");

    // Return the keys so they can be manually set
    return new Response(
      JSON.stringify({
        publicKey: publicKeyBase64Url,
        privateKey: privateKeyBase64Url,
        message: "Keys generated! Set these as VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY secrets.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
