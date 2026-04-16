import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import { BlurView } from "expo-blur";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RouteWaypoint, WaypointType } from "../types";

const WAYPOINT_MAKI: Record<WaypointType, string> = {
  inicio: "marker-15",
  fin: "marker-15",
  cenote: "water-15",
  zona_arqueologica: "monument-15",
  mirador: "viewpoint-15",
  restaurante: "restaurant-15",
  tienda: "shop-15",
  taller_bicicletas: "bicycle-15",
  descanso: "picnic-site-15",
  punto_agua: "drinking-water-15",
  peligro: "circle-stroked-15",
  foto: "attraction-15",
  otro: "marker-15",
};

const WAYPOINT_COLOR: Record<string, string> = {
  inicio: "#22c55e",
  fin: "#ef4444",
};
const DEFAULT_WAYPOINT_COLOR = "#6366f1";

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

function buildEndpointGeoJSON(routeCoords: [number, number][]) {
  const features: GeoJSON.Feature[] = [];

  if (routeCoords.length > 0) {
    features.push({
      type: "Feature",
      properties: { color: WAYPOINT_COLOR.inicio },
      geometry: { type: "Point", coordinates: routeCoords[0] },
    });
  }

  if (routeCoords.length > 1) {
    features.push({
      type: "Feature",
      properties: { color: WAYPOINT_COLOR.fin },
      geometry: {
        type: "Point",
        coordinates: routeCoords[routeCoords.length - 1],
      },
    });
  }

  return { type: "FeatureCollection" as const, features };
}

function buildWaypointGeoJSON(
  waypoints: RouteWaypoint[],
  hasAccess: boolean,
) {
  const features: GeoJSON.Feature[] = [];

  if (hasAccess) {
    for (const wp of waypoints) {
      if (wp.waypoint_type === "inicio" || wp.waypoint_type === "fin") continue;
      features.push({
        type: "Feature",
        properties: {
          icon: WAYPOINT_MAKI[wp.waypoint_type] ?? "marker",
          color: WAYPOINT_COLOR[wp.waypoint_type] ?? DEFAULT_WAYPOINT_COLOR,
          size: 1.1,
        },
        geometry: { type: "Point", coordinates: [wp.lng, wp.lat] },
      });
    }
  }

  return { type: "FeatureCollection" as const, features };
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

  const endpointGeoJSON = useMemo(
    () => buildEndpointGeoJSON(routeGeojson.coordinates),
    [routeGeojson.coordinates],
  );

  const waypointGeoJSON = useMemo(
    () => buildWaypointGeoJSON(waypoints, hasAccess),
    [waypoints, hasAccess],
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

      {/* Start/End circles */}
      <Mapbox.ShapeSource
        id={`endpoints-${isModal ? "fs" : "pv"}`}
        shape={endpointGeoJSON}
      >
        <Mapbox.CircleLayer
          id={`endpoints-border-${isModal ? "fs" : "pv"}`}
          style={{
            circleRadius: 9,
            circleColor: "#FFFFFF",
            circleOpacity: hasAccess ? 1 : 0.4,
          }}
        />
        <Mapbox.CircleLayer
          id={`endpoints-fill-${isModal ? "fs" : "pv"}`}
          style={{
            circleRadius: 6,
            circleColor: ["get", "color"],
            circleOpacity: hasAccess ? 1 : 0.4,
          }}
        />
      </Mapbox.ShapeSource>

      {/* Intermediate waypoint markers via SymbolLayer */}
      <Mapbox.ShapeSource
        id={`waypoints-${isModal ? "fs" : "pv"}`}
        shape={waypointGeoJSON}
      >
        <Mapbox.SymbolLayer
          id={`waypoints-symbols-${isModal ? "fs" : "pv"}`}
          style={{
            iconImage: ["get", "icon"],
            iconSize: ["get", "size"],
            iconAllowOverlap: true,
            iconAnchor: "center",
          }}
        />
      </Mapbox.ShapeSource>
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

        {/* Premium blur overlay */}
        {!hasAccess && (
          <BlurView intensity={30} tint="dark" style={styles.premiumOverlay}>
            <View style={styles.premiumContent}>
              <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
              <Text style={styles.premiumText}>
                Compra esta ruta para ver el mapa completo
              </Text>
            </View>
          </BlurView>
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
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 16,
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
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
