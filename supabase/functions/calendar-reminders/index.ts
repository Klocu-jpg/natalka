import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Base64url helpers ──────────────────────────────────────────────

function base64urlToUint8Array(base64url: string): Uint8Array {
  let s = base64url.replace(/\s/g, "");
  s = s.replace(/-/g, "+").replace(/_/g, "/");
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

async function importVapidPrivateKey(privateKeyBase64url: string): Promise<CryptoKey> {
  const rawBytes = base64urlToUint8Array(privateKeyBase64url);
  return crypto.subtle.importKey(
    "pkcs8",
    rawBytes.buffer,
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

  const key = await importVapidPrivateKey(vapidPrivateKey);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const sigArray = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigArray.length === 64) {
    rawSig = sigArray;
  } else {
    const r = sigArray.slice(4, 4 + sigArray[3]);
    const sOffset = 4 + sigArray[3] + 2;
    const s = sigArray.slice(sOffset, sOffset + sigArray[sOffset - 1]);
    rawSig = new Uint8Array(64);
    rawSig.set(r.length <= 32 ? r : r.slice(r.length - 32), 32 - Math.min(r.length, 32));
    rawSig.set(s.length <= 32 ? s : s.slice(s.length - 32), 64 - Math.min(s.length, 32));
  }

  return `${unsignedToken}.${uint8ArrayToBase64url(rawSig)}`;
}

// ── RFC 8291 Web Push Encryption ──────────────────────────────────

async function encryptPayload(
  payloadText: string,
  subscriberP256dh: string,
  subscriberAuth: string
): Promise<Uint8Array> {
  const subscriberPubKeyBytes = base64urlToUint8Array(subscriberP256dh);
  const authSecret = base64urlToUint8Array(subscriberAuth);

  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const subscriberCryptoKey = await crypto.subtle.importKey(
    "raw",
    subscriberPubKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: subscriberCryptoKey },
      localKeyPair.privateKey,
      256
    )
  );

  const localPubKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  const encoder = new TextEncoder();
  const webpushInfo = concatUint8Arrays(
    encoder.encode("WebPush: info\0"),
    subscriberPubKeyBytes,
    localPubKeyRaw
  );

  const sharedSecretKey = await crypto.subtle.importKey("raw", sharedSecret, "HKDF", false, ["deriveBits"]);

  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: authSecret, info: webpushInfo },
      sharedSecretKey,
      256
    )
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const ikmKey = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);

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

  const payloadBytes = encoder.encode(payloadText);
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2;

  const encryptKey = await crypto.subtle.importKey("raw", cekBits, "AES-GCM", false, ["encrypt"]);

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new Uint8Array(nonceBits), tagLength: 128 },
      encryptKey,
      paddedPayload
    )
  );

  const rs = 4096;
  const header = new Uint8Array(86);
  header.set(salt, 0);
  header[16] = (rs >> 24) & 0xff;
  header[17] = (rs >> 16) & 0xff;
  header[18] = (rs >> 8) & 0xff;
  header[19] = rs & 0xff;
  header[20] = 65;
  header.set(localPubKeyRaw, 21);

  return concatUint8Arrays(header, encrypted);
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await createJWT(vapidPrivateKey, vapidPublicKey, audience);
  const encryptedBody = await encryptPayload(payload, subscription.p256dh, subscription.auth);

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
      TTL: "86400",
      Urgency: "high",
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

// ── Helper: send push to user ─────────────────────────────────────

async function sendPushToUser(
  adminClient: any,
  userId: string,
  title: string,
  body: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<number> {
  const { data: subscriptions } = await adminClient
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (!subscriptions || subscriptions.length === 0) return 0;

  const payload = JSON.stringify({
    title,
    body,
    url: "/",
    urgency: "high",
    requireInteraction: true,
  });

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
      console.error("Push error:", e);
    }
  }
  return sent;
}

// ── Main handler ───────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

    // mode: "morning" (default) — calendar + countdowns + chores
    //       "afternoon" — only uncompleted chores for today
    let mode: "morning" | "afternoon" = "morning";
    try {
      if (req.method === "POST") {
        const body = await req.json().catch(() => ({}));
        if (body && body.mode === "afternoon") mode = "afternoon";
      }
      const url = new URL(req.url);
      if (url.searchParams.get("mode") === "afternoon") mode = "afternoon";
    } catch {}

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Today's day of week (0=Monday .. 6=Sunday)
    const jsDay = now.getDay(); // 0=Sunday
    const todayDayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    // Collect all notifications per user
    const userNotifications = new Map<string, string[]>();

    // 1. Calendar events tomorrow (morning only)
    if (mode === "morning") {
    const { data: events } = await adminClient
      .from("calendar_events")
      .select("*")
      .eq("date", tomorrowStr);

    if (events) {
      for (const event of events) {
        const msgs = userNotifications.get(event.user_id) || [];
        msgs.push(`📅 Jutro: ${event.title}`);
        userNotifications.set(event.user_id, msgs);
      }
    }

    // 2. Event countdowns tomorrow
    const { data: countdowns } = await adminClient
      .from("event_countdowns")
      .select("*")
      .eq("date", tomorrowStr);

    if (countdowns) {
      for (const cd of countdowns) {
        const msgs = userNotifications.get(cd.user_id) || [];
        msgs.push(`${cd.emoji || "🎯"} Jutro: ${cd.title}`);
        userNotifications.set(cd.user_id, msgs);
      }
    }
    }

    // 3. Today's chores (uncompleted)
    const { data: chores } = await adminClient
      .from("chores")
      .select("*")
      .eq("day_of_week", todayDayOfWeek)
      .eq("completed", false);

    if (chores && chores.length > 0) {
      // Group chores by user
      const choresByUser = new Map<string, string[]>();
      for (const chore of chores) {
        const list = choresByUser.get(chore.user_id) || [];
        list.push(chore.title);
        choresByUser.set(chore.user_id, list);
      }

      for (const [userId, choreTitles] of choresByUser.entries()) {
        const msgs = userNotifications.get(userId) || [];
        const prefix = mode === "afternoon" ? "⏰ Pamiętaj o obowiązkach" : "🧹 Dziś do zrobienia";
        if (choreTitles.length === 1) {
          msgs.push(`${prefix}: ${choreTitles[0]}`);
        } else {
          msgs.push(`${prefix}:\n${choreTitles.map(t => `• ${t}`).join("\n")}`);
        }
        userNotifications.set(userId, msgs);
      }
    }

    let totalSent = 0;

    const pushTitle = mode === "afternoon" ? "Przypomnienie ⏰" : "Dzień dobry! ☀️";
    for (const [userId, messages] of userNotifications.entries()) {
      const body = messages.join("\n\n");
      const sent = await sendPushToUser(
        adminClient,
        userId,
        pushTitle,
        body,
        vapidPublicKey,
        vapidPrivateKey
      );
      totalSent += sent;
    }

    return new Response(JSON.stringify({ sent: totalSent }), {
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
