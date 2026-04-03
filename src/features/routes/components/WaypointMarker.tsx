import { StyleSheet, Text, View } from "react-native";
import type { WaypointType } from "../types";

const WAYPOINT_ICONS: Record<WaypointType, string> = {
  inicio: "▶",
  fin: "🏁",
  cenote: "💧",
  zona_arqueologica: "🏛",
  mirador: "👁",
  restaurante: "🍽",
  tienda: "🛒",
  taller_bicicletas: "🔧",
  descanso: "🪑",
  punto_agua: "🚰",
  peligro: "⚠️",
  foto: "📸",
  otro: "📍",
};

function getPinColor(type: WaypointType): string {
  if (type === "inicio") return "#22c55e";
  if (type === "fin") return "#ef4444";
  return "#6366f1";
}

interface WaypointMarkerProps {
  type: WaypointType;
}

export function WaypointMarker({ type }: WaypointMarkerProps) {
  const color = getPinColor(type);
  const icon = WAYPOINT_ICONS[type] ?? "📍";
  const isStartOrEnd = type === "inicio" || type === "fin";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.pin,
          isStartOrEnd ? styles.pinLarge : styles.pinSmall,
          { backgroundColor: color },
        ]}
      >
        <Text style={isStartOrEnd ? styles.iconLarge : styles.iconSmall}>
          {icon}
        </Text>
      </View>
      <View style={[styles.arrow, { borderTopColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  pin: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pinLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  pinSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  iconLarge: {
    fontSize: 14,
  },
  iconSmall: {
    fontSize: 11,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
});
