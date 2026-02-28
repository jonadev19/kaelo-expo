import { supabase } from "@/lib/supabase";
import type {
    PaymentIntentResponse,
    PurchaseCheckResult,
    RoutePurchase,
} from "./types";

/**
 * Create a Stripe PaymentIntent for a route purchase via Edge Function.
 */
export const createRoutePaymentIntent = async (
    routeId: string,
    buyerId: string,
): Promise<PaymentIntentResponse> => {
    console.log("🔵 [API] Invocando Edge Function create-payment-intent...");
    const { data, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
            body: {
                type: "route_purchase",
                route_id: routeId,
                buyer_id: buyerId,
            },
        },
    );

    console.log("🔵 [API] Respuesta data:", JSON.stringify(data));
    console.log("🔵 [API] Respuesta error:", JSON.stringify(error));

    if (error) throw new Error(error.message);
    if (!data?.clientSecret) throw new Error("No se recibió el payment intent");

    return data as PaymentIntentResponse;
};

/**
 * Create a Stripe PaymentIntent for an order payment via Edge Function.
 */
export const createOrderPaymentIntent = async (
    orderId: string,
    customerId: string,
    amount: number,
): Promise<PaymentIntentResponse> => {
    const { data, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
            body: {
                type: "order_payment",
                order_id: orderId,
                customer_id: customerId,
                amount,
            },
        },
    );

    if (error) throw new Error(error.message);
    if (!data?.clientSecret) throw new Error("No se recibió el payment intent");

    return data as PaymentIntentResponse;
};

/**
 * Check if a user has already purchased a specific route.
 */
export const checkRoutePurchased = async (
    routeId: string,
    buyerId: string,
): Promise<PurchaseCheckResult> => {
    const { data, error } = await supabase
        .from("route_purchases")
        .select("*")
        .eq("route_id", routeId)
        .eq("buyer_id", buyerId)
        .in("payment_status", ["completado", "pendiente"])
        .maybeSingle();

    if (error) throw new Error(error.message);

    if (data) {
        return {
            purchased: true,
            purchase: data as unknown as RoutePurchase,
        };
    }

    return { purchased: false };
};

/**
 * Fetch all route purchases for a user.
 */
export const fetchMyPurchases = async (
    buyerId: string,
): Promise<RoutePurchase[]> => {
    const { data, error } = await supabase
        .from("route_purchases")
        .select("*")
        .eq("buyer_id", buyerId)
        .eq("payment_status", "completado")
        .order("purchased_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as RoutePurchase[];
};

/**
 * Record a completed route purchase after Stripe payment succeeds.
 * This is a fallback — the webhook also creates the record server-side.
 */
export const confirmRoutePurchase = async (
    routeId: string,
    buyerId: string,
    stripePaymentId: string,
    amountPaid: number,
): Promise<string> => {
    const creatorEarnings = Math.round(amountPaid * 0.85 * 100) / 100;
    const platformFee = Math.round(amountPaid * 0.15 * 100) / 100;

    const { data, error } = await supabase
        .from("route_purchases")
        .upsert(
            {
                route_id: routeId,
                buyer_id: buyerId,
                amount_paid: amountPaid,
                creator_earnings: creatorEarnings,
                platform_fee: platformFee,
                payment_status: "completado",
                stripe_payment_id: stripePaymentId,
            },
            {
                onConflict: "route_id,buyer_id",
            },
        )
        .select("id")
        .single();

    if (error) throw new Error(error.message);
    return (data as any).id as string;
};
