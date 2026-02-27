import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  eta: Date | null;
  distanceRemaining: number;
  onCenter: () => void;
  onStop: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatEta(date: Date | null): string {
  if (!date) return "--:--";
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return "< 1 min";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

export function NavigationBottomBar({
  eta,
  distanceRemaining,
  onCenter,
  onStop,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const durationSecs =
    eta ? Math.max(0, (eta.getTime() - Date.now()) / 1000) : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingBottom: insets.bottom + 8,
          shadowColor: "#000",
        },
      ]}
    >
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatEta(eta)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Llegada
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatDuration(durationSecs)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Tiempo
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatDistance(distanceRemaining)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Restante
          </Text>
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <Pressable
          style={[styles.centerButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={onCenter}
        >
          <Ionicons name="locate" size={22} color={colors.primary} />
        </Pressable>

        <Pressable style={styles.stopButton} onPress={onStop}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
          <Text style={styles.stopText}>Terminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 32,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E53935",
    height: 48,
    borderRadius: 14,
  },
  stopText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
