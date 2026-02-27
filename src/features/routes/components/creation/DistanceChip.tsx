import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DistanceChipProps {
  distanceMeters: number;
  durationSeconds?: number;
}

export function DistanceChip({ distanceMeters, durationSeconds }: DistanceChipProps) {
  const { colors } = useTheme();
  const km = (distanceMeters / 1000).toFixed(1);
  const mins = durationSeconds ? Math.round(durationSeconds / 60) : null;

  return (
    <View style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="bicycle" size={16} color={colors.primary} />
      <Text style={[styles.text, { color: colors.text }]}>{km} km</Text>
      {mins != null && (
        <Text style={[styles.duration, { color: colors.textSecondary }]}>
          ~{mins} min
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  duration: {
    fontSize: 12,
    marginLeft: 2,
  },
});
