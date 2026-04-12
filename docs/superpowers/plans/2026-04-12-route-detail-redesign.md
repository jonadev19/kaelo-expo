# Route Detail Redesign + Multi-Photo Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the RouteDetailScreen with a photo carousel hero, card-overlay layout, stats grid, and multi-photo upload in route creation.

**Architecture:** Add `elevation_loss_m` column and `photos` param to the DB RPC. Modify the elevation API to return both gain and loss. Rewrite the RouteDetailScreen hero as a FlatList carousel with pagination dots. Add a multi-photo picker to Step3 of route creation and parallel upload in createRoute.

**Tech Stack:** React Native FlatList (carousel), expo-image-picker (multi-select), Supabase Storage, Open-Meteo Elevation API, Share API (react-native)

---

### Task 1: Database — Add elevation_loss_m column and update RPCs

**Files:**
- Supabase migration (applied via MCP)

- [ ] **Step 1: Add the elevation_loss_m column**

```sql
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS elevation_loss_m INTEGER;
```

- [ ] **Step 2: Update create_route RPC to accept p_elevation_loss_m and p_photos**

```sql
CREATE OR REPLACE FUNCTION public.create_route(
    p_name text,
    p_description text DEFAULT NULL,
    p_slug text DEFAULT NULL,
    p_route_geojson jsonb DEFAULT NULL,
    p_start_point_geojson jsonb DEFAULT NULL,
    p_end_point_geojson jsonb DEFAULT NULL,
    p_distance_km numeric DEFAULT 0,
    p_elevation_gain_m integer DEFAULT 0,
    p_elevation_loss_m integer DEFAULT 0,
    p_estimated_duration_min integer DEFAULT NULL,
    p_difficulty text DEFAULT 'moderada',
    p_terrain_type text DEFAULT 'asfalto',
    p_status text DEFAULT 'borrador',
    p_price numeric DEFAULT 0,
    p_is_free boolean DEFAULT true,
    p_cover_image_url text DEFAULT NULL,
    p_photos jsonb DEFAULT '[]'::jsonb,
    p_tags jsonb DEFAULT '[]'::jsonb,
    p_municipality text DEFAULT NULL,
    p_waypoints jsonb DEFAULT '[]'::jsonb,
    p_businesses jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_route_id uuid;
  v_creator_id uuid;
  v_wp jsonb;
  v_biz jsonb;
  v_idx integer;
BEGIN
  v_creator_id := auth.uid();
  IF v_creator_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.routes (
    creator_id, name, description, slug,
    route_path, start_point, end_point,
    distance_km, elevation_gain_m, elevation_loss_m, estimated_duration_min,
    difficulty, terrain_type, status,
    price, is_free, cover_image_url, photos,
    tags, municipality,
    published_at
  )
  VALUES (
    v_creator_id, p_name, p_description, p_slug,
    CASE WHEN p_route_geojson IS NOT NULL
      THEN ST_SetSRID(ST_GeomFromGeoJSON(p_route_geojson::text), 4326)
      ELSE NULL END,
    CASE WHEN p_start_point_geojson IS NOT NULL
      THEN ST_SetSRID(ST_GeomFromGeoJSON(p_start_point_geojson::text), 4326)
      ELSE NULL END,
    CASE WHEN p_end_point_geojson IS NOT NULL
      THEN ST_SetSRID(ST_GeomFromGeoJSON(p_end_point_geojson::text), 4326)
      ELSE NULL END,
    p_distance_km, p_elevation_gain_m, p_elevation_loss_m, p_estimated_duration_min,
    p_difficulty, p_terrain_type, p_status,
    p_price, p_is_free, p_cover_image_url, p_photos,
    p_tags, p_municipality,
    CASE WHEN p_status = 'publicado' THEN now() ELSE NULL END
  )
  RETURNING id INTO v_route_id;

  v_idx := 0;
  FOR v_wp IN SELECT * FROM jsonb_array_elements(p_waypoints)
  LOOP
    INSERT INTO public.route_waypoints (
      route_id, location, name, description,
      waypoint_type, image_url, order_index
    )
    VALUES (
      v_route_id,
      ST_SetSRID(ST_MakePoint(
        (v_wp->>'lng')::double precision,
        (v_wp->>'lat')::double precision
      ), 4326),
      v_wp->>'name',
      v_wp->>'description',
      COALESCE(v_wp->>'waypoint_type', 'otro'),
      v_wp->>'image_url',
      COALESCE((v_wp->>'order_index')::integer, v_idx)
    );
    v_idx := v_idx + 1;
  END LOOP;

  v_idx := 0;
  FOR v_biz IN SELECT * FROM jsonb_array_elements(p_businesses)
  LOOP
    INSERT INTO public.route_businesses (
      route_id, business_id,
      distance_from_route_m, order_index, notes
    )
    VALUES (
      v_route_id,
      (v_biz->>'business_id')::uuid,
      (v_biz->>'distance_from_route_m')::integer,
      COALESCE((v_biz->>'order_index')::integer, v_idx),
      v_biz->>'notes'
    );
    v_idx := v_idx + 1;
  END LOOP;

  RETURN v_route_id;
END;
$$;
```

