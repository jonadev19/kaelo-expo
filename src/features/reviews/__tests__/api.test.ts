import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), functions: { invoke: jest.fn() }, auth: {} },
}))

import { supabase } from '@/lib/supabase'
import { fetchRouteReviews, submitReview } from '../api'

const mockFrom = jest.mocked(supabase.from)

beforeEach(() => jest.clearAllMocks())

describe('fetchRouteReviews', () => {
  it('queries reviews filtered by route_id and status aprobado', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: [], error: null }) as any)

    await fetchRouteReviews('route-abc')

    const builder = mockFrom.mock.results[0].value
    expect(mockFrom).toHaveBeenCalledWith('reviews')
    expect(builder.eq).toHaveBeenCalledWith('route_id', 'route-abc')
    expect(builder.eq).toHaveBeenCalledWith('status', 'aprobado')
  })
})

describe('submitReview', () => {
  it('inserts a review and returns the created record', async () => {
    const createdReview = { id: 'review-1', rating: 5, comment: 'Excelente ruta' }
    mockFrom.mockReturnValueOnce(createBuilder({ data: createdReview, error: null }) as any)

    const result = await submitReview('user-001', {
      route_id: 'route-abc',
      rating: 5,
      comment: 'Excelente ruta',
    })

    expect(result).toEqual(createdReview)
  })

  it('throws with a user-friendly message on duplicate review (code 23505)', async () => {
    mockFrom.mockReturnValueOnce(
      createBuilder({ data: null, error: { code: '23505', message: 'unique violation' } }) as any,
    )

    await expect(
      submitReview('user-001', { route_id: 'route-abc', rating: 4, comment: '' }),
    ).rejects.toThrow('Ya dejaste una reseña')
  })
})