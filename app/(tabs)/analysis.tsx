import { Card } from '@/components/ui/Card';
import { SelectSheet } from '@/components/ui/SelectSheet';
import { themeFor, ThemeType } from '@/components/ui/theme';
import { ThinkingDots } from '@/components/ui/thinkingDots';
import { usePlanFromText, useRunPlan } from '@/hooks/use-analysis';
import { useCategories, useItems } from '@/hooks/use-expenses';
import { useTranslation } from '@/i18n/i18n';
import type { ManualDraft } from '@/lib/analysisApi';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { useChatStore } from '@/store/chatStore';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const makeStyles = (theme: ThemeType) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      padding: theme.pad,
      paddingTop: 60,
      gap: 12,
      backgroundColor: theme.bg,
    },
    title: { fontSize: 28, fontWeight: '700', color: theme.text },

    segment: { flexDirection: 'row', gap: 10 },
    segBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.hairline,
      alignItems: 'center',
    },
    segBtnActive: { backgroundColor: theme.accent, borderColor: theme.accent },
    segText: { fontWeight: '800', color: theme.text },
    segTextActive: { color: theme.text },

    h2: { fontSize: 16, fontWeight: '800', marginBottom: 10, color: theme.text },
    label: { fontSize: 14, marginBottom: 8, color: theme.muted },

    row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

    chip: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.hairline,
    },
    chipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
    chipText: { fontWeight: '800', color: theme.text },
    chipTextActive: { color: theme.text },

    filterBtn: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.hairline,
    },
    filterLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6, color: theme.muted },
    filterValue: { fontSize: 18, fontWeight: '800', color: theme.text },

    primaryBtn: {
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: theme.accent,
      alignItems: 'center',
    },
    primaryBtnText: { color: theme.text, fontWeight: '900' },

    resultText: { color: theme.muted },

    bubble: {
      padding: 10,
      borderRadius: 14,
      maxWidth: '85%',
      borderWidth: 1,
      borderColor: theme.hairline,
      backgroundColor: theme.card,
    },
    bubbleUser: { alignSelf: 'flex-end' },
    bubbleAssistant: { alignSelf: 'flex-start' },

    chatInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    chatInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderColor: theme.hairline,
      backgroundColor: theme.card,
      color: theme.text,
    },
    sendBtn: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: theme.accent,
    },
    sendBtnText: { color: theme.text, fontWeight: '900' },
  });

