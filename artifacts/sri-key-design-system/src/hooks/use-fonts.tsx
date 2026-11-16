import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  NotoSansSinhala_400Regular,
  NotoSansSinhala_500Medium,
  NotoSansSinhala_700Bold,
} from "@expo-google-fonts/noto-sans-sinhala";

export function useDesignSystemFonts() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoSansSinhala_400Regular,
    NotoSansSinhala_500Medium,
    NotoSansSinhala_700Bold,
  });

  return { fontsLoaded, fontError };
}
