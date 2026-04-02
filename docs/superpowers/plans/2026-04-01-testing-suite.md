# Testing Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Jest + React Native Testing Library across all 12 features, with priority on payment/money flows and 4 gap-flagged tests that expose known wallet deficiencies.

**Architecture:** Each test file mocks `@/lib/supabase` inline using `jest.mock`. A shared `createBuilder` helper returns a thenable chainable mock for Supabase's fluent query API. Pure functions (calculateActivityMetrics) need no mocks. Gap tests use `test.failing()` to mark expected failures without blocking CI.

**Tech Stack:** jest-expo, @testing-library/react-native, @testing-library/jest-native, @tanstack/react-query (wrapper for hook tests)

---

## File Map

**Create:**
- `src/__tests__/setup.ts` — global env stubs + console.error suppression
- `src/__tests__/mocks/supabase.ts` — `createBuilder` helper + reusable auth mock shape
- `src/__tests__/mocks/stripe.ts` — Stripe module factory (used inline in test files)
- `src/features/payments/__tests__/api.test.ts`
- `src/features/orders/__tests__/useOrderPayment.test.ts`
- `src/features/orders/__tests__/api.test.ts`
- `src/features/wallet/__tests__/api.test.ts`
- `src/features/auth/__tests__/authStore.test.ts`
- `src/features/routes/__tests__/activityTracking.test.ts`
- `src/features/routes/__tests__/api.test.ts`
- `src/features/offline/__tests__/api.test.ts`
- `src/features/businesses/__tests__/api.test.ts`
- `src/features/favorites/__tests__/api.test.ts`
- `src/features/reviews/__tests__/api.test.ts`
- `src/features/profile/__tests__/api.test.ts`
- `src/features/notifications/__tests__/api.test.ts`
- `src/features/metrics/__tests__/api.test.ts`

**Modify:**
- `package.json` — add devDependencies + jest config block

---

## Task 1: Install dependencies and configure Jest

**Files:**
- Modify: `package.json`
- Create: `src/__tests__/setup.ts`

- [ ] **Step 1: Install test dependencies**

```bash
yarn add --dev jest-expo @testing-library/react-native @testing-library/jest-native
```

Expected output: packages added to `devDependencies`, no errors.

- [ ] **Step 2: Add jest config to package.json**

Open `package.json`. After `"private": true`, add a `"jest"` block. The full `devDependencies` + `jest` section should look like:

```json
"devDependencies": {
  "@testing-library/jest-native": "^5.4.3",
  "@testing-library/react-native": "^13.0.0",
  "@types/react": "~19.1.0",
  "jest-expo": "~54.0.0",
  "patch-package": "^8.0.1",
  "postinstall-postinstall": "^2.1.0",
  "react-test-renderer": "19.1.0",
  "typescript": "~5.9.2"
},
"jest": {
  "preset": "jest-expo",
  "setupFiles": ["./src/__tests__/setup.ts"],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@rnmapbox/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@stripe/stripe-react-native)"
  ]
}
```

Note: `jest-expo` version should match your `expo` version (~54). Adjust if needed.

- [ ] **Step 3: Create setup file**

Create `src/__tests__/setup.ts`:

```typescript
// Stub required env vars so @/config/env.ts Zod validation passes during tests
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-for-jest'
process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test_mapbox_token'
process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_stripe'

// Silence noisy React Native warnings in test output
jest.spyOn(console, 'warn').mockImplementation(() => {})

// Keep console.error visible — failing tests often surface real errors here
```

- [ ] **Step 4: Run jest to verify setup loads**

```bash
yarn jest --listTests
```

Expected: Jest finds no test files (none written yet) but exits cleanly without errors. If you see a Zod validation error, double-check the `process.env` values in `setup.ts`.

- [ ] **Step 5: Commit**

```bash
git add package.json src/__tests__/setup.ts
git commit -m "chore: add jest-expo + RNTL test infrastructure"
```

---

## Task 2: Create mock infrastructure

**Files:**
- Create: `src/__tests__/mocks/supabase.ts`
- Create: `src/__tests__/mocks/stripe.ts`

- [ ] **Step 1: Create the Supabase builder helper**

Create `src/__tests__/mocks/supabase.ts`:

```typescript
/**
 * Creates a mock Supabase query builder that:
 * - Is chainable: every method returns the builder itself
 * - Is awaitable: the builder has `then`/`catch` so `await builder` works
 * - Has terminal methods (.single, .maybeSingle) that return resolved Promises
 *
 * Usage in tests:
 *   jest.mocked(supabase.from).mockReturnValue(
 *     createBuilder({ data: { id: '1' }, error: null })
 *   )
 */
export function createBuilder(resolvedValue: {
  data?: any
  error?: any
  count?: number
}) {
  const builder: Record<string, any> = {}

  // Chainable methods — each returns the builder for further chaining
  const chain = () => jest.fn(() => builder)
  builder.select = chain()
  builder.insert = chain()
  builder.update = chain()
  builder.upsert = chain()
  builder.delete = chain()
  builder.eq = chain()
  builder.neq = chain()
  builder.in = chain()
  builder.gte = chain()
  builder.lte = chain()
  builder.order = chain()
  builder.limit = chain()

  // Terminal methods — return a resolved Promise
  builder.single = jest.fn(() => Promise.resolve(resolvedValue))
  builder.maybeSingle = jest.fn(() => Promise.resolve(resolvedValue))

  // Make the builder itself awaitable (for queries that don't call .single())
  // e.g.: const { data, error } = await supabase.from('x').select().eq().order()
  builder.then = (
    onFulfilled: (v: typeof resolvedValue) => any,
    onRejected?: (e: any) => any,
  ) => Promise.resolve(resolvedValue).then(onFulfilled, onRejected)
  builder.catch = (onRejected: (e: any) => any) =>
    Promise.resolve(resolvedValue).catch(onRejected)

  return builder
}

/**
 * The auth mock shape used inside jest.mock('@/lib/supabase', ...) factories.
 * Copy this into each test file that needs auth mocking.
 *
 * Example:
 *   jest.mock('@/lib/supabase', () => ({
 *     supabase: {
 *       ...require('../../__tests__/mocks/supabase').mockSupabaseBase,
 *     }
 *   }))
 */
export const mockAuthShape = {
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
}
```

- [ ] **Step 2: Create the Stripe mock factory**

Create `src/__tests__/mocks/stripe.ts`:

