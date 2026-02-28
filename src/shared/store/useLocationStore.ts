import * as Location from "expo-location";
import { create } from "zustand";

export type GpsSignalQuality = "excellent" | "good" | "fair" | "poor" | "none";

interface LocationState {
  permission: boolean | null;
  location: Location.LocationObject | null;
  locationHistory: Location.LocationObject[];
  lastUpdate: number;
  isTracking: boolean;
  gpsSignal: GpsSignalQuality;
  trackingStartedAt: number | null;
  distanceTraveled: number; // metros recorridos en la sesión actual
  currentSpeed: number; // m/s velocidad actual del GPS

  setPermission: (permission: boolean) => void;
  setLocation: (location: Location.LocationObject) => void;
  requestPermission: () => Promise<boolean>;
  updateLocation: (
    accuracy?: Location.Accuracy,
  ) => Promise<Location.LocationObject | null>;
  startTracking: (accuracy?: Location.Accuracy, interval?: number) => void;
  stopTracking: () => void;
  clearHistory: () => void;
}

const THROTTLE_TIME = 2000;
const MAX_HISTORY = 100;
const MIN_DISTANCE_METERS = 10; // 👈 Solo agregar si se movió >10m
let trackingInterval: ReturnType<typeof setInterval> | null = null;

// Helper para calcular distancia entre dos puntos
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Radio de la tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/** Determine GPS signal quality from accuracy */
const getSignalQuality = (accuracy: number | undefined): GpsSignalQuality => {
  if (accuracy == null) return "none";
  if (accuracy <= 5) return "excellent";
  if (accuracy <= 10) return "good";
  if (accuracy <= 20) return "fair";
  return "poor";
};

export const useLocationStore = create<LocationState>((set, get) => ({
  permission: null,
  location: null,
  locationHistory: [],
  lastUpdate: 0,
  isTracking: false,
  gpsSignal: "none",
  trackingStartedAt: null,
  distanceTraveled: 0,
  currentSpeed: 0,

  setPermission: (permission) => set({ permission }),
  setLocation: (location) => set({ location }),

  requestPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      set({ permission: granted });

      if (granted) {
        // Verificar que los servicios de ubicación estén habilitados
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (servicesEnabled) {
          try {
            const currentLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            set({ location: currentLocation, lastUpdate: Date.now() });
          } catch (locError) {
            console.warn(
              "Permiso concedido pero no se pudo obtener ubicación actual:",
              locError,
            );
          }
        } else {
          console.warn(
            "Permiso concedido pero los servicios de ubicación están desactivados",
          );
        }
      }

      return granted;
    } catch (error) {
      console.error("Error al solicitar permiso:", error);
      return false;
    }
  },

  updateLocation: async (accuracy = Location.Accuracy.Balanced) => {
    try {
      const { permission, location, lastUpdate, locationHistory, isTracking } =
        get();
      const now = Date.now();

      if (!isTracking && now - lastUpdate < THROTTLE_TIME && location) {
        return location;
      }

      if (!permission) return null;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy,
      });

      // 👇 Solo agregar si se movió significativamente (optimización)
      let newHistory = locationHistory;
      let addedDistance = 0;
      if (isTracking) {
        const lastLocation = locationHistory[locationHistory.length - 1];

        if (lastLocation) {
          const segmentDist = calculateDistance(
            lastLocation.coords.latitude,
            lastLocation.coords.longitude,
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
          );
          if (segmentDist >= MIN_DISTANCE_METERS) {
            addedDistance = segmentDist;
            newHistory = [...locationHistory, currentLocation];
            if (newHistory.length > MAX_HISTORY) {
              newHistory = newHistory.slice(-MAX_HISTORY);
            }
          }
        } else {
          // Primer punto del tracking
          newHistory = [currentLocation];
        }
      }

      set({
        location: currentLocation,
        locationHistory: newHistory,
        lastUpdate: now,
        distanceTraveled: get().distanceTraveled + addedDistance,
        currentSpeed: Math.max(0, currentLocation.coords.speed ?? 0),
        gpsSignal: getSignalQuality(
          currentLocation.coords.accuracy ?? undefined,
        ),
      });

      return currentLocation;
    } catch (error) {
      console.error("Error al actualizar ubicación:", error);
      return get().location;
    }
  },

  startTracking: (
    accuracy = Location.Accuracy.High, // 👈 High en vez de BestForNavigation
    interval = 5000, // 👈 5 segundos en vez de 3 (configurable)
  ) => {
    const { isTracking } = get();
    if (isTracking) return;

    set({
      isTracking: true,
      locationHistory: [],
      distanceTraveled: 0,
      currentSpeed: 0,
      trackingStartedAt: Date.now(),
    });

    trackingInterval = setInterval(async () => {
      await get().updateLocation(accuracy);
    }, interval);
  },

  stopTracking: () => {
    set({ isTracking: false, trackingStartedAt: null });
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  },

  clearHistory: () => {
    set({ locationHistory: [] });
  },
}));
