import { useAuthStore } from "@/shared/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
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
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const setupPushNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const Notifications = await import("expo-notifications").catch(
        () => null,
      );
      const Device = await import("expo-device").catch(() => null);

      if (!Notifications || !Device) {
        return;
      }

      if (!Device.isDevice) {
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

      // Get Expo push token using the EAS project ID from app config
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenResult.data;
      setExpoPushToken(token);

      // Register token with backend
      await registerPushToken(user.id, token);

      // Configure notification channel (Android)
      const { Platform } = await import("react-native");
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
        Notifications.addNotificationReceivedListener(() => {
          useNotificationStore.getState().incrementUnread();
        });

      // Listener: user tapped on a notification — navigate based on data
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          if (data?.route_id) {
            router.push({
              pathname: "/route-detail" as any,
              params: { id: data.route_id as string },
            });
          } else if (data?.order_id) {
            router.push("/my-orders" as any);
          } else if (data?.business_id) {
            router.push({
              pathname: "/business-detail" as any,
              params: { id: data.business_id as string },
            });
          } else {
            router.push("/notifications" as any);
          }
        });
    } catch {
      // Push notification setup failed silently
    }
  }, [user, router]);

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
