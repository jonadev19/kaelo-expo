import { Stack } from "expo-router";

export default function CreateRouteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="step1-draw" />
      <Stack.Screen name="step2-waypoints" />
      <Stack.Screen name="step3-details" />
      <Stack.Screen name="step4-businesses" />
      <Stack.Screen name="step5-review" />
    </Stack>
  );
}
