import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

export function useBackHandler() {
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return { handleBack };
}