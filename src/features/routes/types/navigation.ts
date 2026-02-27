/** Maneuver info from Mapbox Directions API */
export interface NavigationManeuver {
  type: string; // "turn", "depart", "arrive", "merge", "fork", "roundabout", etc.
  modifier?: string; // "left", "right", "straight", "slight left", "slight right", "sharp left", "sharp right", "uturn"
  bearing_before: number;
  bearing_after: number;
  location: [number, number]; // [lng, lat]
}

/** A single step in the navigation directions */
export interface NavigationStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  maneuver: NavigationManeuver;
  name: string; // street name
}

/** Response from our directions API wrapper */
export interface DirectionsResponse {
  steps: NavigationStep[];
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  duration: number; // total seconds
  distance: number; // total meters
}

/** State tracked during active navigation */
export interface NavigationState {
  currentStepIndex: number;
  distanceToNextStep: number; // meters
  distanceRemaining: number; // meters
  durationRemaining: number; // seconds
  userBearing: number;
  isNavigating: boolean;
  isLoading: boolean;
  error: string | null;
}
