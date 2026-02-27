import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoutePolyline } from "../../components/creation/RoutePolyline";
import { StepHeader } from "../../components/creation/StepHeader";
import { WaypointEditorModal } from "../../components/creation/WaypointEditorModal";
import { WaypointEditorRow } from "../../components/creation/WaypointEditorRow";
import type { DraftWaypoint } from "../../store/useRouteCreationStore";
import { useRouteCreationStore } from "../../store/useRouteCreationStore";
import type { WaypointType } from "../../types";

export default function Step2WaypointsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const snappedRoute = useRouteCreationStore((s) => s.snappedRoute);
  const waypoints = useRouteCreationStore((s) => s.waypoints);
  const addWaypoint = useRouteCreationStore((s) => s.addWaypoint);
  const removeWaypoint = useRouteCreationStore((s) => s.removeWaypoint);

  const [modalVisible, setModalVisible] = useState(false);
  const [tapCoord, setTapCoord] = useState<[number, number] | null>(null);

  const routeCoords = snappedRoute?.geometry.coordinates ?? [];
  const center: [number, number] = routeCoords.length
    ? routeCoords[Math.floor(routeCoords.length / 2)]
    : [-89.6237, 20.9674];

  const handleMapPress = (event: any) => {
    const coords = event.geometry.coordinates as [number, number];
    setTapCoord(coords);
    setModalVisible(true);
  };

  const handleSaveWaypoint = (data: {
    name: string;
    description: string;
    waypoint_type: WaypointType;
  }) => {
    if (!tapCoord) return;
    const wp: DraftWaypoint = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: data.name,
      description: data.description || null,
      waypoint_type: data.waypoint_type,
      lng: tapCoord[0],
      lat: tapCoord[1],
      image_url: null,
    };
    addWaypoint(wp);
    setModalVisible(false);
    setTapCoord(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepHeader step={2} title="Puntos de interés" />

      {/* Mini map */}
      <View style={styles.miniMapWrapper}>
        <Mapbox.MapView
          style={styles.miniMap}
          styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors}
          compassEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          scaleBarEnabled={false}
          onPress={handleMapPress}
        >
          <Mapbox.Camera
            defaultSettings={{
              centerCoordinate: center,
              zoomLevel: 12,
            }}
          />

          {routeCoords.length >= 2 && (
            <RoutePolyline
              coordinates={routeCoords}
              color={colors.primary}
              width={4}
            />
          )}

          {/* Waypoint markers */}
          {waypoints.map((wp, i) => (
            <Mapbox.MarkerView
              key={wp.id}
              id={`wp-${wp.id}`}
              coordinate={[wp.lng, wp.lat]}
            >
              <View style={[styles.wpMarker, { backgroundColor: colors.accent }]}>
                <Text style={styles.wpMarkerText}>{i + 1}</Text>
              </View>
            </Mapbox.MarkerView>
          ))}
        </Mapbox.MapView>

        <View style={[styles.mapOverlayHint, { backgroundColor: colors.overlay }]}>
          <Ionicons name="add-circle-outline" size={16} color="#FFF" />
          <Text style={styles.mapOverlayText}>Toca para agregar POI</Text>
        </View>
      </View>

      {/* Waypoints list */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Puntos agregados ({waypoints.length})
        </Text>

        {waypoints.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Ionicons name="flag-outline" size={24} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aún no has agregado puntos de interés. Toca el mapa para agregar uno.
            </Text>
          </View>
        ) : (
          <FlatList
            data={waypoints}
            keyExtractor={(wp) => wp.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <WaypointEditorRow
                waypoint={item}
                index={index}
                onDelete={() => removeWaypoint(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </View>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <Pressable
          style={[styles.skipButton]}
          onPress={() => router.push("/create-route/step3-details")}
        >
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Omitir
          </Text>
        </Pressable>
        <Pressable
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/create-route/step3-details")}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </Pressable>
      </View>

      <WaypointEditorModal
        visible={modalVisible}
        coordinate={tapCoord}
        onSave={handleSaveWaypoint}
        onClose={() => {
          setModalVisible(false);
          setTapCoord(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  miniMapWrapper: {
    height: 220,
    position: "relative",
  },
  miniMap: {
    flex: 1,
  },
  wpMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  wpMarkerText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  mapOverlayHint: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mapOverlayText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  listSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
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
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "500",
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
