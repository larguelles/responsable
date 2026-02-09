export type ThemeVariant = 'default' | 'cobalt2';

export const themeFor = (
  scheme: 'light' | 'dark',
  variant: ThemeVariant = 'default',
) => {
  const isDark = scheme === 'dark';

  if (variant === 'default') {
    return {
      bg: isDark ? '#0B0C10' : '#F6F7FB',
      card: isDark ? '#151823' : '#FFFFFF',
      text: isDark ? '#F2F3F6' : '#12131A',
      muted: isDark ? '#A2A6B3' : '#6B7280',
      hairline: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
      accent: '#fa5311',
      onAccent: '#FFFFFF',
      pad: 16,
      radius: 14,
    } as const;
  }

  return {
    bg: '#193549',
    card: '#1F4662',
    text: '#FFFFFF',
    muted: '#C5DCEB', // Brighter than #9BB4C9 for better contrast on dark blue (WCAG AA)
    hairline: 'rgba(255,255,255,0.12)',
    accent: '#FFC600',
    onAccent: '#12131A', // Dark text on yellow for readable contrast
    pad: 16,
    radius: 14,
  } as const;
};

export type ThemeType = ReturnType<typeof themeFor>;
