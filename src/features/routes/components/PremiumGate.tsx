import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRoutePurchaseCheck } from "../../payments/hooks/usePayment";

interface PremiumGateProps {
  routeId: string;
  creatorId: string;
  currentUserId: string | undefined;
  price: number;
  isFree: boolean;
  isPurchasing: boolean;
  onPurchase: () => void;
  children: React.ReactNode;
}

/**
 * Gate component that restricts content for premium routes.
 * Shows full content for:
 * - Free routes
 * - Routes created by the current user
 * - Routes the user has already purchased
 *
 * Shows a purchase CTA otherwise.
 */
export function PremiumGate({
  routeId,
  creatorId,
  currentUserId,
  price,
  isFree,
  isPurchasing,
  onPurchase,
  children,
}: PremiumGateProps) {
  const { colors } = useTheme();
  const { data: purchaseCheck, isLoading } = useRoutePurchaseCheck(routeId);

  // Free routes: show everything
  if (isFree) return <>{children}</>;

  // Creator's own route: show everything
  if (currentUserId && currentUserId === creatorId) return <>{children}</>;

  // Loading purchase status
  if (isLoading) {
    return (
      <View
        style={[
          styles.gateContainer,
          { backgroundColor: colors.surfaceSecondary },
        ]}
      >
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  // Already purchased: show everything
  if (purchaseCheck?.purchased) return <>{children}</>;

  // Not purchased: show gate
  return (
    <View
      style={[
        styles.gateContainer,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.lockIcon,
          { backgroundColor: colors.premiumBadge + "20" },
        ]}
      >
        <Ionicons name="lock-closed" size={32} color={colors.premiumBadge} />
      </View>
      <Text style={[styles.gateTitle, { color: colors.text }]}>
        Contenido Premium
      </Text>
      <Text style={[styles.gateDescription, { color: colors.textSecondary }]}>
        Compra esta ruta para acceder a todos los puntos de interés, el track
        GPS completo y la navegación guiada.
      </Text>
      <Pressable
        style={[
          styles.purchaseButton,
          { backgroundColor: colors.premiumBadge },
        ]}
        onPress={onPurchase}
        disabled={isPurchasing}
      >
        {isPurchasing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
            <Text style={styles.purchaseButtonText}>
              Comprar por ${price} MXN
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

/**
 * Limits waypoints shown for premium routes.
 * Shows first 3 waypoints + a "locked" message.
 */
export function limitWaypointsForPreview<T>(
  waypoints: T[],
  isFree: boolean,
  hasPurchased: boolean,
  isCreator: boolean,
  maxPreview = 3,
): { visible: T[]; totalHidden: number; isLimited: boolean } {
  if (isFree || hasPurchased || isCreator) {
    return { visible: waypoints, totalHidden: 0, isLimited: false };
  }

  const visible = waypoints.slice(0, maxPreview);
  const totalHidden = Math.max(0, waypoints.length - maxPreview);
  return { visible, totalHidden, isLimited: totalHidden > 0 };
}

const styles = StyleSheet.create({
  gateContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  gateTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  gateDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  purchaseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 4,
    width: "100%",
  },
  purchaseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