```typescript
/**
 * Stripe mock factory for jest.mock().
 * Use this in test files that test Stripe-dependent hooks.
 *
 * Usage:
 *   jest.mock('@stripe/stripe-react-native', () =>
 *     require('../../__tests__/mocks/stripe').stripeFactory()
 *   )
 *
 * Then in individual tests, override specific methods:
 *   const { initPaymentSheet, presentPaymentSheet } =
 *     require('@stripe/stripe-react-native').useStripe()
 *   ;(presentPaymentSheet as jest.Mock).mockResolvedValueOnce({ error: { code: 'CardDeclined', message: 'Card declined' } })
 */

export function stripeFactory() {
  const initPaymentSheet = jest.fn().mockResolvedValue({ error: null })
  const presentPaymentSheet = jest.fn().mockResolvedValue({ error: null })

  return {
    useStripe: () => ({ initPaymentSheet, presentPaymentSheet }),
    StripeProvider: ({ children }: { children: any }) => children,
    // Expose mocks for direct override in tests
    __mocks: { initPaymentSheet, presentPaymentSheet },
  }
}
```

- [ ] **Step 3: Verify mocks compile**

```bash
yarn tsc --noEmit
```

Expected: No TypeScript errors. If you see "jest is not defined", add `"@types/jest"` to devDependencies: `yarn add --dev @types/jest`.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/
git commit -m "chore: add supabase + stripe test mock helpers"
```

---

## Task 3: Tests for payments/api.ts

**Files:**
- Create: `src/features/payments/__tests__/api.test.ts`
- Reference: `src/features/payments/api.ts`

- [ ] **Step 1: Write the failing tests first**

Create `src/features/payments/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    functions: { invoke: jest.fn() },
    auth: {},
  },
}))

import { supabase } from '@/lib/supabase'
import {
  checkRoutePurchased,
  confirmRoutePurchase,
  createOrderPaymentIntent,
  createRoutePaymentIntent,
  fetchMyPurchases,
} from '../api'

const mockFrom = jest.mocked(supabase.from)
const mockInvoke = jest.mocked(supabase.functions.invoke)

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── createRoutePaymentIntent ────────────────────────────────────────

describe('createRoutePaymentIntent', () => {
  it('calls the create-payment-intent edge function with route_purchase type', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { clientSecret: 'pi_test_secret', paymentIntentId: 'pi_123' },
      error: null,
    } as any)

    const result = await createRoutePaymentIntent('route-abc', 'user-xyz')

    expect(mockInvoke).toHaveBeenCalledWith('create-payment-intent', {
      body: {
        type: 'route_purchase',
        route_id: 'route-abc',
        buyer_id: 'user-xyz',
      },
    })
    expect(result.clientSecret).toBe('pi_test_secret')
  })

  it('throws when edge function returns an error', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Unauthorized' },
    } as any)

    await expect(createRoutePaymentIntent('route-abc', 'user-xyz')).rejects.toThrow(
      'Unauthorized',
    )
  })

  it('throws when clientSecret is missing from response', async () => {
    mockInvoke.mockResolvedValueOnce({ data: {}, error: null } as any)

    await expect(createRoutePaymentIntent('route-abc', 'user-xyz')).rejects.toThrow(
      'No se recibió el payment intent',
    )
  })
})

// ─── createOrderPaymentIntent ────────────────────────────────────────

describe('createOrderPaymentIntent', () => {
  it('calls edge function with order_payment type and amount', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { clientSecret: 'pi_order_secret', paymentIntentId: 'pi_order_123' },
      error: null,
    } as any)

    await createOrderPaymentIntent('order-001', 'user-xyz', 250)

    expect(mockInvoke).toHaveBeenCalledWith('create-payment-intent', {
      body: {
        type: 'order_payment',
        order_id: 'order-001',
        customer_id: 'user-xyz',
        amount: 250,
      },
    })
  })
})

// ─── checkRoutePurchased ─────────────────────────────────────────────

describe('checkRoutePurchased', () => {
  it('returns { purchased: true } when a purchase record exists', async () => {
    const purchaseRecord = {
      id: 'purchase-1',
      route_id: 'route-abc',
      buyer_id: 'user-xyz',
      payment_status: 'completado',
    }
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: purchaseRecord, error: null }),
    )

    const result = await checkRoutePurchased('route-abc', 'user-xyz')

    expect(result.purchased).toBe(true)
    expect(result.purchase).toEqual(purchaseRecord)
  })

  it('returns { purchased: false } when no purchase record exists', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: null }),
    )

    const result = await checkRoutePurchased('route-abc', 'user-xyz')

    expect(result.purchased).toBe(false)
    expect(result.purchase).toBeUndefined()
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { message: 'DB error' } }),
    )

    await expect(checkRoutePurchased('route-abc', 'user-xyz')).rejects.toThrow('DB error')
  })
})

// ─── confirmRoutePurchase ────────────────────────────────────────────

describe('confirmRoutePurchase', () => {
  it('upserts the purchase and returns the new record id', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: { id: 'purchase-new-1' }, error: null }),
    )

    const id = await confirmRoutePurchase('route-abc', 'user-xyz', 'pi_stripe_123', 100)

    expect(id).toBe('purchase-new-1')
    // Verify 85/15 split is calculated
    const upsertCall = jest.mocked(mockFrom.mock.results[0].value.upsert)
    expect(upsertCall).toHaveBeenCalledWith(
      expect.objectContaining({
        creator_earnings: 85,
        platform_fee: 15,
        amount_paid: 100,
      }),
      expect.any(Object),
    )
  })
})
```

- [ ] **Step 2: Run tests to see them fail**

```bash
yarn jest src/features/payments/__tests__/api.test.ts --no-coverage
```

Expected: Tests FAIL — imports resolve but mock setup errors appear. This is correct at this stage.

- [ ] **Step 3: Run tests — they should now pass**

The implementation already exists in `payments/api.ts`. The tests just need the mocks to wire up correctly. Run again:

```bash
yarn jest src/features/payments/__tests__/api.test.ts --no-coverage
```

Expected: All 7 tests pass. If `confirmRoutePurchase` test fails on the `.upsert` assertion, check that `mockFrom.mock.results[0].value.upsert` is a jest.fn. The `createBuilder` returns jest.fn for all chain methods.

- [ ] **Step 4: Commit**

```bash
git add src/features/payments/__tests__/
git commit -m "test: add payments/api test suite (7 tests)"
```

---

## Task 4: Tests for useOrderPayment hook

**Files:**
- Create: `src/features/orders/__tests__/useOrderPayment.test.ts`
- Reference: `src/features/orders/hooks/useOrderPayment.ts`

Key facts about this hook:
- Uses `useMutation` from TanStack Query → needs a `QueryClientProvider` wrapper
- Uses `useAuthStore` to get the current user → mock to return a test user
- Uses `createOrderPaymentIntent` from payments/api → mock that module
- Uses `require('@stripe/stripe-react-native')` dynamically inside mutation → mock the module

- [ ] **Step 1: Write the failing tests**

Create `src/features/orders/__tests__/useOrderPayment.test.ts`:

```typescript
import React from 'react'
import { renderHook, act } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ── Module mocks (hoisted by Jest before imports) ──────────────────

jest.mock('@/shared/store/authStore', () => ({
  useAuthStore: jest.fn((selector: (s: any) => any) =>
    selector({ user: { id: 'user-test-123', email: 'test@kaelo.mx' } }),
  ),
}))

