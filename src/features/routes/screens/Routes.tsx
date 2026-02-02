import { Text, View } from "@/shared/components/Themed";
import { useRoutes } from "../hooks/useRoutes";

export default function Routes() {
  const { data } = useRoutes();

  console.log(data);

  return (
    <View>
      <Text>HomeScreen</Text>
    </View>
  );
}
