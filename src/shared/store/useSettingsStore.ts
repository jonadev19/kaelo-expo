import {
  fetchSettings,
  updateSettings,
  type UserPreferences,
} from "@/features/profile/api";
import { Alert } from "react-native";
import { create } from "zustand";

interface SettingsState {
  // Notification preferences
  push_enabled: boolean;
  order_updates: boolean;
  new_achievements: boolean;
  offers_coupons: boolean;
  promotional_emails: boolean;
  // Privacy preferences
  show_profile: boolean;
  show_in_rankings: boolean;
  // Meta
  isLoading: boolean;
  userId: string | null;

  loadSettings: (userId: string) => Promise<void>;
  toggleSetting: (
    key: keyof Omit<SettingsState, "isLoading" | "userId" | "loadSettings" | "toggleSetting">,
    value: boolean,
  ) => Promise<void>;
}

const DEFAULTS: Pick<
  SettingsState,
  | "push_enabled"
  | "order_updates"
  | "new_achievements"
  | "offers_coupons"
  | "promotional_emails"
  | "show_profile"
  | "show_in_rankings"
> = {
  push_enabled: true,
  order_updates: true,
  new_achievements: true,
  offers_coupons: false,
  promotional_emails: false,
  show_profile: true,
  show_in_rankings: true,
};

type ToggleKey = keyof typeof DEFAULTS;

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  isLoading: true,
  userId: null,

  loadSettings: async (userId: string) => {
    set({ isLoading: true, userId });
    try {
      const prefs = await fetchSettings(userId);
      set({
        push_enabled: prefs.push_enabled ?? DEFAULTS.push_enabled,
        order_updates: prefs.order_updates ?? DEFAULTS.order_updates,
        new_achievements: prefs.new_achievements ?? DEFAULTS.new_achievements,
        offers_coupons: prefs.offers_coupons ?? DEFAULTS.offers_coupons,
        promotional_emails: prefs.promotional_emails ?? DEFAULTS.promotional_emails,
        show_profile: prefs.show_profile ?? DEFAULTS.show_profile,
        show_in_rankings: prefs.show_in_rankings ?? DEFAULTS.show_in_rankings,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleSetting: async (key: ToggleKey, value: boolean) => {
    const { userId } = get();
    if (!userId) return;

    const previous = get()[key];
    // Optimistic update
    set({ [key]: value } as Pick<SettingsState, ToggleKey>);

    try {
      await updateSettings(userId, { [key]: value } as Partial<UserPreferences>);
    } catch {
      // Revert on failure
      set({ [key]: previous } as Pick<SettingsState, ToggleKey>);
      Alert.alert("Error", "No se pudo guardar la configuración. Intenta de nuevo.");
    }
  },
}));
