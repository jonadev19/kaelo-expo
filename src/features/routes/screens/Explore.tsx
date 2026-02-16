import ENV from "@/config/env";
import { useTheme } from "@/shared/hooks/useTheme";
import { useLocationStore } from "@/shared/store/useLocationStore";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { LocationAccuracy } from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FilterChips } from "../components/FilterChips";
import { MapButton } from "../components/MapButton";
import { RouteCard } from "../components/RouteCard";
import { RouteMarker } from "../components/RouteMarker";
import { usePublishedRoutes } from "../hooks/usePublishedRoutes";
import type { RouteFilters, RouteListItem } from "../types";

Mapbox.setAccessToken(ENV.MAPBOX_ACCESS_TOKEN);

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
  const flatListRef = useRef<FlatList<RouteListItem>>(null);

  const { data: routes = [], isLoading } = usePublishedRoutes(filters);

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

  const handleRoutePress = useCallback(
    (route: RouteListItem) => {
      router.push({ pathname: "/route-detail" as any, params: { id: route.id } });
    },
    [router],
  );

  const handleMarkerPress = useCallback(
    (route: RouteListItem, index: number) => {
      setSelectedRouteId(route.id);
      // Scroll carousel to the selected route
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
      // Center map on the marker
      cameraRef.current?.setCamera({
        centerCoordinate: [route.start_lng, route.start_lat],
        zoomLevel: 13,
        animationDuration: 500,
      });
    },
    [],
  );

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
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      {/* Map */}
      <Mapbox.MapView
        style={styles.map}
        styleURL={
          isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors
        }
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
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

        {/* Route markers */}
        {routes.map((route, index) => (
          <Mapbox.PointAnnotation
            key={route.id}
            id={`route-${route.id}`}
            coordinate={[route.start_lng, route.start_lat]}
            onSelected={() => handleMarkerPress(route, index)}
          >
            <RouteMarker
              difficulty={route.difficulty}
              isSelected={selectedRouteId === route.id}
            />
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {/* Search Bar (tappable → navigates to search) */}
      <View
        style={[
          styles.searchBarContainer,
          { top: insets.top + 8 },
        ]}
      >
        <Pressable
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
          onPress={() => router.push("/(tabs)/routes")}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textTertiary}
          />
          <Text style={[styles.searchPlaceholder, { color: colors.textTertiary }]}>
            Buscar rutas por nombre o lugar...
          </Text>
        </Pressable>
      </View>

      {/* Filter Chips */}
      <View style={[styles.filtersContainer, { top: insets.top + 60 }]}>
        <FilterChips filters={filters} onFiltersChange={setFilters} />
      </View>

      {/* Map Controls */}
      <View style={[styles.mapControls, { bottom: routes.length > 0 ? 230 : 40 }]}>
        <MapButton icon="locate" onPress={centerOnUserLocation} />
      </View>

      {/* Route Carousel */}
      {routes.length > 0 && (
        <View style={[styles.carouselContainer, { paddingBottom: insets.bottom + 8 }]}>
          <FlatList
            ref={flatListRef}
            data={routes}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            renderItem={({ item }) => (
              <RouteCard route={item} onPress={handleRoutePress} />
            )}
            onScrollToIndexFailed={() => {
              // Silently handle if the index isn't available yet
            }}
          />
        </View>
      )}

      {/* Empty state */}
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

      {/* Loading indicator */}
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
  searchBarContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: {
    fontSize: 14,
  },
  filtersContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 15,
  },
  mapControls: {
    position: "absolute",
    right: 16,
    zIndex: 10,
  },
  carouselContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  carouselContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
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
