import { useAuthStore } from "@/shared/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
} from "../api";
import { notificationKeys } from "../keys";
import { useNotificationStore } from "../store/useNotificationStore";

/**
 * Hook to fetch notifications for the current user.
 */
export const useNotifications = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: notificationKeys.list(user?.id ?? ""),
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user,
    refetchInterval: 30_000, // Refetch every 30 seconds
  });
};

/**
 * Hook to get and auto-update unread notification count.
 */
export const useUnreadCount = () => {
  const user = useAuthStore((state) => state.user);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const query = useQuery({
    queryKey: notificationKeys.unreadCount(user?.id ?? ""),
    queryFn: () => fetchUnreadCount(user!.id),
    enabled: !!user,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (query.data != null) {
      setUnreadCount(query.data);
    }
  }, [query.data, setUnreadCount]);

  return query;
};

/**
 * Hook to mark a notification as read.
 */
export const useMarkRead = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(notificationId),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(user.id),
        });
      }
    },
  });
};

/**
 * Hook to mark all notifications as read.
 */
export const useMarkAllRead = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const resetUnread = useNotificationStore((s) => s.resetUnread);

  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Not authenticated");
      return markAllNotificationsRead(user.id);
    },
    onSuccess: () => {
      resetUnread();
      if (user) {
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(user.id),
        });
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(user.id),
        });
      }
    },
  });
};

/**
 * Hook to initialize push notifications.
 * Registers the device token and sets up notification listeners.
 *
 * Should be called once in the root layout.
 */
export const usePushNotificationSetup = () => {
  const user = useAuthStore((state) => state.user);
  const { setPermissionGranted, setExpoPushToken } = useNotificationStore();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const setupPushNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // Dynamically import expo-notifications (may not be installed)
      const Notifications = await import("expo-notifications").catch(
        () => null,
      );
      const Device = await import("expo-device").catch(() => null);

      if (!Notifications || !Device) {
        console.warn(
          "expo-notifications or expo-device not installed. Push notifications disabled.",
        );
        return;
      }

      // Check if physical device
      if (!Device.isDevice) {
        console.warn("Push notifications require a physical device");
        return;
      }

      // Request permissions
      const permResult: any = await Notifications.getPermissionsAsync();
      let finalStatus = permResult.status;

      if (finalStatus !== "granted") {
        const reqResult: any = await Notifications.requestPermissionsAsync();
        finalStatus = reqResult.status;
      }

      if (finalStatus !== "granted") {
        setPermissionGranted(false);
        return;
      }

      setPermissionGranted(true);

      // Get Expo push token
      const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId: undefined, // Uses project ID from app.json
      });
      const token = tokenResult.data;
      setExpoPushToken(token);

      // Register token with backend
      await registerPushToken(
        user.id,
        token,
        Device.modelId ?? "unknown",
        Platform.OS as "ios" | "android",
      );

      // Configure notification channel (Android)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Notificaciones",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#3B82F6",
        });
      }

      // Listener: notification received while app is in foreground
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          const { title, body } = notification.request.content;
          console.log("Notification received:", title);
          // Increment unread count
          useNotificationStore.getState().incrementUnread();
        });

      // Listener: user tapped on a notification
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          console.log("Notification tapped:", JSON.stringify(data));
          // Navigation will be handled by the component reading this
        });
    } catch (error) {
      console.error("Error setting up push notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    setupPushNotifications();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [setupPushNotifications]);
};
