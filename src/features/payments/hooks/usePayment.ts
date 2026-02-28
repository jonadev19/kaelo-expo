import { useAuthStore } from "@/shared/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import {
  checkRoutePurchased,
  confirmRoutePurchase,
  createRoutePaymentIntent,
  fetchMyPurchases,
} from "../api";
import { paymentKeys } from "../keys";

/**
 * Hook to check if the current user has purchased a specific route.
 */
export const useRoutePurchaseCheck = (routeId: string) => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: paymentKeys.purchaseCheck(routeId),
    queryFn: () => checkRoutePurchased(routeId, user!.id),
    enabled: !!user && !!routeId,
  });
};

/**
 * Hook to fetch all purchases for the current user.
 */
export const useMyPurchases = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: paymentKeys.myPurchases(),
    queryFn: () => fetchMyPurchases(user!.id),
    enabled: !!user,
  });
};

/**
 * Hook to handle the complete route purchase flow.
 *
 * Usage:
 * ```
 * const { purchaseRoute, isPurchasing } = useRoutePurchase();
 * purchaseRoute({ routeId, price });
 * ```
 */
export const useRoutePurchase = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      routeId,
      price,
    }: {
      routeId: string;
      price: number;
    }) => {
      if (!user) throw new Error("Debes iniciar sesión");

      // 1. Check if already purchased
      const check = await checkRoutePurchased(routeId, user.id);
      if (check.purchased) {
        throw new Error("Ya tienes esta ruta");
      }

      // 2. Create PaymentIntent via Edge Function
      const paymentIntent = await createRoutePaymentIntent(routeId, user.id);

      // 3. Present Stripe payment sheet
      // Using @stripe/stripe-react-native's confirmPayment
      const { initPaymentSheet, presentPaymentSheet } =
        require("@stripe/stripe-react-native") as typeof import("@stripe/stripe-react-native");

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent.clientSecret,
        merchantDisplayName: "Kaelo",
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

      // 4. Confirm purchase record (webhook also does this)
      const purchaseId = await confirmRoutePurchase(
        routeId,
        user.id,
        paymentIntent.paymentIntentId,
        price,
      );

      return purchaseId;
    },
    onSuccess: (_purchaseId, variables) => {
      // Invalidate purchase check for this route
      queryClient.invalidateQueries({
        queryKey: paymentKeys.purchaseCheck(variables.routeId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.myPurchases(),
      });

      Alert.alert(
        "¡Ruta desbloqueada!",
        "Ya puedes acceder al contenido completo de esta ruta.",
        [{ text: "Genial", style: "default" }],
      );
    },
    onError: (error) => {
      if (error.message === "CANCELLED") return;
      if (error.message === "Ya tienes esta ruta") {
        Alert.alert("Ruta ya comprada", "Ya tienes acceso a esta ruta.");
        return;
      }
      Alert.alert(
        "Error en el pago",
        error.message || "No se pudo procesar el pago. Intenta de nuevo.",
      );
    },
  });

  return {
    purchaseRoute: mutation.mutate,
    purchaseRouteAsync: mutation.mutateAsync,
    isPurchasing: mutation.isPending,
    purchaseError: mutation.error,
  };
};
