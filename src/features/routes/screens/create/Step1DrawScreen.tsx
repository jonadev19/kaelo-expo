import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DraftMarker } from "../../components/creation/DraftMarker";
import { DistanceChip } from "../../components/creation/DistanceChip";
import { RoutePolyline } from "../../components/creation/RoutePolyline";
import { StepHeader } from "../../components/creation/StepHeader";
import { useDirectionsForDraft } from "../../hooks/useDirectionsForDraft";
import { useRouteCreationStore } from "../../store/useRouteCreationStore";

const DEFAULT_CENTER: [number, number] = [-89.6237, 20.9674];

export default function Step1DrawScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const draftPoints = useRouteCreationStore((s) => s.draftPoints);
  const snappedRoute = useRouteCreationStore((s) => s.snappedRoute);
  const addPoint = useRouteCreationStore((s) => s.addPoint);
  const undoLastPoint = useRouteCreationStore((s) => s.undoLastPoint);
  const clearPoints = useRouteCreationStore((s) => s.clearPoints);

  const [styleLoaded, setStyleLoaded] = useState(false);
  const cameraRef = useRef<Mapbox.Camera>(null);

  // This hook watches draftPoints and fetches directions with debounce
  useDirectionsForDraft();

  const canProceed = draftPoints.length >= 2 && snappedRoute != null;

  const handleMapPress = (event: any) => {
    const coords = event.geometry.coordinates as [number, number];
    addPoint(coords);
  };

  const handleNext = () => {
    router.push("/create-route/step2-waypoints");
  };

  return (
    <View style={styles.container}>
      <StepHeader step={1} title="Trazar ruta" />

      <View style={styles.mapContainer}>
        <Mapbox.MapView
          style={styles.map}
          styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors}
          compassEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          scaleBarEnabled={false}
          onPress={handleMapPress}
          onDidFinishLoadingStyle={() => setStyleLoaded(true)}
        >
          <Mapbox.Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: DEFAULT_CENTER,
              zoomLevel: 12,
            }}
          />

          <Mapbox.UserLocation visible />

          {/* Snapped route polyline */}
          {styleLoaded && snappedRoute && (
            <RoutePolyline
              coordinates={snappedRoute.geometry.coordinates}
              color={colors.primary}
              width={5}
            />
          )}

          {/* Draft point markers */}
          {draftPoints.map((coord, index) => (
            <Mapbox.MarkerView
              key={`draft-${index}`}
              id={`draft-marker-${index}`}
              coordinate={coord}
            >
              <DraftMarker index={index} total={draftPoints.length} />
            </Mapbox.MarkerView>
          ))}
        </Mapbox.MapView>

        {/* Distance chip */}
        {snappedRoute && (
          <View style={[styles.distanceChipContainer, { top: 12 }]}>
            <DistanceChip
              distanceMeters={snappedRoute.distance}
              durationSeconds={snappedRoute.duration}
            />
          </View>
        )}

        {/* Hint text */}
        {draftPoints.length === 0 && (
          <View style={[styles.hintContainer, { bottom: 100 }]}>
            <View style={[styles.hintCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                Toca el mapa para agregar puntos de la ruta
              </Text>
            </View>
          </View>
        )}

        {/* Floating action buttons */}
        <View style={[styles.fabColumn, { bottom: insets.bottom + 90 }]}>
          {draftPoints.length > 0 && (
            <Pressable
              style={[styles.fab, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={undoLastPoint}
            >
              <Ionicons name="arrow-undo" size={22} color={colors.text} />
            </Pressable>
          )}
          {draftPoints.length > 0 && (
            <Pressable
              style={[styles.fab, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={clearPoints}
            >
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <Text style={[styles.pointCount, { color: colors.textSecondary }]}>
          {draftPoints.length} punto{draftPoints.length !== 1 ? "s" : ""} agregado{draftPoints.length !== 1 ? "s" : ""}
        </Text>
        <Pressable
          style={[
            styles.nextButton,
            { backgroundColor: canProceed ? colors.primary : colors.buttonDisabled },
          ]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  distanceChipContainer: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
  },
  hintContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 10,
  },
  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  hintText: {
    fontSize: 13,
  },
  fabColumn: {
    position: "absolute",
    right: 16,
    gap: 10,
    zIndex: 10,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  pointCount: {
    fontSize: 13,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
