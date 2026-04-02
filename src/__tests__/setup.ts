// Stub required env vars so @/config/env.ts Zod validation passes during tests
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-for-jest'
process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test_mapbox_token'
process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_stripe'

// Silence noisy React Native warnings in test output
jest.spyOn(console, 'warn').mockImplementation(() => {})

// Keep console.error visible — failing tests often surface real errors here