- [ ] **Step 3: Update get_route_detail RPC to return elevation_loss_m**

```sql
-- Re-create get_route_detail adding r.elevation_loss_m to the SELECT list
-- Full function body same as current, but add this line after r.elevation_gain_m:
--   r.elevation_loss_m,
```

Run the full updated `get_route_detail` replacing the existing one. The only change is adding `r.elevation_loss_m` in the route_data subquery after `r.elevation_gain_m`.

- [ ] **Step 4: Verify**

Query to confirm:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'routes' AND column_name = 'elevation_loss_m';
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(db): add elevation_loss_m column and update create_route/get_route_detail RPCs"
```

---

### Task 2: Elevation API — Return gain + loss

**Files:**
- Modify: `src/features/routes/api/elevation.ts`
- Modify: `src/features/routes/hooks/useDirectionsForDraft.ts`
- Modify: `src/features/routes/store/useRouteCreationStore.ts` (SnappedRoute type)

- [ ] **Step 1: Update elevation.ts to return both gain and loss**

Replace the `calculateElevationGain` function in `src/features/routes/api/elevation.ts`:

```typescript
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
```

Keep the old `calculateElevationGain` as a deprecated wrapper for backwards compatibility until all callers are updated, or just remove it since we'll update the only caller next.

- [ ] **Step 2: Update SnappedRoute type in useRouteCreationStore.ts**

In `src/features/routes/store/useRouteCreationStore.ts`, change the `SnappedRoute` interface (line 43-51):

```typescript
interface SnappedRoute {
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  distance: number; // meters
  duration: number; // seconds
  elevationGain: number; // meters
  elevationLoss: number; // meters
}
```

- [ ] **Step 3: Update useDirectionsForDraft.ts to use new API**

In `src/features/routes/hooks/useDirectionsForDraft.ts`, change the import and usage:

```typescript
import { calculateElevation } from "../api/elevation";
```

Replace lines 42-50:

```typescript
        const elevation = await calculateElevation(
          result.geometry.coordinates,
        );

        setSnappedRoute({
          geometry: result.geometry,
          distance: result.distance,
          duration: result.duration,
          elevationGain: elevation.gain,
          elevationLoss: elevation.loss,
        });
```

- [ ] **Step 4: Commit**

```bash
git add src/features/routes/api/elevation.ts src/features/routes/hooks/useDirectionsForDraft.ts src/features/routes/store/useRouteCreationStore.ts
git commit -m "feat(elevation): calculate both gain and loss from Open-Meteo API"
```

---

### Task 3: Types — Add elevation_loss_m to route types

**Files:**
- Modify: `src/features/routes/types.ts`

- [ ] **Step 1: Add elevation_loss_m to RouteListItem**

In `src/features/routes/types.ts`, add after `elevation_gain_m` (line 27):

```typescript
    elevation_loss_m: number | null;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/routes/types.ts
