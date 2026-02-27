import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DraftWaypoint } from "../../store/useRouteCreationStore";

interface WaypointEditorRowProps {
  waypoint: DraftWaypoint;
  index: number;
  onDelete: () => void;
}

const typeIcons: Record<string, string> = {
  cenote: "water",
  mirador: "eye",
  zona_arqueologica: "business",
  restaurante: "restaurant",
  tienda: "cart",
  taller_bicicletas: "build",
  descanso: "bed",
  punto_agua: "water",
  peligro: "warning",
  foto: "camera",
  otro: "location",
};

export function WaypointEditorRow({
  waypoint,
  index,
  onDelete,
}: WaypointEditorRowProps) {
  const { colors } = useTheme();
  const icon = typeIcons[waypoint.waypoint_type] ?? "location";

  return (
    <View
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.indexBadge, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.indexText, { color: colors.primary }]}>
          {index + 1}
        </Text>
      </View>
      <Ionicons
        name={icon as any}
        size={18}
        color={colors.textSecondary}
        style={styles.icon}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {waypoint.name}
        </Text>
        {waypoint.description ? (
          <Text
            style={[styles.desc, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {waypoint.description}
          </Text>
        ) : null}
      </View>
      <Pressable onPress={onDelete} hitSlop={12}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: 12,
    fontWeight: "700",
  },
  icon: {
    width: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  desc: {
    fontSize: 12,
    marginTop: 2,
  },
});
