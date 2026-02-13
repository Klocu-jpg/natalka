import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LIVE_PRICES = [
  "price_1Sywb9GiLeHcQYBNBSg0kYRP",
  "price_1SywquGiLeHcQYBNjFjfgsmG",
  "price_1SywgIGiLeHcQYBN5Ad1ffwQ",
  // Couple plans
  "price_1T0RlgGiLeHcQYBNCY317b4O",
  "price_1T0Rm8GiLeHcQYBNEXMJdm2y",
  "price_1T0RmlGiLeHcQYBN4x5ioVWm",
];

const TEST_PRICES = [
  "price_1SywqWGiLeHcQYBNZXo0GC0K",
  "price_1SywuTGiLeHcQYBNjDz7dmbc",
  "price_1SywuHGiLeHcQYBNZFskrLPn",
  // Couple plans (using live for now)
  "price_1T0RlgGiLeHcQYBNCY317b4O",
  "price_1T0Rm8GiLeHcQYBNEXMJdm2y",
  "price_1T0RmlGiLeHcQYBN4x5ioVWm",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const body = await req.json().catch(() => ({}));
    const priceId = body.priceId;
    const testMode = body.testMode === true;

    const validPrices = testMode ? TEST_PRICES : LIVE_PRICES;
    const resolvedPriceId = priceId || validPrices[0];

    if (!validPrices.includes(resolvedPriceId)) {
      throw new Error("Invalid price ID");
    }

    const stripeKey = testMode
      ? Deno.env.get("STRIPE_TEST_SECRET_KEY")
      : Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error(testMode ? "STRIPE_TEST_SECRET_KEY is not set" : "STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: { trial_period_days: 14 },
      success_url: `${req.headers.get("origin")}/?subscription=success`,
      cancel_url: `${req.headers.get("origin")}/?subscription=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
