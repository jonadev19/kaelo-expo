# Settings Functionality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all toggles and actions in AppSettingsScreen functional — notification preferences and privacy settings persisted to Supabase, location permission reads from OS, soft-delete account with confirmation modal.

**Architecture:** Zustand store (`useSettingsStore`) loads settings from Supabase on mount, provides optimistic toggle updates that sync to backend. Notification prefs stored in `profiles.preferences` JSONB (since `notification_preferences` table is not in production DB). Privacy stored in `profiles.preferences` as well.

**Tech Stack:** React Native, Zustand, Supabase (profiles table, preferences JSONB), expo-location, expo-linking

**Important context:**
- The `notification_preferences` table exists in reference migrations but is NOT in the production database (missing from generated types). We use `profiles.preferences` JSONB instead.
- The `profiles` table does NOT have `privacy_settings` column in production. We store privacy flags inside `profiles.preferences` JSONB too.
- `profiles.preferences` current default: `{ "language": "es", "notifications_enabled": true, "theme": "light" }`
- The `useUser()` selector from `authStore` returns the Supabase `User` object; `user.id` gives the user ID.
- `profiles.preferences` is typed as `Json | null` in database.types.ts.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/shared/store/useSettingsStore.ts` | Create | Zustand store: load/toggle notification & privacy settings with optimistic Supabase sync |
| `src/features/profile/api.ts` | Modify | Add `fetchSettings()` and `updateSettings()` functions for preferences JSONB |
| `src/features/profile/screens/AppSettingsScreen.tsx` | Modify | Wire store, location permission, delete account modal, "Proximamente" toast |

---

### Task 1: Add settings API functions to profile/api.ts

**Files:**
- Modify: `src/features/profile/api.ts`

**Context:** The `profiles.preferences` column is `Json | null`. We need functions to read and write structured preferences. The existing `updateProfile` can update any profile column, but we need a typed helper that merges into the `preferences` JSONB without overwriting other keys.

- [ ] **Step 1: Define the preferences type**

Add to the top of `src/features/profile/api.ts`, below the existing `ProfileStats` interface:

```ts
export interface UserPreferences {
  language?: string;
  theme?: string;
  notifications_enabled?: boolean;
  // Notification toggles
  push_enabled?: boolean;
  order_updates?: boolean;
  new_achievements?: boolean;
  offers_coupons?: boolean;
  promotional_emails?: boolean;
  // Privacy toggles
  show_profile?: boolean;
  show_in_rankings?: boolean;
  // Account
  deactivated?: boolean;
  deactivated_at?: string;
}
```

- [ ] **Step 2: Add fetchSettings function**

Add below `fetchProfileStats`:

```ts
/**
 * Fetch user preferences from the profiles table.
 */
export const fetchSettings = async (userId: string): Promise<UserPreferences> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return (data?.preferences as UserPreferences) ?? {};
};
```

- [ ] **Step 3: Add updateSettings function**

Add below `fetchSettings`:

```ts
/**
 * Merge updates into user preferences JSONB.
 */
export const updateSettings = async (
  userId: string,
  updates: Partial<UserPreferences>,
): Promise<UserPreferences> => {
  // First fetch current preferences to merge
  const current = await fetchSettings(userId);
  const merged = { ...current, ...updates };

  const { data, error } = await supabase
    .from("profiles")
    .update({ preferences: merged as unknown as Json })
    .eq("id", userId)
    .select("preferences")
    .single();

  if (error) throw new Error(error.message);
  return (data?.preferences as UserPreferences) ?? merged;
};
```

- [ ] **Step 4: Add the Json import**

Add the `Json` type import at the top of the file. Change the existing import:

```ts
import type { Database } from "@/types/database.types";
```

to:

```ts
import type { Database, Json } from "@/types/database.types";
```

- [ ] **Step 5: Verify the Json type is exported from database.types.ts**

Run: `grep "export type Json" src/types/database.types.ts`

Expected: `export type Json =`

- [ ] **Step 6: Commit**

```bash
git add src/features/profile/api.ts
git commit -m "feat(settings): add fetchSettings and updateSettings API functions"
```

---

### Task 2: Create useSettingsStore

**Files:**
- Create: `src/shared/store/useSettingsStore.ts`

**Context:** Follow the same pattern as `themeStore.ts` (Zustand, simple create). The store loads preferences from Supabase via `fetchSettings`, and each toggle does an optimistic local update then calls `updateSettings`. If the API call fails, it reverts the toggle and shows an Alert.

- [ ] **Step 1: Create the store file**

Create `src/shared/store/useSettingsStore.ts`:

```ts
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
```

- [ ] **Step 2: Verify the store compiles**

Run: `npx tsc --noEmit src/shared/store/useSettingsStore.ts 2>&1 | head -20`

If there are type errors with the `set()` calls using computed keys, cast as needed. The important thing is that `toggleSetting` accepts any boolean setting key and does optimistic update + revert.

- [ ] **Step 3: Commit**

```bash
git add src/shared/store/useSettingsStore.ts
git commit -m "feat(settings): create useSettingsStore with optimistic Supabase sync"
```

---

### Task 3: Wire AppSettingsScreen to store and real functionality

**Files:**
- Modify: `src/features/profile/screens/AppSettingsScreen.tsx`

**Context:** Replace all `() => {}` handlers with real functionality. The screen needs to:
1. Call `loadSettings(userId)` on mount
2. Read toggle values from `useSettingsStore`
3. Read location permission from `useLocationStore`
4. Open OS settings on location press
5. Show toast for "Descargar Mis Datos"
6. Show confirmation modal for "Eliminar Cuenta" with soft-delete

- [ ] **Step 1: Replace the entire AppSettingsScreen**

Replace the contents of `src/features/profile/screens/AppSettingsScreen.tsx` with:

```tsx
import { updateSettings } from "@/features/profile/api";
import { useTheme } from "@/shared/hooks/useTheme";
import { useAuthStore } from "@/shared/store/authStore";
import { useLocationStore } from "@/shared/store/useLocationStore";
import { useSettingsStore } from "@/shared/store/useSettingsStore";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SettingsCardOption from "../components/SettingsCardOption";

