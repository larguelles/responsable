export type Lang = 'en' | 'es';

export const localeForLang = (lang: Lang) => (lang === 'es' ? 'es-AR' : 'en-US');

const capitalizeWords = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

const dayKeyLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const dayKeyFromIso = (iso: string) => dayKeyLocal(new Date(iso));

export const makeDayTitleFormatter = (lang: Lang) => {
  const locale = localeForLang(lang);
  const dtf = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const todayKey = dayKeyLocal(new Date());
  const yesterdayKey = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dayKeyLocal(d);
  })();

  const labels = {
    today: lang === 'es' ? 'Hoy' : 'Today',
    yesterday: lang === 'es' ? 'Ayer' : 'Yesterday',
  };

  return (dayKey: string) => {
    if (dayKey === todayKey) return labels.today;
    if (dayKey === yesterdayKey) return labels.yesterday;

    const [y, m, d] = dayKey.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return capitalizeWords(dtf.format(dt));
  };
};
