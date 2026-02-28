import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  eta: Date | null;
  distanceRemaining: number;
  distanceTraveled: number;
  currentSpeed: number; // m/s
  trackingStartedAt: number | null;
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

function formatSpeed(metersPerSec: number): string {
  const kmh = metersPerSec * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

function formatCalories(distanceMeters: number): string {
  // ~30 cal/km para ciclismo (estimación)
  const cal = Math.round((distanceMeters / 1000) * 30);
  return `${cal}`;
}

export function NavigationBottomBar({
  eta,
  distanceRemaining,
  distanceTraveled,
  currentSpeed,
  trackingStartedAt,
  onCenter,
  onStop,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const durationSecs =
    eta ? Math.max(0, (eta.getTime() - Date.now()) / 1000) : 0;
  const elapsedSecs = trackingStartedAt
    ? Math.max(0, (Date.now() - trackingStartedAt) / 1000)
    : 0;

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
      {/* Row 1: Navigation stats */}
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
            Tiempo rest.
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

      {/* Row 2: Activity metrics */}
      <View style={[styles.statsRow, styles.activityRow]}>
        <View style={styles.stat}>
          <View style={styles.iconValue}>
            <Ionicons name="footsteps-outline" size={14} color={colors.primary} />
            <Text style={[styles.activityValue, { color: colors.primary }]}>
              {formatDistance(distanceTraveled)}
            </Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Recorrido
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <View style={styles.iconValue}>
            <Ionicons name="speedometer-outline" size={14} color={colors.primary} />
            <Text style={[styles.activityValue, { color: colors.primary }]}>
              {formatSpeed(currentSpeed)}
            </Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Velocidad
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <View style={styles.iconValue}>
            <Ionicons name="flame-outline" size={14} color="#FF6B35" />
            <Text style={[styles.activityValue, { color: "#FF6B35" }]}>
              {formatCalories(distanceTraveled)}
            </Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            kcal
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <View style={styles.iconValue}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={[styles.activityValue, { color: colors.primary }]}>
              {formatDuration(elapsedSecs)}
            </Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Activo
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
    marginBottom: 12,
  },
  activityRow: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.2)",
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
  activityValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  iconValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
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
