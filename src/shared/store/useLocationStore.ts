import * as Location from "expo-location";
import { create } from "zustand";

interface LocationState {
  permission: boolean | null;
  location: Location.LocationObject | null;
  locationHistory: Location.LocationObject[];
  lastUpdate: number;
  isTracking: boolean;

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

export const useLocationStore = create<LocationState>((set, get) => ({
  permission: null,
  location: null,
  locationHistory: [],
  lastUpdate: 0,
  isTracking: false,

  setPermission: (permission) => set({ permission }),
  setLocation: (location) => set({ location }),

  requestPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      set({ permission: granted });

      if (granted) {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // 👈 Balanced para inicio
        });
        set({ location: currentLocation, lastUpdate: Date.now() });
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
      if (isTracking) {
        const lastLocation = locationHistory[locationHistory.length - 1];

        if (
          !lastLocation ||
          calculateDistance(
            lastLocation.coords.latitude,
            lastLocation.coords.longitude,
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
          ) >= MIN_DISTANCE_METERS
        ) {
          // Usar push + pop en vez de spread (más eficiente)
          newHistory = [...locationHistory, currentLocation];
          if (newHistory.length > MAX_HISTORY) {
            newHistory = newHistory.slice(-MAX_HISTORY);
          }
        }
      }

      set({
        location: currentLocation,
        locationHistory: newHistory,
        lastUpdate: now,
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

    set({ isTracking: true, locationHistory: [] });

    trackingInterval = setInterval(async () => {
      await get().updateLocation(accuracy);
    }, interval);
  },

  stopTracking: () => {
    set({ isTracking: false });
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  },

  clearHistory: () => {
    set({ locationHistory: [] });
  },
}));
