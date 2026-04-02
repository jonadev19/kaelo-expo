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
      createBuilder({ data: purchaseRecord, error: null }) as any,
    )

    const result = await checkRoutePurchased('route-abc', 'user-xyz')

    expect(result.purchased).toBe(true)
    expect(result.purchase).toEqual(purchaseRecord)
  })

  it('returns { purchased: false } when no purchase record exists', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: null }) as any,
    )

    const result = await checkRoutePurchased('route-abc', 'user-xyz')

    expect(result.purchased).toBe(false)
    expect(result.purchase).toBeUndefined()
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { message: 'DB error' } }) as any,
    )

    await expect(checkRoutePurchased('route-abc', 'user-xyz')).rejects.toThrow('DB error')
  })
})

// ─── confirmRoutePurchase ────────────────────────────────────────────

describe('confirmRoutePurchase', () => {
  it('upserts the purchase and returns the new record id', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: { id: 'purchase-new-1' }, error: null }) as any,
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