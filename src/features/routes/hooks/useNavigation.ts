import { useLocationStore } from "@/shared/store/useLocationStore";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDirections } from "../api/directions";
import type {
  DirectionsResponse,
  NavigationState,
  NavigationStep,
} from "../types/navigation";

const STEP_ADVANCE_THRESHOLD = 30; // meters to advance to next step
const ARRIVAL_THRESHOLD = 50; // meters to consider arrived

/** Haversine distance in meters */
function haversine(
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

/** Calculate bearing from point A to point B in degrees */
function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dLam = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLam) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLam);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

interface UseNavigationReturn {
  navState: NavigationState;
  directions: DirectionsResponse | null;
  currentStep: NavigationStep | null;
  nextStep: NavigationStep | null;
  progress: number; // 0-1
  eta: Date | null;
  hasArrived: boolean;
  startNavigation: (
    startCoord: [number, number],
    endCoord: [number, number],
    waypoints?: [number, number][],
  ) => Promise<void>;
  stopNavigation: () => void;
}

export function useNavigation(): UseNavigationReturn {
  const [directions, setDirections] = useState<DirectionsResponse | null>(null);
  const [hasArrived, setHasArrived] = useState(false);
  const [navState, setNavState] = useState<NavigationState>({
    currentStepIndex: 0,
    distanceToNextStep: 0,
    distanceRemaining: 0,
    durationRemaining: 0,
    userBearing: 0,
    isNavigating: false,
    isLoading: false,
    error: null,
  });

  const directionsRef = useRef<DirectionsResponse | null>(null);
  const navStateRef = useRef(navState);
  navStateRef.current = navState;

  const location = useLocationStore((s) => s.location);
  const startTracking = useLocationStore((s) => s.startTracking);
  const stopTracking = useLocationStore((s) => s.stopTracking);

  // Update navigation state when location changes
  useEffect(() => {
    if (!navStateRef.current.isNavigating || !location || !directionsRef.current)
      return;

    const dirs = directionsRef.current;
    const { coords } = location;
    const userLat = coords.latitude;
    const userLng = coords.longitude;

    let currentIdx = navStateRef.current.currentStepIndex;
    const steps = dirs.steps;

    // Check if we should advance to next step
    if (currentIdx < steps.length - 1) {
      const nextManeuver = steps[currentIdx + 1]?.maneuver.location;
      if (nextManeuver) {
        const distToNext = haversine(
          userLat,
          userLng,
          nextManeuver[1],
          nextManeuver[0],
        );
        if (distToNext < STEP_ADVANCE_THRESHOLD) {
          currentIdx = currentIdx + 1;
        }
      }
    }

    // Calculate distance to current step's end (next maneuver point)
    let distanceToNextStep = 0;
    if (currentIdx < steps.length - 1) {
      const nextManeuver = steps[currentIdx + 1].maneuver.location;
      distanceToNextStep = haversine(
        userLat,
        userLng,
        nextManeuver[1],
        nextManeuver[0],
      );
    }

    // Calculate remaining distance and duration from current step onward
    let distanceRemaining = distanceToNextStep;
    let durationRemaining = 0;
    for (let i = currentIdx + 1; i < steps.length; i++) {
      distanceRemaining += steps[i].distance;
      durationRemaining += steps[i].duration;
    }
    // Add proportional duration for current step
    if (steps[currentIdx]) {
      const stepDist = steps[currentIdx].distance;
      const ratio = stepDist > 0 ? distanceToNextStep / stepDist : 0;
      durationRemaining += steps[currentIdx].duration * Math.min(ratio, 1);
    }

    // Calculate user bearing
    const bearingTarget =
      currentIdx < steps.length - 1
        ? steps[currentIdx + 1].maneuver.location
        : dirs.geometry.coordinates[dirs.geometry.coordinates.length - 1];
    const userBearing = calculateBearing(
      userLat,
      userLng,
      bearingTarget[1],
      bearingTarget[0],
    );

    // Check if arrived at destination
    const lastCoord =
      dirs.geometry.coordinates[dirs.geometry.coordinates.length - 1];
    const distToEnd = haversine(userLat, userLng, lastCoord[1], lastCoord[0]);
    if (distToEnd < ARRIVAL_THRESHOLD) {
      setHasArrived(true);
    }

    setNavState((prev) => ({
      ...prev,
      currentStepIndex: currentIdx,
      distanceToNextStep,
      distanceRemaining,
      durationRemaining,
      userBearing,
    }));
  }, [location]);

  const startNavigation = useCallback(
    async (
      startCoord: [number, number],
      endCoord: [number, number],
      waypoints?: [number, number][],
    ) => {
      setNavState((prev) => ({ ...prev, isLoading: true, error: null }));
      setHasArrived(false);

      try {
        const dirs = await fetchDirections(startCoord, endCoord, waypoints);
        directionsRef.current = dirs;
        setDirections(dirs);

        setNavState({
          currentStepIndex: 0,
          distanceToNextStep: dirs.steps[0]?.distance ?? 0,
          distanceRemaining: dirs.distance,
          durationRemaining: dirs.duration,
          userBearing: dirs.steps[0]?.maneuver.bearing_after ?? 0,
          isNavigating: true,
          isLoading: false,
          error: null,
        });

        // Start GPS tracking at high accuracy, 3 second intervals
        startTracking(Location.Accuracy.High, 3000);
      } catch (err: any) {
        setNavState((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message ?? "Error al obtener direcciones",
        }));
      }
    },
    [startTracking],
  );

  const stopNavigation = useCallback(() => {
    stopTracking();
    directionsRef.current = null;
    setDirections(null);
    setNavState({
      currentStepIndex: 0,
      distanceToNextStep: 0,
      distanceRemaining: 0,
      durationRemaining: 0,
      userBearing: 0,
      isNavigating: false,
      isLoading: false,
      error: null,
    });
  }, [stopTracking]);

  const currentStep =
    directions?.steps[navState.currentStepIndex] ?? null;
  const nextStep =
    directions?.steps[navState.currentStepIndex + 1] ?? null;
  const progress =
    directions && directions.distance > 0
      ? 1 - navState.distanceRemaining / directions.distance
      : 0;
  const eta =
    navState.isNavigating && navState.durationRemaining > 0
      ? new Date(Date.now() + navState.durationRemaining * 1000)
      : null;

  return {
    navState,
    directions,
    currentStep,
    nextStep,
    progress,
    eta,
    hasArrived,
    startNavigation,
    stopNavigation,
  };
}