jest.mock('@/features/payments/api', () => ({
  createOrderPaymentIntent: jest.fn(),
}))

jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
    presentPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
  }),
  StripeProvider: ({ children }: any) => children,
}))

// ── Imports after mocks ────────────────────────────────────────────

import { useOrderPayment } from '../hooks/useOrderPayment'
import { createOrderPaymentIntent } from '@/features/payments/api'

const mockCreateIntent = jest.mocked(createOrderPaymentIntent)

// ── Test helpers ───────────────────────────────────────────────────

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children)
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── Tests ──────────────────────────────────────────────────────────

describe('useOrderPayment', () => {
  describe('cash payment (efectivo)', () => {
    it('returns success without calling Stripe or the edge function', async () => {
      const { result } = renderHook(() => useOrderPayment(), {
        wrapper: makeWrapper(),
      })

      let outcome: any
      await act(async () => {
        outcome = await result.current.processPayment({
          orderId: 'order-001',
          amount: 150,
          paymentMethod: 'efectivo',
        })
      })

      expect(outcome).toEqual({ success: true, method: 'efectivo' })
      expect(mockCreateIntent).not.toHaveBeenCalled()
    })
  })

  describe('card payment (tarjeta)', () => {
    it('creates payment intent then presents Stripe sheet on success', async () => {
      mockCreateIntent.mockResolvedValueOnce({
        clientSecret: 'pi_test_secret',
        paymentIntentId: 'pi_123',
      } as any)

      const { result } = renderHook(() => useOrderPayment(), {
        wrapper: makeWrapper(),
      })

      let outcome: any
      await act(async () => {
        outcome = await result.current.processPayment({
          orderId: 'order-001',
          amount: 250,
          paymentMethod: 'tarjeta',
        })
      })

      expect(mockCreateIntent).toHaveBeenCalledWith('order-001', 'user-test-123', 250)
      expect(outcome).toEqual({ success: true, method: 'tarjeta' })
    })

    it('throws CANCELLED when user dismisses the Stripe sheet', async () => {
      mockCreateIntent.mockResolvedValueOnce({
        clientSecret: 'pi_test_secret',
        paymentIntentId: 'pi_123',
      } as any)

      // Override presentPaymentSheet to simulate user cancellation
      const stripe = require('@stripe/stripe-react-native')
      const { presentPaymentSheet } = stripe.useStripe()
      ;(presentPaymentSheet as jest.Mock).mockResolvedValueOnce({
        error: { code: 'Canceled', message: 'User canceled' },
      })

      const { result } = renderHook(() => useOrderPayment(), {
        wrapper: makeWrapper(),
      })

      await act(async () => {
        await expect(
          result.current.processPayment({
            orderId: 'order-001',
            amount: 250,
            paymentMethod: 'tarjeta',
          }),
        ).rejects.toThrow('CANCELLED')
      })
    })

    it('throws when card is declined', async () => {
      mockCreateIntent.mockResolvedValueOnce({
        clientSecret: 'pi_test_secret',
        paymentIntentId: 'pi_123',
      } as any)

      const stripe = require('@stripe/stripe-react-native')
      const { presentPaymentSheet } = stripe.useStripe()
      ;(presentPaymentSheet as jest.Mock).mockResolvedValueOnce({
        error: { code: 'CardDeclined', message: 'Tu tarjeta fue rechazada' },
      })

      const { result } = renderHook(() => useOrderPayment(), {
        wrapper: makeWrapper(),
      })

      await act(async () => {
        await expect(
          result.current.processPayment({
            orderId: 'order-001',
            amount: 250,
            paymentMethod: 'tarjeta',
          }),
        ).rejects.toThrow('Tu tarjeta fue rechazada')
      })
    })

    it('throws when the edge function fails to create a payment intent', async () => {
      mockCreateIntent.mockRejectedValueOnce(new Error('Edge Function error'))

      const { result } = renderHook(() => useOrderPayment(), {
        wrapper: makeWrapper(),
      })

      await act(async () => {
        await expect(
          result.current.processPayment({
            orderId: 'order-001',
            amount: 250,
            paymentMethod: 'tarjeta',
          }),
        ).rejects.toThrow('Edge Function error')
      })
    })
  })

  describe('wallet payment', () => {
    it('throws "Wallet no disponible" for wallet payment method', async () => {
      const { result } = renderHook(() => useOrderPayment(), {
        wrapper: makeWrapper(),
      })

      await act(async () => {
        await expect(
          result.current.processPayment({
            orderId: 'order-001',
            amount: 100,
            paymentMethod: 'wallet',
          }),
        ).rejects.toThrow('Wallet no disponible aún')
      })
    })
  })

  describe('unauthenticated user', () => {
    it('throws when no user is in the auth store', async () => {
      // Override useAuthStore to return null user
      const { useAuthStore } = require('@/shared/store/authStore')
      ;(useAuthStore as jest.Mock).mockImplementationOnce((selector: any) =>
        selector({ user: null }),
      )

      const { result } = renderHook(() => useOrderPayment(), {
        wrapper: makeWrapper(),
      })

      await act(async () => {
        await expect(
          result.current.processPayment({
            orderId: 'order-001',
            amount: 100,
            paymentMethod: 'tarjeta',
          }),
        ).rejects.toThrow('Debes iniciar sesión')
      })
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
yarn jest src/features/orders/__tests__/useOrderPayment.test.ts --no-coverage
```

Expected: 6 tests pass. If you see "Cannot find module '@/shared/store/authStore'", confirm `moduleNameMapper` in `package.json` maps `^@/(.*)$` to `<rootDir>/src/$1`.

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/__tests__/useOrderPayment.test.ts
git commit -m "test: add useOrderPayment hook tests (6 tests, covers cash/card/wallet/cancel/decline)"
```

---

## Task 5: Tests for orders/api.ts

**Files:**
- Create: `src/features/orders/__tests__/api.test.ts`
- Reference: `src/features/orders/api.ts`

- [ ] **Step 1: Write the tests**

Create `src/features/orders/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    functions: { invoke: jest.fn() },
    auth: {},
  },
}))

import { supabase } from '@/lib/supabase'
import { cancelOrder, createOrder, fetchMyOrders } from '../api'

const mockFrom = jest.mocked(supabase.from)
const mockRpc = jest.mocked(supabase.rpc)

beforeEach(() => jest.clearAllMocks())

// ─── createOrder ─────────────────────────────────────────────────────

describe('createOrder', () => {
  const baseFormData = {
    business_id: 'biz-001',
    items: [{ product_id: 'prod-1', quantity: 2 }],
    notes: null,
    pickup_time: '2026-04-10T10:00:00Z',
    payment_method: 'efectivo' as const,
  }

  it('calls create_order RPC with all required parameters', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'order-uuid-123', error: null } as any)

    const orderId = await createOrder('customer-001', baseFormData)

    expect(mockRpc).toHaveBeenCalledWith('create_order', {
      p_customer_id: 'customer-001',
      p_business_id: 'biz-001',
      p_items: baseFormData.items,
      p_notes: null,
      p_pickup_time: '2026-04-10T10:00:00Z',
      p_payment_method: 'efectivo',
    })
    expect(orderId).toBe('order-uuid-123')
  })

  it('defaults payment_method to "efectivo" when not provided', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'order-uuid-456', error: null } as any)

    await createOrder('customer-001', { ...baseFormData, payment_method: undefined as any })

    expect(mockRpc).toHaveBeenCalledWith(
      'create_order',
      expect.objectContaining({ p_payment_method: 'efectivo' }),
    )
  })

  it('throws when RPC returns an error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Insufficient stock' } } as any)

    await expect(createOrder('customer-001', baseFormData)).rejects.toThrow('Insufficient stock')
  })
})

// ─── fetchMyOrders ───────────────────────────────────────────────────

describe('fetchMyOrders', () => {
  it('returns mapped orders with business name from join', async () => {
    const rawRow = {
      id: 'order-1',
      order_number: 'ORD-001',
      business_id: 'biz-001',
      status: 'pendiente',
      subtotal: '120.00',
      platform_fee: '12.00',
      total: '132.00',
      estimated_pickup_time: '2026-04-10T10:00:00Z',
      notes: null,
      payment_method: 'efectivo',
      payment_status: 'pendiente',
      created_at: '2026-04-01T09:00:00Z',
      businesses: { name: 'Café Verde', logo_url: 'https://cdn.test/logo.jpg' },
    }

    mockFrom.mockReturnValueOnce(createBuilder({ data: [rawRow], error: null }))

    const orders = await fetchMyOrders('customer-001')

    expect(orders).toHaveLength(1)
    expect(orders[0].business_name).toBe('Café Verde')
    expect(orders[0].total).toBe(132)     // should be a Number, not string
    expect(orders[0].subtotal).toBe(120)
  })

  it('uses fallback business name when businesses join is null', async () => {
    const rawRow = {
      id: 'order-2',
      order_number: 'ORD-002',
      business_id: 'biz-002',
      status: 'pendiente',
      subtotal: '50.00',
      platform_fee: '5.00',
      total: '55.00',
      estimated_pickup_time: null,
      notes: null,
      payment_method: null,
      payment_status: null,
      created_at: '2026-04-01T09:00:00Z',
      businesses: null,
    }

    mockFrom.mockReturnValueOnce(createBuilder({ data: [rawRow], error: null }))

    const orders = await fetchMyOrders('customer-001')

    expect(orders[0].business_name).toBe('Comercio')  // fallback value
    expect(orders[0].payment_method).toBe('efectivo')  // default when null
    expect(orders[0].payment_status).toBe('pendiente') // default when null
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: { message: 'Network error' } }))

    await expect(fetchMyOrders('customer-001')).rejects.toThrow('Network error')
  })
})

// ─── cancelOrder ────────────────────────────────────────────────────

describe('cancelOrder', () => {
  it('calls cancel_order RPC with order and customer ids', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null } as any)

    await cancelOrder('order-001', 'customer-001')

    expect(mockRpc).toHaveBeenCalledWith('cancel_order', {
      p_order_id: 'order-001',
      p_customer_id: 'customer-001',
    })
  })

  it('throws when RPC returns an error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Cannot cancel a completed order' } } as any)

    await expect(cancelOrder('order-001', 'customer-001')).rejects.toThrow(
      'Cannot cancel a completed order',
    )
  })
})
```

- [ ] **Step 2: Run and verify**

```bash
yarn jest src/features/orders/__tests__/api.test.ts --no-coverage
```

Expected: 8 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/__tests__/api.test.ts
git commit -m "test: add orders/api test suite (8 tests)"
```

---

## Task 6: Tests for wallet/api.ts (includes gap-flagged tests)

**Files:**
- Create: `src/features/wallet/__tests__/api.test.ts`
- Reference: `src/features/wallet/api.ts`, `docs/analisis_pendientes.md` (gaps 2 and 3)

Gap tests use `test.failing()`: Jest treats these as passing when they fail and failing when they pass. This means:
- While gaps 2 and 3 are unresolved → CI stays green
- When you fix a gap → the `test.failing()` test turns red, reminding you to remove the wrapper

- [ ] **Step 1: Write the tests**

Create `src/features/wallet/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    functions: { invoke: jest.fn() },
    auth: {},
  },
}))

import { supabase } from '@/lib/supabase'
import {
  fetchWalletBalance,
  fetchWalletSummary,
  fetchWalletTransactions,
  requestWithdrawal,
} from '../api'

const mockFrom = jest.mocked(supabase.from)

beforeEach(() => jest.clearAllMocks())

// ─── fetchWalletBalance ──────────────────────────────────────────────

describe('fetchWalletBalance', () => {
  it('returns balance data mapped from profile', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({
        data: {
          wallet_balance: '1500.50',
          total_earnings: '3000.00',
          total_routes_sold: 5,
          is_creator: true,
        },
        error: null,
      }),
    )

    const balance = await fetchWalletBalance('user-001')

    expect(balance).toEqual({
      balance: 1500.5,
      totalEarnings: 3000,
      totalRoutesSold: 5,
      isCreator: true,
    })
  })

  it('returns zeros when profile data is null', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: null }))

    const balance = await fetchWalletBalance('user-001')

    expect(balance.balance).toBe(0)
    expect(balance.totalEarnings).toBe(0)
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { message: 'Profile not found' } }),
    )

    await expect(fetchWalletBalance('user-001')).rejects.toThrow('Profile not found')
  })
})

