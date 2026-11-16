import React from "react";
import { View } from "react-native";
import { useColors } from "../../hooks/use-colors";
import { Text } from "./text";

export function Badge({
  children,
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: "accent" | "muted" | "success";
}) {
  const colors = useColors();
  const backgroundColor =
    tone === "success" ? colors.chart2 : tone === "muted" ? colors.muted : colors.accent;
  const color = tone === "success" ? colors.primaryForeground : colors.foreground;

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor,
      }}
    >
      <Text variant="caption" weight="semibold" style={{ color }}>
        {children}
      </Text>
    </View>
  );
}
