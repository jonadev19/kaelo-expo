import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing server configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const { type } = body;

    if (type === "route_purchase") {
      return await handleRoutePurchase(stripe, supabase, body, corsHeaders);
    } else if (type === "order_payment") {
      return await handleOrderPayment(stripe, supabase, body, corsHeaders);
    }

    return new Response(JSON.stringify({ error: "Invalid payment type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Payment intent error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function handleRoutePurchase(
  stripe: any,
  supabase: any,
  body: { route_id: string; buyer_id: string },
  headers: Record<string, string>,
) {
  const { route_id, buyer_id } = body;

  if (!route_id || !buyer_id) {
    return new Response(
      JSON.stringify({ error: "route_id and buyer_id are required" }),
      {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      },
    );
  }

  // 1. Check if already purchased
  const { data: existing } = await supabase
    .from("route_purchases")
    .select("id")
    .eq("route_id", route_id)
    .eq("buyer_id", buyer_id)
    .in("payment_status", ["completado", "pendiente"])
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ error: "Route already purchased" }), {
      status: 409,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // 2. Get route price
  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select("id, name, price, is_free, creator_id")
    .eq("id", route_id)
    .single();

  if (routeError || !route) {
    return new Response(JSON.stringify({ error: "Route not found" }), {
      status: 404,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  if (route.is_free) {
    return new Response(
      JSON.stringify({ error: "This route is free, no payment needed" }),
      {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      },
    );
  }

  // 3. Get buyer email for Stripe
  const { data: buyer } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", buyer_id)
    .single();

  // 4. Convert MXN to centavos for Stripe
  const amountCentavos = Math.round(route.price * 100);

  // 5. Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCentavos,
    currency: "mxn",
    metadata: {
      type: "route_purchase",
      route_id,
      buyer_id,
      creator_id: route.creator_id,
      route_name: route.name,
    },
    receipt_email: buyer?.email ?? undefined,
  });

  // 6. Create pending purchase record
  const creatorEarnings = Math.round(route.price * 0.85 * 100) / 100;
  const platformFee = Math.round(route.price * 0.15 * 100) / 100;

  await supabase.from("route_purchases").insert({
    route_id,
    buyer_id,
    amount_paid: route.price,
    creator_earnings: creatorEarnings,
    platform_fee: platformFee,
    payment_status: "pendiente",
    stripe_payment_id: paymentIntent.id,
  });

  return new Response(
    JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: route.price,
      currency: "mxn",
    }),
    {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    },
  );
}

async function handleOrderPayment(
  stripe: any,
  supabase: any,
  body: { order_id: string; customer_id: string; amount: number },
  headers: Record<string, string>,
) {
  const { order_id, customer_id, amount } = body;

  if (!order_id || !customer_id || !amount) {
    return new Response(
      JSON.stringify({
        error: "order_id, customer_id, and amount are required",
      }),
      {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      },
    );
  }

  // Get customer email
  const { data: customer } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", customer_id)
    .single();

  // Convert to centavos
  const amountCentavos = Math.round(amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCentavos,
    currency: "mxn",
    metadata: {
      type: "order_payment",
      order_id,
      customer_id,
    },
    receipt_email: customer?.email ?? undefined,
  });

  // Update order with stripe payment ID
  await supabase
    .from("orders")
    .update({
      stripe_payment_id: paymentIntent.id,
      payment_status: "pendiente",
      payment_method: "tarjeta",
    })
    .eq("id", order_id);

  return new Response(
    JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: "mxn",
    }),
    {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    },
  );
}