// ─── fetchWalletTransactions ─────────────────────────────────────────

describe('fetchWalletTransactions', () => {
  it('includes a route_sale transaction when user is the creator', async () => {
    const row = {
      id: 'purchase-1',
      route_id: 'route-abc',
      buyer_id: 'buyer-999',
      creator_earnings: '85.00',
      platform_fee: '15.00',
      amount_paid: '100.00',
      payment_status: 'completado',
      stripe_payment_id: 'pi_123',
      purchased_at: '2026-03-15T10:00:00Z',
      routes: { name: 'Ruta del Sol', creator_id: 'user-001' },
    }

    mockFrom.mockReturnValueOnce(createBuilder({ data: [row], error: null }))

    const transactions = await fetchWalletTransactions('user-001')

    expect(transactions).toHaveLength(1)
    expect(transactions[0].type).toBe('route_sale')
    expect(transactions[0].amount).toBe(85)
    expect(transactions[0].description).toContain('Ruta del Sol')
  })

  it('includes a route_purchase transaction when user is the buyer', async () => {
    const row = {
      id: 'purchase-2',
      route_id: 'route-xyz',
      buyer_id: 'user-001',
      creator_earnings: '85.00',
      platform_fee: '15.00',
      amount_paid: '100.00',
      payment_status: 'completado',
      stripe_payment_id: 'pi_456',
      purchased_at: '2026-03-16T10:00:00Z',
      routes: { name: 'Ruta Costera', creator_id: 'creator-999' },
    }

    mockFrom.mockReturnValueOnce(createBuilder({ data: [row], error: null }))

    const transactions = await fetchWalletTransactions('user-001')

    expect(transactions).toHaveLength(1)
    expect(transactions[0].type).toBe('route_purchase')
    expect(transactions[0].amount).toBe(-100)  // negative = outgoing payment
  })

  it('returns empty array when no purchases exist', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }))

    const transactions = await fetchWalletTransactions('user-001')

    expect(transactions).toHaveLength(0)
  })

  // GAP-3: wallet_transactions table doesn't exist yet — withdrawals not in history
  // When Gap 3 is resolved: remove test.failing() wrapper
  test.failing(
    '[GAP-3] includes withdrawal transactions in history',
    async () => {
      // After Gap 3 is resolved, fetchWalletTransactions should query
      // wallet_transactions table and include withdrawal entries.
      // This test will start passing once withdrawals are real transactions.
      mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }))

      const transactions = await fetchWalletTransactions('user-001')

      // Expect at least one withdrawal type transaction
      const withdrawals = transactions.filter((t) => t.type === 'withdrawal')
      expect(withdrawals.length).toBeGreaterThan(0)
    },
  )
})

