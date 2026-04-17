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
      }) as any,
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
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: null }) as any)

    const balance = await fetchWalletBalance('user-001')

    expect(balance.balance).toBe(0)
    expect(balance.totalEarnings).toBe(0)
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { message: 'Profile not found' } }) as any,
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

    // Call 1: route_purchases
    mockFrom.mockReturnValueOnce(createBuilder({ data: [row], error: null }) as any)
    // Call 2: withdrawals
    mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }) as any)

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

    // Call 1: route_purchases
    mockFrom.mockReturnValueOnce(createBuilder({ data: [row], error: null }) as any)
    // Call 2: withdrawals
    mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }) as any)

    const transactions = await fetchWalletTransactions('user-001')

    expect(transactions).toHaveLength(1)
    expect(transactions[0].type).toBe('route_purchase')
    expect(transactions[0].amount).toBe(-100)  // negative = outgoing payment
  })

  it('returns empty array when no purchases exist', async () => {
    // Call 1: route_purchases
    mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }) as any)
    // Call 2: withdrawals
    mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }) as any)

    const transactions = await fetchWalletTransactions('user-001')

    expect(transactions).toHaveLength(0)
  })

  // GAP-3: resolved - withdrawals are now in history
  it('includes withdrawal transactions in history', async () => {
    const row = {
      id: 'wd-1',
      user_id: 'user-001',
      amount: '500.00',
      status: 'completed',
      stripe_transfer_id: 'tr_123',
      created_at: '2026-03-17T10:00:00Z',
    }

    // Call 1: route_purchases
    mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }) as any)
    // Call 2: withdrawals
    mockFrom.mockReturnValueOnce(createBuilder({ data: [row], error: null }) as any)

    const transactions = await fetchWalletTransactions('user-001')

    const withdrawals = transactions.filter((t) => t.type === 'withdrawal')
    expect(withdrawals).toHaveLength(1)
    expect(withdrawals[0].amount).toBe(-500)
  })
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
      }) as any,
    )
    // Call 2: user's routes for monthly aggregation
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: [{ id: 'route-abc' }], error: null }) as any,
    )
    // Call 3: route_purchases for this month
    mockFrom.mockReturnValueOnce(
      createBuilder({
        data: [
          { creator_earnings: '85.00', payment_status: 'completado' },
          { creator_earnings: '85.00', payment_status: 'completado' },
        ],
        error: null,
      }) as any,
    )
    // Call 4: month withdrawals
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: [{ amount: '200.00' }], error: null }) as any,
    )
    // Call 5: pending withdrawal
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: null }) as any,
    )

    const summary = await fetchWalletSummary('user-001')

    expect(summary.currentBalance).toBe(500)
    expect(summary.monthSales).toBe(170)
    expect(summary.monthSalesCount).toBe(2)
    expect(summary.monthWithdrawals).toBe(200)
  })

  // GAP-3: resolved - monthWithdrawals is fetched from DB
  it('monthWithdrawals is fetched from DB', async () => {
    mockFrom
      .mockReturnValueOnce(
        createBuilder({
          data: { wallet_balance: '500.00', total_earnings: '500.00', total_routes_sold: 1, is_creator: true },
          error: null,
        }) as any,
      )
      .mockReturnValueOnce(createBuilder({ data: [], error: null }) as any) // no routes
      .mockReturnValueOnce(createBuilder({ data: [{ amount: '300.00' }], error: null }) as any) // withdrawals query
      .mockReturnValueOnce(createBuilder({ data: null, error: null }) as any) // pending withdrawal query

    const summary = await fetchWalletSummary('user-001')

    expect(summary.monthWithdrawals).toBe(300)
  })
})

// ─── requestWithdrawal ───────────────────────────────────────────────

describe('requestWithdrawal', () => {
  it('throws when balance is insufficient', async () => {
    // requestWithdrawal no longer calls fetchWalletBalance directly, 
    // it relies on the RPC to check balance, but let's check the implementation again.
    // Actually, looking at requestWithdrawal in api.ts, it doesn't call fetchWalletBalance!
    // It only calls supabase.rpc.
    
    // Wait, let's re-read api.ts requestWithdrawal.
    /*
    export const requestWithdrawal = async (...) => {
      if (amount < 500) throw new Error(...);
      const { data: withdrawalId, error: rpcError } = await supabase.rpc(...);
      if (rpcError) { ... }
      await supabase.from("notifications").insert(...);
      return withdrawalId;
    };
    */
    
    // So the test was mocking fetchWalletBalance which is NOT called.
    const mockRpc = jest.mocked(supabase.rpc)
    
    mockRpc.mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'Saldo insuficiente', code: 'P0001' } as any 
    })

    await expect(
      requestWithdrawal('user-001', 500, '123456789012345678', 'BBVA'),
    ).rejects.toThrow('No tienes saldo suficiente')
  })

  it('throws when amount is below minimum ($500 MXN)', async () => {
    await expect(
      requestWithdrawal('user-001', 100, '123456789012345678', 'BBVA'),
    ).rejects.toThrow('monto mínimo')
  })

  it('deducts balance and creates notification record on valid request', async () => {
    const mockRpc = jest.mocked(supabase.rpc)
    mockRpc.mockResolvedValueOnce({ data: 'new-wd-id', error: null })
    
    // Call to notifications
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: null }) as any)

    const result = await requestWithdrawal('user-001', 1000, '123456789012345678', 'BBVA')

    expect(result).toBe('new-wd-id')
    expect(mockRpc).toHaveBeenCalledWith('process_withdrawal_request', expect.any(Object))
    expect(mockFrom).toHaveBeenCalledWith('notifications')
  })
})