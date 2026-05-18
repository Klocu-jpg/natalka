import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COUPLE_PRICE_IDS = [
  "price_1T0RlgGiLeHcQYBNCY317b4O",
  "price_1T0Rm8GiLeHcQYBNEXMJdm2y",
  "price_1T0RmlGiLeHcQYBN4x5ioVWm",
];

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

async function checkStripeSubscription(stripe: any, email: string) {
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return null;

  const customerId = customers.data[0].id;

  // Check active subscriptions
  const activeSubs = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 10,
  });

  if (activeSubs.data.length > 0) {
    const sub = activeSubs.data[0];
    const priceId = sub.items.data[0]?.price?.id;
    return {
      hasActiveSub: true,
      isTrial: false,
      subscriptionEnd: new Date(sub.current_period_end * 1000).toISOString(),
      isCouplePlan: COUPLE_PRICE_IDS.includes(priceId),
      priceId,
    };
  }

  // Check trialing
  const trialSubs = await stripe.subscriptions.list({
    customer: customerId,
    status: "trialing",
    limit: 10,
  });

  if (trialSubs.data.length > 0) {
    const sub = trialSubs.data[0];
    const priceId = sub.items.data[0]?.price?.id;
    return {
      hasActiveSub: true,
      isTrial: true,
      subscriptionEnd: new Date(sub.trial_end! * 1000).toISOString(),
      isCouplePlan: COUPLE_PRICE_IDS.includes(priceId),
      priceId,
    };
  }

  return { hasActiveSub: false, isTrial: false, subscriptionEnd: null, isCouplePlan: false, priceId: null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const body = await req.json().catch(() => ({}));
    const testMode = body?.testMode === true;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header - returning unsubscribed");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      logStep("Auth failed - returning unsubscribed", { error: userError?.message });
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }
    const user = userData.user;
    logStep("User authenticated", { email: user.email });

    // Check if user is admin
    const { data: isAdmin } = await supabaseClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (isAdmin) {
      logStep("User is admin - bypassing subscription check");
      return new Response(JSON.stringify({
        subscribed: true, subscription_end: null, is_trial: false, is_admin: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // Resolve ALL other group members (group can hold up to 4 users)
    const { data: memberRows } = await supabaseClient.rpc("get_couple_member_ids", { p_user_id: user.id });
    const partnerIds: string[] = Array.isArray(memberRows)
      ? memberRows
          .map((r: any) => (typeof r === "string" ? r : r?.get_couple_member_ids))
          .filter((id: string | null) => id && id !== user.id)
      : [];
    logStep("Group members resolved", { partnerIds });

    // Any group member admin? -> grant access
    for (const pid of partnerIds) {
      const { data: pAdmin } = await supabaseClient.rpc("has_role", {
        _user_id: pid, _role: "admin",
      });
      if (pAdmin) {
        logStep("Group member is admin - bypassing subscription check", { pid });
        return new Response(JSON.stringify({
          subscribed: true, subscription_end: null, is_trial: false, is_admin_partner: true,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
      }
    }

    // Normal Stripe check
    const stripeKey = testMode
      ? Deno.env.get("STRIPE_TEST_SECRET_KEY")
      : Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error(testMode ? "STRIPE_TEST_SECRET_KEY is not set" : "STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // 1. Check user's own subscription
    const userSub = await checkStripeSubscription(stripe, user.email);
    
    if (userSub?.hasActiveSub) {
      logStep("User has active subscription", { isCouplePlan: userSub.isCouplePlan, isTrial: userSub.isTrial });
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_end: userSub.subscriptionEnd,
        is_trial: userSub.isTrial,
        is_couple_plan: userSub.isCouplePlan,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // 2. Check each other group member's subscription (only couple/group plans grant shared access)
    for (const pid of partnerIds) {
      const { data: partnerData } = await supabaseClient.auth.admin.getUserById(pid);
      const partnerEmail = partnerData?.user?.email;
      if (!partnerEmail) continue;

      logStep("Checking group member subscription", { partnerEmail });
      const partnerSub = await checkStripeSubscription(stripe, partnerEmail);

      if (partnerSub?.hasActiveSub && partnerSub.isCouplePlan) {
        logStep("Group member has couple/group plan - granting access", { partnerEmail });
        return new Response(JSON.stringify({
          subscribed: true,
          subscription_end: partnerSub.subscriptionEnd,
          is_trial: partnerSub.isTrial,
          is_couple_plan: true,
          via_partner: true,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
      }
    }

    logStep("No active subscription found");
    return new Response(JSON.stringify({ subscribed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
