export { colors } from "./colors";
export { fontSize, fontWeight, lineHeight, typography } from "./typography";
export { spacing } from "./spacing";

export const radius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  full: 9999,
} as const;

export const border = {
  width: {
    thin: 1,
    medium: 2,
  },
} as const;

export const shadow = {
  sm: { boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  md: { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  lg: { boxShadow: "0 4px 16px rgba(0,0,0,0.12)" },
} as const;

/** Appends an alpha byte to a 6-char hex color string (e.g. "#2563eb", 0.1 → "#2563eb1a"). */
export function hexWithOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, "0");
  return `${hex}${alpha}`;
}

export const layout = {
  sidebarWidth: 240,
  contentMaxWidth: 1200,
  headerHeight: 56,
  pageGutter: 24,
} as const;
