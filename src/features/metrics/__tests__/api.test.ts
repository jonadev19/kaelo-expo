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
    mockFrom.mockReturnValueOnce(createBuilder({ data: dashboard, error: null }) as any)

    const result = await fetchUserDashboard('user-001')
    expect(result).toEqual(dashboard)
  })

  it('returns null when no dashboard row exists (new user, PGRST116)', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { code: 'PGRST116', message: 'no rows' } }) as any,
    )

    const result = await fetchUserDashboard('user-001')
    expect(result).toBeNull()
  })
})

describe('fetchUserAchievements', () => {
  it('returns achievements ordered by unlocked status', async () => {
    const data = [{ id: 'ach-1', name: 'Primer viaje' }]
    mockFrom.mockReturnValueOnce(createBuilder({ data, error: null }) as any)

    const result = await fetchUserAchievements('user-001')
    expect(result).toEqual(data)
  })
})