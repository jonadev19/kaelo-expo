import { createBuilder } from '../../../__tests__/mocks/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn(), functions: { invoke: jest.fn() }, auth: {} },
}))

import { supabase } from '@/lib/supabase'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../api'

const mockFrom = jest.mocked(supabase.from)

beforeEach(() => jest.clearAllMocks())

describe('fetchNotifications', () => {
  it('queries notifications for the given user ordered by date desc', async () => {
    const notifications = [{ id: 'notif-1', title: 'Test', is_read: false }]
    mockFrom.mockReturnValueOnce(createBuilder({ data: notifications, error: null }) as any)

    const result = await fetchNotifications('user-001')

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(result).toHaveLength(1)
  })

  it('throws on error', async () => {
    mockFrom.mockReturnValueOnce(createBuilder({ data: null, error: { message: 'error' } }) as any)
    await expect(fetchNotifications('user-001')).rejects.toThrow()
  })
})