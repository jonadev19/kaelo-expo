import { useAuthStore } from "@/shared/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { createOrderPaymentIntent } from "@/features/payments/api";
import type { PaymentMethod } from "@/features/payments/types";

interface OrderPaymentParams {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
}

/**
 * Hook to process payment for an order after it has been created.
 *
 * - "efectivo": no-op, payment happens at pickup
 * - "tarjeta": Stripe PaymentSheet flow
 * - "wallet": future feature (currently disabled)
 */
export const useOrderPayment = () => {
    const user = useAuthStore((state) => state.user);

    const mutation = useMutation({
        mutationFn: async ({ orderId, amount, paymentMethod }: OrderPaymentParams) => {
            if (!user) throw new Error("Debes iniciar sesión");

            // Cash — nothing to process
            if (paymentMethod === "efectivo") {
                return { success: true, method: "efectivo" as const };
            }

            // Wallet — future feature
            if (paymentMethod === "wallet") {
                throw new Error("Wallet no disponible aún");
            }

            // Card — Stripe PaymentSheet flow
            console.log("💳 [ORDER PAYMENT] Iniciando pago con tarjeta:", { orderId, amount });

            // 1. Create PaymentIntent via Edge Function
            const paymentIntent = await createOrderPaymentIntent(orderId, user.id, amount);
            console.log("💳 [ORDER PAYMENT] PaymentIntent creado:", paymentIntent.paymentIntentId);

            // 2. Present Stripe PaymentSheet
            const { initPaymentSheet, presentPaymentSheet } =
                require("@stripe/stripe-react-native") as typeof import("@stripe/stripe-react-native");

            const { error: initError } = await initPaymentSheet({
                paymentIntentClientSecret: paymentIntent.clientSecret,
                merchantDisplayName: "Kaelo",
                returnURL: "kaeloappproduction://stripe-redirect",
                defaultBillingDetails: {
                    email: user.email,
                },
            });

            if (initError) {
                throw new Error(initError.message);
            }

            const { error: presentError } = await presentPaymentSheet();

            if (presentError) {
                if (presentError.code === "Canceled") {
                    throw new Error("CANCELLED");
                }
                throw new Error(presentError.message);
            }

            return { success: true, method: "tarjeta" as const };
        },
        onError: (error) => {
            if (error.message === "CANCELLED") return; // User cancelled, no alert
            Alert.alert(
                "Error en el pago",
                error.message || "No se pudo procesar el pago. Intenta de nuevo.",
            );
        },
    });

    return {
        processPayment: mutation.mutateAsync,
        isProcessing: mutation.isPending,
        paymentError: mutation.error,
    };
};
