/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#FFF4E6",
      "foreground": "#39271F",
      "border": "#DCC5B2",
      "card": "#FFFFFF",
      "cardForeground": "#39271F",
      "popover": "#FFFFFF",
      "popoverForeground": "#39271F",
      "primary": "#573321",
      "primaryForeground": "#FFFDF7",
      "secondary": "#F2E0D0",
      "secondaryForeground": "#39271F",
      "muted": "#F2E0D0",
      "mutedForeground": "#795548",
      "accent": "#E8B78E",
      "accentForeground": "#39271F",
      "destructive": "#B3261E",
      "destructiveForeground": "#FFFFFF",
      "input": "#DCC5B2",
      "ring": "#573321",
      "chart1": "#8B5E3C",
      "chart2": "#3E7A4A",
      "chart3": "#C6512F",
      "chart4": "#B68900",
      "chart5": "#8B3D5C",
      "sidebar": "#FFF4E6",
      "sidebarForeground": "#39271F",
      "sidebarBorder": "#DCC5B2",
      "sidebarPrimary": "#573321",
      "sidebarPrimaryForeground": "#FFFDF7",
      "sidebarAccent": "#F2E0D0",
      "sidebarAccentForeground": "#39271F",
      "sidebarRing": "#573321"
    },
    "dark": {
      "background": "#2A080E",
      "foreground": "#FFFDF7",
      "border": "#6B1D2C",
      "card": "#4A121D",
      "cardForeground": "#FFFDF7",
      "popover": "#3E0E18",
      "popoverForeground": "#FFFDF7",
      "primary": "#FFC107",
      "primaryForeground": "#2A080E",
      "secondary": "#801826",
      "secondaryForeground": "#FFFDF7",
      "muted": "#3E0E18",
      "mutedForeground": "#FFC107",
      "accent": "#FFD54F",
      "accentForeground": "#2A080E",
      "destructive": "#FF8A80",
      "destructiveForeground": "#2A080E",
      "input": "#6B1D2C",
      "ring": "#FFC107",
      "chart1": "#FFC107",
      "chart2": "#FFF8E1",
      "chart3": "#FF8A80",
      "chart4": "#FFA726",
      "chart5": "#B8E986",
      "sidebar": "#21060B",
      "sidebarForeground": "#FFFDF7",
      "sidebarBorder": "#6B1D2C",
      "sidebarPrimary": "#FFC107",
      "sidebarPrimaryForeground": "#2A080E",
      "sidebarAccent": "#4A121D",
      "sidebarAccentForeground": "#FFFDF7",
      "sidebarRing": "#FFD54F"
    }
  },
  "fontFamily": {
    "sans": [
      "Inter",
      "Noto Sans Sinhala",
      "sans-serif"
    ],
    "serif": [
      "Noto Serif Sinhala",
      "Georgia",
      "serif"
    ],
    "mono": [
      "JetBrains Mono",
      "Noto Sans Sinhala",
      "monospace"
    ]
  },
  "radius": "0.5rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
