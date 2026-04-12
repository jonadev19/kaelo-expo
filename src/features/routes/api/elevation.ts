/**
 * Calculate elevation gain for a route using the Open-Meteo Elevation API.
 * Free, no API key required, supports batch queries.
 */

const MAX_POINTS_PER_REQUEST = 100;

/**
 * Sample evenly-spaced points from a coordinate array.
 * Returns at most `maxPoints` coordinates.
 */
function sampleCoordinates(
  coords: [number, number][],
  maxPoints: number,
): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  const step = (coords.length - 1) / (maxPoints - 1);
  const sampled: [number, number][] = [];
  for (let i = 0; i < maxPoints; i++) {
    sampled.push(coords[Math.round(i * step)]);
  }
  return sampled;
}

/**
 * Fetch elevations from Open-Meteo for a batch of [lng, lat] coordinates.
 * Returns an array of elevation values in meters.
 */
async function fetchElevations(coords: [number, number][]): Promise<number[]> {
  const latitudes = coords.map((c) => c[1]).join(",");
  const longitudes = coords.map((c) => c[0]).join(",");

  const response = await fetch(
    `https://api.open-meteo.com/v1/elevation?latitude=${latitudes}&longitude=${longitudes}`,
  );

  if (!response.ok) {
    throw new Error(`Elevation API error: ${response.status}`);
  }

  const data = await response.json();
  return data.elevation as number[];
}

export interface ElevationResult {
  gain: number;
  loss: number;
}

/**
 * Calculate total positive elevation gain and total elevation loss for a route.
 *
 * @param coordinates Array of [lng, lat] from the route geometry
 * @returns Elevation gain and loss in meters, or zeros if the lookup fails
 */
export async function calculateElevation(
  coordinates: [number, number][],
): Promise<ElevationResult> {
  if (coordinates.length < 2) return { gain: 0, loss: 0 };

  try {
    const sampled = sampleCoordinates(coordinates, MAX_POINTS_PER_REQUEST);
    const elevations = await fetchElevations(sampled);

    let gain = 0;
    let loss = 0;
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) gain += diff;
      else if (diff < 0) loss += Math.abs(diff);
    }

    return { gain: Math.round(gain), loss: Math.round(loss) };
  } catch {
    return { gain: 0, loss: 0 };
  }
}
