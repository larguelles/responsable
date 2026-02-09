import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { translations } from './translations';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { useMemo } from 'react';

export type Lang = 'en' | 'es';

export const i18n = new I18n(translations);

export const getDeviceLang = (): Lang => {
  const tag = Localization.getLocales()?.[0]?.languageTag ?? 'en';
  return tag.toLowerCase().startsWith('es') ? 'es' : 'en';
};

export const setLang = (lang: Lang) => {
  i18n.locale = lang;
  i18n.enableFallback = true;
};

export const t = (key: keyof typeof translations.en) => i18n.t(key);

export const useTranslation = () => {
  const { lang } = useAppSettings();

  return useMemo(() => {
    setLang(lang);
    return (key: keyof typeof translations.en) => {
      const translation = translations[lang]?.[key] ?? translations.en[key] ?? key;
      return translation;
    };
  }, [lang]);
};