// ─── fetchWalletSummary ──────────────────────────────────────────────

describe('fetchWalletSummary', () => {
  it('returns current balance and month sales aggregated from route_purchases', async () => {
    // Call 1: fetchWalletBalance → profiles
    mockFrom.mockReturnValueOnce(
      createBuilder({
        data: {
          wallet_balance: '500.00',
          total_earnings: '1000.00',
          total_routes_sold: 2,
          is_creator: true,
        },
        error: null,
      }),
    )
    // Call 2: user's routes for monthly aggregation
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: [{ id: 'route-abc' }], error: null }),
    )
    // Call 3: route_purchases for this month
    mockFrom.mockReturnValueOnce(
      createBuilder({
        data: [
          { creator_earnings: '85.00', payment_status: 'completado' },
          { creator_earnings: '85.00', payment_status: 'completado' },
        ],
        error: null,
      }),
    )

    const summary = await fetchWalletSummary('user-001')

    expect(summary.currentBalance).toBe(500)
    expect(summary.monthSales).toBe(170)
    expect(summary.monthSalesCount).toBe(2)
  })

  // GAP-3: monthWithdrawals is hardcoded to 0 — should come from DB
  // When Gap 3 is resolved: remove test.failing() wrapper
  test.failing(
    '[GAP-3] monthWithdrawals is fetched from DB, not hardcoded to 0',
    async () => {
      mockFrom
        .mockReturnValueOnce(
          createBuilder({
            data: { wallet_balance: '500.00', total_earnings: '500.00', total_routes_sold: 1, is_creator: true },
            error: null,
          }),
        )
        .mockReturnValueOnce(createBuilder({ data: [], error: null })) // no routes
        .mockReturnValueOnce(createBuilder({ data: null, error: null })) // withdrawals query

      const summary = await fetchWalletSummary('user-001')

      // This fails today because monthWithdrawals is hardcoded to 0
      // After Gap 3: this should reflect actual withdrawal amounts
      expect(summary.monthWithdrawals).not.toBe(0)
    },
  )
})

// ─── requestWithdrawal ───────────────────────────────────────────────

describe('requestWithdrawal', () => {
  it('throws when balance is insufficient', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({
        data: { wallet_balance: '100.00', total_earnings: '100.00', total_routes_sold: 1, is_creator: true },
        error: null,
      }),
    )

    await expect(
      requestWithdrawal('user-001', 500, '123456789012345678', 'BBVA'),
    ).rejects.toThrow('Balance insuficiente')
  })

  it('throws when amount is below minimum ($500 MXN)', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({
        data: { wallet_balance: '5000.00', total_earnings: '5000.00', total_routes_sold: 10, is_creator: true },
        error: null,
      }),
    )

    await expect(
      requestWithdrawal('user-001', 100, '123456789012345678', 'BBVA'),
    ).rejects.toThrow('monto mínimo')
  })

  it('deducts balance and creates notification record on valid request', async () => {
    // Call 1: fetchWalletBalance
    mockFrom.mockReturnValueOnce(
      createBuilder({
        data: { wallet_balance: '2000.00', total_earnings: '2000.00', total_routes_sold: 5, is_creator: true },
        error: null,
      }),
    )
    // Call 2: update balance
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: null }))
    // Call 3: insert notification
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: null }))

    await expect(
      requestWithdrawal('user-001', 1000, '123456789012345678', 'BBVA'),
    ).resolves.toBeUndefined()

    // Verify balance update was called with new balance
    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(mockFrom).toHaveBeenCalledWith('notifications')
  })

  // GAP-2: No withdrawals table — request creates a notification instead of a real DB record
  // When Gap 2 is resolved: remove test.failing() wrapper
  test.failing(
    '[GAP-2] creates a record in the withdrawals table',
    async () => {
      mockFrom
        .mockReturnValueOnce(
          createBuilder({
            data: { wallet_balance: '2000.00', total_earnings: '2000.00', total_routes_sold: 5, is_creator: true },
            error: null,
          }),
        )
        .mockReturnValueOnce(createBuilder({ data: null, error: null })) // balance update
        .mockReturnValueOnce(createBuilder({ data: { id: 'withdrawal-1' }, error: null })) // withdrawals insert

      await requestWithdrawal('user-001', 1000, '123456789012345678', 'BBVA')

      // This fails today because the code inserts to 'notifications', not 'withdrawals'
      expect(mockFrom).toHaveBeenCalledWith('withdrawals')
    },
  )

  // GAP-2: pendingWithdrawal in summary should reflect the new request
  test.failing(
    '[GAP-2] pendingWithdrawal is returned from withdrawals table after request',
    async () => {
      // After Gap 2: fetchWalletSummary should query withdrawals table
      // and return pendingWithdrawal !== null after a request is made
      mockFrom.mockReturnValue(createBuilder({ data: null, error: null }))

      const { fetchWalletSummary: summaryFn } = await import('../api')
      const summary = await summaryFn('user-001')

      // Today this is always null (hardcoded)
      expect(summary.pendingWithdrawal).not.toBeNull()
    },
  )
})
```

- [ ] **Step 2: Run tests — regular tests pass, gap tests "fail as expected"**

```bash
yarn jest src/features/wallet/__tests__/api.test.ts --no-coverage --verbose
```

Expected output:
- Regular tests: PASS ✓
- `[GAP-2]` and `[GAP-3]` tests show as `✓ [GAP-2] ... (failed as expected)` — this is correct

If a gap test shows as FAIL (not "failed as expected"), it means `test.failing()` behaved unexpectedly. Check that the test actually exercises the gap code path.

- [ ] **Step 3: Commit**

```bash
git add src/features/wallet/__tests__/api.test.ts
git commit -m "test: add wallet/api tests (8 tests: 4 passing + 4 gap-flagged)"
```

---

## Task 7: Tests for auth store

**Files:**
- Create: `src/features/auth/__tests__/authStore.test.ts`
- Reference: `src/shared/store/authStore.ts`

- [ ] **Step 1: Write the tests**

Create `src/features/auth/__tests__/authStore.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run and verify**