git commit -m "feat(types): add elevation_loss_m to route types"
```

---

### Task 4: createRoute API — Upload photos + pass elevation_loss

**Files:**
- Modify: `src/features/routes/api/createRoute.ts`
- Modify: `src/features/routes/store/useRouteCreationStore.ts`

- [ ] **Step 1: Add photo_uris to RouteDetails and actions to the store**

In `src/features/routes/store/useRouteCreationStore.ts`, update `RouteDetails` (add after `cover_image_uri`):

```typescript
  photo_uris: string[]; // local URIs from image picker
```

Add to `RouteCreationActions` interface:

```typescript
  addPhotos: (uris: string[]) => void;
  removePhoto: (index: number) => void;
  reorderPhotos: (fromIndex: number, toIndex: number) => void;
```

Update `defaultDetails`:

```typescript
  photo_uris: [],
```

Add action implementations inside the `create` callback:

```typescript
  addPhotos: (uris) =>
    set((s) => ({
      details: { ...s.details, photo_uris: [...s.details.photo_uris, ...uris] },
    })),

  removePhoto: (index) =>
    set((s) => ({
      details: {
        ...s.details,
        photo_uris: s.details.photo_uris.filter((_, i) => i !== index),
      },
    })),

  reorderPhotos: (fromIndex, toIndex) =>
    set((s) => {
      const arr = [...s.details.photo_uris];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return { details: { ...s.details, photo_uris: arr } };
    }),
```

- [ ] **Step 2: Add uploadPhotos function and update createRoute in createRoute.ts**

In `src/features/routes/api/createRoute.ts`, add after the `uploadCoverImage` function:

```typescript
/**
 * Upload multiple photos to Supabase Storage in parallel.
 * Returns an array of public URLs.
 */
