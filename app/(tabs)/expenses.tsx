import { Card } from '@/components/ui/Card';
import { SelectSheet } from '@/components/ui/SelectSheet';
import { themeFor, ThemeType } from '@/components/ui/theme';
import { useCategories, useExpenses, useItems } from '@/hooks/use-expenses';
import { useTranslation } from '@/i18n/i18n';
import { dayKeyFromIso, makeDayTitleFormatter } from '@/lib/dates';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Row =
  | { type: 'header'; key: string; title: string; totalCents: number }
  | {
      type: 'item';
      key: string;
      id: string;
      amountCents: number;
      occurredAt: string;
      categoryName: string;
      itemName: string;
    };

type DatePreset = 'all' | 'month_to_date' | 'last_30_days' | 'today';

const formatMoney = (cents: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(cents / 100);

function dateRangeForPreset(preset: DatePreset): { from?: string; to?: string } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  if (preset === 'all') return {};

  if (preset === 'today') {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }

  if (preset === 'month_to_date') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }
  const from = new Date(now);
  from.setDate(from.getDate() - 29);
  from.setHours(0, 0, 0, 0);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

const makeStyles = (theme: ThemeType) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.bg, padding: theme.pad, paddingTop: 60 },
    top: { gap: 6, marginBottom: 10 },
    title: { color: theme.text, fontSize: 28, fontWeight: '700' },
    muted: { color: theme.muted, fontSize: 12 },

    searchWrap: { marginBottom: 12 },
    searchInput: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: theme.radius,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.hairline,
      color: theme.text,
      fontSize: 16,
    },

    filterLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, color: theme.muted },
    filterRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 14, },
    filterBtn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.hairline,
      minWidth: 90,
    },
    filterBtnActive: { borderColor: theme.accent },
    filterBtnText: { color: theme.text, fontSize: 14, fontWeight: '700' },
    filterBtnTextMuted: { color: theme.muted },
    chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingBottom: 14 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.hairline,
    },
    chipActive: { borderColor: theme.accent },
    chipText: { fontSize: 13, fontWeight: '700', color: theme.text },
    clearBtn: { paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start', marginTop: 4 },
    clearBtnText: { fontSize: 13, fontWeight: '700', color: theme.accent },

    listContent: { paddingBottom: 24, marginTop: 24, },

    headerRow: {
      marginTop: 10,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    headerTitle: { color: theme.text, fontSize: 13, fontWeight: '700', opacity: 0.9 },
    headerTotal: { color: theme.muted, fontSize: 13, fontWeight: '700' },

    card: { paddingVertical: 14, paddingHorizontal: 14, marginBottom: 10 },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    main: { color: theme.text, fontSize: 16, fontWeight: '700' },
    sub: { color: theme.muted, fontSize: 12, marginTop: 2 },
    amount: { color: theme.text, fontSize: 16, fontWeight: '800' },
  });

const FilterButton = ({
  label,
  value,
  onPress,
  styles,
}: {
  label: string;
  value: string | null;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.filterBtn, value != null && styles.filterBtnActive]}
  >
    <Text style={[styles.filterBtnText, value == null && styles.filterBtnTextMuted]}>
      {value ?? label}
    </Text>
  </Pressable>
);

