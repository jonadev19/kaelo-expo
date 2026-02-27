<<<<<<< HEAD
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
=======
import { useTheme } from "@/shared/hooks/useTheme";
import { Stack } from "expo-router";

export default function AuthLayout() {
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
        headerShown: false,
      }}
    >
>>>>>>> 6641b1a67348778d6d81cb4e018da3214ab4d1fc
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
