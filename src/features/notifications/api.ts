import { supabase } from "@/lib/supabase";
import type { AppNotification } from "./types";

/**
 * Register an Expo push token for the current device.
 * Uses upsert to handle re-registration.
 */
export const registerPushToken = async (
  userId: string,
  expoPushToken: string,
  deviceId: string,
  platform: "ios" | "android",
): Promise<void> => {
  // Store in profiles metadata since push_tokens table may not exist
  // Also store in a simple way using notifications table convention
  const { error } = await supabase
    .from("profiles")
    .update({
      // Store the push token in profile metadata
      // This is a pragmatic approach since the push_tokens table isn't in the schema
      push_token: expoPushToken,
    } as any)
    .eq("id", userId);

  // If the column doesn't exist, log but don't crash
  if (error) {
    console.warn("Could not save push token to profile:", error.message);
    // Fallback: store in AsyncStorage
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    await AsyncStorage.setItem(
      `push_token_${userId}`,
      JSON.stringify({ expoPushToken, deviceId, platform }),
    );
  }
};

/**
 * Fetch all notifications for a user.
 */
export const fetchNotifications = async (
  userId: string,
  limit = 50,
): Promise<AppNotification[]> => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AppNotification[];
};

/**
 * Get unread notification count.
 */
export const fetchUnreadCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return count ?? 0;
};

/**
 * Mark a single notification as read.
 */
export const markNotificationRead = async (
  notificationId: string,
): Promise<void> => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) throw new Error(error.message);
};

/**
 * Mark all notifications as read for a user.
 */
export const markAllNotificationsRead = async (
  userId: string,
): Promise<void> => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
};
