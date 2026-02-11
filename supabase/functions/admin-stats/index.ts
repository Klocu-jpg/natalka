import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error("Auth error");
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    // Verify admin role
    const { data: isAdmin } = await supabaseClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const body = await req.json().catch(() => ({}));
    const testMode = body?.testMode === true;

    const stripeKey = testMode
      ? Deno.env.get("STRIPE_TEST_SECRET_KEY")
      : Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe key not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get all customers
    const allCustomers: any[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;
    while (hasMore) {
      const params: any = { limit: 100 };
      if (startingAfter) params.starting_after = startingAfter;
      const batch = await stripe.customers.list(params);
      allCustomers.push(...batch.data);
      hasMore = batch.has_more;
      if (batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id;
    }

    // Get subscriptions (active + trialing + past_due + canceled)
    const subscriptions: any[] = [];
    for (const status of ["active", "trialing", "past_due", "canceled"]) {
      let subHasMore = true;
      let subStartingAfter: string | undefined;
      while (subHasMore) {
        const params: any = { limit: 100, status };
        if (subStartingAfter) params.starting_after = subStartingAfter;
        const batch = await stripe.subscriptions.list(params);
        subscriptions.push(...batch.data);
        subHasMore = batch.has_more;
        if (batch.data.length > 0) subStartingAfter = batch.data[batch.data.length - 1].id;
      }
    }

    // Get recent charges (last 30)
    const charges = await stripe.charges.list({ limit: 30 });

    // Build response
    const activeCount = subscriptions.filter(s => s.status === "active").length;
    const trialingCount = subscriptions.filter(s => s.status === "trialing").length;
    const canceledCount = subscriptions.filter(s => s.status === "canceled").length;
    const pastDueCount = subscriptions.filter(s => s.status === "past_due").length;

    // Calculate MRR from active subs
    let mrr = 0;
    subscriptions.filter(s => s.status === "active").forEach(sub => {
      const item = sub.items?.data?.[0];
      if (item?.price) {
        const amount = item.price.unit_amount || 0;
        const interval = item.price.recurring?.interval;
        const intervalCount = item.price.recurring?.interval_count || 1;
        // Normalize to monthly
        if (interval === "month") mrr += amount / intervalCount;
        else if (interval === "year") mrr += amount / (12 * intervalCount);
        else if (interval === "week") mrr += (amount * 4.33) / intervalCount;
        else if (interval === "day") mrr += (amount * 30) / intervalCount;
      }
    });

    const recentPayments = charges.data.map(c => ({
      id: c.id,
      amount: c.amount,
      currency: c.currency,
      status: c.status,
      created: c.created,
      customer_email: c.billing_details?.email || c.receipt_email || null,
      description: c.description,
      paid: c.paid,
      refunded: c.refunded,
    }));

    const subDetails = subscriptions.map(s => ({
      id: s.id,
      status: s.status,
      customer_email: null as string | null, // will be filled below
      customer_id: s.customer,
      current_period_end: s.current_period_end,
      trial_end: s.trial_end,
      cancel_at_period_end: s.cancel_at_period_end,
      created: s.created,
      plan_amount: s.items?.data?.[0]?.price?.unit_amount || 0,
      plan_interval: s.items?.data?.[0]?.price?.recurring?.interval || null,
      plan_interval_count: s.items?.data?.[0]?.price?.recurring?.interval_count || 1,
    }));

    // Fill customer emails
    const customerMap = new Map(allCustomers.map(c => [c.id, c.email]));
    subDetails.forEach(s => {
      s.customer_email = customerMap.get(s.customer_id) || null;
    });

    return new Response(JSON.stringify({
      customers_count: allCustomers.length,
      subscriptions: {
        active: activeCount,
        trialing: trialingCount,
        canceled: canceledCount,
        past_due: pastDueCount,
      },
      mrr: Math.round(mrr), // in cents
      recent_payments: recentPayments,
      subscription_details: subDetails,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
