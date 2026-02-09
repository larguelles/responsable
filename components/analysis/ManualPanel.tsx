import { Card } from '@/components/ui/Card';
import { ChatResultCard } from '@/components/ui/ChatResultCard';
import { SelectSheet } from '@/components/ui/SelectSheet';
import type { ThemeType } from '@/components/ui/theme';
import { useCategories, useItems } from '@/hooks/use-expenses';
import { useTranslation } from '@/i18n/i18n';
import { buildPlan, type ManualDraft } from '@/lib/analysisApi';
import { useRunPlan } from '@/hooks/use-analysis';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { AnalysisStyles } from './analysisStyles';

const Chip = ({
  label,
  active,
  onPress,
  styles,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  styles: AnalysisStyles;
}) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

export type ManualPanelProps = {
  styles: AnalysisStyles;
  theme: ThemeType;
  categorySheetVisible: boolean;
  itemSheetVisible: boolean;
  setCategorySheetVisible: (b: boolean) => void;
  setItemSheetVisible: (b: boolean) => void;
};

export function ManualPanel({
  styles,
  theme,
  categorySheetVisible,
  itemSheetVisible,
  setCategorySheetVisible,
  setItemSheetVisible,
}: ManualPanelProps) {
  const t = useTranslation();

  const { data: categories } = useCategories();
  const { data: items } = useItems();

  const run = useRunPlan();

  const [draft, setDraft] = useState<ManualDraft>({
    kind: 'metric',
    preset: 'month_to_date',
    metric: 'sum',
    breakdownBy: 'day',
  });

  const categoryOptions = useMemo(
    () => (categories ?? []).map((c) => ({ name: c.name, id: c.id })),
    [categories],
  );

  const itemOptions = useMemo(
    () => (items ?? []).map((i) => ({ name: i.name, id: i.id })),
    [items],
  );

  const timezone = 'America/Argentina/Buenos_Aires';
  const hasResult = run.data?.result != null;

  const onRun = async () => {
    const plan = buildPlan(draft, timezone);
    await run.mutateAsync({ plan, timezone });
  };

  const FilterButton = ({
    label,
    value,
    onPress,
  }: {
    label: string;
    value?: string;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={[styles.filterBtn, { borderColor: value ? theme.accent : theme.hairline }]}
    >
      <Text style={styles.filterLabel}>{label}</Text>
      <Text style={[styles.filterValue, { color: value ? theme.text : theme.muted }]}>
        {value || t('select')}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView contentContainerStyle={{ gap: 12 }}>
      <Card>
        <Text style={styles.h2}>{t('plan')}</Text>

        <Text style={styles.label}>{t('analysisDefaultMode')}</Text>

        <View style={styles.row}>
          <Chip
            label={t('metric')}
            active={draft.kind === 'metric'}
            onPress={() => setDraft((d) => ({ ...d, kind: 'metric' }))}
            styles={styles}
          />
          <Chip
            label={t('breakdown')}
            active={draft.kind === 'breakdown'}
            onPress={() => setDraft((d) => ({ ...d, kind: 'breakdown' }))}
            styles={styles}
          />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>{t('range')}</Text>
        <View style={styles.row}>
          <Chip
            label={t('mtd')}
            active={draft.preset === 'month_to_date'}
            onPress={() => setDraft((d) => ({ ...d, preset: 'month_to_date' }))}
            styles={styles}
          />
          <Chip
            label={t('last_30_days')}
            active={draft.preset === 'last_30_days'}
            onPress={() => setDraft((d) => ({ ...d, preset: 'last_30_days' }))}
            styles={styles}
          />
          <Chip
            label={t('today')}
            active={draft.preset === 'today'}
            onPress={() => setDraft((d) => ({ ...d, preset: 'today' }))}
            styles={styles}
          />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>{t('metric')}</Text>
        <View style={styles.row}>
          <Chip
            label={t('sum')}
            active={draft.metric === 'sum'}
            onPress={() => setDraft((d) => ({ ...d, metric: 'sum' }))}
            styles={styles}
          />
          <Chip
            label={t('count')}
            active={draft.metric === 'count'}
            onPress={() => setDraft((d) => ({ ...d, metric: 'count' }))}
            styles={styles}
          />
        </View>

        {draft.kind === 'breakdown' && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>{t('group_by')}</Text>
            <View style={styles.row}>
              <Chip
                label={t('day')}
                active={draft.breakdownBy === 'day'}
                onPress={() => setDraft((d) => ({ ...d, breakdownBy: 'day' }))}
                styles={styles}
              />
              <Chip
                label={t('category')}
                active={draft.breakdownBy === 'category'}
                onPress={() => setDraft((d) => ({ ...d, breakdownBy: 'category' }))}
                styles={styles}
              />
              <Chip
                label={t('item')}
                active={draft.breakdownBy === 'item'}
                onPress={() => setDraft((d) => ({ ...d, breakdownBy: 'item' }))}
                styles={styles}
              />
            </View>
          </>
        )}
      </Card>

      <Card>
        <Text style={styles.h2}>
          {t('filters')}{' '}
          <Text style={[styles.h2, { fontSize: 12, color: theme.muted }]}>
            ({t('oneOrAnother')})
          </Text>
        </Text>

        <View style={{ gap: 10 }}>
          <FilterButton
            label={t('category')}
            value={draft.categoryName}
            onPress={() => setCategorySheetVisible(true)}
          />
          <FilterButton
            label={t('item')}
            value={draft.itemName}
            onPress={() => setItemSheetVisible(true)}
          />

          <SelectSheet
            title={t('category')}
            visible={categorySheetVisible}
            onClose={() => setCategorySheetVisible(false)}
            placeholder={t('search')}
            placeholderShowOrAdd={false}
            value={draft.categoryName ?? ''}
            items={categoryOptions}
            onSelect={(name) =>
              setDraft((d) => ({
                ...d,
                categoryName: name || undefined,
                itemName: undefined,
              }))
            }
          />

          <SelectSheet
            title={t('item')}
            visible={itemSheetVisible}
            onClose={() => setItemSheetVisible(false)}
            placeholder={t('search')}
            placeholderShowOrAdd={false}
            value={draft.itemName ?? ''}
            items={itemOptions}
            onSelect={(name) =>
              setDraft((d) => ({
                ...d,
                itemName: name || undefined,
                categoryName: undefined,
              }))
            }
          />
        </View>
      </Card>

      <Pressable
        onPress={onRun}
        style={[styles.primaryBtn, run.isPending && { opacity: 0.6 }]}
        disabled={run.isPending}
      >
        <Text style={styles.primaryBtnText}>
          {run.isPending ? t('loading') : t('run')}
        </Text>
      </Pressable>

      {hasResult ? (
        <ChatResultCard result={run.data!.result as any} title={t('result')} />
      ) : (
        <Card>
          <Text style={styles.h2}>{t('result')}</Text>
          <Text
            style={[
              styles.resultText,
              run.isError && { color: theme.muted, fontStyle: 'italic' },
            ]}
          >
            {run.isError
              ? (run.error as Error)?.message ?? t('requestFailed')
              : t('empty')}
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}
