import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DraftMarkerProps {
  index: number;
  total: number;
}

export function DraftMarker({ index, total }: DraftMarkerProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1 && total > 1;
  const bgColor = isFirst ? "#22C55E" : isLast ? "#EF4444" : "#FFFFFF";
  const textColor = isFirst || isLast ? "#FFFFFF" : "#1C1917";

  return (
    <View style={[styles.marker, { backgroundColor: bgColor }]}>
      <Text style={[styles.label, { color: textColor }]}>{index + 1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
