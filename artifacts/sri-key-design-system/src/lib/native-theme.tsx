import React, { createContext, useMemo, type ReactNode } from "react";
import { tokens } from "../generated/tokens";

const toPixels = (value: string) =>
  value.endsWith("rem") ? Number.parseFloat(value) * 16 : Number.parseFloat(value);

export const nativeTheme = {
  light: tokens.color.light,
  dark: tokens.color.dark,
  radius: toPixels(tokens.radius),
  spacing: toPixels(tokens.spacing),
};

export type NativeColors = typeof nativeTheme.light & {
  radius: number;
  spacing: number;
};

type NativeThemeOverride = {
  scheme?: "light" | "dark";
  accent?: string;
};

export const NativeThemeContext = createContext<NativeThemeOverride | null>(null);

function contrastColor(hex: string) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.58 ? tokens.color.light.foreground : tokens.color.light.primaryForeground;
}

export function colorsForScheme(
  scheme: "light" | "dark" | null | undefined,
  accent?: string,
): NativeColors {
  const palette = scheme === "dark" ? nativeTheme.dark : nativeTheme.light;
  const validAccent = accent && /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : undefined;

  return {
    ...palette,
    ...(validAccent
      ? {
          primary: validAccent,
          ring: validAccent,
          primaryForeground: contrastColor(validAccent),
        }
      : {}),
    radius: nativeTheme.radius,
    spacing: nativeTheme.spacing,
  };
}

export function NativeThemeProvider({
  scheme,
  accent,
  children,
}: NativeThemeOverride & { children: ReactNode }) {
  const value = useMemo(() => ({ scheme, accent }), [scheme, accent]);
  return <NativeThemeContext.Provider value={value}>{children}</NativeThemeContext.Provider>;
}
