import { brand } from "@/constants/Colors";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff", // O usa tus colores de tema
      }}
    >
      <ActivityIndicator size="large" color={brand.primary[500]} />
    </View>
  );
}
