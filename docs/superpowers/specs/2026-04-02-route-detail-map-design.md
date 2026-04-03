# Route Detail Map Improvements — Design Spec

## Overview

Improve the map section in `RouteDetailScreen` to be interactive, visually informative, and properly handle premium/free access. Currently the map is a static 200px card with no zoom-to-fit, generic dot markers, and a crude 20% coordinate preview for non-purchasers.

## Decisions

1. **Interaction model:** Expandible to fullscreen (tap to expand, X to close)
2. **Markers:** Pin-style markers with icons by type (start=green ▶, end=red 🏁, waypoints by type)
3. **Premium preview:** Full route visible with blur overlay + lock icon + CTA. Fullscreen disabled.
4. **Zoom-to-fit:** Automatic camera bounds fitting all route coordinates with padding
5. **Route line:** Thicker solid line with outline for contrast

## Architecture

### New components

**`RouteDetailMap.tsx`** — `src/features/routes/components/RouteDetailMap.tsx`

Extracted map component that handles:
- Inline preview mode (~250px height, non-interactive, zoom-to-fit)
- Fullscreen mode (Modal, full zoom/pan controls, close button)
- Route line rendering (full LineString from `route_geojson`)
- Start/end markers + waypoint markers
- Premium blur overlay when user has no access
- Camera bounds calculation from route coordinates

Props:
```ts
interface RouteDetailMapProps {
  routeGeojson: { type: "LineString"; coordinates: number[][] };
  waypoints: RouteWaypoint[];
  hasAccess: boolean; // whether user purchased the route
  isDark: boolean;
}
```

State:
- `isFullscreen: boolean` — controls Modal visibility
- Camera ref for bounds fitting

**`RouteMarker.tsx`** — `src/features/routes/components/RouteMarker.tsx`

Pin marker component for Mapbox `PointAnnotation` or `MarkerView`:
- Renders a colored pin shape with icon inside
- Props: `type` (start | end | waypoint_type), `coordinate: [lng, lat]`, `name?: string`
- Maps `waypoint_type` to emoji/icon (cenote→💧, mirador→👁, restaurante→🍽, etc.)
- Start = green pin with ▶, End = red pin with 🏁

### Modified files

**`RouteDetailScreen.tsx`** — Replace the inline map section (lines ~310-418) with `<RouteDetailMap>` component. Remove all Mapbox imports from this file.

## Behavior Details

### Zoom-to-fit

Calculate bounding box from all route coordinates:
```ts
const bounds = {
  ne: [maxLng, maxLat],
  sw: [minLng, minLat],
};
camera.fitBounds(bounds.ne, bounds.sw, [50, 50, 50, 50]); // padding
```

Applied on mount for both preview and fullscreen modes. In fullscreen, user can then zoom/pan freely.

### Fullscreen mode

- Triggered by `TouchableOpacity` wrapping the preview map
- Renders a `Modal` with `animationType="slide"`
- Inside modal: full-screen `MapView` with all interactions enabled
- Close button (X) positioned absolute top-right
- All markers and route line rendered same as preview
- Premium users only — non-purchasers cannot expand

### Premium blur overlay

For users without access (`hasAccess === false`):
- Route line is rendered fully (all coordinates) so zoom-to-fit works
- A `View` overlay with `BlurView` (from `expo-blur`) covers the map
- Overlay contains: lock icon + text "Compra esta ruta para ver el mapa completo"
- Map is NOT touchable (cannot expand to fullscreen)
- Waypoint markers are NOT rendered (only start marker visible)

### Waypoint type icon mapping

| waypoint_type | Icon |
|---|---|
| inicio | ▶ (green pin) |
| fin | 🏁 (red pin) |
| cenote | 💧 |
| zona_arqueologica | 🏛 |
| mirador | 👁 |
| restaurante | 🍽 |
| tienda | 🛒 |
| taller_bicicletas | 🔧 |
| descanso | 🪑 |
| punto_agua | 🚰 |
| peligro | ⚠️ |
| foto | 📸 |
| otro | 📍 |

### Route line styling

- Width: 4px with 1px outline (casing line technique in Mapbox)
- Color: `colors.mapRoute` from theme (with darker outline)
- LineJoin: round, LineCap: round

## Out of scope

- Elevation profile on the map
- Animated route drawing
- 3D terrain
- Offline map tiles