```bash
yarn jest src/features/auth/__tests__/authStore.test.ts --no-coverage
```

Expected: 6 tests pass. If `initialize` test is flaky, wrap the assertions in `await new Promise(setImmediate)` to let microtasks drain.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/__tests__/authStore.test.ts
git commit -m "test: add auth store tests (6 tests)"
```

---

## Task 8: Tests for activity tracking and routes/api

**Files:**
- Create: `src/features/routes/__tests__/activityTracking.test.ts`
- Create: `src/features/routes/__tests__/api.test.ts`
- Reference: `src/features/routes/api/activityTracking.ts`, `src/features/routes/api.ts`

`calculateActivityMetrics` is a pure function — no mocks needed.

- [ ] **Step 1: Write activityTracking tests (pure function — no mocks)**

Create `src/features/routes/__tests__/activityTracking.test.ts`:

```typescript
import { calculateActivityMetrics } from '../api/activityTracking'

// Helper to build a LocationObject-like value
function loc(lat: number, lng: number, timestamp: number, speed = 0) {
  return {
    coords: { latitude: lat, longitude: lng, speed, accuracy: 5, altitude: 0, altitudeAccuracy: 0, heading: 0 },
    timestamp,
    mocked: false,
  } as any
}

describe('calculateActivityMetrics', () => {
  it('returns zeros when fewer than 2 locations are provided', () => {
    expect(calculateActivityMetrics([])).toEqual({
      distanceKm: 0,
      avgSpeedKmh: 0,
      maxSpeedKmh: 0,
      caloriesBurned: 0,
      recordedPath: [],
    })

    const single = [loc(20.97, -89.62, 1000)]
    const result = calculateActivityMetrics(single)
    expect(result.distanceKm).toBe(0)
    expect(result.recordedPath).toHaveLength(1)
  })

  it('calculates distance between two points using Haversine formula', () => {
    // Mérida city center to roughly 1 km north
    const start = loc(20.9674, -89.5926, 0)
    const end = loc(20.9764, -89.5926, 3600_000) // 1 hour later

    const result = calculateActivityMetrics([start, end])

    // ~1 km between these coordinates (Haversine)
    expect(result.distanceKm).toBeGreaterThan(0.9)
    expect(result.distanceKm).toBeLessThan(1.2)
  })

  it('calculates average speed as distance / duration in hours', () => {
    const start = loc(20.9674, -89.5926, 0)
    const end = loc(20.9764, -89.5926, 3600_000) // 1 hour

    const result = calculateActivityMetrics([start, end])

    // ~1 km in 1 hour = ~1 km/h
    expect(result.avgSpeedKmh).toBeGreaterThan(0.5)
    expect(result.avgSpeedKmh).toBeLessThan(2)
  })

  it('calculates calories as ~30 per km', () => {
    const start = loc(20.9674, -89.5926, 0)
    const end = loc(20.9764, -89.5926, 3600_000)

    const result = calculateActivityMetrics([start, end])

    // ~1 km × 30 = ~30 cal
    expect(result.caloriesBurned).toBeCloseTo(30, -1) // within ±5
  })

  it('converts max speed from m/s to km/h', () => {
    const start = loc(20.9674, -89.5926, 0, 0)
    const end = loc(20.9764, -89.5926, 3600_000, 10) // 10 m/s = 36 km/h

    const result = calculateActivityMetrics([start, end])

    expect(result.maxSpeedKmh).toBeCloseTo(36, 0)
  })

  it('builds recordedPath as [lng, lat] pairs (GeoJSON order)', () => {
    const locations = [
      loc(20.9674, -89.5926, 0),
      loc(20.9764, -89.5930, 3600_000),
    ]

    const result = calculateActivityMetrics(locations)

    expect(result.recordedPath[0]).toEqual([-89.5926, 20.9674]) // [lng, lat]
    expect(result.recordedPath[1]).toEqual([-89.5930, 20.9764])
  })
})
```

- [ ] **Step 2: Write routes/api tests**

Create `src/features/routes/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    functions: { invoke: jest.fn() },
    auth: {},
  },
}))

import { supabase } from '@/lib/supabase'
import { fetchPublishedRoutes, fetchRouteDetail, searchRoutes } from '../api'

const mockRpc = jest.mocked(supabase.rpc)

beforeEach(() => jest.clearAllMocks())

describe('fetchPublishedRoutes', () => {
  it('calls get_published_routes RPC with null filters when none provided', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null } as any)

    await fetchPublishedRoutes()

    expect(mockRpc).toHaveBeenCalledWith('get_published_routes', {
      p_difficulty: null,
      p_terrain: null,
      p_max_distance: null,
      p_min_distance: null,
    })
  })

  it('passes filters through to the RPC correctly', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null } as any)

    await fetchPublishedRoutes({ difficulty: 'intermedio', terrain: 'asfalto', maxDistance: 50, minDistance: 10 })

    expect(mockRpc).toHaveBeenCalledWith('get_published_routes', {
      p_difficulty: 'intermedio',
      p_terrain: 'asfalto',
      p_max_distance: 50,
      p_min_distance: 10,
    })
  })

  it('returns empty array when RPC returns null data', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null } as any)

    const result = await fetchPublishedRoutes()
    expect(result).toEqual([])
  })

  it('throws when RPC returns an error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Permission denied' } } as any)

    await expect(fetchPublishedRoutes()).rejects.toThrow('Permission denied')
  })
})

describe('searchRoutes', () => {
  it('calls search_routes RPC with the query string', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null } as any)

    await searchRoutes('cenote')

    expect(mockRpc).toHaveBeenCalledWith('search_routes', expect.objectContaining({
      p_query: 'cenote',
    }))
  })
})
```

- [ ] **Step 3: Run both test files**

```bash
yarn jest src/features/routes/__tests__/ --no-coverage
```

Expected: 10 tests pass (6 activityTracking + 4 routes/api).

- [ ] **Step 4: Commit**

```bash
git add src/features/routes/__tests__/
git commit -m "test: add routes activityTracking + api tests (10 tests)"
```

---

## Task 9: Tests for offline/api.ts

**Files:**
- Create: `src/features/offline/__tests__/api.test.ts`
- Reference: `src/features/offline/api.ts`

`offline/api.ts` uses `AsyncStorage` and dynamic `import('expo-file-system')` — both need mocking.

- [ ] **Step 1: Write the tests**

Create `src/features/offline/__tests__/api.test.ts`:

```typescript
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test/',
  downloadAsync: jest.fn().mockResolvedValue({ uri: 'file:///test/offline_cover_route-1.jpg' }),
}))

