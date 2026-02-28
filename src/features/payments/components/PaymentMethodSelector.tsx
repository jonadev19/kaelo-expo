import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PaymentMethod } from "../types";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  showWallet?: boolean;
  walletBalance?: number;
}

const METHODS: {
  key: PaymentMethod;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}[] = [
  {
    key: "tarjeta",
    label: "Tarjeta",
    icon: "card-outline",
    description: "Débito o crédito vía Stripe",
  },
  {
    key: "efectivo",
    label: "Efectivo",
    icon: "cash-outline",
    description: "Pagar al recoger tu pedido",
  },
  {
    key: "wallet",
    label: "Wallet Kaelo",
    icon: "wallet-outline",
    description: "Usar tu balance disponible",
  },
];

export function PaymentMethodSelector({
  selected,
  onSelect,
  showWallet = false,
  walletBalance = 0,
}: PaymentMethodSelectorProps) {
  const { colors } = useTheme();

  const visibleMethods = METHODS.filter((m) => {
    if (m.key === "wallet" && !showWallet) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Método de pago</Text>
      {visibleMethods.map((method) => {
        const isSelected = selected === method.key;
        const isDisabled = method.key === "wallet" && walletBalance <= 0;

        return (
          <Pressable
            key={method.key}
            style={[
              styles.methodCard,
              {
                backgroundColor: isSelected
                  ? colors.primary + "10"
                  : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
              },
              isDisabled && styles.disabled,
            ]}
            onPress={() => !isDisabled && onSelect(method.key)}
            disabled={isDisabled}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isSelected
                    ? colors.primary + "20"
                    : colors.surfaceSecondary,
                },
              ]}
            >
              <Ionicons
                name={method.icon}
                size={20}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
            </View>
            <View style={styles.methodContent}>
              <Text
                style={[
                  styles.methodLabel,
                  { color: isDisabled ? colors.textTertiary : colors.text },
                ]}
              >
                {method.label}
                {method.key === "wallet" && ` ($${walletBalance.toFixed(2)})`}
              </Text>
              <Text
                style={[
                  styles.methodDescription,
                  { color: colors.textTertiary },
                ]}
              >
                {isDisabled ? "Balance insuficiente" : method.description}
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              {isSelected && (
                <View
                  style={[
                    styles.radioInner,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  methodContent: {
    flex: 1,
    gap: 2,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  methodDescription: {
    fontSize: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
