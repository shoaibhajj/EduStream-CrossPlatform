import { View, Text } from "react-native";

export default function IndexScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-semibold text-text-primary">EduStream</Text>
      <Text className="mt-2 text-text-muted">Monorepo setup complete.</Text>
    </View>
  );
}
