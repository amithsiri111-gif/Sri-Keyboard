import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useColors } from "../../hooks/use-colors";

export function Spinner({ label }: { label?: string }) {
  const colors = useColors();
  return (
    <View accessibilityRole="progressbar" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <ActivityIndicator color={colors.primary} />
      {label ? <View accessibilityLabel={label} /> : null}
    </View>
  );
}
