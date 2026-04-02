jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///test/',
  downloadAsync: jest.fn().mockResolvedValue({ uri: 'file:///test/offline_cover_route-1.jpg' }),
}))

jest.mock('@rnmapbox/maps', () => ({
  default: {
    offlineManager: {
      createPack: jest.fn(),
      deletePack: jest.fn(),
    }
  }
}))

import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  removeOfflineRoute,
  getOfflineRoute,
  getAllOfflineRoutes,
  saveRouteOffline,
} from '../api'

const mockRouteDetail = {
  route: {
    id: 'route-1',
    name: 'Ruta del Sol',
    cover_image_url: 'https://cdn.test/cover.jpg',
  },
  waypoints: [],
  businesses: [],
} as any

beforeEach(async () => {
  await AsyncStorage.clear()
  jest.clearAllMocks()
})

describe('saveRouteOffline', () => {
  it('saves route metadata to AsyncStorage and returns OfflineRouteData', async () => {
    const result = await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    expect(result.routeId).toBe('route-1')
    expect(result.name).toBe('Ruta del Sol')
    expect(result.downloadedAt).toBeGreaterThan(0)
    expect(result.sizeBytes).toBeGreaterThan(0)
  })

  it('adds the route id to the offline index', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    const index = JSON.parse((await AsyncStorage.getItem('offline_routes_index')) ?? '[]')
    expect(index).toContain('route-1')
  })

  it('does not duplicate the route id in the index when saved twice', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    const index = JSON.parse((await AsyncStorage.getItem('offline_routes_index')) ?? '[]')
    expect(index.filter((id: string) => id === 'route-1')).toHaveLength(1)
  })
})

describe('getOfflineRoute', () => {
  it('returns the saved OfflineRouteData', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    const result = await getOfflineRoute('route-1')

    expect(result).not.toBeNull()
    expect(result?.meta.routeId).toBe('route-1')
  })

  it('returns null when route was not saved', async () => {
    const result = await getOfflineRoute('nonexistent-route')
    expect(result).toBeNull()
  })
})

describe('getAllOfflineRoutes', () => {
  it('returns all saved offline routes', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)
    await saveRouteOffline('route-2', 'Ruta Costera', { ...mockRouteDetail, route: { ...mockRouteDetail.route, id: 'route-2' } })

    const list = await getAllOfflineRoutes()

    expect(list).toHaveLength(2)
    expect(list.map((r) => r.routeId)).toContain('route-1')
    expect(list.map((r) => r.routeId)).toContain('route-2')
  })

  it('returns empty array when nothing is saved', async () => {
    const list = await getAllOfflineRoutes()
    expect(list).toHaveLength(0)
  })
})

describe('removeOfflineRoute', () => {
  it('removes the route from AsyncStorage and the index', async () => {
    await saveRouteOffline('route-1', 'Ruta del Sol', mockRouteDetail)

    await removeOfflineRoute('route-1')

    const result = await getOfflineRoute('route-1')
    expect(result).toBeNull()

    const index = JSON.parse((await AsyncStorage.getItem('offline_routes_index')) ?? '[]')
    expect(index).not.toContain('route-1')
  })
})