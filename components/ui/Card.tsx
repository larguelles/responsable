import { themeFor, ThemeType } from '@/components/ui/theme';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { useMemo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

const makeStyles = (theme: ThemeType) =>
  StyleSheet.create({
    main: {
      backgroundColor: theme.card,
      borderRadius: theme.radius,
      padding: theme.pad,
      borderWidth: 1,
      borderColor: theme.hairline,
    },
  });

export const Card = (props: ViewProps) => {
  const { resolvedScheme } = useAppSettings();
  const theme = useMemo(() => themeFor(resolvedScheme), [resolvedScheme]);
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return <View {...props} style={[styles.main, props.style]} />;
};
