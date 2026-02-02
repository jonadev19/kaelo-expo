import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

export const ThemeToggleButton = () => {
  const { isDark, mode, setMode } = useTheme();
  const rotateAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isDark ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [isDark]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleToggle = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggle}
      activeOpacity={0.8}
    >
      {/* Fondo con gradiente simulado */}
      <View
        style={[
          styles.background,
          {
            backgroundColor: isDark ? "#1e293b" : "#f8fafc",
          },
        ]}
      >
        {/* Círculo decorativo */}
        <View
          style={[
            styles.decorativeCircle,
            {
              backgroundColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        />

        {/* Iconos animados */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate }],
            },
          ]}
        >
          {isDark ? (
            <View style={styles.moonContainer}>
              <Ionicons name="moon" size={28} color="#fbbf24" />
              {/* Estrellas decorativas */}
              <View style={[styles.star, { top: 8, right: 8 }]}>
                <Ionicons name="star" size={8} color="#fbbf24" />
              </View>
              <View style={[styles.star, { top: 20, right: 2 }]}>
                <Ionicons name="star" size={6} color="#fbbf24" />
              </View>
            </View>
          ) : (
            <View style={styles.sunContainer}>
              <Ionicons name="sunny" size={28} color="#f59e0b" />
              {/* Rayos decorativos */}
              <View style={styles.rays}>
                {[...Array(8)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.ray,
                      {
                        transform: [
                          { rotate: `${i * 45}deg` },
                          { translateY: -20 },
                        ],
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        {/* Borde brillante */}
        <View
          style={[
            styles.glowBorder,
            {
              borderColor: isDark ? "#fbbf24" : "#f59e0b",
              opacity: isDark ? 0.3 : 0.4,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    marginVertical: 20,
  },
  background: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  decorativeCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    top: 10,
    left: 10,
  },
  iconContainer: {
    zIndex: 2,
  },
  moonContainer: {
    position: "relative",
  },
  star: {
    position: "absolute",
  },
  sunContainer: {
    position: "relative",
  },
  rays: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  ray: {
    position: "absolute",
    width: 2,
    height: 8,
    backgroundColor: "#f59e0b",
    borderRadius: 1,
  },
  glowBorder: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
  },
});
