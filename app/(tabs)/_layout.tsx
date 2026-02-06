import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Tabs } from "expo-router";
import React, { useEffect } from "react";

import Colors from "@/constants/Colors";
import { useAuth } from "@/shared/hooks/useAuth";
import { useClientOnlyValue } from "@/shared/hooks/useClientOnlyValue";
import { useColorScheme } from "@/shared/hooks/useColorScheme";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("🏠 TabsLayout: isAuthenticated =", isAuthenticated);

    if (!isAuthenticated) {
      console.log("❌ Sesión cerrada, redirigiendo a login...");
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, router]);

  // No renderizar si no está autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Explorar",
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          headerShown: false,
          title: "Rutas",
          tabBarIcon: ({ color }) => <TabBarIcon name="road" color={color} />,
        }}
      />
      <Tabs.Screen
        name="businesses"
        options={{
          headerShown: false,
          title: "Comercios",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shopping-bag" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Perfil",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
