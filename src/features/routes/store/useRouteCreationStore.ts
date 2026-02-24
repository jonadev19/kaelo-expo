import type { WaypointType, RouteDifficulty, RouteTerrainType } from "../types";
import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────
export interface DraftWaypoint {
  id: string;
  name: string;
  description: string | null;
  waypoint_type: WaypointType;
  lng: number;
  lat: number;
  image_url: string | null;
}

export interface DraftBusiness {
  business_id: string;
  name: string;
  business_type: string;
  cover_image_url: string | null;
  average_rating: number | null;
  address: string;
  phone: string | null;
  lng: number;
  lat: number;
  distance_from_route_m: number | null;
  notes: string | null;
  selected: boolean;
}

export interface RouteDetails {
  name: string;
  description: string;
  difficulty: RouteDifficulty;
  terrain_type: RouteTerrainType;
  municipality: string;
  tags: string[];
  cover_image_uri: string | null; // local URI from image picker
  is_free: boolean;
  price: number;
  estimated_duration_min: number | null;
}

interface SnappedRoute {
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  distance: number; // meters
  duration: number; // seconds
}

// ── Store State ────────────────────────────────────────────
interface RouteCreationState {
  currentStep: number;
  draftPoints: [number, number][]; // [lng, lat]
  snappedRoute: SnappedRoute | null;
  waypoints: DraftWaypoint[];
  businesses: DraftBusiness[];
  details: RouteDetails;
  isSaving: boolean;
}

interface RouteCreationActions {
  setCurrentStep: (step: number) => void;
  addPoint: (coord: [number, number]) => void;
  removePoint: (index: number) => void;
  undoLastPoint: () => void;
  clearPoints: () => void;
  setSnappedRoute: (route: SnappedRoute | null) => void;
  addWaypoint: (wp: DraftWaypoint) => void;
  updateWaypoint: (id: string, wp: Partial<DraftWaypoint>) => void;
  removeWaypoint: (id: string) => void;
  reorderWaypoints: (fromIndex: number, toIndex: number) => void;
  setBusinesses: (businesses: DraftBusiness[]) => void;
  toggleBusiness: (businessId: string) => void;
  setBusinessNotes: (businessId: string, notes: string) => void;
  setDetails: (details: Partial<RouteDetails>) => void;
  setIsSaving: (saving: boolean) => void;
  reset: () => void;
}

export type RouteCreationStore = RouteCreationState & RouteCreationActions;

// ── Defaults ───────────────────────────────────────────────
const defaultDetails: RouteDetails = {
  name: "",
  description: "",
  difficulty: "moderada",
  terrain_type: "asfalto",
  municipality: "",
  tags: [],
  cover_image_uri: null,
  is_free: true,
  price: 0,
  estimated_duration_min: null,
};

const initialState: RouteCreationState = {
  currentStep: 1,
  draftPoints: [],
  snappedRoute: null,
  waypoints: [],
  businesses: [],
  details: { ...defaultDetails },
  isSaving: false,
};

// ── Store ──────────────────────────────────────────────────
export const useRouteCreationStore = create<RouteCreationStore>((set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),

  addPoint: (coord) =>
    set((s) => ({ draftPoints: [...s.draftPoints, coord] })),

  removePoint: (index) =>
    set((s) => ({
      draftPoints: s.draftPoints.filter((_, i) => i !== index),
    })),

  undoLastPoint: () =>
    set((s) => ({
      draftPoints: s.draftPoints.slice(0, -1),
    })),

  clearPoints: () => set({ draftPoints: [], snappedRoute: null }),

  setSnappedRoute: (route) => set({ snappedRoute: route }),

  addWaypoint: (wp) =>
    set((s) => ({ waypoints: [...s.waypoints, wp] })),

  updateWaypoint: (id, partial) =>
    set((s) => ({
      waypoints: s.waypoints.map((w) =>
        w.id === id ? { ...w, ...partial } : w,
      ),
    })),

  removeWaypoint: (id) =>
    set((s) => ({
      waypoints: s.waypoints.filter((w) => w.id !== id),
    })),

  reorderWaypoints: (fromIndex, toIndex) =>
    set((s) => {
      const arr = [...s.waypoints];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return { waypoints: arr };
    }),

  setBusinesses: (businesses) => set({ businesses }),

  toggleBusiness: (businessId) =>
    set((s) => ({
      businesses: s.businesses.map((b) =>
        b.business_id === businessId ? { ...b, selected: !b.selected } : b,
      ),
    })),

  setBusinessNotes: (businessId, notes) =>
    set((s) => ({
      businesses: s.businesses.map((b) =>
        b.business_id === businessId ? { ...b, notes } : b,
      ),
    })),

  setDetails: (partial) =>
    set((s) => ({ details: { ...s.details, ...partial } })),

  setIsSaving: (saving) => set({ isSaving: saving }),

  reset: () => set({ ...initialState, details: { ...defaultDetails } }),
}));
