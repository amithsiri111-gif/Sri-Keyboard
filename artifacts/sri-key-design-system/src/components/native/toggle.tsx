import React from "react";
import { Switch, View } from "react-native";
import { useColors } from "../../hooks/use-colors";
import { Text } from "./text";

export function Toggle({
  label,
  value,
  onValueChange,
  testID,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <View style={{ minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <Text variant="body">{label}</Text>
      <Switch
        testID={testID}
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.primaryForeground : colors.card}
      />
    </View>
  );
}
