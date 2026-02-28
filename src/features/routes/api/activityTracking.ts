import { supabase } from "@/lib/supabase";
import type * as Location from "expo-location";

export interface RouteCompletionData {
  userId: string;
  routeId: string;
  startedAt: string;
  completedAt: string;
  durationMin: number;
  distanceActualKm: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  caloriesBurned: number;
  recordedPath: [number, number][]; // [lng, lat][] GeoJSON coordinates
}

/**
 * Save a completed route activity with GPS track.
 */
export const saveRouteCompletion = async (
  data: RouteCompletionData,
): Promise<string> => {
  const recordedPathGeoJSON = {
    type: "LineString",
    coordinates: data.recordedPath,
  };

  const { data: result, error } = await supabase
    .from("route_completions")
    .insert({
      user_id: data.userId,
      route_id: data.routeId,
      started_at: data.startedAt,
      completed_at: data.completedAt,
      duration_min: data.durationMin,
      distance_actual_km: data.distanceActualKm,
      avg_speed_kmh: data.avgSpeedKmh,
      max_speed_kmh: data.maxSpeedKmh,
      calories_burned: data.caloriesBurned,
      recorded_path: JSON.stringify(recordedPathGeoJSON),
    } as any)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return (result as any).id;
};

/**
 * Calculate activity metrics from location history.
 */
export function calculateActivityMetrics(
  locations: Location.LocationObject[],
): {
  distanceKm: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  caloriesBurned: number;
  recordedPath: [number, number][];
} {
  if (locations.length < 2) {
    return {
      distanceKm: 0,
      avgSpeedKmh: 0,
      maxSpeedKmh: 0,
      caloriesBurned: 0,
      recordedPath: locations.map((l) => [
        l.coords.longitude,
        l.coords.latitude,
      ]),
    };
  }

  let totalDistanceM = 0;
  let maxSpeedMs = 0;
  const path: [number, number][] = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    path.push([loc.coords.longitude, loc.coords.latitude]);

    if (i > 0) {
      const prev = locations[i - 1];
      const dist = haversineDistance(
        prev.coords.latitude,
        prev.coords.longitude,
        loc.coords.latitude,
        loc.coords.longitude,
      );
      totalDistanceM += dist;

      // Speed from location data or calculate
      const speed = loc.coords.speed ?? 0;
      if (speed > maxSpeedMs) maxSpeedMs = speed;
    }
  }

  const firstTime = locations[0].timestamp;
  const lastTime = locations[locations.length - 1].timestamp;
  const durationHours = (lastTime - firstTime) / (1000 * 60 * 60);

  const distanceKm = totalDistanceM / 1000;
  const avgSpeedKmh = durationHours > 0 ? distanceKm / durationHours : 0;
  const maxSpeedKmh = maxSpeedMs * 3.6; // m/s to km/h

  // Rough calorie estimate for cycling: ~30 cal/km
  const caloriesBurned = Math.round(distanceKm * 30);

  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
    maxSpeedKmh: Math.round(maxSpeedKmh * 10) / 10,
    caloriesBurned,
    recordedPath: path,
  };
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLam = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