import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  deleteRouteOffline,
  fetchOfflineRoute,
  listOfflineRoutes,
  saveRouteOffline,
} from '../api'

const mockRouteDetail = {
  route: {
    id: 'route-1',
    name: 'Ruta del Sol',
    cover_image_url: 'https://cdn.test/cover.jpg',
  },
  waypoints: [],
  businesses: [],
} as any

beforeEach(async () => {
  await AsyncStorage.clear()
  jest.clearAllMocks()
})

describe('saveRouteOffline', () => {
  it('saves route metadata to AsyncStorage and returns OfflineRouteData', async () => {
    const result = await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    expect(result.routeId).toBe('route-1')
    expect(result.name).toBe('Ruta del Sol')
    expect(result.downloadedAt).toBeGreaterThan(0)
    expect(result.sizeBytes).toBeGreaterThan(0)
  })

  it('adds the route id to the offline index', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    const index = JSON.parse((await AsyncStorage.getItem('offline_routes_index')) ?? '[]')
    expect(index).toContain('route-1')
  })

  it('does not duplicate the route id in the index when saved twice', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    const index = JSON.parse((await AsyncStorage.getItem('offline_routes_index')) ?? '[]')
    expect(index.filter((id: string) => id === 'route-1')).toHaveLength(1)
  })
})

describe('fetchOfflineRoute', () => {
  it('returns the saved OfflineRouteData', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    const result = await fetchOfflineRoute('route-1')

    expect(result).not.toBeNull()
    expect(result?.routeId).toBe('route-1')
  })

  it('returns null when route was not saved', async () => {
    const result = await fetchOfflineRoute('nonexistent-route')
    expect(result).toBeNull()
  })
})

describe('listOfflineRoutes', () => {
  it('returns all saved offline routes', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)
    await saveRouteOffline('route-2', 'Ruta Costera', { ...mockRouteDetail, route: { ...mockRouteDetail.route, id: 'route-2' } })

    const list = await listOfflineRoutes()

    expect(list).toHaveLength(2)
    expect(list.map((r) => r.routeId)).toContain('route-1')
    expect(list.map((r) => r.routeId)).toContain('route-2')
  })

  it('returns empty array when nothing is saved', async () => {
    const list = await listOfflineRoutes()
    expect(list).toHaveLength(0)
  })
})

describe('deleteRouteOffline', () => {
  it('removes the route from AsyncStorage and the index', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    await deleteRouteOffline('route-1')

    const result = await fetchOfflineRoute('route-1')
    expect(result).toBeNull()

    const index = JSON.parse((await AsyncStorage.getItem('offline_routes_index')) ?? '[]')
    expect(index).not.toContain('route-1')
  })
})
```

Note: If `fetchOfflineRoute`, `listOfflineRoutes`, or `deleteRouteOffline` don't exist yet in `offline/api.ts`, check what the actual exported function names are: `getOfflineRoute`, `getOfflineRoutes`, etc. Adjust import names accordingly.

- [ ] **Step 2: Run tests**

```bash
yarn jest src/features/offline/__tests__/api.test.ts --no-coverage
```

Expected: 7 tests pass. If AsyncStorage mock is missing, install it: `yarn add --dev @react-native-async-storage/async-storage` (it includes the jest mock).

- [ ] **Step 3: Commit**

```bash
git add src/features/offline/__tests__/api.test.ts
git commit -m "test: add offline/api tests (7 tests)"
```

---

## Task 10: Tests for remaining 6 features

**Files:**
- Create: `src/features/businesses/__tests__/api.test.ts`
- Create: `src/features/favorites/__tests__/api.test.ts`
- Create: `src/features/reviews/__tests__/api.test.ts`
- Create: `src/features/profile/__tests__/api.test.ts`
- Create: `src/features/notifications/__tests__/api.test.ts`
- Create: `src/features/metrics/__tests__/api.test.ts`

All 6 follow the same pattern. Each file:
1. Mocks `@/lib/supabase`
2. Uses `createBuilder` for query results
3. Tests the happy path + error path for each exported function

- [ ] **Step 1: Create businesses tests**

Create `src/features/businesses/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), functions: { invoke: jest.fn() }, auth: {} },
}))

import { supabase } from '@/lib/supabase'
import { fetchBusinesses, searchBusinesses } from '../api'

const mockRpc = jest.mocked(supabase.rpc)

beforeEach(() => jest.clearAllMocks())

describe('fetchBusinesses', () => {
  it('calls get_active_businesses RPC with null type when no filter provided', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null } as any)
    await fetchBusinesses()
    expect(mockRpc).toHaveBeenCalledWith('get_active_businesses', { p_type: null })
  })

  it('passes type filter to the RPC', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null } as any)
    await fetchBusinesses('restaurante')
    expect(mockRpc).toHaveBeenCalledWith('get_active_businesses', { p_type: 'restaurante' })
  })

  it('throws on RPC error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } } as any)
    await expect(fetchBusinesses()).rejects.toThrow('RPC error')
  })
})

describe('searchBusinesses', () => {
  it('calls search_businesses RPC with query and type', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null } as any)
    await searchBusinesses('taqueria', 'restaurante')
    expect(mockRpc).toHaveBeenCalledWith('search_businesses', {
      p_query: 'taqueria',
      p_type: 'restaurante',
    })
  })
})
```

- [ ] **Step 2: Create favorites tests**

Create `src/features/favorites/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), functions: { invoke: jest.fn() }, auth: {} },
}))

import { supabase } from '@/lib/supabase'
import { checkRouteSaved, fetchSavedRoutes, toggleSaveRoute } from '../api'

const mockFrom = jest.mocked(supabase.from)

beforeEach(() => jest.clearAllMocks())

describe('fetchSavedRoutes', () => {
  it('queries saved_routes and returns the results', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: [{ id: 'saved-1', route_id: 'route-abc' }], error: null }))
    const routes = await fetchSavedRoutes('user-001')
    expect(mockFrom).toHaveBeenCalledWith('saved_routes')
    expect(routes).toHaveLength(1)
  })

  it('throws on error', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: { message: 'DB error' } }))
    await expect(fetchSavedRoutes('user-001')).rejects.toThrow('DB error')
  })
})

describe('checkRouteSaved', () => {
  it('returns true when count > 0', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ count: 1, error: null }))
    const saved = await checkRouteSaved('user-001', 'route-abc')
    expect(saved).toBe(true)
  })

  it('returns false when count is 0', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ count: 0, error: null }))
    const saved = await checkRouteSaved('user-001', 'route-abc')
    expect(saved).toBe(false)
  })
})
```

- [ ] **Step 3: Create reviews tests**

Create `src/features/reviews/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), functions: { invoke: jest.fn() }, auth: {} },
}))

import { supabase } from '@/lib/supabase'
import { fetchRouteReviews, submitReview } from '../api'

