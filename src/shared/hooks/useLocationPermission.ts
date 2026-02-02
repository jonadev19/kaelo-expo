import * as Location from "expo-location";
import { useState } from "react";

// Hook personalizado para manejar permisos
const useLocationPermission = () => {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status === "granted");

      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
      }

      return status === "granted";
    } catch (error) {
      console.error("Error al solicitar permiso:", error);
      return false;
    }
  };

  return { permission, location, requestPermission };
};

export default useLocationPermission;
