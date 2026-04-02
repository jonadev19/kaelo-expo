# Google Auth Tests Design

## Overview

Add unit and integration tests for the Google sign-in and sign-up flows, covering both the `signInWithGoogle()` store action and the UI behavior of `LoginScreenComponent` and `RegisterScreenComponent`.

## Scope

- **In scope:** authStore `signInWithGoogle` unit tests, Login/Register screen integration tests for the Google button
- **Out of scope:** `auth/callback.tsx` route, E2E tests, actual OAuth flow

## Part 1: Store Tests — `authStore.test.ts`

New `describe('signInWithGoogle')` block added to the existing test file. Uses the already-configured mocks for `expo-web-browser`, `expo-auth-session`, and `supabase.auth`.

### Test Cases

1. **Flujo exitoso completo**
   - `signInWithOAuth` returns `{ data: { url: '...' }, error: null }`
   - `openAuthSessionAsync` returns `{ type: 'success', url: 'scheme://callback#access_token=AT&refresh_token=RT' }`
   - Asserts `setSession` called with `{ access_token: 'AT', refresh_token: 'RT' }`
   - Returns `{ error: null }`

2. **Usuario cancela OAuth**
   - `openAuthSessionAsync` returns `{ type: 'cancel' }`
   - Returns error with `name: 'OAuthCancelled'`
   - `setSession` never called

3. **Error en signInWithOAuth**
   - `signInWithOAuth` returns `{ data: null, error: { message: 'OAuth failed' } }`
   - `openAuthSessionAsync` never called
   - Returns the Supabase error

4. **Callback sin tokens**
   - `openAuthSessionAsync` returns success but URL has no hash fragment
   - Returns error with `name: 'OAuthError'` and message about missing tokens

5. **Error al establecer sesión**
   - `setSession` returns `{ error: { message: 'Session error' } }`
   - Returns the session error

6. **isLoading se maneja correctamente**
   - Verify `isLoading` is `false` after successful completion
   - Verify `isLoading` is `false` after error/cancellation

## Part 2: Screen Tests — `googleSignIn.test.tsx`

New file at `src/features/auth/__tests__/googleSignIn.test.tsx`.

### Mocks Required

- `@/shared/store/authStore` — mock `useAuthStore` to return controlled `signInWithGoogle` and `isLoading`
- `@/shared/hooks/useTheme` — return a static colors object
- `expo-router` — mock `router.replace` and `router.push`
- `react-native-safe-area-context` — mock `SafeAreaView` as a plain `View`
- `@expo/vector-icons` — mock `MaterialIcons` as a plain `Text`
- `react-native` `Alert.alert` — spy to verify calls

### Test Cases — LoginScreenComponent

1. **Renderiza el boton de Google** — finds element with text "Continuar con Google"
2. **Tap invoca signInWithGoogle** — `fireEvent.press` on the button, assert `signInWithGoogle` was called
3. **Error muestra Alert** — mock `signInWithGoogle` to return `{ error: { message: 'fail', name: 'OAuthError' } }`, assert `Alert.alert` called
4. **Cancelacion no muestra Alert** — mock returns `{ error: { name: 'OAuthCancelled' } }`, assert `Alert.alert` NOT called

### Test Cases — RegisterScreenComponent

Same 4 test cases as Login, in a separate `describe` block. The handler logic is identical but lives in a different component.

## File Changes Summary

| File | Action |
|------|--------|
| `src/features/auth/__tests__/authStore.test.ts` | Add `describe('signInWithGoogle')` with 6 tests |
| `src/features/auth/__tests__/googleSignIn.test.tsx` | New file with 8 tests (4 Login + 4 Register) |

## Total: 14 new tests