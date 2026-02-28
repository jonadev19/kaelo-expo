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

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
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

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (stripeWebhookSecret && sig) {
      // Verify webhook signature in production
      event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret);
    } else {
      // Development: parse directly
      event = JSON.parse(body);
    }

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(supabase, event.data.object as any);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(supabase, event.data.object as any);
        break;

      case "charge.refunded":
        await handleRefund(supabase, event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handlePaymentSucceeded(supabase: any, paymentIntent: any) {
  const { type, route_id, buyer_id, creator_id, order_id } =
    paymentIntent.metadata;

  if (type === "route_purchase") {
    // 1. Update purchase status
    await supabase
      .from("route_purchases")
      .update({ payment_status: "completado" })
      .eq("stripe_payment_id", paymentIntent.id);

    // 2. Update creator wallet balance and stats
    const amountMXN = paymentIntent.amount / 100;
    const creatorEarnings = Math.round(amountMXN * 0.85 * 100) / 100;

    const { data: creator } = await supabase
      .from("profiles")
      .select("wallet_balance, total_earnings, total_routes_sold")
      .eq("id", creator_id)
      .single();

    if (creator) {
      await supabase
        .from("profiles")
        .update({
          wallet_balance:
            (Number(creator.wallet_balance) || 0) + creatorEarnings,
          total_earnings:
            (Number(creator.total_earnings) || 0) + creatorEarnings,
          total_routes_sold: (Number(creator.total_routes_sold) || 0) + 1,
        })
        .eq("id", creator_id);
    }

    // 3. Increment route purchase_count
    await supabase
      .rpc("increment_route_purchases", {
        p_route_id: route_id,
      })
      .catch(() => {
        // Fallback: direct update if RPC doesn't exist
        return supabase
          .from("routes")
          .update({
            purchase_count: supabase.raw("purchase_count + 1"),
          })
          .eq("id", route_id);
      });

    // 4. Create notification for buyer
    await supabase.from("notifications").insert({
      user_id: buyer_id,
      notification_type: "route_purchased",
      title: "¡Ruta desbloqueada!",
      body: "Tu compra se ha completado exitosamente. Ya puedes acceder al contenido completo.",
      related_route_id: route_id,
      data: { payment_intent_id: paymentIntent.id },
    });

    // 5. Create notification for creator
    await supabase.from("notifications").insert({
      user_id: creator_id,
      notification_type: "route_sold",
      title: "¡Vendiste una ruta!",
      body: `Has ganado $${creatorEarnings.toFixed(2)} MXN por la venta de tu ruta.`,
      related_route_id: route_id,
      data: {
        earnings: creatorEarnings,
        payment_intent_id: paymentIntent.id,
      },
    });

    console.log(
      `Route purchase completed: ${route_id} by ${buyer_id}, creator ${creator_id} earned $${creatorEarnings}`,
    );
  } else if (type === "order_payment") {
    // Update order payment status
    await supabase
      .from("orders")
      .update({ payment_status: "pagado" })
      .eq("id", order_id);

    // Notify customer
    await supabase.from("notifications").insert({
      user_id: paymentIntent.metadata.customer_id,
      notification_type: "order_paid",
      title: "Pago confirmado",
      body: "Tu pago ha sido procesado exitosamente.",
      related_order_id: order_id,
      data: { payment_intent_id: paymentIntent.id },
    });

    console.log(`Order payment completed: ${order_id}`);
  }
}

async function handlePaymentFailed(supabase: any, paymentIntent: any) {
  const { type, route_id, order_id, buyer_id, customer_id } =
    paymentIntent.metadata;

  if (type === "route_purchase") {
    await supabase
      .from("route_purchases")
      .update({ payment_status: "fallido" })
      .eq("stripe_payment_id", paymentIntent.id);

    await supabase.from("notifications").insert({
      user_id: buyer_id,
      notification_type: "payment_failed",
      title: "Pago fallido",
      body: "No se pudo procesar tu pago. Intenta de nuevo.",
      related_route_id: route_id,
    });
  } else if (type === "order_payment") {
    await supabase
      .from("orders")
      .update({ payment_status: "fallido" })
      .eq("id", order_id);

    await supabase.from("notifications").insert({
      user_id: customer_id,
      notification_type: "payment_failed",
      title: "Pago fallido",
      body: "No se pudo procesar tu pago. Intenta de nuevo.",
      related_order_id: order_id,
    });
  }
}

async function handleRefund(supabase: any, charge: any) {
  const paymentIntentId = charge.payment_intent;
  if (!paymentIntentId) return;

  // Find the purchase by stripe payment ID
  const { data: purchase } = await supabase
    .from("route_purchases")
    .select("id, route_id, buyer_id, creator_earnings")
    .eq("stripe_payment_id", paymentIntentId)
    .single();

  if (purchase) {
    // Update purchase status
    await supabase
      .from("route_purchases")
      .update({
        payment_status: "reembolsado",
        refunded_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    // Reverse creator earnings
    const { data: route } = await supabase
      .from("routes")
      .select("creator_id")
      .eq("id", purchase.route_id)
      .single();

    if (route) {
      const { data: creator } = await supabase
        .from("profiles")
        .select("wallet_balance, total_earnings, total_routes_sold")
        .eq("id", route.creator_id)
        .single();

      if (creator) {
        await supabase
          .from("profiles")
          .update({
            wallet_balance: Math.max(
              0,
              (Number(creator.wallet_balance) || 0) -
                Number(purchase.creator_earnings),
            ),
            total_earnings: Math.max(
              0,
              (Number(creator.total_earnings) || 0) -
                Number(purchase.creator_earnings),
            ),
            total_routes_sold: Math.max(
              0,
              (Number(creator.total_routes_sold) || 0) - 1,
            ),
          })
          .eq("id", route.creator_id);
      }
    }

    // Notify buyer
    await supabase.from("notifications").insert({
      user_id: purchase.buyer_id,
      notification_type: "refund_completed",
      title: "Reembolso procesado",
      body: "Tu reembolso ha sido procesado exitosamente.",
      related_route_id: purchase.route_id,
    });
  }
}
