import { Card } from '@/components/ui/Card';
import { themeFor, type ThemeType, type ThemeVariant } from '@/components/ui/theme';
import { useTranslation } from '@/i18n/i18n';
import { useAppSettings, type ThemeMode } from '@/providers/AppSettingsProvider';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const makeStyles = (theme: ThemeType) =>
  StyleSheet.create({
    screen: { flex: 1, padding: theme.pad, paddingTop: 60, gap: 14 },
    title: { fontSize: 28, fontWeight: '700', color: theme.text },
    label: { fontSize: 12, marginBottom: 8, color: theme.muted },
    row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },

    btn: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.hairline,
    },
    btnActive: {
      borderColor: theme.accent,
    },
    btnText: { fontSize: 14, fontWeight: '800', color: theme.text },
    btnTextActive: { color: theme.text },
  });

const Btn = ({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  theme: ThemeType;
}) => {
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, active && styles.btnActive, pressed && { opacity: 0.7 }]}
    >
      <Text style={[styles.btnText, active && styles.btnTextActive]}>{label}</Text>
    </Pressable>
  );
};

const SettingsScreen = () => {
  const {
    lang,
    setLangPref,
    themeMode,
    setThemeMode,
    themeVariant,
    setThemeVariant,
    resolvedScheme,
    chatAutoRun,
    setAutoRun,
    analysisDefaultMode,
    setAnalysisMode,
  } = useAppSettings();

  const t = useTranslation();
  const theme = useMemo(() => themeFor(resolvedScheme, themeVariant), [resolvedScheme, themeVariant]);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Text style={styles.title}>{t('settings')}</Text>

      <Card>
        <Text style={styles.label}>{t('language')}</Text>
        <View style={styles.row}>
          <Btn label="English" active={lang === 'en'} onPress={() => setLangPref('en')} theme={theme} />
          <Btn label="Español" active={lang === 'es'} onPress={() => setLangPref('es')} theme={theme} />
        </View>

        {themeVariant === 'default' && 
        <>
        <Text style={[styles.label, { marginTop: 16 }]}>{t('theme')}</Text>
        <View style={styles.row}>
          {(['system', 'light', 'dark'] as ThemeMode[]).map((m) => (
            <Btn
              key={m}
              label={t(m)}
              active={themeMode === m}
              onPress={() => setThemeMode(m)}
              theme={theme}
            />
          ))}
        </View>
        </>
}
        <Text style={[styles.label, { marginTop: 16 }]}>{t('themeVariant')}</Text>
        <View style={styles.row}>
          {(['default', 'cobalt2'] as ThemeVariant[]).map((v) => (
            <Btn
              key={v}
              label={t(v)}
              active={themeVariant === v}
              onPress={() => setThemeVariant(v)}
              theme={theme}
            />
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>{t('autoRun')}</Text>
        <View style={styles.row}>
          <Btn label={t('off')} active={chatAutoRun === 'off'} onPress={() => setAutoRun('off')} theme={theme} />
          <Btn label={t('on')} active={chatAutoRun === 'on'} onPress={() => setAutoRun('on')} theme={theme} />
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>{t('analysisDefaultMode')}</Text>
        <View style={styles.row}>
          <Btn
            label={t('manual')}
            active={analysisDefaultMode === 'manual'}
            onPress={() => setAnalysisMode('manual')}
            theme={theme}
          />
          <Btn
            label={t('chat')}
            active={analysisDefaultMode === 'chat'}
            onPress={() => setAnalysisMode('chat')}
            theme={theme}
          />
        </View>
      </Card>
    </View>
  );
};

export default SettingsScreen;
