# Google Auth Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 14 tests covering Google sign-in/sign-up flows at the store and screen levels.

**Architecture:** Store-level unit tests exercise every branch of `signInWithGoogle()` in `authStore.ts`. Screen-level integration tests verify button rendering, handler invocation, and Alert behavior for both `LoginScreenComponent` and `RegisterScreenComponent`.

**Tech Stack:** Jest, @testing-library/react-native, jest-expo, existing Supabase/WebBrowser/AuthSession mocks.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/features/auth/__tests__/authStore.test.ts` | Modify | Add `describe('signInWithGoogle')` block with 6 tests |
| `src/features/auth/__tests__/googleSignIn.test.tsx` | Create | Screen integration tests: 4 for Login + 4 for Register |

---

### Task 1: Add signInWithGoogle store tests

**Files:**
- Modify: `src/features/auth/__tests__/authStore.test.ts` (append after line 141)

- [ ] **Step 1: Add WebBrowser import and typed mock**

At the top of `authStore.test.ts`, after the existing imports (line 31-32), add:

```ts
import * as WebBrowser from 'expo-web-browser'

const mockWebBrowser = WebBrowser as jest.Mocked<typeof WebBrowser>
```

- [ ] **Step 2: Write the 6 signInWithGoogle tests**

Append the following `describe` block at the end of the file (after the `initialize` describe block):

```ts
// ─── signInWithGoogle ─────────────────────────────────────────────────

