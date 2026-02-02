import ENV from "@/config/env";
import { Text, View } from "@/shared/components/Themed";
import { useTheme } from "@/shared/hooks/useTheme";
import { useLocationStore } from "@/shared/store/useLocationStore";
import Mapbox from "@rnmapbox/maps";
import { LocationAccuracy } from "expo-location";
import { useEffect, useRef } from "react";
import { MapButton } from "../components/MapButton";

Mapbox.setAccessToken(ENV.MAPBOX_ACCESS_TOKEN);

export default function Explore() {
  const { permission, requestPermission, updateLocation } = useLocationStore();
  const { isDark } = useTheme();
  const cameraRef = useRef<Mapbox.Camera>(null);

  const centerOnUserLocation = async () => {
    const freshLocation = await updateLocation(LocationAccuracy.Balanced);
    if (freshLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: [
          freshLocation.coords.longitude,
          freshLocation.coords.latitude,
        ],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (permission === null) {
    return <Text>Cargando permisos...</Text>;
  }

  if (permission === false) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Permisos de ubicación denegados</Text>
        <Text>Por favor, habilítalos en ajustes</Text>
      </View>
    );
  }

  return (
    <>
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={
          isDark
            ? "mapbox://styles/mapbox/satellite-streets-v12"
            : "mapbox://styles/mapbox/streets-v12"
        }
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={10}
          centerCoordinate={[-89.5926, 20.9674]}
        />
        <Mapbox.UserLocation
          visible={true}
          showsUserHeadingIndicator={false}
          minDisplacement={5}
          androidRenderMode="gps"
        />
      </Mapbox.MapView>
      <MapButton
        icon="layers"
        style={{ position: "absolute", bottom: 30, right: 20 }}
      />
      <MapButton
        icon="locate"
        style={{ position: "absolute", bottom: 100, right: 20 }}
        onPress={centerOnUserLocation}
      />
    </>
  );
}