const SegBtn = ({
  label,
  active,
  onPress,
  styles,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <Pressable onPress={onPress} style={[styles.segBtn, active && styles.segBtnActive]}>
    <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
  </Pressable>
);

const Chip = ({
  label,
  active,
  onPress,
  styles,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

const mapGroupBy = (g: NonNullable<ManualDraft['breakdownBy']>) => {
  if (g === 'category') return 'category' as const;
  if (g === 'item') return 'item' as const;
  return 'day' as const;
};

export const buildPlan = (d: ManualDraft, timezone: string): any => {
  const filters =
    d.categoryName || d.itemName
      ? {
          categoryName: d.categoryName || undefined,
          itemName: d.itemName || undefined,
        }
      : undefined;

  const range = {
    preset: d.preset,
    timezone,
  };

  const op = d.metric;

  if (d.kind === 'metric') {
    return {
      kind: 'metric',
      op,
      field: 'amountCents',
      range,
      filters,
    };
  }

  return {
    kind: 'breakdown',
    op,
    field: 'amountCents',
    groupBy: mapGroupBy(d.breakdownBy ?? 'day'),
    range,
    filters,
    limit: d.limit ?? 20,
  };
};

export default function AnalysisScreen() {
  const t = useTranslation();
  const { resolvedScheme, chatAutoRun, analysisDefaultMode } = useAppSettings();

  const theme = useMemo(() => themeFor(resolvedScheme), [resolvedScheme]);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [mode, setMode] = useState<'manual' | 'chat'>(analysisDefaultMode);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [itemSheetVisible, setItemSheetVisible] = useState(false);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t('analysis')}</Text>

      <View style={styles.segment}>
        <SegBtn
          label={t('manual')}
          active={mode === 'manual'}
          onPress={() => setMode('manual')}
          styles={styles}
        />
        <SegBtn
          label={t('chat')}
          active={mode === 'chat'}
          onPress={() => setMode('chat')}
          styles={styles}
        />
      </View>

      {mode === 'manual' ? (
        <ManualPanel
          styles={styles}
          theme={theme}
          categorySheetVisible={categorySheetVisible}
          itemSheetVisible={itemSheetVisible}
          setCategorySheetVisible={setCategorySheetVisible}
          setItemSheetVisible={setItemSheetVisible}
        />
      ) : (
        <ChatPanel
          styles={styles}
          theme={theme}
          chatAutoRun={chatAutoRun}
          onEditInManual={() => {}}
        />
      )}
    </View>
  );
}

type ManualPanelProps = {
  styles: ReturnType<typeof makeStyles>;
  theme: ThemeType;
  categorySheetVisible: boolean;
  itemSheetVisible: boolean;
  setCategorySheetVisible: (b: boolean) => void;
  setItemSheetVisible: (b: boolean) => void;
};

function ManualPanel({
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
    <Pressable onPress={onPress} style={styles.filterBtn}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Text style={[styles.filterValue, { color: value ? theme.text : theme.muted }]}>
        {value || t('select')}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 12 }}>
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
            value={draft.categoryName ?? ''}
            items={categoryOptions}
            onSelect={(name) =>
              setDraft((d) => ({
                ...d,
                categoryName: name || undefined,
                itemName: undefined, // ✅ “o categoría o ítem”
              }))
            }
          />

          <SelectSheet
            title={t('item')}
            visible={itemSheetVisible}
            onClose={() => setItemSheetVisible(false)}
            placeholder={t('search')}
            value={draft.itemName ?? ''}
            items={itemOptions}
            onSelect={(name) =>
              setDraft((d) => ({
                ...d,
                itemName: name || undefined,
                categoryName: undefined, // ✅ “o categoría o ítem”
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

      <Card>
        <Text style={styles.h2}>{t('result')}</Text>
        <Text selectable style={styles.resultText}>
          {run.data ? JSON.stringify(run.data.result, null, 2) : t('empty')}
        </Text>
      </Card>
    </View>
  );
}

function ChatPanel({
  styles,
  theme,
  chatAutoRun,
}: {
  styles: ReturnType<typeof makeStyles>;
  theme: ThemeType;
  chatAutoRun: 'off' | 'on';
  onEditInManual: (plan: any) => void;
}) {
  const t = useTranslation();

  const { messages, input, setInput } = useChatStore();
  const planMut = usePlanFromText();
  const runMut = useRunPlan();

  const timezone = 'America/Argentina/Buenos_Aires';

  const onSend = async () => {
    const question = input.trim();
    if (!question) return;
    setInput('');

    const userMsg = {
      id: String(Date.now()) + '_u',
      role: 'user' as const,
      text: question,
      createdAt: Date.now(),
      status: 'sent' as const,
    };
    useChatStore.getState().addMessage(userMsg);

    const assistantId = String(Date.now()) + '_a';
    useChatStore.getState().addMessage({
      id: assistantId,
      role: 'assistant',
      text: '',
      createdAt: Date.now(),
      status: 'sending',
    });

    try {
      const planned = await planMut.mutateAsync({ question, timezone });

      if (chatAutoRun === 'on') {
        const run = await runMut.mutateAsync({ plan: planned.plan, timezone });
        useChatStore.getState().updateMessage(assistantId, {
          text: JSON.stringify(run.result, null, 2),
          status: 'sent',
        });
      } else {
        useChatStore.getState().updateMessage(assistantId, {
          text: `Plan:\n${JSON.stringify(planned.plan, null, 2)}\n\n(${t('autoRunOffHint')})`,
          status: 'sent',
        });
      }
    } catch (e: any) {
      useChatStore.getState().updateMessage(assistantId, {
        text: e?.message ?? t('requestFailed'),
        status: 'error',
      });
    }
  };

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <Card style={{ flex: 1 }}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
              ]}
            >
              {item.status === 'sending' ? (
                <ThinkingDots style={{ color: theme.text }} />
              ) : (
                <Text style={{ color: theme.text }}>{item.text}</Text>
              )}
            </View>
          )}
        />
      </Card>

      <View style={styles.chatInputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t('askSomething')}
          placeholderTextColor={theme.muted}
          style={styles.chatInput}
        />
        <Pressable onPress={onSend} style={styles.sendBtn}>
          <Text style={styles.sendBtnText}>{t('send')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
