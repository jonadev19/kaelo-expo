import { difficulty as difficultyColors } from "@/constants/Colors";
import { useTheme } from "@/shared/hooks/useTheme";
import { useLocationStore } from "@/shared/store/useLocationStore";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { LocationAccuracy } from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FilterChips } from "../components/FilterChips";
import { usePublishedRoutes } from "../hooks/usePublishedRoutes";
import type { RouteFilters } from "../types";

// Default center: Mérida, Yucatán
const DEFAULT_CENTER: [number, number] = [-89.6237, 20.9674];
const DEFAULT_ZOOM = 11;

export default function Explore() {
  const { permission, requestPermission, updateLocation } = useLocationStore();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Mapbox.Camera>(null);

  const [filters, setFilters] = useState<RouteFilters>({});
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const { data: routes = [], isLoading } = usePublishedRoutes(filters);

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  );

  // Delay layer rendering until native map has fully settled
  useEffect(() => {
    if (!styleLoaded) {
      setMapReady(false);
      return;
    }
    const timer = setTimeout(() => setMapReady(true), 200);
    return () => clearTimeout(timer);
  }, [styleLoaded]);

  // Build GeoJSON FeatureCollection for route lines
  const routeLinesGeoJSON = useMemo(() => {
    const features = routes
      .filter((r) => r.route_geojson != null)
      .map((r) => ({
        type: "Feature" as const,
        properties: {
          id: r.id,
          difficulty: r.difficulty,
          selected: r.id === selectedRouteId,
        },
        geometry: r.route_geojson!,
      }));
    return { type: "FeatureCollection" as const, features };
  }, [routes, selectedRouteId]);

  const centerOnUserLocation = async () => {
    const freshLocation = await updateLocation(LocationAccuracy.Balanced);
    if (freshLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: [
          freshLocation.coords.longitude,
          freshLocation.coords.latitude,
        ],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  };

  const handleRouteLinePress = useCallback(
    (e: any) => {
      const feature = e?.features?.[0];
      if (feature?.properties?.id) {
        const routeId = feature.properties.id;
        setSelectedRouteId((prev) => (prev === routeId ? null : routeId));
        const route = routes.find((r) => r.id === routeId);
        if (route) {
          cameraRef.current?.setCamera({
            centerCoordinate: [route.start_lng, route.start_lat],
            zoomLevel: 13,
            animationDuration: 500,
          });
        }
      }
    },
    [routes],
  );

  const handleCardPress = useCallback(() => {
    if (selectedRouteId) {
      router.push({
        pathname: "/route-detail" as any,
        params: { id: selectedRouteId },
      });
    }
  }, [selectedRouteId, router]);

  const dismissCard = useCallback(() => {
    setSelectedRouteId(null);
  }, []);

  if (!permission) {
    return (
      <View
        style={[
          styles.permissionContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons name="location-outline" size={48} color={colors.primary} />
        <Text style={[styles.permissionTitle, { color: colors.text }]}>
          Acceso a ubicación
        </Text>
        <Text
          style={[styles.permissionText, { color: colors.textSecondary }]}
        >
          Para explorar rutas cercanas, necesitamos acceso a tu ubicación.
        </Text>
        <Pressable
          style={[styles.permissionButton, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Permitir ubicación</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Map */}
      <Mapbox.MapView
        style={styles.map}
        styleURL={
          isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.SatelliteStreet
        }
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        onDidFinishLoadingStyle={() => setStyleLoaded(true)}
        onPress={() => setSelectedRouteId(null)}
      >
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER,
            zoomLevel: DEFAULT_ZOOM,
          }}
        />

        {/* User location */}
        <Mapbox.UserLocation visible />

        {/* Route lines — only after map style is loaded */}
        {mapReady && (
          <Mapbox.ShapeSource
            id="route-lines"
            shape={routeLinesGeoJSON}
            onPress={handleRouteLinePress}
          >
            {/* Black outline behind base lines */}
            <Mapbox.LineLayer
              id="route-lines-outline"
              filter={["!=", ["get", "selected"], true]}
              style={{
                lineColor: "#000000",
                lineWidth: 7,
                lineOpacity: 0.5,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Mapbox.LineLayer
              id="route-lines-base"
              filter={["!=", ["get", "selected"], true]}
              style={{
                lineColor: [
                  "match",
                  ["get", "difficulty"],
                  "facil", difficultyColors.easy,
                  "moderada", difficultyColors.moderate,
                  "dificil", difficultyColors.hard,
                  "experto", difficultyColors.expert,
                  colors.primary,
                ],
                lineWidth: 3,
                lineOpacity: 0.8,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Black outline behind selected line */}
            <Mapbox.LineLayer
              id="route-lines-selected-outline"
              filter={["==", ["get", "selected"], true]}
              style={{
                lineColor: "#000000",
                lineWidth: 11,
                lineOpacity: 0.6,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Mapbox.LineLayer
              id="route-lines-selected"
              filter={["==", ["get", "selected"], true]}
              style={{
                lineColor: [
                  "match",
                  ["get", "difficulty"],
                  "facil", difficultyColors.easy,
                  "moderada", difficultyColors.moderate,
                  "dificil", difficultyColors.hard,
                  "experto", difficultyColors.expert,
                  colors.primary,
                ],
                lineWidth: 5,
                lineOpacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>

      {/* ─── Search Bar ─── */}
      <View style={[styles.searchBarContainer, { top: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.push("/(tabs)/routes")}
          style={[styles.searchBar, { backgroundColor: "rgba(30,30,30,0.82)" }]}
        >
          <Ionicons name="bicycle" size={20} color={colors.primary} />
          <View style={styles.searchDivider} />
          <Text style={styles.searchPlaceholder}>Buscar ubicaciones</Text>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.savedButton}>
            <Ionicons name="bookmark-outline" size={16} color="#FFFFFF" />
            <Text style={styles.savedButtonText}>Guardado</Text>
          </Pressable>
        </Pressable>
      </View>

      {/* ─── Filter Chips ─── */}
      <View style={[styles.filtersContainer, { top: insets.top + 72 }]}>
        <FilterChips filters={filters} onFiltersChange={setFilters} />
      </View>

      {/* ─── Right Map Controls ─── */}
      <View style={[styles.mapControlsStack, { bottom: selectedRoute ? 195 : insets.bottom + 20 }]}>
        <Pressable
          style={styles.mapControlButton}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="locate" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable
          style={styles.mapControlButton}
          onPress={() => router.push("/create-route/step1-draw")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* ─── Selected Route Bottom Card ─── */}
      {selectedRoute && (
        <Pressable
          style={[
            styles.bottomCard,
            {
              backgroundColor: colors.surface,
              paddingBottom: insets.bottom + 12,
            },
          ]}
          onPress={handleCardPress}
        >
          {/* Drag handle */}
          <View style={styles.cardHandle}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.cardBody}>
            {/* Mini map preview */}
            <View style={[styles.miniMapPreview, { backgroundColor: isDark ? "#1A1A1A" : "#E8E8E8" }]}>
              <Ionicons name="map-outline" size={28} color={colors.textTertiary} />
            </View>

            {/* Route info */}
            <View style={styles.cardInfo}>
              <Text
                style={[styles.cardTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {selectedRoute.name}
              </Text>

              <View style={styles.cardMetaRow}>
                <Ionicons name="bicycle-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                  {selectedRoute.distance_km.toFixed(2)} km
                  {selectedRoute.estimated_duration_min
                    ? ` · ${selectedRoute.estimated_duration_min} m`
                    : ""}
                </Text>
              </View>

              <View style={styles.cardMetaRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                  Ubicación actual
                </Text>
              </View>

              {selectedRoute.is_free && (
                <View style={styles.cardMetaRow}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
                  <Text style={[styles.cardBadge, { color: colors.primary }]}>
                    Ruta gratuita
                  </Text>
                </View>
              )}
            </View>

            {/* Dismiss button */}
            <Pressable
              style={styles.cardDismiss}
              onPress={dismissCard}
              hitSlop={12}
            >
              <Ionicons name="close" size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
        </Pressable>
      )}

      {/* ─── Empty state ─── */}
      {!isLoading && routes.length === 0 && (
        <View style={[styles.emptyState, { bottom: insets.bottom + 20 }]}>
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="bicycle-outline" size={28} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay rutas disponibles con estos filtros
            </Text>
          </View>
        </View>
      )}

      {/* ─── Loading ─── */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },
  permissionText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  /* ─── Search Bar ─── */
  searchBarContainer: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 10,
    borderRadius: 28,
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  savedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  savedButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  /* ─── Filter Chips ─── */
  filtersContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 15,
  },

  /* ─── Right Map Controls ─── */
  mapControlsStack: {
    position: "absolute",
    right: 14,
    zIndex: 10,
    gap: 10,
  },
  mapControlButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(30,30,30,0.75)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  /* ─── Bottom Route Card ─── */
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHandle: {
    alignItems: "center",
    paddingBottom: 10,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  cardBody: {
    flexDirection: "row",
    gap: 12,
  },
  miniMapPreview: {
    width: 90,
    height: 90,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cardMeta: {
    fontSize: 13,
  },
  cardBadge: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardDismiss: {
    paddingTop: 2,
    alignSelf: "flex-start",
  },

  /* ─── Empty & Loading ─── */
  emptyState: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
  },
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 13,
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    zIndex: 20,
  },
});
