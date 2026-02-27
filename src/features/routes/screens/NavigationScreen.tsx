import { useTheme } from "@/shared/hooks/useTheme";
import { useLocationStore } from "@/shared/store/useLocationStore";
import { Ionicons } from "@expo/vector-icons";
import Mapbox, { UserTrackingMode } from "@rnmapbox/maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NavigationBottomBar } from "../components/NavigationBottomBar";
import { NavigationInstruction } from "../components/NavigationInstruction";
import { useNavigation } from "../hooks/useNavigation";
import { useRouteDetail } from "../hooks/useRouteDetail";

export default function NavigationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading: routeLoading } = useRouteDetail(id ?? "");
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const cameraRef = useRef<Mapbox.Camera>(null);

  const location = useLocationStore((s) => s.location);
  const requestPermission = useLocationStore((s) => s.requestPermission);

  const {
    navState,
    directions,
    currentStep,
    eta,
    hasArrived,
    startNavigation,
    stopNavigation,
  } = useNavigation();

  const [isFollowing, setIsFollowing] = useState(true);
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
      await startNavigation(startCoord, endCoord);
    };

    init();
  }, [data?.route]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNavigation();
    };
  }, [stopNavigation]);

  // Handle arrival
  useEffect(() => {
    if (hasArrived && directions) {
      const totalKm = (directions.distance / 1000).toFixed(1);
      const totalMin = Math.round(directions.duration / 60);
      Alert.alert(
        "Has llegado a tu destino",
        `Recorriste ${totalKm} km en aproximadamente ${totalMin} min.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    }
  }, [hasArrived]);

  const handleCenter = useCallback(() => {
    setIsFollowing(true);
  }, []);

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
            stopNavigation();
            router.back();
          },
        },
      ],
    );
  }, [stopNavigation, router]);

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

        <Mapbox.UserLocation visible={true} />

        {/* Navigation route line */}
        {directions?.geometry && (
          <Mapbox.ShapeSource
            id="nav-route"
            shape={{
              type: "Feature",
              properties: {},
              geometry: directions.geometry,
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
        {directions?.geometry && (
          <Mapbox.ShapeSource
            id="nav-route-outline"
            shape={{
              type: "Feature",
              properties: {},
              geometry: directions.geometry,
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
      </Mapbox.MapView>

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
});
