import type { ThemeVariant } from '@/components/ui/theme';
import { getDeviceLang, setLang, type Lang } from '@/i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type AnalysisMode = 'chat' | 'manual';
export type AutoRun = 'off' | 'on';

type Ctx = {
  lang: Lang;
  setLangPref: (l: Lang) => void;

  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;

  themeVariant: ThemeVariant;
  setThemeVariant: (v: ThemeVariant) => void;

  resolvedScheme: 'light' | 'dark';

  chatAutoRun: AutoRun;
  setAutoRun: (b: AutoRun) => void;

  analysisDefaultMode: AnalysisMode;
  setAnalysisMode: (m: AnalysisMode) => void;
};

const SettingsContext = createContext<Ctx | null>(null);

const K_LANG = 'settings.lang';
const K_THEME = 'settings.themeMode';
const K_THEME_VARIANT = 'settings.themeVariant';
const K_AUTO_RUN = 'settings.chatAutoRun';
const K_ANALYSIS_MODE = 'settings.analysisMode';

export const AppSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme() ?? 'light';

  const [lang, setLangState] = useState<Lang>('en');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [themeVariant, setThemeVariantState] = useState<ThemeVariant>('default');
  const [chatAutoRun, setChatAutoRun] = useState<AutoRun>('off');
  const [analysisDefaultMode, setAnalysisDefaultMode] = useState<AnalysisMode>('manual');

  useEffect(() => {
    (async () => {
      const storedLang = (await AsyncStorage.getItem(K_LANG)) as Lang | null;
      const storedTheme = (await AsyncStorage.getItem(K_THEME)) as ThemeMode | null;
      const storedVariant = (await AsyncStorage.getItem(
        K_THEME_VARIANT,
      )) as ThemeVariant | null;
      const storedChatAutoRun = (await AsyncStorage.getItem(K_AUTO_RUN)) as AutoRun | null;
      const storedAnalysisMode = (await AsyncStorage.getItem(
        K_ANALYSIS_MODE,
      )) as AnalysisMode | null;

      const nextLang = storedLang ?? getDeviceLang();
      const nextTheme = storedTheme ?? 'system';
      const nextVariant: ThemeVariant = storedVariant ?? 'default';
      const nextAutoRun = storedChatAutoRun ?? 'off';
      const nextAnalysisMode = storedAnalysisMode ?? 'manual';

      setLang(nextLang);
      setLangState(nextLang);
      setThemeModeState(nextTheme);
      setThemeVariantState(nextVariant);
      setChatAutoRun(nextAutoRun);
      setAnalysisDefaultMode(nextAnalysisMode);
    })();
  }, []);

  const setLangPref = (l: Lang) => {
    setLang(l);
    setLangState(l);
    AsyncStorage.setItem(K_LANG, l).catch(() => {});
  };

  const setThemeMode = (m: ThemeMode) => {
    setThemeModeState(m);
    AsyncStorage.setItem(K_THEME, m).catch(() => {});
  };

  const setThemeVariant = (v: ThemeVariant) => {
    setThemeVariantState(v);
    AsyncStorage.setItem(K_THEME_VARIANT, v).catch(() => {});
  };

  const setAutoRun = (b: AutoRun) => {
    setChatAutoRun(b);
    AsyncStorage.setItem(K_AUTO_RUN, b).catch(() => {});
  };

  const setAnalysisMode = (m: AnalysisMode) => {
    setAnalysisDefaultMode(m);
    AsyncStorage.setItem(K_ANALYSIS_MODE, m).catch(() => {});
  };

  const resolvedScheme = themeMode === 'system' ? systemScheme : themeMode;

  const value = useMemo(
    () => ({
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
    }),
    [lang, themeMode, themeVariant, resolvedScheme, analysisDefaultMode, chatAutoRun],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useAppSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
};
