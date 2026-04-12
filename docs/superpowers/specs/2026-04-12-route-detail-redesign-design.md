# Route Detail Redesign + Multi-Photo Gallery

**Date:** 2026-04-12

## Summary

Redesign the RouteDetailScreen hero section to support a photo carousel and restructure the info layout to match the reference design (card-overlay style). Add multi-photo upload to route creation. Add `elevation_loss_m` field.

## Hero Carousel

Replace the static hero image with a horizontal paged FlatList:

- **Data source**: `[cover_image_url, ...photos]` — cover is always first
- **Height**: ~420px (roughly half screen)
- **Overlay**: bottom gradient (transparent → rgba(0,0,0,0.4)) instead of uniform overlay
- **Top nav bar** (unchanged position): back button (left), favorite + download offline (right), circular buttons with `rgba(0,0,0,0.35)` background
- **Bottom-left**: photo count indicator — gallery icon + number of total photos
- **Bottom-center**: pagination dots (white, inside the hero, just above where the content card overlaps)
- **Bottom-right**: mini map thumbnail (~64x64, rounded 12px) showing a static preview of the route if `route_geojson` exists. Pressable — scrolls to the full map section.

When there is only 1 photo (cover only, no additional photos), no dots and no photo count are shown.

## Content Card

White card with `borderTopLeftRadius: 24, borderTopRightRadius: 24`, overlapping the hero by ~24px (`marginTop: -24`):

**Row 1**: Difficulty badge (colored) + star icon with `average_rating` + person icon with `purchase_count`

**Title**: Route name, large (22px) bold, multi-line allowed

**Info chips row** (moved from below stats to here): terrain type chip + price chip (free/premium)

**Stats grid 2x2** (replaces the horizontal stats bar):
| Left | Right |
|------|-------|
| Duración (`estimated_duration_min`) | Distancia (`distance_km`) |
| Desnivel (`elevation_gain_m`) | Pérdida Elevación (`elevation_loss_m` — new) |

Each stat cell: label on top (small, muted), value below (large, bold).

## Remaining Sections (unchanged functionality, just inside the card)

All existing sections remain in the same order, inside the content card scroll:
1. Description
2. Route Map (full RouteDetailMap)
3. Waypoints (with premium gate limiting)
4. Nearby Businesses carousel
5. Premium Gate CTA (if applicable)
6. Reviews section
7. Tags

No sections are removed or reordered.

## Sticky Footer (redesigned)

Three buttons in a row:
- **Primary (wide)**: "Guardar" with bookmark icon (toggles favorite). If not purchased and route is premium: "Comprar por $X MXN"
- **Secondary (square)**: Navigate icon — starts route navigation (only if hasFullAccess)
- **Secondary (square)**: Share icon — native share sheet with route info

When the user doesn't have access to a premium route, the primary button becomes "Comprar" and the navigate button is disabled/hidden.

## Backend Changes

### New column
- Add `elevation_loss_m INTEGER` to `routes` table (nullable, same as `elevation_gain_m`)

### Elevation calculation
- Modify `calculateElevationGain` in `src/features/routes/api/elevation.ts` to return `{ gain: number, loss: number }` instead of just a number
- The loss calculation: sum of absolute values of negative differences in the elevation array

### RPC update
- Update `get_route_detail` to include `r.elevation_loss_m` in the returned JSON
- Update `get_published_routes` to include `r.elevation_loss_m` (for future use)

### createRoute update
- Pass `elevation_loss_m` to the `create_route` RPC
- Update the `create_route` RPC to accept and store `p_elevation_loss_m`

## Route Creation Changes (Step3)

### Multi-photo picker
- Below the existing cover image picker, add a "Agregar fotos" section
- Uses `expo-image-picker` with `allowsMultipleSelection: true`
- Shows a grid of thumbnails (3 per row)
- Each thumbnail has a remove button (X)
- Reorder via move up/down buttons on each thumbnail
- No limit on number of photos

### Store changes
- Add `photo_uris: string[]` to `RouteDetails` in `useRouteCreationStore`
- Add actions: `addPhotos`, `removePhoto`, `reorderPhotos`

### Upload
- In `createRoute.ts`, upload each photo to Supabase Storage `route-photos/{routeId}/{index}.jpg`
- Upload in parallel with `Promise.all`
- Store resulting public URLs in `routes.photos` jsonb column

## TypeScript Changes

- Add `elevation_loss_m: number | null` to `RouteListItem` and `RouteDetail` interfaces in `types.ts`
- Add `photo_uris: string[]` to `RouteDetails` in `useRouteCreationStore.ts`

## Files to Modify

1. `src/features/routes/screens/RouteDetailScreen.tsx` — full hero + layout redesign
2. `src/features/routes/api/elevation.ts` — return gain + loss
3. `src/features/routes/hooks/useDirectionsForDraft.ts` — handle new return type
4. `src/features/routes/store/useRouteCreationStore.ts` — add photo_uris + actions
5. `src/features/routes/screens/create/Step3DetailsScreen.tsx` — multi-photo picker UI
6. `src/features/routes/api/createRoute.ts` — upload photos + pass elevation_loss
7. `src/features/routes/types.ts` — add elevation_loss_m
8. Supabase migration — add column + update RPCs