describe('signInWithGoogle', () => {
  const successUrl =
    'kaeloappproduction://auth/callback#access_token=mock-at&refresh_token=mock-rt'

  it('completes the full OAuth flow and sets the session', async () => {
    mockAuth.signInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2' },
      error: null,
    } as any)
    mockWebBrowser.openAuthSessionAsync.mockResolvedValueOnce({
      type: 'success',
      url: successUrl,
    } as any)
    mockAuth.setSession.mockResolvedValueOnce({
      data: { session: {} },
      error: null,
    } as any)

    const { error } = await useAuthStore.getState().signInWithGoogle()

    expect(error).toBeNull()
    expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'kaeloappproduction://auth/callback',
        skipBrowserRedirect: false,
      },
    })
    expect(mockWebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
      'https://accounts.google.com/o/oauth2',
      'kaeloappproduction://auth/callback',
    )
    expect(mockAuth.setSession).toHaveBeenCalledWith({
      access_token: 'mock-at',
      refresh_token: 'mock-rt',
    })
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('returns OAuthCancelled when the user dismisses the browser', async () => {
    mockAuth.signInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2' },
      error: null,
    } as any)
    mockWebBrowser.openAuthSessionAsync.mockResolvedValueOnce({
      type: 'cancel',
    } as any)

    const { error } = await useAuthStore.getState().signInWithGoogle()

    expect(error).toEqual(
      expect.objectContaining({ name: 'OAuthCancelled' }),
    )
    expect(mockAuth.setSession).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('returns the error when signInWithOAuth fails', async () => {
    const oauthError = { message: 'OAuth config error', name: 'AuthError' }
    mockAuth.signInWithOAuth.mockResolvedValueOnce({
      data: { url: null },
      error: oauthError,
    } as any)

    const { error } = await useAuthStore.getState().signInWithGoogle()

    expect(error).toEqual(oauthError)
    expect(mockWebBrowser.openAuthSessionAsync).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('returns OAuthError when the callback URL has no tokens', async () => {
    mockAuth.signInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2' },
      error: null,
    } as any)
    mockWebBrowser.openAuthSessionAsync.mockResolvedValueOnce({
      type: 'success',
      url: 'kaeloappproduction://auth/callback',
    } as any)

    const { error } = await useAuthStore.getState().signInWithGoogle()

    expect(error).toEqual(
      expect.objectContaining({
        name: 'OAuthError',
        message: 'No se recibieron tokens de autenticación',
      }),
    )
    expect(mockAuth.setSession).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('returns the session error when setSession fails', async () => {
    const sessionError = { message: 'Session expired', name: 'AuthError' }
    mockAuth.signInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2' },
      error: null,
    } as any)
    mockWebBrowser.openAuthSessionAsync.mockResolvedValueOnce({
      type: 'success',
      url: successUrl,
    } as any)
    mockAuth.setSession.mockResolvedValueOnce({
      data: { session: null },
      error: sessionError,
    } as any)

    const { error } = await useAuthStore.getState().signInWithGoogle()

    expect(error).toEqual(sessionError)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('catches unexpected exceptions and returns OAuthError', async () => {
    mockAuth.signInWithOAuth.mockRejectedValueOnce(new Error('Network down'))

    const { error } = await useAuthStore.getState().signInWithGoogle()

    expect(error).toEqual(
      expect.objectContaining({ name: 'OAuthError', message: 'Network down' }),
    )
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})
```

- [ ] **Step 3: Run the store tests to verify they pass**

Run: `npx jest src/features/auth/__tests__/authStore.test.ts --verbose`
Expected: All existing tests still pass + 6 new `signInWithGoogle` tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/__tests__/authStore.test.ts
git commit -m "test: add signInWithGoogle store tests (6 cases)"
```

---

### Task 2: Create screen-level Google sign-in tests

**Files:**
- Create: `src/features/auth/__tests__/googleSignIn.test.tsx`

- [ ] **Step 1: Create the test file with mocks and LoginScreenComponent tests**

Create `src/features/auth/__tests__/googleSignIn.test.tsx`:

```tsx
import React from 'react'
import { Alert } from 'react-native'
import { render, fireEvent, waitFor } from '@testing-library/react-native'

// ─── Mocks (must be before component imports) ─────────────────────────

const mockSignInWithGoogle = jest.fn()
const mockSignInWithEmail = jest.fn()
const mockSignUpWithEmail = jest.fn()
const mockCheckEmailExists = jest.fn()

jest.mock('@/shared/store/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = {
      signInWithGoogle: mockSignInWithGoogle,
      signInWithEmail: mockSignInWithEmail,
      signUpWithEmail: mockSignUpWithEmail,
      checkEmailExists: mockCheckEmailExists,
      isLoading: false,
    }
    return selector(state)
  },
}))

jest.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#000',
      textSecondary: '#666',
      textTertiary: '#999',
      textInverse: '#fff',
      background: '#fff',
      backgroundSecondary: '#f5f5f5',
      surface: '#fff',
      surfaceSecondary: '#eee',
      border: '#ddd',
      borderLight: '#eee',
      primary: '#10B981',
      primaryLight: '#D1FAE5',
      primaryDark: '#047857',
      tint: '#10B981',
    },
    isDark: false,
    theme: 'light',
  }),
}))

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
}))

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}))

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => null,
}))

// ─── Component imports (after mocks) ─────────────────────────────────

import LoginScreenComponent from '@/features/auth/screens/LoginScreenComponent'
import RegisterScreenComponent from '@/features/auth/screens/RegisterScreenComponent'

// ─── Setup ────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

jest.spyOn(Alert, 'alert')

// ─── LoginScreenComponent ─────────────────────────────────────────────

describe('LoginScreenComponent – Google sign-in', () => {
  it('renders the Google sign-in button', () => {
    const { getByText } = render(<LoginScreenComponent />)
    expect(getByText('Continuar con Google')).toBeTruthy()
  })

  it('calls signInWithGoogle when the Google button is pressed', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({ error: null })
    const { getByText } = render(<LoginScreenComponent />)

    fireEvent.press(getByText('Continuar con Google'))

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
    })
  })

  it('shows an Alert when Google sign-in returns an error', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({
      error: { message: 'Something went wrong', name: 'OAuthError' },
    })
    const { getByText } = render(<LoginScreenComponent />)

    fireEvent.press(getByText('Continuar con Google'))

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Something went wrong',
      )
    })
  })

  it('does NOT show an Alert when the user cancels OAuth', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({
      error: { message: 'Cancelled', name: 'OAuthCancelled' },
    })
    const { getByText } = render(<LoginScreenComponent />)

    fireEvent.press(getByText('Continuar con Google'))

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
    })
    expect(Alert.alert).not.toHaveBeenCalled()
  })
})

// ─── RegisterScreenComponent ──────────────────────────────────────────

describe('RegisterScreenComponent – Google sign-in', () => {
  it('renders the Google sign-in button', () => {
    const { getByText } = render(<RegisterScreenComponent />)
    expect(getByText('Continuar con Google')).toBeTruthy()
  })

  it('calls signInWithGoogle when the Google button is pressed', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({ error: null })
    const { getByText } = render(<RegisterScreenComponent />)

    fireEvent.press(getByText('Continuar con Google'))

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
    })
  })

  it('shows an Alert when Google sign-in returns an error', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({
      error: { message: 'Something went wrong', name: 'OAuthError' },
    })
    const { getByText } = render(<RegisterScreenComponent />)

    fireEvent.press(getByText('Continuar con Google'))

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Something went wrong',
      )
    })
  })

  it('does NOT show an Alert when the user cancels OAuth', async () => {
    mockSignInWithGoogle.mockResolvedValueOnce({
      error: { message: 'Cancelled', name: 'OAuthCancelled' },
    })
    const { getByText } = render(<RegisterScreenComponent />)

    fireEvent.press(getByText('Continuar con Google'))

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
    })
    expect(Alert.alert).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the screen tests to verify they pass**

Run: `npx jest src/features/auth/__tests__/googleSignIn.test.tsx --verbose`
Expected: 8 tests pass (4 Login + 4 Register).

- [ ] **Step 3: Run the full auth test suite**

Run: `npx jest src/features/auth/__tests__/ --verbose`
Expected: All 14+ auth tests pass (existing + new store + new screen tests).

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/__tests__/googleSignIn.test.tsx
git commit -m "test: add Google sign-in screen tests for Login and Register"
```