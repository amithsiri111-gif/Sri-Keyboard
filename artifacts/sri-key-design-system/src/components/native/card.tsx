import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useColors } from "../../hooks/use-colors";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: colors.radius * 2,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
