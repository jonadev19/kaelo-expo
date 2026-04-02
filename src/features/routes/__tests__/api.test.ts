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