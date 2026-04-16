# Settings Functionality — Design Spec

## Overview

Implement real functionality for all toggles and actions in `AppSettingsScreen`. Currently all handlers are `() => {}` placeholders except "Cerrar Sesion". This spec covers connecting each setting to Supabase and device APIs.

## Architecture

**Approach:** Zustand store (`useSettingsStore`) with optimistic UI updates and Supabase sync.

### Store: `src/shared/store/useSettingsStore.ts`

```ts
interface SettingsState {
  notifications: {
    push_enabled: boolean;
    order_status: boolean;
    badge_earned: boolean;
    coupon_unlocked: boolean;
    email_enabled: boolean;
  };
  privacy: {
    show_profile: boolean;
    show_in_rankings: boolean;
  };
  isLoading: boolean;

  loadSettings: (userId: string) => Promise<void>;
  toggleNotification: (key: keyof SettingsState['notifications'], value: boolean) => Promise<void>;
  togglePrivacy: (key: keyof SettingsState['privacy'], value: boolean) => Promise<void>;
}
```

**Optimistic updates:** Each toggle immediately updates the local state, then syncs to Supabase. If the API call fails, the toggle reverts and shows an error alert.

### Mapping: UI toggles to database columns

| UI Label | Table | Column |
|----------|-------|--------|
| Notificaciones Push | `notification_preferences` | `push_enabled` |
| Actualizaciones de Pedidos | `notification_preferences` | `order_status` |
| Nuevos Logros | `notification_preferences` | `badge_earned` |
| Ofertas y Cupones | `notification_preferences` | `coupon_unlocked` |
| Emails Promocionales | `notification_preferences` | `email_enabled` |
| Perfil Publico | `profiles` | `privacy_settings.show_profile` |
| Aparecer en Rankings | `profiles` | `privacy_settings.show_in_rankings` |

### API functions: `src/features/profile/api.ts`

Add:
- `fetchNotificationPreferences(userId: string)` — select from `notification_preferences` where `user_id = userId`
- `upsertNotificationPreferences(userId: string, updates: Partial<NotificationPrefs>)` — upsert to `notification_preferences`
- `updatePrivacySettings(userId: string, updates: Partial<PrivacySettings>)` — update `profiles.privacy_settings` JSONB merge

## Per-setting behavior

### Permisos de Ubicacion (value variant)
- On mount: read current permission from `useLocationStore.permission`
- Display mapped value: `granted` → "Siempre", `denied` → "Denegado", `undetermined` → "No definido"
- On press: call `Linking.openSettings()` to open OS settings

### Descargar Mis Datos
- On press: show Toast/Alert "Proximamente"

### Eliminar Cuenta
- On press: show confirmation modal ("Esta accion no se puede deshacer. Tu cuenta sera desactivada.")
- On confirm: set `profiles.is_active = false` (or `deleted_at = now()`), then call `signOut()`
- Requires adding a `deleted_at` or `is_active` field to profiles if not present. Check database.types.ts for existing field. If no field exists, use `privacy_settings` JSONB to store `{ deactivated: true }` as a lightweight alternative without migration.

### Cerrar Sesion
- Already functional via `handleLogout`.

## Files to create

- `src/shared/store/useSettingsStore.ts`

## Files to modify

- `src/features/profile/api.ts` — add notification prefs + privacy API functions
- `src/features/profile/screens/AppSettingsScreen.tsx` — connect store, location, modals

## Out of scope

- Descargar Mis Datos full implementation (placeholder toast only)
- Hard-delete account flow
- Quiet hours settings
- SMS notification preferences
