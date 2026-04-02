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

    mockFrom.mockReturnValueOnce(createBuilder({ data: [rawRow], error: null }) as any)

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

    mockFrom.mockReturnValueOnce(createBuilder({ data: [rawRow], error: null }) as any)

    const orders = await fetchMyOrders('customer-001')

    expect(orders[0].business_name).toBe('Comercio')  // fallback value
    expect(orders[0].payment_method).toBe('efectivo')  // default when null
    expect(orders[0].payment_status).toBe('pendiente') // default when null
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: { message: 'Network error' } }) as any)

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