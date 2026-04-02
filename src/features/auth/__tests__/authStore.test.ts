jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    functions: { invoke: jest.fn() },
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithOAuth: jest.fn(),
      setSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  },
}))

// expo-web-browser is called at module level (maybeCompleteAuthSession)
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}))

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'kaeloappproduction://auth/callback'),
}))

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/shared/store/authStore'

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>

beforeEach(() => {
  jest.clearAllMocks()
  // Reset store to initial state between tests
  useAuthStore.setState({
    session: null,
    user: null,
    isLoading: true,
    isInitialized: false,
  })
})

// ─── signInWithEmail ──────────────────────────────────────────────────

describe('signInWithEmail', () => {
  it('calls supabase signInWithPassword with provided credentials', async () => {
    mockAuth.signInWithPassword.mockResolvedValueOnce({ error: null } as any)

    const { error } = await useAuthStore.getState().signInWithEmail(
      'user@test.com',
      'password123',
    )

    expect(error).toBeNull()
    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password123',
    })
  })

  it('returns the error without throwing when credentials are invalid', async () => {
    const authError = { message: 'Invalid login credentials', name: 'AuthError' }
    mockAuth.signInWithPassword.mockResolvedValueOnce({ error: authError } as any)

    const { error } = await useAuthStore.getState().signInWithEmail(
      'user@test.com',
      'wrong-password',
    )

    expect(error).toEqual(authError)
    // Store should not have updated user state
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('sets isLoading to false after the call completes', async () => {
    mockAuth.signInWithPassword.mockResolvedValueOnce({ error: null } as any)

    await useAuthStore.getState().signInWithEmail('user@test.com', 'pass')

    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})

// ─── signUpWithEmail ───────────────────────────────────────────────────

describe('signUpWithEmail', () => {
  it('calls supabase signUp with email and password', async () => {
    mockAuth.signUp.mockResolvedValueOnce({ error: null } as any)

    const { error } = await useAuthStore.getState().signUpWithEmail(
      'new@test.com',
      'newpass123',
    )

    expect(error).toBeNull()
    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'newpass123',
    })
  })
})

// ─── signOut ──────────────────────────────────────────────────────────

describe('signOut', () => {
  it('calls supabase signOut and sets isLoading to false', async () => {
    mockAuth.signOut.mockResolvedValueOnce({ error: null } as any)

    await useAuthStore.getState().signOut()

    expect(mockAuth.signOut).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})

// ─── initialize ───────────────────────────────────────────────────────

describe('initialize', () => {
  it('fetches the initial session and sets isInitialized to true', async () => {
    const fakeSession = { user: { id: 'user-123', email: 'user@test.com' } }
    mockAuth.getSession.mockResolvedValueOnce({
      data: { session: fakeSession },
    } as any)

    const cleanup = useAuthStore.getState().initialize()

    // Wait for the async getSession promise to resolve
    await Promise.resolve()
    await Promise.resolve() // double tick for .then chaining

    expect(useAuthStore.getState().isInitialized).toBe(true)
    expect(useAuthStore.getState().user).toEqual(fakeSession.user)

    // Cleanup should unsubscribe
    expect(typeof cleanup).toBe('function')
    cleanup()
  })
})