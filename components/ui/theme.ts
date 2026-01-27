export const themeFor = (scheme: "light" | "dark") => {
  const isDark = scheme === "dark";
  return {
    bg: isDark ? "#0B0C10" : "#F6F7FB",
    card: isDark ? "#151823" : "#FFFFFF",
    text: isDark ? "#F2F3F6" : "#12131A",
    muted: isDark ? "#A2A6B3" : "#6B7280",
    hairline: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    accent: "#fa5311",
    pad: 16,
    radius: 14,
  } as const;
};
export type ThemeType = ReturnType<typeof themeFor>;