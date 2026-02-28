import ENV from "@/config/env";
import "@/config/mapbox";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { queryClient } from "@/lib/react-query";
import { useTheme } from "@/shared/hooks/useTheme";
import {
  useAuthInitialized,
  useAuthStore,
  useIsAuthenticated,
} from "@/shared/store/authStore";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
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
    // Inicializamos el listener de Supabase
    const cleanup = initializeAuth();
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
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useAuthInitialized();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else {
      if (
        inAuthGroup ||
        (segments as string[]).length === 0 ||
        (segments as string[])[0] === "index"
      ) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isInitialized, segments]);

  return (
    <StripeProvider
      publishableKey={ENV.STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.kaelo"
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
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
            <Stack.Screen
              name="wallet"
              options={{ headerShown: false, presentation: "card" }}
            />
            <Stack.Screen
              name="notifications"
              options={{ headerShown: false, presentation: "card" }}
            />
            <Stack.Screen
              name="downloaded-routes"
              options={{ headerShown: false, presentation: "card" }}
            />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </StripeProvider>
  );
}
