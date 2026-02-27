<<<<<<< HEAD
=======
import "@/config/mapbox";
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
<<<<<<< HEAD
import { Stack } from "expo-router";
=======
import { Stack, useRouter, useSegments } from "expo-router";
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { queryClient } from "@/lib/react-query";
import { useTheme } from "@/shared/hooks/useTheme";
<<<<<<< HEAD

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
=======
import {
  useAuthInitialized,
  useAuthStore,
  useIsAuthenticated,
} from "@/shared/store/authStore";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
<<<<<<< HEAD
  initialRouteName: "(tabs)",
=======
  initialRouteName: "index",
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const initializeAuth = useAuthStore((state) => state.initialize);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // 3. Inicializamos el listener de Supabase
    // Esto se ejecuta una sola vez cuando abre la app
    const cleanup = initializeAuth();

    // Al cerrar la app o desmontar, limpiamos el listener
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { theme } = useTheme();
<<<<<<< HEAD
=======
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useAuthInitialized();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    // Revisamos si el usuario está en el grupo de autenticación (login/registro)
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated) {
      // 1. Si NO está logueado y NO está en login, mandarlo a login
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else {
      // 2. Si SI está logueado...
      // y está en login O en la raíz (index), mandarlo a la app principal
      if (
        inAuthGroup ||
        (segments as string[]).length === 0 ||
        (segments as string[])[0] === "index"
      ) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isInitialized, segments]);
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
<<<<<<< HEAD
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
=======
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="route-detail"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="business-detail"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="navigation"
            options={{ headerShown: false, presentation: "fullScreenModal", gestureEnabled: false }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="saved-routes"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="metrics"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="create-route"
            options={{ headerShown: false, presentation: "fullScreenModal" }}
          />
          <Stack.Screen
            name="cart"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="my-orders"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="business-search"
            options={{ headerShown: false, presentation: "card" }}
          />
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