const ExpensesScreen = () => {
  const { resolvedScheme, lang, themeVariant } = useAppSettings();
  const theme = useMemo(() => themeFor(resolvedScheme, themeVariant), [resolvedScheme, themeVariant]);
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const t = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [itemFilter, setItemFilter] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [itemSheetVisible, setItemSheetVisible] = useState(false);

  const dateParams = useMemo(() => dateRangeForPreset(datePreset), [datePreset]);
  const q = useExpenses(dateParams.from || dateParams.to ? dateParams : undefined);
  const expensesRaw = useMemo(() => q.data ?? [], [q.data]);

  const { data: categories } = useCategories();
  const { data: items } = useItems();

  const categoryOptions = useMemo(
    () => [{ id: '__all__', name: t('date_all') }, ...(categories ?? []).map((c) => ({ id: c.id, name: c.name }))],
    [categories, t],
  );
  const itemOptions = useMemo(
    () => [{ id: '__all__', name: t('date_all') }, ...(items ?? []).map((i) => ({ id: i.id, name: i.name }))],
    [items, t],
  );

  const expenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return expensesRaw.filter((e) => {
      if (categoryFilter != null && e.category.name !== categoryFilter) return false;
      if (itemFilter != null && e.item.name !== itemFilter) return false;
      if (q) {
        const matchItem = e.item.name.toLowerCase().includes(q);
        const matchCategory = e.category.name.toLowerCase().includes(q);
        if (!matchItem && !matchCategory) return false;
      }
      return true;
    });
  }, [expensesRaw, searchQuery, categoryFilter, itemFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || categoryFilter != null || itemFilter != null || datePreset !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter(null);
    setItemFilter(null);
    setDatePreset('all');
  };

  const formatDayTitle = useMemo(() => makeDayTitleFormatter(lang), [lang]);

  const monthToDateTotal = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses
      .filter((e) => new Date(e.occurredAt) >= start)
      .reduce((sum, e) => sum + e.amountCents, 0);
  }, [expenses]);

  const rows: Row[] = useMemo(() => {
    const byDay = new Map<string, typeof expenses>();

    for (const e of expenses) {
      const k = dayKeyFromIso(e.occurredAt);
      const arr = byDay.get(k) ?? [];
      arr.push(e);
      byDay.set(k, arr);
    }

    const dayKeys = Array.from(byDay.keys()).sort((a, b) => (a < b ? 1 : -1));

    const out: Row[] = [];
    for (const dayKey of dayKeys) {
      const dayItems = byDay.get(dayKey);
      if (!dayItems) continue;

      const totalCents = dayItems.reduce((s, e) => s + e.amountCents, 0);

      out.push({
        type: 'header',
        key: `h-${dayKey}`,
        title: formatDayTitle(dayKey),
        totalCents,
      });

      for (const e of dayItems) {
        out.push({
          type: 'item',
          key: `e-${e.id}`,
          id: e.id,
          amountCents: e.amountCents,
          occurredAt: e.occurredAt,
          categoryName: e.category.name,
          itemName: e.item.name,
        });
      }
    }

    return out;
  }, [expenses, formatDayTitle]);

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.title}>{t('expenses')}</Text>
        <Text style={styles.muted}>
          {t('month_to_date')}: {formatMoney(monthToDateTotal)}
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('expenses_search_placeholder')}
          placeholderTextColor={theme.muted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <Text style={styles.filterLabel}>{t('filter_category')}</Text>
      <View style={styles.filterRow}>
        <FilterButton
          label={t('select')}
          value={categoryFilter}
          onPress={() => setCategorySheetVisible(true)}
          styles={styles}
        />
      </View>

      <Text style={styles.filterLabel}>{t('filter_item')}</Text>
      <View style={styles.filterRow}>
        <FilterButton
          label={t('select')}
          value={itemFilter}
          onPress={() => setItemSheetVisible(true)}
          styles={styles}
        />
      </View>

      <Text style={styles.filterLabel}>{t('filter_date_range')}</Text>
      <View style={styles.chipRow}>
        <Pressable
          onPress={() => setDatePreset('all')}
          style={[styles.chip, datePreset === 'all' && styles.chipActive]}
        >
          <Text style={styles.chipText}>{t('date_all')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setDatePreset('month_to_date')}
          style={[styles.chip, datePreset === 'month_to_date' && styles.chipActive]}
        >
          <Text style={styles.chipText}>{t('mtd')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setDatePreset('last_30_days')}
          style={[styles.chip, datePreset === 'last_30_days' && styles.chipActive]}
        >
          <Text style={styles.chipText}>{t('last_30_days')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setDatePreset('today')}
          style={[styles.chip, datePreset === 'today' && styles.chipActive]}
        >
          <Text style={styles.chipText}>{t('today')}</Text>
        </Pressable>
      </View>

      {hasActiveFilters && (
        <Pressable onPress={clearFilters} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>{t('clear_filters')}</Text>
        </Pressable>
      )}

      <SelectSheet
        title={t('category')}
        visible={categorySheetVisible}
        items={categoryOptions}
        value={categoryFilter ?? ''}
        placeholder={t('search')}
        placeholderShowOrAdd={false}
        onClose={() => setCategorySheetVisible(false)}
        onSelect={(name) => {
          setCategoryFilter(name === t('date_all') ? null : name || null);
          setCategorySheetVisible(false);
        }}
      />
      <SelectSheet
        title={t('item')}
        visible={itemSheetVisible}
        items={itemOptions}
        value={itemFilter ?? ''}
        placeholder={t('search')}
        placeholderShowOrAdd={false}
        onClose={() => setItemSheetVisible(false)}
        onSelect={(name) => {
          setItemFilter(name === t('date_all') ? null : name || null);
          setItemSheetVisible(false);
        }}
      />

      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={q?.isFetching} onRefresh={q?.refetch} />
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>{item.title}</Text>
                <Text style={styles.headerTotal}>{formatMoney(item.totalCents)}</Text>
              </View>
            );
          }

          return (
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.main}>{item.itemName}</Text>
                  <Text style={styles.sub}>{item.categoryName}</Text>
                </View>
                <Text style={styles.amount}>{formatMoney(item.amountCents)}</Text>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          q?.isLoading ? (
            <Text style={styles.muted}>{t('loading')}</Text>
          ) : (
            <Text style={styles.muted}>
              {hasActiveFilters ? t('empty') : 'No expenses yet.'}
            </Text>
          )
        }
      />
    </View>
  );
};

export default ExpensesScreen;
