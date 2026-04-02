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
    mockFrom.mockReturnValueOnce(createBuilder({ data: [{ id: 'saved-1', route_id: 'route-abc' }], error: null }) as any)
    const routes = await fetchSavedRoutes('user-001')
    expect(mockFrom).toHaveBeenCalledWith('saved_routes')
    expect(routes).toHaveLength(1)
  })

  it('throws on error', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: { message: 'DB error' } }) as any)
    await expect(fetchSavedRoutes('user-001')).rejects.toThrow('DB error')
  })
})

describe('checkRouteSaved', () => {
  it('returns true when count > 0', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ count: 1, error: null }) as any)
    const saved = await checkRouteSaved('user-001', 'route-abc')
    expect(saved).toBe(true)
  })

  it('returns false when count is 0', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ count: 0, error: null }) as any)
    const saved = await checkRouteSaved('user-001', 'route-abc')
    expect(saved).toBe(false)
  })
})