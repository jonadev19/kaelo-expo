import { useTheme } from "@/shared/hooks/useTheme";
import { useAuthStore } from "@/shared/store/authStore";
import { useLocationStore } from "@/shared/store/useLocationStore";
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "@/shared/tasks/backgroundLocation";
import { Ionicons } from "@expo/vector-icons";
import Mapbox, { UserTrackingMode } from "@rnmapbox/maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BusinessDetailScreen from "@/features/businesses/screens/BusinessDetailScreen";
import {
  calculateActivityMetrics,
  saveRouteCompletion,
} from "../api/activityTracking";
import { GpsSignalIndicator } from "../components/GpsSignalIndicator";
import { NavigationBottomBar } from "../components/NavigationBottomBar";
import { NavigationInstruction } from "../components/NavigationInstruction";
import { useNavigation } from "../hooks/useNavigation";
import { useRouteDetail } from "../hooks/useRouteDetail";
import type { RouteBusinessItem } from "../types";

export default function NavigationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading: routeLoading } = useRouteDetail(id ?? "");
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const cameraRef = useRef<Mapbox.Camera>(null);

  const location = useLocationStore((s) => s.location);
  const gpsSignal = useLocationStore((s) => s.gpsSignal);
  const locationHistory = useLocationStore((s) => s.locationHistory);
  const distanceTraveled = useLocationStore((s) => s.distanceTraveled);
  const currentSpeed = useLocationStore((s) => s.currentSpeed);
  const trackingStartedAt = useLocationStore((s) => s.trackingStartedAt);
  const requestPermission = useLocationStore((s) => s.requestPermission);
  const startTracking = useLocationStore((s) => s.startTracking);
  const user = useAuthStore((s) => s.user);

  const {
    navState,
    directions,
    currentStep,
    eta,
    hasArrived,
    startNavigation,
    stopNavigation,
  } = useNavigation();

  const insets = useSafeAreaInsets();
  const [isFollowing, setIsFollowing] = useState(true);
  const [selectedBiz, setSelectedBiz] = useState<RouteBusinessItem | null>(null);
  const [openBizId, setOpenBizId] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  // Request permission and start navigation when route data is ready
  useEffect(() => {
    if (!data?.route || hasStartedRef.current) return;

    const init = async () => {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permiso requerido",
          "Se necesita acceso a tu ubicación para la navegación.",
          [{ text: "OK", onPress: () => router.back() }],
        );
        return;
      }

      // Wait briefly for location to update
      await new Promise((r) => setTimeout(r, 500));
      const loc = useLocationStore.getState().location;
      if (!loc) {
        Alert.alert("Error", "No se pudo obtener tu ubicación.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      const route = data.route!;
      const startCoord: [number, number] = [
        loc.coords.longitude,
        loc.coords.latitude,
      ];
      const endCoord: [number, number] = [
        route.end_lng ?? route.start_lng,
        route.end_lat ?? route.start_lat,
      ];

      hasStartedRef.current = true;
      startTracking(); // Start recording location history
      startBackgroundLocationTracking().catch(() => { }); // Best-effort background tracking
      await startNavigation(startCoord, endCoord);
    };

    init();
  }, [data?.route]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNavigation();
      stopBackgroundLocationTracking().catch(() => { });
    };
  }, [stopNavigation]);

  // Handle arrival
  useEffect(() => {
    if (hasArrived && directions) {
      const totalKm = (directions.distance / 1000).toFixed(1);
      const totalMin = Math.round(directions.duration / 60);

      // Save activity data
      const history = useLocationStore.getState().locationHistory;
      const trackingStart = useLocationStore.getState().trackingStartedAt;
      if (user?.id && id && history.length > 0) {
        const metrics = calculateActivityMetrics(history);
        const durationSec = trackingStart
          ? Math.round((Date.now() - trackingStart) / 1000)
          : Math.round(directions.duration);
        const now = new Date().toISOString();
        const startTime = trackingStart
          ? new Date(trackingStart).toISOString()
          : now;
        saveRouteCompletion({
          userId: user.id,
          routeId: id,
          startedAt: startTime,
          completedAt: now,
          durationMin: Math.round(durationSec / 60),
          distanceActualKm: metrics.distanceKm,
          avgSpeedKmh: metrics.avgSpeedKmh,
          maxSpeedKmh: metrics.maxSpeedKmh,
          caloriesBurned: metrics.caloriesBurned,
          recordedPath: metrics.recordedPath,
        }).catch(() => { }); // Best-effort save
      }

      stopBackgroundLocationTracking().catch(() => { });

      Alert.alert(
        "Has llegado a tu destino",
        `Recorriste ${totalKm} km en aproximadamente ${totalMin} min.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    }
  }, [hasArrived]);

  const handleCenter = useCallback(() => {
    // Toggle off then on so Mapbox re-engages follow mode
    setIsFollowing(false);
    setTimeout(() => setIsFollowing(true), 50);
  }, []);

  // Trim route geometry to show only the remaining portion
  const remainingGeometry = useMemo(() => {
    if (!directions?.geometry?.coordinates || !location) return directions?.geometry ?? null;

    const coords = directions.geometry.coordinates;
    const userLng = location.coords.longitude;
    const userLat = location.coords.latitude;

    // Find the closest point on the route
    let closestIdx = 0;
    let closestDist = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const dx = coords[i][0] - userLng;
      const dy = coords[i][1] - userLat;
      const dist = dx * dx + dy * dy;
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    // Keep only the remaining route from the closest point onward
    const remaining = coords.slice(closestIdx);
    if (remaining.length < 2) return directions.geometry;

    return { type: "LineString" as const, coordinates: remaining };
  }, [directions?.geometry, location]);

  const handleStop = useCallback(() => {
    Alert.alert(
      "Terminar navegación",
      "¿Estás seguro de que quieres terminar la navegación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Terminar",
          style: "destructive",
          onPress: () => {
            // Save partial activity before stopping
            const history = useLocationStore.getState().locationHistory;
            const trackingStart = useLocationStore.getState().trackingStartedAt;
            if (user?.id && id && history.length > 1) {
              const metrics = calculateActivityMetrics(history);
              const durationSec = trackingStart
                ? Math.round((Date.now() - trackingStart) / 1000)
                : 0;
              const now = new Date().toISOString();
              const startTime = trackingStart
                ? new Date(trackingStart).toISOString()
                : now;
              saveRouteCompletion({
                userId: user.id,
                routeId: id,
                startedAt: startTime,
                completedAt: now,
                durationMin: Math.round(durationSec / 60),
                distanceActualKm: metrics.distanceKm,
                avgSpeedKmh: metrics.avgSpeedKmh,
                maxSpeedKmh: metrics.maxSpeedKmh,
                caloriesBurned: metrics.caloriesBurned,
                recordedPath: metrics.recordedPath,
              }).catch(() => { });
            }
            stopBackgroundLocationTracking().catch(() => { });
            router.back();
            stopNavigation();
          },
        },
      ],
    );
  }, [stopNavigation, router, user?.id, id]);

  // Loading state
  if (routeLoading || navState.isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {routeLoading ? "Cargando ruta..." : "Calculando dirección..."}
        </Text>
      </View>
    );
  }

  // Error state
  if (navState.error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {navState.error}
        </Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        compassEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          followUserLocation={isFollowing}
          followUserMode={UserTrackingMode.FollowWithHeading}
          followPitch={60}
          followZoomLevel={16}
          animationMode="easeTo"
          animationDuration={1000}
        />

        {/* Location puck de Mapbox (flecha de navegación sin círculo de precisión) */}
        <Mapbox.UserLocation
          visible
          showsUserHeadingIndicator
        />

        {/* Remaining route line */}
        {remainingGeometry && (
          <Mapbox.ShapeSource
            id="nav-route"
            shape={{
              type: "Feature",
              properties: {},
              geometry: remainingGeometry,
            }}
          >
            <Mapbox.LineLayer
              id="nav-route-line"
              style={{
                lineColor: colors.primary,
                lineWidth: 6,
                lineCap: "round",
                lineJoin: "round",
                lineOpacity: 0.85,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Route outline for better visibility */}
        {remainingGeometry && (
          <Mapbox.ShapeSource
            id="nav-route-outline"
            shape={{
              type: "Feature",
              properties: {},
              geometry: remainingGeometry,
            }}
          >
            <Mapbox.LineLayer
              id="nav-route-outline-line"
              belowLayerID="nav-route-line"
              style={{
                lineColor: isDark ? "#000000" : "#FFFFFF",
                lineWidth: 10,
                lineCap: "round",
                lineJoin: "round",
                lineOpacity: 0.3,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Destination marker */}
        {data?.route && (
          <Mapbox.MarkerView
            id="destination"
            coordinate={[
              data.route.end_lng ?? data.route.start_lng,
              data.route.end_lat ?? data.route.start_lat,
            ]}
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="flag" size={16} color="#FFFFFF" />
            </View>
          </Mapbox.MarkerView>
        )}

        {/* Business markers */}
        {(data?.businesses as RouteBusinessItem[] | undefined)?.map((biz) => (
          <Mapbox.MarkerView
            key={biz.id}
            id={`biz-${biz.id}`}
            coordinate={[biz.lng, biz.lat]}
          >
            <Pressable
              style={[
                styles.bizMarker,
                selectedBiz?.id === biz.id && styles.bizMarkerSelected,
              ]}
              onPress={() => setSelectedBiz(selectedBiz?.id === biz.id ? null : biz)}
            >
              <Ionicons name="storefront" size={14} color="#FFFFFF" />
            </Pressable>
          </Mapbox.MarkerView>
        ))}
      </Mapbox.MapView>

      {/* GPS Signal indicator */}
      {navState.isNavigating && (
        <View style={styles.gpsIndicator}>
          <GpsSignalIndicator quality={gpsSignal} size="small" />
        </View>
      )}

      {/* Top instruction panel */}
      {navState.isNavigating && (
        <NavigationInstruction
          currentStep={currentStep}
          distanceToNextStep={navState.distanceToNextStep}
        />
      )}

      {/* Bottom bar */}
      {navState.isNavigating && (
        <NavigationBottomBar
          eta={eta}
          distanceRemaining={navState.distanceRemaining}
          distanceTraveled={distanceTraveled}
          currentSpeed={currentSpeed}
          trackingStartedAt={trackingStartedAt}
          onCenter={handleCenter}
          onStop={handleStop}
        />
      )}

      {/* Re-center button when not following */}
      {!isFollowing && navState.isNavigating && (
        <Pressable
          style={[styles.recenterFab, { backgroundColor: colors.surface }]}
          onPress={handleCenter}
        >
          <Ionicons name="navigate" size={22} color={colors.primary} />
        </Pressable>
      )}

      {/* Business detail modal */}
      <Modal
        visible={openBizId !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpenBizId(null)}
      >
        {openBizId && (
          <BusinessDetailScreen
            businessId={openBizId}
            onClose={() => setOpenBizId(null)}
          />
        )}
      </Modal>

      {/* Business info card */}
      {selectedBiz && (
        <View style={[styles.bizCard, { backgroundColor: colors.surface, bottom: 220 + insets.bottom }]}>
          <Pressable style={styles.bizCardClose} onPress={() => setSelectedBiz(null)}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.bizCardRow}>
            {selectedBiz.cover_image_url ? (
              <Image source={{ uri: selectedBiz.cover_image_url }} style={styles.bizCardImage} />
            ) : (
              <View style={[styles.bizCardImage, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="storefront" size={20} color={colors.textTertiary} />
              </View>
            )}
            <View style={styles.bizCardInfo}>
              <Text style={[styles.bizCardName, { color: colors.text }]} numberOfLines={1}>
                {selectedBiz.name}
              </Text>
              <Text style={[styles.bizCardType, { color: colors.textSecondary }]}>
                {selectedBiz.business_type}
              </Text>
              {selectedBiz.distance_from_route_m != null && (
                <Text style={[styles.bizCardDistance, { color: colors.textTertiary }]}>
                  A {(selectedBiz.distance_from_route_m / 1000).toFixed(1)} km de la ruta
                </Text>
              )}
            </View>
          </View>
          <Pressable
            style={[styles.bizCardButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setOpenBizId(selectedBiz.id);
              setSelectedBiz(null);
            }}
          >
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.bizCardButtonText}>Ver negocio</Text>
          </Pressable>
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  destinationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  recenterFab: {
    position: "absolute",
    right: 16,
    bottom: 200,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  gpsIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  bizMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  bizMarkerSelected: {
    backgroundColor: "#F57C00",
    transform: [{ scale: 1.2 }],
  },
  bizCard: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  bizCardClose: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  bizCardRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  bizCardImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bizCardInfo: {
    flex: 1,
    gap: 2,
  },
  bizCardName: {
    fontSize: 15,
    fontWeight: "700",
    paddingRight: 20,
  },
  bizCardType: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  bizCardDistance: {
    fontSize: 11,
  },
  bizCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bizCardButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
