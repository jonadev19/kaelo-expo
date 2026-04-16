import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { ActivityRecord } from "../types";

interface ActivityItemProps {
  activity: ActivityRecord;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { colors } = useTheme();

  const dateStr = new Date(activity.started_at).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const totalDurationMin = (activity as any).duration_min ?? 0;
  const distanceActual = activity.distance_actual_km ?? 0;

  const durationHours = Math.floor(totalDurationMin / 60);
  const durationMins = totalDurationMin % 60;
  const durationStr = durationHours > 0 
    ? `${durationHours}h ${durationMins}m` 
    : `${durationMins}m`;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primary + "15" }]}>
        <Ionicons name="bicycle" size={22} color={colors.primary} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.routeName, { color: colors.text }]} numberOfLines={1}>
          {activity.route?.name || "Ruta personalizada"}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.date, { color: colors.textTertiary }]}>{dateStr}</Text>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <Text style={[styles.difficulty, { color: colors.primary }]}>
             {activity.route?.difficulty || "Media"}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={[styles.distance, { color: colors.text }]}>
          {distanceActual.toFixed(1)} km
        </Text>
        <Text style={[styles.duration, { color: colors.textTertiary }]}>
          {durationStr}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  routeName: {
    fontSize: 16,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    fontSize: 12,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  difficulty: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  stats: {
    alignItems: "flex-end",
    gap: 2,
  },
  distance: {
    fontSize: 16,
    fontWeight: "700",
  },
  duration: {
    fontSize: 12,
  },
});
