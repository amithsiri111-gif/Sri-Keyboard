import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

type TextVariant = "display" | "title" | "subtitle" | "body" | "caption" | "key";
type FontLanguage = "latin" | "sinhala";

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  language?: FontLanguage;
  weight?: "regular" | "medium" | "semibold" | "bold";
};

const sizes: Record<TextVariant, number> = {
  display: 30,
  title: 22,
  subtitle: 17,
  body: 15,
  caption: 12,
  key: 19,
};

const latinFonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

const sinhalaFonts = {
  regular: "NotoSansSinhala_400Regular",
  medium: "NotoSansSinhala_500Medium",
  semibold: "NotoSansSinhala_700Bold",
  bold: "NotoSansSinhala_700Bold",
} as const;

export function Text({
  variant = "body",
  language = "latin",
  weight = "regular",
  style,
  ...props
}: TextProps) {
  const fontFamily = language === "sinhala" ? sinhalaFonts[weight] : latinFonts[weight];
  return (
    <RNText
      {...props}
      style={[{ fontFamily, fontSize: sizes[variant], includeFontPadding: false }, style]}
    />
  );
}
