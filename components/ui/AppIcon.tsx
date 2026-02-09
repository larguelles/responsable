import { themeFor } from '@/components/ui/theme';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

/** Apple-style icon corner radius (≈22.37% of size, iOS mask) */
const APPLE_ICON_RADIUS_RATIO = 0.2237;

type AppIconProps = {
  readonly size?: number;
  /** Override theme: when set, icon uses these instead of app theme (e.g. for export) */
  readonly backgroundColor?: string;
  readonly foregroundColor?: string;
};

/**
 * Theme-aware app icon: square, Apple-style rounded corners, sleek R combined with $.
 * Use without overrides to follow app theme (accent + onAccent).
 */
export function AppIcon({
  size = 128,
  backgroundColor,
  foregroundColor,
}: AppIconProps) {
  const { resolvedScheme, themeVariant } = useAppSettings();
  const theme = themeFor(resolvedScheme, themeVariant);

  const bg = backgroundColor ?? theme.accent;
  const fg = foregroundColor ?? theme.onAccent;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background with Apple-style squircle-like rounded corners */}
        <Rect
          x={0}
          y={0}
          width={100}
          height={100}
          rx={100 * APPLE_ICON_RADIUS_RATIO}
          ry={100 * APPLE_ICON_RADIUS_RATIO}
          fill={bg}
        />
        {/* Sleek R: stem, closed bowl, leg — centered with $ */}
        <Path
          fill="none"
          stroke={fg}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M 14 16 L 14 84
             M 14 16 L 42 16 Q 58 16 58 38 Q 58 54 42 54 L 14 54
             M 42 54 L 66 84"
        />
        {/* Clear $: two bars + S-curve */}
        <Path
          fill="none"
          stroke={fg}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M 72 14 L 72 86
             M 84 14 L 84 86
             M 72 30 C 72 30 84 38 84 50 C 84 62 72 70 72 70
             M 84 34 C 84 34 72 42 72 50 C 72 58 84 66 84 66"
        />
      </Svg>
    </View>
  );
}

export default AppIcon;
