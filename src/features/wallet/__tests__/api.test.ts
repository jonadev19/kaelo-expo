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

    mockFrom.mockReturnValueOnce(createBuilder({ data: [row], error: null }) as any)

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

    mockFrom.mockReturnValueOnce(createBuilder({ data: [row], error: null }) as any)

    const transactions = await fetchWalletTransactions('user-001')

    expect(transactions).toHaveLength(1)
    expect(transactions[0].type).toBe('route_purchase')
    expect(transactions[0].amount).toBe(-100)  // negative = outgoing payment
  })

  it('returns empty array when no purchases exist', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }) as any)

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
      mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }) as any)

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
          }) as any,
        )
        .mockReturnValueOnce(createBuilder({ data: [], error: null }) as any) // no routes
        .mockReturnValueOnce(createBuilder({ data: null, error: null }) as any) // withdrawals query

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
      }) as any,
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
      }) as any,
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
      }) as any,
    )
    // Call 2: update balance
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: null }) as any)
    // Call 3: insert notification
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: null }) as any)

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
          }) as any,
        )
        .mockReturnValueOnce(createBuilder({ data: null, error: null }) as any) // balance update
        .mockReturnValueOnce(createBuilder({ data: { id: 'withdrawal-1' }, error: null }) as any) // withdrawals insert

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
      mockFrom.mockReturnValue(createBuilder({ data: null, error: null }) as any)

      const { fetchWalletSummary: summaryFn } = await import('../api')
      const summary = await summaryFn('user-001')

      // Today this is always null (hardcoded)
      expect(summary.pendingWithdrawal).not.toBeNull()
    },
  )
})