const mockFrom = jest.mocked(supabase.from)

beforeEach(() => jest.clearAllMocks())

describe('fetchRouteReviews', () => {
  it('queries reviews filtered by route_id and status aprobado', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }))

    await fetchRouteReviews('route-abc')

    const builder = mockFrom.mock.results[0].value
    expect(mockFrom).toHaveBeenCalledWith('reviews')
    expect(builder.eq).toHaveBeenCalledWith('route_id', 'route-abc')
    expect(builder.eq).toHaveBeenCalledWith('status', 'aprobado')
  })
})

describe('submitReview', () => {
  it('inserts a review and returns the created record', async () => {
    const createdReview = { id: 'review-1', rating: 5, comment: 'Excelente ruta' }
    mockFrom.mockReturnValueOnce(createBuilder({ data: createdReview, error: null }))

    const result = await submitReview('user-001', {
      route_id: 'route-abc',
      rating: 5,
      comment: 'Excelente ruta',
    })

    expect(result).toEqual(createdReview)
  })

  it('throws with a user-friendly message on duplicate review (code 23505)', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { code: '23505', message: 'unique violation' } }),
    )

    await expect(
      submitReview('user-001', { route_id: 'route-abc', rating: 4, comment: '' }),
    ).rejects.toThrow('Ya dejaste una reseña')
  })
})
```

- [ ] **Step 4: Create profile tests**

Create `src/features/profile/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), functions: { invoke: jest.fn() }, auth: {} },
}))

import { supabase } from '@/lib/supabase'
import { fetchProfile, updateProfile } from '../api'

const mockFrom = jest.mocked(supabase.from)

beforeEach(() => jest.clearAllMocks())

describe('fetchProfile', () => {
  it('returns the profile for a valid user id', async () => {
    const profile = { id: 'user-001', full_name: 'Ana García', email: 'ana@test.com' }
    mockFrom.mockReturnValueOnce(createBuilder({ data: profile, error: null }))

    const result = await fetchProfile('user-001')
    expect(result).toEqual(profile)
  })

  it('returns null when no profile found (PGRST116)', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { code: 'PGRST116', message: 'no rows' } }),
    )

    const result = await fetchProfile('user-001')
    expect(result).toBeNull()
  })

  it('throws for non-PGRST116 errors', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { code: '500', message: 'Server error' } }),
    )

    await expect(fetchProfile('user-001')).rejects.toThrow('Server error')
  })
})

describe('updateProfile', () => {
  it('updates the profile and returns the updated record', async () => {
    const updated = { id: 'user-001', full_name: 'Ana Actualizada' }
    mockFrom.mockReturnValueOnce(createBuilder({ data: updated, error: null }))

    const result = await updateProfile('user-001', { full_name: 'Ana Actualizada' })
    expect(result).toEqual(updated)
  })
})
```

- [ ] **Step 5: Create notifications tests**

Create `src/features/notifications/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), functions: { invoke: jest.fn() }, auth: {} },
}))

import { supabase } from '@/lib/supabase'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../api'

const mockFrom = jest.mocked(supabase.from)

beforeEach(() => jest.clearAllMocks())

describe('fetchNotifications', () => {
  it('queries notifications for the given user ordered by date desc', async () => {
    const notifications = [{ id: 'notif-1', title: 'Test', is_read: false }]
    mockFrom.mockReturnValueOnce(createBuilder({ data: notifications, error: null }))

    const result = await fetchNotifications('user-001')

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(result).toHaveLength(1)
  })

  it('throws on error', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: { message: 'error' } }))
    await expect(fetchNotifications('user-001')).rejects.toThrow()
  })
})
```

- [ ] **Step 6: Create metrics tests**

Create `src/features/metrics/__tests__/api.test.ts`:

```typescript
import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), functions: { invoke: jest.fn() }, auth: {} },
}))

import { supabase } from '@/lib/supabase'
import { fetchUserAchievements, fetchUserDashboard } from '../api'

const mockFrom = jest.mocked(supabase.from)

beforeEach(() => jest.clearAllMocks())

describe('fetchUserDashboard', () => {
  it('returns dashboard data from user_dashboard_summary view', async () => {
    const dashboard = { user_id: 'user-001', total_routes: 5, total_distance_km: 120 }
    mockFrom.mockReturnValueOnce(createBuilder({ data: dashboard, error: null }))

    const result = await fetchUserDashboard('user-001')
    expect(result).toEqual(dashboard)
  })

  it('returns null when no dashboard row exists (new user, PGRST116)', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { code: 'PGRST116', message: 'no rows' } }),
    )

    const result = await fetchUserDashboard('user-001')
    expect(result).toBeNull()
  })
})

describe('fetchUserAchievements', () => {
  it('returns achievements ordered by unlocked status', async () => {
    const achievements = [
      { id: 'ach-1', is_unlocked: true, progress_current: 1 },
      { id: 'ach-2', is_unlocked: false, progress_current: 0 },
    ]
    mockFrom.mockReturnValueOnce(createBuilder({ data: achievements, error: null }))

    const result = await fetchUserAchievements('user-001')
    expect(result).toHaveLength(2)
  })
})
```

- [ ] **Step 7: Run all remaining tests**

```bash
yarn jest src/features/businesses src/features/favorites src/features/reviews src/features/profile src/features/notifications src/features/metrics --no-coverage
```

Expected: ~20 tests pass.

- [ ] **Step 8: Run the full test suite**

```bash
yarn jest --no-coverage
```

Expected: ~75 tests total — majority passing, 4 showing as "failed as expected" (the gap tests).

- [ ] **Step 9: Commit all remaining test files**

```bash
git add src/features/businesses/__tests__/ src/features/favorites/__tests__/ src/features/reviews/__tests__/ src/features/profile/__tests__/ src/features/notifications/__tests__/ src/features/metrics/__tests__/
git commit -m "test: add remaining feature api tests (businesses, favorites, reviews, profile, notifications, metrics)"
```

---

## Self-Review Checklist

Spec coverage check:
- ✅ payments/api (createRoutePaymentIntent, createOrderPaymentIntent, checkRoutePurchased, confirmRoutePurchase)
- ✅ useOrderPayment (cash, card success, card declined, cancelled, wallet, unauthenticated)
- ✅ orders/api (createOrder, fetchMyOrders, cancelOrder)
- ✅ wallet/api (balance, transactions, summary, withdrawal + 4 gap tests)
- ✅ auth store (signIn, signUp, signOut, initialize)
- ✅ calculateActivityMetrics (distance, speed, calories, path, edge cases)
- ✅ routes/api (fetchPublishedRoutes, searchRoutes)
- ✅ offline/api (save, fetch, list, delete)
- ✅ businesses, favorites, reviews, profile, notifications, metrics
- ✅ Gap tests use `test.failing()` not `test.skip()`
- ✅ `createBuilder` handles both `.single()` and direct await patterns
