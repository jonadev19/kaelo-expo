import { useTheme } from "@/shared/hooks/useTheme";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface PricingToggleProps {
  isFree: boolean;
  price: number;
  onToggle: (isFree: boolean) => void;
  onPriceChange: (price: number) => void;
}

export function PricingToggle({
  isFree,
  price,
  onToggle,
  onPriceChange,
}: PricingToggleProps) {
  const { colors } = useTheme();

  return (
    <View>
      <View style={styles.toggleRow}>
        <Pressable
          style={[
            styles.option,
            {
              backgroundColor: isFree ? colors.primary : colors.surfaceSecondary,
              borderColor: isFree ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onToggle(true)}
        >
          <Text
            style={[styles.optionText, { color: isFree ? "#FFF" : colors.text }]}
          >
            Gratis
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.option,
            {
              backgroundColor: !isFree ? colors.primary : colors.surfaceSecondary,
              borderColor: !isFree ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onToggle(false)}
        >
          <Text
            style={[
              styles.optionText,
              { color: !isFree ? "#FFF" : colors.text },
            ]}
          >
            De pago
          </Text>
        </Pressable>
      </View>

      {!isFree && (
        <View style={styles.priceRow}>
          <Text style={[styles.currency, { color: colors.text }]}>$</Text>
          <TextInput
            style={[
              styles.priceInput,
              {
                color: colors.text,
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="0.00"
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="decimal-pad"
            value={price > 0 ? String(price) : ""}
            onChangeText={(v) => {
              const n = parseFloat(v) || 0;
              onPriceChange(n);
            }}
          />
          <Text style={[styles.mxn, { color: colors.textSecondary }]}>MXN</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  currency: {
    fontSize: 20,
    fontWeight: "600",
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  mxn: {
    fontSize: 14,
    fontWeight: "500",
  },
});
