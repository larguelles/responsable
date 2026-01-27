import { getDeviceLang, setLang, type Lang } from "@/i18n/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";

type Ctx = {
  lang: Lang;
  setLangPref: (l: Lang) => void;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  resolvedScheme: "light" | "dark";
};

const SettingsContext = createContext<Ctx | null>(null);

const K_LANG = "settings.lang";
const K_THEME = "settings.themeMode";

export const AppSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme() ?? "light";

  const [lang, setLangState] = useState<Lang>("en");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    (async () => {
      const storedLang = (await AsyncStorage.getItem(K_LANG)) as Lang | null;
      const storedTheme = (await AsyncStorage.getItem(K_THEME)) as ThemeMode | null;

      const nextLang = storedLang ?? getDeviceLang();
      const nextTheme = storedTheme ?? "system";

      setLang(nextLang);
      setLangState(nextLang);
      setThemeModeState(nextTheme);
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

  const resolvedScheme = themeMode === "system" ? systemScheme : themeMode;

  const value = useMemo(
    () => ({ lang, setLangPref, themeMode, setThemeMode, resolvedScheme }),
    [lang, themeMode, resolvedScheme],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useAppSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
};