function getLocationLabel(permission: boolean | null): string {
  if (permission === true) return "Permitido";
  if (permission === false) return "Denegado";
  return "No definido";
}

export default function AppSettingsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.signOut);
  const locationPermission = useLocationStore((s) => s.permission);

  const {
    push_enabled,
    order_updates,
    new_achievements,
    offers_coupons,
    promotional_emails,
    show_profile,
    show_in_rankings,
    isLoading,
    loadSettings,
    toggleSetting,
  } = useSettingsStore();

  useEffect(() => {
    if (user?.id) {
      loadSettings(user.id);
    }
  }, [user?.id]);

  // Also check location permission on mount
  const checkPermission = useLocationStore((s) => s.checkPermission);
  useEffect(() => {
    checkPermission();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Eliminar Cuenta",
      "Esta acción no se puede deshacer. Tu cuenta será desactivada y no podrás acceder a ella.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            if (!user?.id) return;
            try {
              await updateSettings(user.id, {
                deactivated: true,
                deactivated_at: new Date().toISOString(),
              });
              await logout();
            } catch {
              Alert.alert("Error", "No se pudo eliminar la cuenta. Intenta de nuevo.");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      contentContainerStyle={styles.content}
    >
      {/* NOTIFICACIONES */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        NOTIFICACIONES
      </Text>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <SettingsCardOption
          icon="notifications"
          label="Notificaciones Push"
          variant="toggle"
          value={push_enabled}
          onToggle={(v) => toggleSetting("push_enabled", v)}
        />
        <SettingsCardOption
          icon="cart"
          label="Actualizaciones de Pedidos"
          variant="toggle"
          value={order_updates}
          onToggle={(v) => toggleSetting("order_updates", v)}
        />
        <SettingsCardOption
          icon="trophy"
          label="Nuevos Logros"
          variant="toggle"
          value={new_achievements}
          onToggle={(v) => toggleSetting("new_achievements", v)}
        />
        <SettingsCardOption
          icon="pricetag"
          label="Ofertas y Cupones"
          variant="toggle"
          value={offers_coupons}
          onToggle={(v) => toggleSetting("offers_coupons", v)}
        />
        <SettingsCardOption
          icon="mail"
          label="Emails Promocionales"
          variant="toggle"
          value={promotional_emails}
          onToggle={(v) => toggleSetting("promotional_emails", v)}
        />
      </View>

      {/* PRIVACIDAD Y DATOS */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        PRIVACIDAD Y DATOS
      </Text>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <SettingsCardOption
          icon="location"
          label="Permisos de Ubicación"
          variant="value"
          displayValue={getLocationLabel(locationPermission)}
          onPress={() => Linking.openSettings()}
        />
        <SettingsCardOption
          icon="person-circle"
          label="Perfil Público"
          variant="toggle"
          value={show_profile}
          onToggle={(v) => toggleSetting("show_profile", v)}
        />
        <SettingsCardOption
          icon="podium"
          label="Aparecer en Rankings"
          variant="toggle"
          value={show_in_rankings}
          onToggle={(v) => toggleSetting("show_in_rankings", v)}
        />
        <SettingsCardOption
          icon="download"
          label="Descargar Mis Datos"
          subtitle="Exportar en formato JSON"
          onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto.")}
        />
      </View>

      {/* ZONA DE PELIGRO */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        ZONA DE PELIGRO
      </Text>
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <SettingsCardOption
          icon="log-out"
          label="Cerrar Sesión"
          variant="danger"
          onPress={handleLogout}
        />
        <SettingsCardOption
          icon="trash"
          label="Eliminar Cuenta"
          subtitle="Esta acción es irreversible"
          variant="danger"
          onPress={handleDeleteAccount}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -30`

Fix any type errors.

- [ ] **Step 3: Manual test checklist**

Test in the app:
1. Open Settings screen — should show loading spinner briefly, then toggles with values from Supabase
2. Toggle "Notificaciones Push" off then on — should update immediately (optimistic), no errors
3. Toggle "Perfil Público" off — should persist after leaving and returning to screen
4. Press "Permisos de Ubicación" — should open OS settings app
5. Press "Descargar Mis Datos" — should show "Próximamente" alert
6. Press "Eliminar Cuenta" — should show confirmation dialog; press "Cancelar" to dismiss
7. Section title changed from "PREFERENCIAS DE CICLISMO" to "NOTIFICACIONES"

- [ ] **Step 4: Commit**

```bash
git add src/features/profile/screens/AppSettingsScreen.tsx
git commit -m "feat(settings): wire AppSettingsScreen to store with real functionality

Connects all toggles to useSettingsStore with optimistic Supabase sync.
Location permission reads from OS. Delete account shows confirmation modal
with soft-delete. Descargar Mis Datos shows placeholder toast."
```

---

## Summary

| Task | What it does | Files |
|------|-------------|-------|
| 1 | API layer: fetchSettings + updateSettings for preferences JSONB | `api.ts` |
| 2 | Zustand store with optimistic updates and Supabase sync | `useSettingsStore.ts` (new) |
| 3 | Wire screen to real data, location, delete modal, toast | `AppSettingsScreen.tsx` |
