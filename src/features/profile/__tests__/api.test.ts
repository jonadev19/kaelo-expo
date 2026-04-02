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
    mockFrom.mockReturnValueOnce(createBuilder({ data: profile, error: null }) as any)

    const result = await fetchProfile('user-001')
    expect(result).toEqual(profile)
  })

  it('returns null when no profile found (PGRST116)', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { code: 'PGRST116', message: 'no rows' } }) as any,
    )

    const result = await fetchProfile('user-001')
    expect(result).toBeNull()
  })

  it('throws for non-PGRST116 errors', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { code: '500', message: 'Server error' } }) as any,
    )

    await expect(fetchProfile('user-001')).rejects.toThrow('Server error')
  })
})

describe('updateProfile', () => {
  it('updates the profile and returns the updated record', async () => {
    const updated = { id: 'user-001', full_name: 'Ana Actualizada' }
    mockFrom.mockReturnValueOnce(createBuilder({ data: updated, error: null }) as any)

    const result = await updateProfile('user-001', { full_name: 'Ana Actualizada' })
    expect(result).toEqual(updated)
  })
})