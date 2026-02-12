import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Base64url helpers ──────────────────────────────────────────────

function base64urlToUint8Array(base64url: string): Uint8Array {
  // 1. Strip whitespace
  let s = base64url.replace(/\s/g, "");
  // 2. Convert base64url → standard base64 chars
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  // 3. Strip existing padding, then re-add correct padding
  s = s.replace(/=+$/, "");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const raw = atob(s + pad);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function uint8ArrayToBase64url(arr: Uint8Array): string {
  let binary = "";
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

// ── VAPID JWT ──────────────────────────────────────────────────────

async function importVapidKeyPair(privateKeyBase64url: string, publicKeyBase64url: string): Promise<CryptoKey> {
  console.log("[VAPID DEBUG] Private key length:", privateKeyBase64url.length, "chars:", privateKeyBase64url.substring(0, 10) + "...");
  console.log("[VAPID DEBUG] Public key length:", publicKeyBase64url.length, "chars:", publicKeyBase64url.substring(0, 10) + "...");
  const rawPrivate = base64urlToUint8Array(privateKeyBase64url);
  console.log("[VAPID DEBUG] rawPrivate length:", rawPrivate.length);
  const rawPublic = base64urlToUint8Array(publicKeyBase64url);
  console.log("[VAPID DEBUG] rawPublic length:", rawPublic.length);
  
  // Public key should be 65 bytes (uncompressed P-256: 0x04 || x || y)
  if (rawPublic.length !== 65 || rawPublic[0] !== 0x04) {
    throw new Error(`Invalid public key length: ${rawPublic.length}`);
  }
  
  const x = uint8ArrayToBase64url(rawPublic.slice(1, 33));
  const y = uint8ArrayToBase64url(rawPublic.slice(33, 65));
  const d = uint8ArrayToBase64url(rawPrivate);
  
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", d, x, y },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
}

async function createJWT(vapidPrivateKey: string, vapidPublicKey: string, audience: string): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: "mailto:push@love-app.app",
  };

  const encodedHeader = uint8ArrayToBase64url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = uint8ArrayToBase64url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const key = await importVapidKeyPair(vapidPrivateKey, vapidPublicKey);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format if needed
  const sigArray = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigArray.length === 64) {
    rawSig = sigArray;
  } else {
    // DER encoded - extract r and s
    const r = sigArray.slice(4, 4 + sigArray[3]);
    const sOffset = 4 + sigArray[3] + 2;
    const s = sigArray.slice(sOffset, sOffset + sigArray[sOffset - 1]);
    rawSig = new Uint8Array(64);
    rawSig.set(r.length <= 32 ? r : r.slice(r.length - 32), 32 - Math.min(r.length, 32));
    rawSig.set(s.length <= 32 ? s : s.slice(s.length - 32), 64 - Math.min(s.length, 32));
  }

  return `${unsignedToken}.${uint8ArrayToBase64url(rawSig)}`;
}

// ── RFC 8291 Web Push Encryption (aes128gcm) ──────────────────────

async function encryptPayload(
  payloadText: string,
  subscriberP256dh: string,
  subscriberAuth: string
): Promise<Uint8Array> {
  const subscriberPubKeyBytes = base64urlToUint8Array(subscriberP256dh);
  const authSecret = base64urlToUint8Array(subscriberAuth);

  // 1. Generate local ephemeral ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // 2. Import subscriber's public key
  const subscriberCryptoKey = await crypto.subtle.importKey(
    "raw",
    subscriberPubKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // 3. ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: subscriberCryptoKey },
      localKeyPair.privateKey,
      256
    )
  );

  // 4. Export local public key (65 bytes, uncompressed)
  const localPubKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  // 5. Derive IKM via HKDF (RFC 8291 Section 3.3)
  // info = "WebPush: info\0" || ua_public || as_public
  const encoder = new TextEncoder();
  const webpushInfo = concatUint8Arrays(
    encoder.encode("WebPush: info\0"),
    subscriberPubKeyBytes,
    localPubKeyRaw
  );

  const sharedSecretKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    "HKDF",
    false,
    ["deriveBits"]
  );

  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: authSecret, info: webpushInfo },
      sharedSecretKey,
      256
    )
  );

  // 6. Generate random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 7. Derive CEK and nonce from IKM + salt
  const ikmKey = await crypto.subtle.importKey(
    "raw",
    ikm,
    "HKDF",
    false,
    ["deriveBits"]
  );

  const cekBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: encoder.encode("Content-Encoding: aes128gcm\0") },
    ikmKey,
    128
  );

  const nonceBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: encoder.encode("Content-Encoding: nonce\0") },
    ikmKey,
    96
  );

  // 8. Pad and encrypt payload
  const payloadBytes = encoder.encode(payloadText);
  // Add padding delimiter (0x02 = final record) + no extra padding
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2; // delimiter for final record

  const encryptKey = await crypto.subtle.importKey(
    "raw",
    cekBits,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(nonceBits), tagLength: 128 },
      encryptKey,
      paddedPayload
    )
  );

  // 9. Build aes128gcm content coding header
  // salt (16) || rs (4, big-endian) || idlen (1) || keyid (65 = local public key)
  const rs = 4096;
  const header = new Uint8Array(86); // 16 + 4 + 1 + 65
  header.set(salt, 0);
  header[16] = (rs >> 24) & 0xff;
  header[17] = (rs >> 16) & 0xff;
  header[18] = (rs >> 8) & 0xff;
  header[19] = rs & 0xff;
  header[20] = 65;
  header.set(localPubKeyRaw, 21);

  return concatUint8Arrays(header, encrypted);
}

// ── Send Web Push ──────────────────────────────────────────────────

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const jwt = await createJWT(vapidPrivateKey, vapidPublicKey, audience);

  // Encrypt payload per RFC 8291
  const encryptedBody = await encryptPayload(payload, subscription.p256dh, subscription.auth);

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
      TTL: "86400",
      "Content-Length": String(encryptedBody.byteLength),
    },
    body: encryptedBody,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Push failed (${response.status}): ${text}`);
    if (response.status === 404 || response.status === 410) {
      return { gone: true, endpoint: subscription.endpoint };
    }
  }

  return { gone: false };
}

// ── Main handler ───────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { recipientId, title, body, emoji } = await req.json();

    if (!recipientId || !title || !body) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: subscriptions, error: subError } = await adminClient
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", recipientId);

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const payload = JSON.stringify({ title, body, emoji, url: "/" });

    let sent = 0;
    for (const sub of subscriptions) {
      try {
        const result = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          vapidPublicKey,
          vapidPrivateKey
        );
        if (result.gone) {
          await adminClient.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        } else {
          sent++;
        }
      } catch (e) {
        console.error("Push error for endpoint:", sub.endpoint, e);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
