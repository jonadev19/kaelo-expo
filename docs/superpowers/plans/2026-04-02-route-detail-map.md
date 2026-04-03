# Route Detail Map Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static 200px map in RouteDetailScreen with an expandable fullscreen map featuring zoom-to-fit, pin markers with icons by waypoint type, and a premium overlay for non-purchasers.

**Architecture:** Extract map from RouteDetailScreen into a new `RouteDetailMap` component with inline preview and fullscreen Modal. Create a `WaypointMarker` component for typed pin markers. Premium users see blurred overlay (semi-transparent) with lock CTA instead of blur (no expo-blur dependency).

**Tech Stack:** @rnmapbox/maps (already installed), React Native Modal, Ionicons

**Important context:**
- The existing `RouteMarker.tsx` is for difficulty-colored markers on the Explore map — do NOT modify it. Our new component is `WaypointMarker.tsx`.
- `expo-blur` is NOT installed. Premium overlay uses a semi-transparent View overlay instead.
- Route coordinates are `route_geojson: { type: "LineString", coordinates: [lng, lat][] } | null`
- Waypoints have `lng`, `lat`, `waypoint_type` (WaypointType union), `name`, `id`
- Theme colors available: `colors.mapRoute`, `colors.mapPOI`, `colors.primary`, `colors.text`, `colors.background`
- `hasFullAccess` is already computed in RouteDetailScreen (line 106): `route.is_free || isCreator || hasPurchased`
- Map section to replace is lines 309-418 of `RouteDetailScreen.tsx`
- `visibleWaypoints` and `limitWaypointsForPreview` are already defined for the waypoint list section and should continue to work for that section — the map component receives `waypoints` (all) and `hasAccess` to decide what to show.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/features/routes/components/WaypointMarker.tsx` | Create | Pin marker with emoji icon based on waypoint_type |
| `src/features/routes/components/RouteDetailMap.tsx` | Create | Inline preview map + fullscreen Modal, zoom-to-fit, route line, markers, premium overlay |
| `src/features/routes/screens/RouteDetailScreen.tsx` | Modify | Replace inline map section (lines 309-418) with `<RouteDetailMap>` component |

---

### Task 1: Create WaypointMarker component

**Files:**
- Create: `src/features/routes/components/WaypointMarker.tsx`

**Context:** A pin-shaped marker that renders an emoji inside based on `waypoint_type`. Start waypoints get a green pin with ▶, end gets red with 🏁, others get a purple pin with type-specific emoji. Used by RouteDetailMap for Mapbox PointAnnotation children.

- [ ] **Step 1: Create the WaypointMarker component**

Create `src/features/routes/components/WaypointMarker.tsx`:

```tsx
import { StyleSheet, Text, View } from "react-native";
import type { WaypointType } from "../types";

const WAYPOINT_ICONS: Record<WaypointType, string> = {
  inicio: "▶",
  fin: "🏁",
  cenote: "💧",
  zona_arqueologica: "🏛",
  mirador: "👁",
  restaurante: "🍽",
  tienda: "🛒",
  taller_bicicletas: "🔧",
  descanso: "🪑",
  punto_agua: "🚰",
  peligro: "⚠️",
  foto: "📸",
  otro: "📍",
};

function getPinColor(type: WaypointType): string {
  if (type === "inicio") return "#22c55e";
  if (type === "fin") return "#ef4444";
  return "#6366f1";
}

interface WaypointMarkerProps {
  type: WaypointType;
}

export function WaypointMarker({ type }: WaypointMarkerProps) {
  const color = getPinColor(type);
  const icon = WAYPOINT_ICONS[type] ?? "📍";
  const isStartOrEnd = type === "inicio" || type === "fin";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.pin,
          isStartOrEnd ? styles.pinLarge : styles.pinSmall,
          { backgroundColor: color },
        ]}
      >
        <Text style={isStartOrEnd ? styles.iconLarge : styles.iconSmall}>
          {icon}
        </Text>
      </View>
      <View style={[styles.arrow, { borderTopColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  pin: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pinLarge: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  pinSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  iconLarge: {
    fontSize: 14,
  },
  iconSmall: {
    fontSize: 11,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
});
```

- [ ] **Step 2: Verify file exists and has no syntax errors**

Run: `npx tsc --noEmit src/features/routes/components/WaypointMarker.tsx 2>&1 | head -10`

- [ ] **Step 3: Commit**

```bash
git add src/features/routes/components/WaypointMarker.tsx
git commit -m "feat(routes): create WaypointMarker component with typed pin icons"
```

---

### Task 2: Create RouteDetailMap component

**Files:**
- Create: `src/features/routes/components/RouteDetailMap.tsx`

**Context:** This is the main component. It renders an inline preview map (~250px) that shows the route with zoom-to-fit. When the user taps it (and has access), a fullscreen Modal opens with full interaction. Premium users without access see an overlay with lock icon.

Key Mapbox APIs:
- `Mapbox.Camera` with `bounds` prop for zoom-to-fit: `bounds={{ ne: [maxLng, maxLat], sw: [minLng, minLat], paddingTop: 50, paddingBottom: 50, paddingLeft: 50, paddingRight: 50 }}`
- `Mapbox.ShapeSource` + `Mapbox.LineLayer` for route line
- `Mapbox.PointAnnotation` with children for custom markers

- [ ] **Step 1: Create the RouteDetailMap component**

Create `src/features/routes/components/RouteDetailMap.tsx`:

```tsx
import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RouteWaypoint } from "../types";
import { WaypointMarker } from "./WaypointMarker";

interface RouteDetailMapProps {
  routeGeojson: {
    type: "LineString";
    coordinates: [number, number][];
  };
  waypoints: RouteWaypoint[];
  hasAccess: boolean;
  startCoordinate: [number, number]; // [lng, lat] fallback
}

function calculateBounds(coordinates: [number, number][]) {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coordinates) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return {
    ne: [maxLng, maxLat] as [number, number],
    sw: [minLng, minLat] as [number, number],
  };
}

