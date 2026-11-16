import { useContext } from "react";
import { useColorScheme } from "react-native";
import { colorsForScheme, NativeThemeContext } from "../lib/native-theme";

export function useColors() {
  const override = useContext(NativeThemeContext);
  const systemScheme = useColorScheme();
  return colorsForScheme(override?.scheme ?? systemScheme, override?.accent);
}
