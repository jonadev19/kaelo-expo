import { useEffect, useRef } from "react";
import { fetchDirections } from "../api/directions";
import { useRouteCreationStore } from "../store/useRouteCreationStore";

const DEBOUNCE_MS = 600;

/**
 * Watches draftPoints in the creation store and fetches cycling directions
 * from the Mapbox Directions API with a 600ms debounce.
 * Automatically updates the snappedRoute in the store.
 */
export function useDirectionsForDraft() {
  const draftPoints = useRouteCreationStore((s) => s.draftPoints);
  const setSnappedRoute = useRouteCreationStore((s) => s.setSnappedRoute);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear any pending debounce
    if (timerRef.current) clearTimeout(timerRef.current);

    // Need at least 2 points to get a route
    if (draftPoints.length < 2) {
      setSnappedRoute(null);
      return;
    }

    timerRef.current = setTimeout(async () => {
      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const start = draftPoints[0];
        const end = draftPoints[draftPoints.length - 1];
        const intermediates =
          draftPoints.length > 2 ? draftPoints.slice(1, -1) : undefined;

        const result = await fetchDirections(start, end, intermediates);

        setSnappedRoute({
          geometry: result.geometry,
          distance: result.distance,
          duration: result.duration,
        });
      } catch {
        // Silently handle — the user can retry by adding/moving points
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draftPoints, setSnappedRoute]);
}
