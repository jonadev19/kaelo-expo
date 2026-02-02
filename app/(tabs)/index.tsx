import { StyleSheet } from "react-native";

import ENV from "@/config/env";
import useLocationPermission from "@/shared/hooks/useLocationPermission";
import { useTheme } from "@/shared/hooks/useTheme";
import Mapbox from "@rnmapbox/maps";
import { useEffect } from "react";

Mapbox.setAccessToken(ENV.MAPBOX_ACCESS_TOKEN);

export default function TabOneScreen() {
  const { permission, requestPermission } = useLocationPermission();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  return (
    <Mapbox.MapView
      style={{ flex: 1 }}
      styleURL={
        isDark
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/streets-v12"
      }
    >
      <Mapbox.Camera zoomLevel={10} centerCoordinate={[-89.5926, 20.9674]} />
      <Mapbox.UserLocation
        visible={permission === true}
        showsUserHeadingIndicator={true} // Muestra dirección
      />
    </Mapbox.MapView>
  );
}

const styles = StyleSheet.create({});
