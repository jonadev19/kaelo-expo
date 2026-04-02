jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    functions: { invoke: jest.fn() },
    auth: {},
  },
}))

import { calculateActivityMetrics } from '../api/activityTracking'

// Helper to build a LocationObject-like value
function loc(lat: number, lng: number, timestamp: number, speed = 0) {
  return {
    coords: { latitude: lat, longitude: lng, speed, accuracy: 5, altitude: 0, altitudeAccuracy: 0, heading: 0 },
    timestamp,
    mocked: false,
  } as any
}

describe('calculateActivityMetrics', () => {
  it('returns zeros when fewer than 2 locations are provided', () => {
    expect(calculateActivityMetrics([])).toEqual({
      distanceKm: 0,
      avgSpeedKmh: 0,
      maxSpeedKmh: 0,
      caloriesBurned: 0,
      recordedPath: [],
    })

    const single = [loc(20.97, -89.62, 1000)]
    const result = calculateActivityMetrics(single)
    expect(result.distanceKm).toBe(0)
    expect(result.recordedPath).toHaveLength(1)
  })

  it('calculates distance between two points using Haversine formula', () => {
    // Mérida city center to roughly 1 km north
    const start = loc(20.9674, -89.5926, 0)
    const end = loc(20.9764, -89.5926, 3600_000) // 1 hour later

    const result = calculateActivityMetrics([start, end])

    // ~1 km between these coordinates (Haversine)
    expect(result.distanceKm).toBeGreaterThan(0.9)
    expect(result.distanceKm).toBeLessThan(1.2)
  })

  it('calculates average speed as distance / duration in hours', () => {
    const start = loc(20.9674, -89.5926, 0)
    const end = loc(20.9764, -89.5926, 3600_000) // 1 hour

    const result = calculateActivityMetrics([start, end])

    // ~1 km in 1 hour = ~1 km/h
    expect(result.avgSpeedKmh).toBeGreaterThan(0.5)
    expect(result.avgSpeedKmh).toBeLessThan(2)
  })

  it('calculates calories as ~30 per km', () => {
    const start = loc(20.9674, -89.5926, 0)
    const end = loc(20.9764, -89.5926, 3600_000)

    const result = calculateActivityMetrics([start, end])

    // ~1 km × 30 = ~30 cal
    expect(result.caloriesBurned).toBeCloseTo(30, -1) // within ±5
  })

  it('converts max speed from m/s to km/h', () => {
    const start = loc(20.9674, -89.5926, 0, 0)
    const end = loc(20.9764, -89.5926, 3600_000, 10) // 10 m/s = 36 km/h

    const result = calculateActivityMetrics([start, end])

    expect(result.maxSpeedKmh).toBeCloseTo(36, 0)
  })

  it('builds recordedPath as [lng, lat] pairs (GeoJSON order)', () => {
    const locations = [
      loc(20.9674, -89.5926, 0),
      loc(20.9764, -89.5930, 3600_000),
    ]

    const result = calculateActivityMetrics(locations)

    expect(result.recordedPath[0]).toEqual([-89.5926, 20.9674]) // [lng, lat]
    expect(result.recordedPath[1]).toEqual([-89.5930, 20.9764])
  })
})