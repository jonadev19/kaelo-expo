import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { WalletTransaction } from "../types";

interface TransactionItemProps {
  transaction: WalletTransaction;
}

const TYPE_CONFIG: Record<
  string,
  {
    icon: keyof typeof Ionicons.glyphMap;
    colorKey: "freeBadge" | "premiumBadge" | "error" | "textSecondary";
  }
> = {
  route_sale: { icon: "arrow-down-circle", colorKey: "freeBadge" },
  route_purchase: { icon: "arrow-up-circle", colorKey: "premiumBadge" },
  withdrawal: { icon: "wallet-outline", colorKey: "textSecondary" },
  refund: { icon: "return-down-back", colorKey: "error" },
  refund_reversal: { icon: "return-up-forward", colorKey: "error" },
};

export function TransactionItem({ transaction }: TransactionItemProps) {
  const { colors } = useTheme();
  const config = TYPE_CONFIG[transaction.type] ?? TYPE_CONFIG.route_sale;
  const isPositive = transaction.amount > 0;

  const dateStr = new Date(transaction.created_at).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: (colors[config.colorKey] as string) + "15",
          },
        ]}
      >
        <Ionicons
          name={config.icon}
          size={20}
          color={colors[config.colorKey] as string}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.description, { color: colors.text }]}
            numberOfLines={1}
          >
            {transaction.description}
          </Text>
          {transaction.type === "withdrawal" && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Text style={[styles.statusText, { color: colors.textTertiary }]}>
                {transaction.description.includes("pending")
                  ? "PENDIENTE"
                  : transaction.description.includes("completed")
                    ? "COMPLETADO"
                    : "EN PROCESO"}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.date, { color: colors.textTertiary }]}>
          {dateStr}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          {
            color: isPositive
              ? (colors.freeBadge as string)
              : colors.textSecondary,
          },
        ]}
      >
        {isPositive ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  description: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
});
