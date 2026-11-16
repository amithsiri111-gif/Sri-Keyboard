import React from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useColors } from "../../hooks/use-colors";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "default" | "small" | "icon";

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  children,
  variant = "primary",
  size = "default",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colors = useColors();
  const variants = {
    primary: { backgroundColor: colors.primary, borderColor: colors.primary },
    secondary: { backgroundColor: colors.secondary, borderColor: colors.secondary },
    outline: { backgroundColor: "transparent", borderColor: colors.border },
    ghost: { backgroundColor: "transparent", borderColor: "transparent" },
    destructive: { backgroundColor: colors.destructive, borderColor: colors.destructive },
  } satisfies Record<ButtonVariant, ViewStyle>;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        {
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          borderRadius: colors.radius,
          borderWidth: variant === "ghost" ? 0 : 1,
          paddingHorizontal: size === "small" ? 12 : size === "icon" ? 0 : 16,
          paddingVertical: size === "small" ? 8 : size === "icon" ? 0 : 12,
          minHeight: size === "small" ? 36 : 44,
          ...(size === "icon" ? { width: 44, height: 44 } : {}),
          ...variants[variant],
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}
