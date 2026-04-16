import ENV from "@/config/env";
import type {
  DirectionsResponse,
  NavigationStep,
  VoiceInstruction,
} from "../types/navigation";

/**
 * Fetches cycling directions from the Mapbox Directions API.
 * @param start [lng, lat]
 * @param end [lng, lat]
 * @param waypoints optional intermediate points [[lng, lat], ...]
 */
export async function fetchDirections(
  start: [number, number],
  end: [number, number],
  waypoints?: [number, number][],
): Promise<DirectionsResponse> {
  const allCoords = [start, ...(waypoints ?? []), end];
  const coordinatesStr = allCoords.map((c) => `${c[0]},${c[1]}`).join(";");

  const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${coordinatesStr}?steps=true&geometries=geojson&overview=full&banner_instructions=true&voice_instructions=true&roundabout_exits=true&language=es&access_token=${ENV.MAPBOX_ACCESS_TOKEN}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Directions API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No se encontró una ruta disponible");
  }

  const route = data.routes[0];
  const legs = route.legs;

  // Flatten steps from all legs
  const steps: NavigationStep[] = [];
  for (const leg of legs) {
    for (const step of leg.steps) {
      const voiceInstructions: VoiceInstruction[] = (
        step.voiceInstructions ?? []
      ).map((vi: any) => ({
        announcement: vi.announcement ?? "",
        distanceAlongGeometry: vi.distanceAlongGeometry ?? 0,
      }));

      steps.push({
        instruction:
          step.bannerInstructions?.[0]?.primary?.text ??
          step.maneuver.instruction ??
          "",
        distance: step.distance,
        duration: step.duration,
        maneuver: {
          type: step.maneuver.type,
          modifier: step.maneuver.modifier,
          bearing_before: step.maneuver.bearing_before,
          bearing_after: step.maneuver.bearing_after,
          location: step.maneuver.location,
        },
        name: step.name ?? "",
        voiceInstructions,
      });
    }
  }

  return {
    steps,
    geometry: route.geometry,
    duration: route.duration,
    distance: route.distance,
  };
}