async function uploadPhotos(uris: string[]): Promise<string[]> {
  if (uris.length === 0) return [];

  const uploads = uris.map(async (uri, index) => {
    const fileName = `route-photos/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.jpg`;
    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });

    if (error) throw new Error(`Photo upload failed: ${error.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);

    return publicUrl;
  });

  return Promise.all(uploads);
}
```

Then update the `createRoute` function body. After the `coverImageUrl` line (line 60), add:

```typescript
  const photoUrls = await uploadPhotos(details.photo_uris);
```

Add these params to the RPC call object (after `p_cover_image_url`):

```typescript
    p_photos: photoUrls,
    p_elevation_loss_m: snappedRoute?.elevationLoss ?? 0,
```

Remove the old `p_elevation_gain_m` line and replace with:

```typescript
    p_elevation_gain_m: snappedRoute?.elevationGain ?? 0,
    p_elevation_loss_m: snappedRoute?.elevationLoss ?? 0,
```

- [ ] **Step 3: Commit**

```bash
git add src/features/routes/api/createRoute.ts src/features/routes/store/useRouteCreationStore.ts
git commit -m "feat(routes): add multi-photo upload and elevation_loss to route creation"
```

---

### Task 5: Step3DetailsScreen — Multi-photo picker UI

**Files:**
- Modify: `src/features/routes/screens/create/Step3DetailsScreen.tsx`

- [ ] **Step 1: Add photo picker section after cover image**

Import `FlatList` from react-native. Add store selectors:

```typescript
const addPhotos = useRouteCreationStore((s) => s.addPhotos);
const removePhoto = useRouteCreationStore((s) => s.removePhoto);
const reorderPhotos = useRouteCreationStore((s) => s.reorderPhotos);
```

Add the pick function:

```typescript
const pickPhotos = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    quality: 0.8,
  });
  if (!result.canceled && result.assets.length > 0) {
    addPhotos(result.assets.map((a) => a.uri));
  }
};
```

Add this JSX block after the cover image `</Pressable>` (after line 93):

```tsx
{/* Additional photos */}
<Text style={[styles.label, { color: colors.text }]}>Fotos adicionales</Text>
<View style={styles.photosGrid}>
  {details.photo_uris.map((uri, index) => (
    <View key={uri} style={styles.photoThumb}>
      <Image source={{ uri }} style={styles.photoThumbImage} />
      <Pressable
        style={styles.photoRemoveBtn}
        onPress={() => removePhoto(index)}
      >
        <Ionicons name="close-circle" size={22} color="#FF4D6A" />
      </Pressable>
      <View style={styles.photoReorderRow}>
        {index > 0 && (
          <Pressable
            style={styles.photoReorderBtn}
            onPress={() => reorderPhotos(index, index - 1)}
          >
            <Ionicons name="chevron-back" size={14} color="#FFF" />
          </Pressable>
        )}
        {index < details.photo_uris.length - 1 && (
          <Pressable
            style={styles.photoReorderBtn}
            onPress={() => reorderPhotos(index, index + 1)}
          >
            <Ionicons name="chevron-forward" size={14} color="#FFF" />
          </Pressable>
        )}
      </View>
    </View>
  ))}
  <Pressable
    onPress={pickPhotos}
    style={[styles.addPhotoBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
  >
    <Ionicons name="add-outline" size={28} color={colors.textTertiary} />
    <Text style={[styles.addPhotoText, { color: colors.textSecondary }]}>Agregar</Text>
  </Pressable>
</View>
```

- [ ] **Step 2: Add styles for the photo grid**

Add to the StyleSheet:

```typescript
photosGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},
photoThumb: {
  width: (Dimensions.get("window").width - 48) / 3,
  aspectRatio: 1,
  borderRadius: 10,
  overflow: "hidden",
  position: "relative",
},
photoThumbImage: {
  width: "100%",
  height: "100%",
},
photoRemoveBtn: {
  position: "absolute",
  top: 4,
  right: 4,
},
photoReorderRow: {
  position: "absolute",
  bottom: 4,
  left: 0,
  right: 0,
  flexDirection: "row",
  justifyContent: "center",
  gap: 8,
},
photoReorderBtn: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: "rgba(0,0,0,0.5)",
  alignItems: "center",
  justifyContent: "center",
},
addPhotoBtn: {
  width: (Dimensions.get("window").width - 48) / 3,
  aspectRatio: 1,
  borderRadius: 10,
  borderWidth: 1,
  borderStyle: "dashed",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
},
addPhotoText: {
  fontSize: 11,
},
```

Add `Dimensions` to the react-native import.

- [ ] **Step 3: Commit**

```bash
git add src/features/routes/screens/create/Step3DetailsScreen.tsx
git commit -m "feat(routes): add multi-photo picker to route creation Step3"
```

---

### Task 6: RouteDetailScreen — Hero carousel redesign

**Files:**
- Modify: `src/features/routes/screens/RouteDetailScreen.tsx`

This is the largest task. The full hero section (lines 141-261 in the current file) gets rewritten. All sections below the stats bar remain unchanged in functionality.

- [ ] **Step 1: Add new imports and state**

Add to imports:

```typescript
import { FlatList, Share } from "react-native";
```

Add state inside the component:

```typescript
const [activePhotoIndex, setActivePhotoIndex] = useState(0);
```

Build the photos array:

```typescript
const allPhotos = [
  route.cover_image_url,
  ...(route.photos ?? []),
].filter(Boolean) as string[];
```

- [ ] **Step 2: Replace the Hero section (lines 142-209) with the carousel**

Replace from `{/* Hero Image */}` through the closing `</View>` of the hero with:

```tsx
{/* Hero Carousel */}
<View style={styles.hero}>
  <FlatList
    data={allPhotos.length > 0 ? allPhotos : [null]}
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    keyExtractor={(_, i) => `photo-${i}`}
    onMomentumScrollEnd={(e) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActivePhotoIndex(index);
    }}
    renderItem={({ item }) =>
      item ? (
        <Image
          source={{ uri: item }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[styles.heroImage, { backgroundColor: colors.surfaceSecondary }]}
        />
      )
    }
  />
  {/* Gradient overlay */}
  <View style={styles.heroGradient} pointerEvents="none" />

  {/* Nav bar */}
  <View style={[styles.navBar, { top: insets.top }]}>
    <Pressable
      style={styles.navButton}
      onPress={() => router.back()}
    >
      <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
    </Pressable>
    <View style={styles.navBarRight}>
      {hasFullAccess && data && (
        <DownloadRouteButton
          routeId={id!}
          routeName={route.name}
          routeData={data}
          compact
        />
      )}
      <Pressable
        style={styles.navButton}
        onPress={() => toggleSave()}
        disabled={isToggling}
      >
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={22}
          color={isSaved ? "#FF4D6A" : "#FFFFFF"}
        />
      </Pressable>
    </View>
  </View>

  {/* Bottom indicators */}
  <View style={styles.heroBottomRow}>
    {/* Photo count */}
    {allPhotos.length > 1 && (
      <View style={styles.photoCountBadge}>
        <Ionicons name="images-outline" size={14} color="#FFFFFF" />
        <Text style={styles.photoCountText}>{allPhotos.length}</Text>
      </View>
    )}

    {/* Pagination dots */}
    {allPhotos.length > 1 && (
      <View style={styles.paginationDots}>
        {allPhotos.map((_, i) => (
          <View
            key={`dot-${i}`}
            style={[
              styles.dot,
              i === activePhotoIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    )}

    {/* Mini map thumbnail */}
    {route.route_geojson && (
      <View style={styles.miniMapThumb}>
        <Ionicons name="map" size={20} color={colors.primary} />
      </View>
    )}
  </View>
</View>
```

- [ ] **Step 3: Replace the content card (stats bar + info chips) with card-overlay layout**

Replace the stats bar section (lines 211-307 in original) with:

```tsx
{/* Content Card */}
<View style={[styles.contentCard, { backgroundColor: colors.background }]}>
  {/* Row: difficulty + rating + purchases */}
  <View style={styles.metaRow}>
    <View style={[styles.diffBadge, { backgroundColor: diffColor }]}>
      <Text style={styles.diffBadgeText}>{diffLabel}</Text>
    </View>
    {route.total_reviews > 0 && (
      <View style={styles.metaItem}>
        <Ionicons name="star" size={14} color="#F5A623" />
        <Text style={[styles.metaText, { color: colors.text }]}>
          {route.average_rating.toFixed(1)}
        </Text>
      </View>
    )}
    <View style={styles.metaItem}>
      <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
        {route.purchase_count ?? 0}
      </Text>
    </View>
  </View>

  {/* Title */}
  <Text style={[styles.routeTitle, { color: colors.text }]}>
    {route.name}
  </Text>

  {/* Info chips */}
  <View style={styles.infoChipsRow}>
    <View style={[styles.infoChip, { backgroundColor: colors.surfaceSecondary }]}>
      <Ionicons name="trail-sign-outline" size={14} color={colors.primary} />
      <Text style={[styles.infoChipText, { color: colors.text }]}>{terrainLabel}</Text>
    </View>
    <View style={[styles.infoChip, { backgroundColor: colors.surfaceSecondary }]}>
      <Ionicons
        name={route.is_free ? "pricetag-outline" : "card-outline"}
        size={14}
        color={route.is_free ? colors.freeBadge : colors.premiumBadge}
      />
      <Text style={[styles.infoChipText, { color: colors.text }]}>
        {route.is_free ? "Gratis" : `$${route.price} MXN`}
      </Text>
    </View>
  </View>

  {/* Stats grid 2x2 */}
  <View style={styles.statsGrid}>
    <View style={[styles.statsGridItem, { borderColor: colors.border }]}>
      <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Duración</Text>
      <Text style={[styles.statsGridValue, { color: colors.text }]}>
        {route.estimated_duration_min
          ? route.estimated_duration_min >= 60
            ? `${Math.floor(route.estimated_duration_min / 60)}h ${route.estimated_duration_min % 60}m`
            : `${route.estimated_duration_min} min`
          : "—"}
      </Text>
    </View>
    <View style={[styles.statsGridItem, { borderColor: colors.border }]}>
      <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Distancia</Text>
      <Text style={[styles.statsGridValue, { color: colors.text }]}>
        {route.distance_km.toFixed(2)} km
      </Text>
    </View>
    <View style={[styles.statsGridItem, { borderColor: colors.border }]}>
      <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Desnivel</Text>
      <Text style={[styles.statsGridValue, { color: colors.text }]}>
        {route.elevation_gain_m ? `${route.elevation_gain_m} m` : "—"}
      </Text>
    </View>
    <View style={[styles.statsGridItem, { borderColor: colors.border }]}>
      <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Pérdida Elevación</Text>
      <Text style={[styles.statsGridValue, { color: colors.text }]}>
        {route.elevation_loss_m ? `${route.elevation_loss_m} m` : "—"}
      </Text>
    </View>
  </View>
</View>
```

- [ ] **Step 4: Replace the sticky footer with new 3-button layout**

Replace the stickyFooter section (lines 522-561 in original) with:

```tsx
{/* Sticky footer */}
<View
  style={[
    styles.stickyFooter,
    {
      backgroundColor: colors.background,
      paddingBottom: insets.bottom + 12,
      borderTopColor: colors.border,
    },
  ]}
>
  {!route.is_free && !hasFullAccess ? (
    <Pressable
      style={[styles.footerBtnPrimary, { backgroundColor: colors.premiumBadge, flex: 1 }]}
      onPress={handlePurchase}
      disabled={isPurchasing}
    >
      {isPurchasing ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Ionicons name="card-outline" size={20} color="#FFFFFF" />
          <Text style={styles.footerBtnText}>Comprar por ${route.price} MXN</Text>
        </>
      )}
    </Pressable>
  ) : (
    <>
      <Pressable
        style={[styles.footerBtnPrimary, { backgroundColor: colors.primary, flex: 1 }]}
        onPress={() => toggleSave()}
        disabled={isToggling}
      >
        <Text style={styles.footerBtnText}>Guardar</Text>
        <Ionicons
          name={isSaved ? "bookmark" : "bookmark-outline"}
          size={18}
          color="#FFFFFF"
        />
      </Pressable>
      <Pressable
        style={[styles.footerBtnSecondary, { backgroundColor: colors.surfaceSecondary }]}
        onPress={handleStartRoute}
      >
        <Ionicons name="navigate" size={20} color={colors.text} />
      </Pressable>
      <Pressable
        style={[styles.footerBtnSecondary, { backgroundColor: colors.surfaceSecondary }]}
        onPress={() => {
          Share.share({
            message: `Mira esta ruta en Kaelo: ${route.name}`,
          });
        }}
      >
        <Ionicons name="share-outline" size={20} color={colors.text} />
      </Pressable>
    </>
  )}
</View>
```

- [ ] **Step 5: Update styles**

Replace/add these styles in the StyleSheet (remove old hero/statsBar/statItem/statDivider/statValue/statLabel styles):

```typescript
hero: {
  height: 420,
  position: "relative",
},
heroImage: {
  width: SCREEN_WIDTH,
  height: 420,
},
heroGradient: {
  ...StyleSheet.absoluteFillObject,
  top: "50%",
  backgroundColor: "transparent",
  // Use a pseudo-gradient: dark at bottom
  borderBottomWidth: 0,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 200 },
  shadowOpacity: 0.6,
  shadowRadius: 100,
},
navBar: {
  position: "absolute",
  left: 16,
  right: 16,
  flexDirection: "row",
  justifyContent: "space-between",
  zIndex: 10,
},
navBarRight: {
  flexDirection: "row",
  gap: 8,
},
navButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "rgba(0,0,0,0.35)",
  alignItems: "center",
  justifyContent: "center",
},
heroBottomRow: {
  position: "absolute",
  bottom: 32,
  left: 16,
  right: 16,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
photoCountBadge: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  backgroundColor: "rgba(0,0,0,0.5)",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
},
photoCountText: {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "600",
},
paginationDots: {
  flexDirection: "row",
  gap: 6,
  position: "absolute",
  left: 0,
  right: 0,
  justifyContent: "center",
},
dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
},
dotActive: {
  backgroundColor: "#FFFFFF",
},
dotInactive: {
  backgroundColor: "rgba(255,255,255,0.4)",
},
miniMapThumb: {
  width: 56,
  height: 56,
  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.9)",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
},
contentCard: {
  marginTop: -24,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 20,
  paddingHorizontal: 20,
},
metaRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
},
metaItem: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
},
metaText: {
  fontSize: 14,
  fontWeight: "600",
},
routeTitle: {
  fontSize: 22,
  fontWeight: "800",
  lineHeight: 28,
  marginBottom: 12,
},
infoChipsRow: {
  flexDirection: "row",
  gap: 8,
  marginBottom: 16,
},
infoChip: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 10,
},
infoChipText: {
  fontSize: 13,
  fontWeight: "500",
},
statsGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
},
statsGridItem: {
  width: "50%",
  paddingVertical: 12,
  borderBottomWidth: StyleSheet.hairlineWidth,
},
statsGridLabel: {
  fontSize: 12,
  marginBottom: 2,
},
statsGridValue: {
  fontSize: 18,
  fontWeight: "700",
},
// Footer
stickyFooter: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  paddingTop: 12,
  paddingHorizontal: 20,
  borderTopWidth: 1,
  flexDirection: "row",
  gap: 10,
},
footerBtnPrimary: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  height: 52,
  borderRadius: 14,
},
footerBtnText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
},
footerBtnSecondary: {
  width: 52,
  height: 52,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
},
```

Remove these old styles that are no longer used: `heroOverlay`, `heroContent`, `heroTitle`, `locationRow`, `locationText`, `statsBar`, `statItem`, `statValue`, `statLabel`, `statDivider`, `startButton`, `startButtonText`.

- [ ] **Step 6: Remove the old StatItem component**

Delete the `StatItem` function component (lines 574-594 in original) — it's no longer used.

- [ ] **Step 7: Commit**

```bash
git add src/features/routes/screens/RouteDetailScreen.tsx
git commit -m "feat(routes): redesign RouteDetailScreen with hero carousel and card-overlay layout"
```

---

### Task 7: Smoke test and final verification

- [ ] **Step 1: Verify the app compiles**

```bash
npx expo start --clear
```

Open the app in the simulator/device. Navigate to a route detail screen and verify:
- Carousel swipes between photos
- Dots update on swipe
- Photo count shows correctly
- Content card overlaps hero
- Stats grid shows 2x2 layout
- Footer shows Guardar + navigate + share buttons
- All existing sections (description, map, waypoints, businesses, reviews, tags) render correctly

- [ ] **Step 2: Test route creation**

Navigate to create route → Step 3. Verify:
- Can add multiple photos
- Can remove individual photos
- Can reorder photos with arrow buttons
- Photos persist to Step 5 review

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "fix(routes): polish route detail redesign and photo gallery"
```