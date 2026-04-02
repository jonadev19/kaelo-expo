import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-native'
import React from 'react'

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
  initPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
  presentPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
  useStripe: () => ({
    initPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
    presentPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
  }),
  StripeProvider: ({ children }: any) => children,
}))

// ── Imports after mocks ────────────────────────────────────────────

import { createOrderPaymentIntent } from '@/features/payments/api'
import { useOrderPayment } from '../hooks/useOrderPayment'

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
      ;(stripe.presentPaymentSheet as jest.Mock).mockResolvedValueOnce({
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
      ;(stripe.presentPaymentSheet as jest.Mock).mockResolvedValueOnce({
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