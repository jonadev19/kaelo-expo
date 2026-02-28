import {
  useLocationStore,
  type GpsSignalQuality,
} from "@/shared/store/useLocationStore";
import { StyleSheet, Text, View } from "react-native";

const SIGNAL_CONFIG: Record<
  GpsSignalQuality,
  { label: string; color: string; bars: number }
> = {
  excellent: { label: "GPS Excelente", color: "#10B981", bars: 4 },
  good: { label: "GPS Bueno", color: "#3B82F6", bars: 3 },
  fair: { label: "GPS Regular", color: "#F59E0B", bars: 2 },
  poor: { label: "GPS Débil", color: "#EF4444", bars: 1 },
  none: { label: "Sin GPS", color: "#6B7280", bars: 0 },
};

interface GpsSignalIndicatorProps {
  quality?: GpsSignalQuality;
  size?: "small" | "normal";
}

export function GpsSignalIndicator({
  quality,
  size,
}: GpsSignalIndicatorProps = {}) {
  const storeSignal = useLocationStore((s) => s.gpsSignal);
  const gpsSignal = quality ?? storeSignal;
  const config = SIGNAL_CONFIG[gpsSignal];
  const isSmall = size === "small";

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {[1, 2, 3, 4].map((bar) => (
          <View
            key={bar}
            style={[
              styles.bar,
              {
                height: 4 + bar * 3,
                backgroundColor:
                  bar <= config.bars ? config.color : "#D1D5DB40",
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: {
    width: 4,
    borderRadius: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
  },
});