export function RouteDetailMap({
  routeGeojson,
  waypoints,
  hasAccess,
  startCoordinate,
}: RouteDetailMapProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const bounds = useMemo(() => {
    if (routeGeojson.coordinates.length < 2) return null;
    return calculateBounds(routeGeojson.coordinates);
  }, [routeGeojson.coordinates]);

  const mapStyleURL = isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors;

  const routeShape = useMemo(
    () => ({
      type: "Feature" as const,
      properties: {},
      geometry: routeGeojson,
    }),
    [routeGeojson],
  );

  const renderMapContent = (isModal: boolean) => (
    <>
      <Mapbox.Camera
        defaultSettings={
          bounds
            ? undefined
            : { centerCoordinate: startCoordinate, zoomLevel: 12 }
        }
        bounds={
          bounds
            ? {
                ne: bounds.ne,
                sw: bounds.sw,
                paddingTop: isModal ? 80 : 50,
                paddingBottom: isModal ? 80 : 50,
                paddingLeft: 50,
                paddingRight: 50,
              }
            : undefined
        }
        animationDuration={0}
      />

      {/* Route line outline (casing) */}
      <Mapbox.ShapeSource id={`route-casing-${isModal ? "fs" : "pv"}`} shape={routeShape}>
        <Mapbox.LineLayer
          id={`route-casing-line-${isModal ? "fs" : "pv"}`}
          style={{
            lineColor: isDark ? "#000000" : "#FFFFFF",
            lineWidth: 7,
            lineCap: "round",
            lineJoin: "round",
            lineOpacity: hasAccess ? 0.6 : 0.3,
          }}
        />
      </Mapbox.ShapeSource>

      {/* Route line */}
      <Mapbox.ShapeSource id={`route-path-${isModal ? "fs" : "pv"}`} shape={routeShape}>
        <Mapbox.LineLayer
          id={`route-line-${isModal ? "fs" : "pv"}`}
          style={{
            lineColor: colors.mapRoute,
            lineWidth: 4,
            lineCap: "round",
            lineJoin: "round",
            lineOpacity: hasAccess ? 1 : 0.4,
          }}
        />
      </Mapbox.ShapeSource>

      {/* Start marker — always visible */}
      {routeGeojson.coordinates.length > 0 && (
        <Mapbox.PointAnnotation
          id="marker-start"
          coordinate={routeGeojson.coordinates[0]}
        >
          <WaypointMarker type="inicio" />
        </Mapbox.PointAnnotation>
      )}

      {/* End marker — always visible */}
      {routeGeojson.coordinates.length > 1 && (
        <Mapbox.PointAnnotation
          id="marker-end"
          coordinate={routeGeojson.coordinates[routeGeojson.coordinates.length - 1]}
        >
          <WaypointMarker type="fin" />
        </Mapbox.PointAnnotation>
      )}

      {/* Waypoint markers — only when user has access */}
      {hasAccess &&
        waypoints
          .filter((wp) => wp.waypoint_type !== "inicio" && wp.waypoint_type !== "fin")
          .map((wp) => (
            <Mapbox.PointAnnotation
              key={wp.id}
              id={`wp-${wp.id}`}
              coordinate={[wp.lng, wp.lat]}
            >
              <WaypointMarker type={wp.waypoint_type} />
            </Mapbox.PointAnnotation>
          ))}
    </>
  );

  return (
    <>
      {/* Inline preview */}
      <Pressable
        onPress={() => hasAccess && setIsFullscreen(true)}
        style={[styles.mapContainer, { borderColor: colors.border }]}
      >
        <Mapbox.MapView
          style={styles.mapView}
          styleURL={mapStyleURL}
          scrollEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          scaleBarEnabled={false}
        >
          {renderMapContent(false)}
        </Mapbox.MapView>

        {/* Premium overlay */}
        {!hasAccess && (
          <View style={styles.premiumOverlay}>
            <View style={styles.premiumContent}>
              <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
              <Text style={styles.premiumText}>
                Compra esta ruta para ver el mapa completo
              </Text>
            </View>
          </View>
        )}

        {/* Expand hint for users with access */}
        {hasAccess && (
          <View style={styles.expandHint}>
            <Ionicons name="expand-outline" size={16} color="#FFFFFF" />
          </View>
        )}
      </Pressable>

      {/* Fullscreen modal */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenContainer}>
          <Mapbox.MapView
            style={styles.fullscreenMap}
            styleURL={mapStyleURL}
            logoEnabled={false}
            attributionEnabled={false}
            compassEnabled={true}
            scaleBarEnabled={true}
          >
            {renderMapContent(true)}
          </Mapbox.MapView>

          {/* Close button */}
          <Pressable
            style={[styles.closeButton, { top: insets.top + 12 }]}
            onPress={() => setIsFullscreen(false)}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  mapView: {
    flex: 1,
  },
  premiumOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumContent: {
    alignItems: "center",
    gap: 8,
  },
  premiumText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  expandHint: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullscreenMap: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit 2>&1 | grep -i "RouteDetailMap" | head -10`

If there are type issues with Mapbox Camera bounds, the `bounds` prop format may need adjustment. Check the @rnmapbox/maps types for `CameraBoundsWithPadding`.

- [ ] **Step 3: Commit**

```bash
git add src/features/routes/components/RouteDetailMap.tsx
git commit -m "feat(routes): create RouteDetailMap with fullscreen, zoom-to-fit, and premium overlay"
```

---

### Task 3: Wire RouteDetailMap into RouteDetailScreen

**Files:**
- Modify: `src/features/routes/screens/RouteDetailScreen.tsx`

**Context:** Replace lines 309-418 (the entire Route Map section) with the new `<RouteDetailMap>` component. Remove unused Mapbox import since the screen no longer renders map elements directly. Keep all other sections unchanged.

- [ ] **Step 1: Add RouteDetailMap import**

At the top of `src/features/routes/screens/RouteDetailScreen.tsx`, add this import (below the existing component imports around line 34):

```ts
import { RouteDetailMap } from "../components/RouteDetailMap";
```

- [ ] **Step 2: Remove the Mapbox import**

Remove this line (line 15):

```ts
import Mapbox from "@rnmapbox/maps";
```

- [ ] **Step 3: Replace the map section**

Replace the entire map section (lines 309-418, from `{/* Route Map */}` to the closing `</View>` of that section) with:

```tsx
        {/* Route Map */}
        {route.route_geojson && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Mapa de la ruta
            </Text>
            <RouteDetailMap
              routeGeojson={route.route_geojson}
              waypoints={waypoints as RouteWaypoint[]}
              hasAccess={hasFullAccess}
              startCoordinate={[route.start_lng, route.start_lat]}
            />
          </View>
        )}
```

- [ ] **Step 4: Remove unused styles**

Remove these styles from the StyleSheet that are no longer needed (they were only used by the old inline map):

- `mapContainer` (now in RouteDetailMap)
- `mapView` (now in RouteDetailMap)
- `mapPremiumOverlay` (now in RouteDetailMap)
- `mapPremiumText` (now in RouteDetailMap)
- `waypointDot` (replaced by WaypointMarker)

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

Check there are no errors related to RouteDetailScreen or RouteDetailMap. Pre-existing errors in other files are fine.

- [ ] **Step 6: Manual test checklist**

Test in the app:
1. Open a route detail — map should show at ~250px with route line and zoom-to-fit
2. Start and end markers should be green (▶) and red (🏁) pins
3. Waypoints should show as purple pins with type-specific emojis
4. Tap the map — should expand to fullscreen with slide animation
5. In fullscreen: zoom, pan, pinch should all work
6. Close button (X) should close and return to detail scroll
7. For a non-purchased premium route: map shows with overlay, lock icon, "Compra esta ruta..." text
8. Tapping the premium map should NOT open fullscreen
9. Route line should have outline/casing for contrast

- [ ] **Step 7: Commit**

```bash
git add src/features/routes/screens/RouteDetailScreen.tsx
git commit -m "feat(routes): replace inline map with RouteDetailMap component

Extracts map into dedicated component with fullscreen modal,
zoom-to-fit, typed waypoint markers, and premium overlay."
```

---

## Summary

| Task | What it does | Files |
|------|-------------|-------|
| 1 | WaypointMarker — pin with emoji by type | `WaypointMarker.tsx` (new) |
| 2 | RouteDetailMap — preview + fullscreen + zoom-to-fit + overlay | `RouteDetailMap.tsx` (new) |
| 3 | Wire into RouteDetailScreen, remove old map code | `RouteDetailScreen.tsx` (modify) |
