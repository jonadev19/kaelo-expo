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