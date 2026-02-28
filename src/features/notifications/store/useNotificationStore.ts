import { create } from "zustand";

interface NotificationStoreState {
  /** Whether push notification permission has been granted */
  permissionGranted: boolean;
  /** The Expo push token for this device */
  expoPushToken: string | null;
  /** Unread notification badge count */
  unreadCount: number;

  setPermissionGranted: (granted: boolean) => void;
  setExpoPushToken: (token: string | null) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  resetUnread: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  permissionGranted: false,
  expoPushToken: null,
  unreadCount: 0,

  setPermissionGranted: (granted) => set({ permissionGranted: granted }),
  setExpoPushToken: (token) => set({ expoPushToken: token }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: () =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  resetUnread: () => set({ unreadCount: 0 }),
}));
