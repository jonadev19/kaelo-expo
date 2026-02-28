import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AppNotification, NotificationType } from "../types";

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  order_status: { icon: "bag-check-outline", color: "#3B82F6" },
  order_paid: { icon: "card-outline", color: "#10B981" },
  route_purchased: { icon: "map-outline", color: "#8B5CF6" },
  route_sold: { icon: "cash-outline", color: "#10B981" },
  payment_failed: { icon: "alert-circle-outline", color: "#EF4444" },
  refund_completed: { icon: "return-down-back-outline", color: "#F59E0B" },
  withdrawal_requested: { icon: "wallet-outline", color: "#6366F1" },
  withdrawal_completed: { icon: "checkmark-circle-outline", color: "#10B981" },
  general: { icon: "notifications-outline", color: "#6B7280" },
};

export function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  const { colors } = useTheme();
  const config =
    TYPE_CONFIG[notification.notification_type as NotificationType] ??
    TYPE_CONFIG.general;

  const timeAgo = getTimeAgo(notification.created_at);

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: notification.is_read
            ? colors.surface
            : colors.primary + "08",
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(notification)}
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}

      <View
        style={[styles.iconCircle, { backgroundColor: config.color + "15" }]}
      >
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontWeight: notification.is_read ? "500" : "700",
            },
          ]}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text
          style={[styles.body, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {notification.body}
        </Text>
        <Text style={[styles.time, { color: colors.textTertiary }]}>
          {timeAgo}
        </Text>
      </View>
    </Pressable>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days}d`;

  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    left: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
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
    gap: 2,
  },
  title: {
    fontSize: 14,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
  },
});
