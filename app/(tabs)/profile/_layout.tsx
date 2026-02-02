import { useTheme } from "@/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export default function ProfileLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "600",
          color: colors.text,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Perfil",
          headerShown: true,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <Pressable
                onPress={() => router.push("/(tabs)/profile/settings")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={({ pressed }) => [
                  styles.headerButton,
                  { opacity: pressed ? 0.5 : 1, height: 30, width: 38 },
                ]}
              >
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          ),
        }}
      />
      <Stack.Screen name="settings" options={{ title: "Configuración" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    marginRight: 0,
  },
  headerButton: {
    width: 20,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});
