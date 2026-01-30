import { Card } from '@/components/ui/Card';
import { SelectSheet } from '@/components/ui/SelectSheet';
import { themeFor } from '@/components/ui/theme';
import { usePlanFromText, useRunPlan } from '@/hooks/use-analysis';
import { useCategories, useItems } from '@/hooks/use-expenses';
import { useTranslation } from '@/i18n/i18n';
import type { ManualDraft } from '@/lib/analysisApi';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { useChatStore } from '@/store/chatStore';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const SegBtn = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={[styles.segBtn, active && styles.segBtnActive]}>
    <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
  </Pressable>
);

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
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

  // UI metric: "sum" | "count"  → backend op: "sum" | "count"
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
  const theme = themeFor(resolvedScheme);

  const [mode, setMode] = useState<'manual' | 'chat'>(analysisDefaultMode);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [itemSheetVisible, setItemSheetVisible] = useState(false);

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('analysis')}</Text>

      <View style={styles.segment}>
        <SegBtn
          label={t('manual')}
          active={mode === 'manual'}
          onPress={() => setMode('manual')}
        />
        <SegBtn
          label={t('chat')}
          active={mode === 'chat'}
          onPress={() => setMode('chat')}
        />
      </View>

      {mode === 'manual' ? (
        <ManualPanel
          categorySheetVisible={categorySheetVisible}
          itemSheetVisible={itemSheetVisible}
          setCategorySheetVisible={setCategorySheetVisible}
          setItemSheetVisible={setItemSheetVisible}
        />
      ) : (
        <ChatPanel
          chatAutoRun={chatAutoRun}
          onEditInManual={(plan) => {
            // opcional: podés implementar “Edit in Manual” cargando draft desde plan
            // lo dejamos para el siguiente paso
          }}
        />
      )}
    </View>
  );
}

type ManualPanelProps = {
  categorySheetVisible: boolean;
  itemSheetVisible: boolean;
  setCategorySheetVisible: (b: boolean) => void;
  setItemSheetVisible: (b: boolean) => void;
};

function ManualPanel({
  categorySheetVisible,
  itemSheetVisible,
  setCategorySheetVisible,
  setItemSheetVisible,
}: ManualPanelProps) {
  const t = useTranslation();
  const { resolvedScheme } = useAppSettings();
  const theme = themeFor(resolvedScheme);

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

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <Text style={[styles.h2, { color: theme.text }]}>Plan</Text>

        <Text style={[styles.label, { color: theme.muted }]}>
          {t('analysisDefaultMode')}
        </Text>

        <View style={styles.row}>
          <Chip
            label="Metric"
            active={draft.kind === 'metric'}
            onPress={() => setDraft((d) => ({ ...d, kind: 'metric' }))}
          />
          <Chip
            label="Breakdown"
            active={draft.kind === 'breakdown'}
            onPress={() => setDraft((d) => ({ ...d, kind: 'breakdown' }))}
          />
        </View>

        <Text style={[styles.label, { color: theme.muted, marginTop: 12 }]}>
          {t('month_to_date')}
        </Text>
        <View style={styles.row}>
          <Chip
            label="MTD"
            active={draft.preset === 'month_to_date'}
            onPress={() => setDraft((d) => ({ ...d, preset: 'month_to_date' }))}
          />
          <Chip
            label="30d"
            active={draft.preset === 'last_30_days'}
            onPress={() => setDraft((d) => ({ ...d, preset: 'last_30_days' }))}
          />
          <Chip
            label="Today"
            active={draft.preset === 'today'}
            onPress={() => setDraft((d) => ({ ...d, preset: 'today' }))}
          />
        </View>

        <Text style={[styles.label, { color: theme.muted, marginTop: 12 }]}>Metric</Text>
        <View style={styles.row}>
          <Chip
            label="Sum"
            active={draft.metric === 'sum'}
            onPress={() => setDraft((d) => ({ ...d, metric: 'sum' }))}
          />
          <Chip
            label="Count"
            active={draft.metric === 'count'}
            onPress={() => setDraft((d) => ({ ...d, metric: 'count' }))}
          />
        </View>

        {draft.kind === 'breakdown' && (
          <>
            <Text style={[styles.label, { color: theme.muted, marginTop: 12 }]}>
              Group by
            </Text>
            <View style={styles.row}>
              <Chip
                label="Day"
                active={draft.breakdownBy === 'day'}
                onPress={() => setDraft((d) => ({ ...d, breakdownBy: 'day' }))}
              />
              <Chip
                label="Category"
                active={draft.breakdownBy === 'category'}
                onPress={() => setDraft((d) => ({ ...d, breakdownBy: 'category' }))}
              />
              <Chip
                label="Item"
                active={draft.breakdownBy === 'item'}
                onPress={() => setDraft((d) => ({ ...d, breakdownBy: 'item' }))}
              />
            </View>
          </>
        )}
      </Card>

      <Card>
        <Text style={[styles.h2, { color: theme.text }]}>Filters</Text>

        <View style={{ gap: 10 }}>
          <SelectSheet
            title={t('category')}
            visible={categorySheetVisible}
            onClose={() => setCategorySheetVisible(false)}
            placeholder={t('select')}
            value={draft.categoryName ?? ''}
            items={categoryOptions}
            onSelect={(v) => setDraft((d) => ({ ...d, categoryName: v || undefined }))}
          />

          <SelectSheet
            title={t('item')}
            visible={itemSheetVisible}
            onClose={() => setItemSheetVisible(false)}
            placeholder={t('select')}
            value={draft.itemName ?? ''}
            items={itemOptions}
            onSelect={(v) => setDraft((d) => ({ ...d, itemName: v || undefined }))}
          />
        </View>
      </Card>

      <Pressable
        onPress={onRun}
        style={[styles.primaryBtn, run.isPending && { opacity: 0.6 }]}
        disabled={run.isPending}
      >
        <Text style={styles.primaryBtnText}>{run.isPending ? t('loading') : 'Run'}</Text>
      </Pressable>

      <Card>
        <Text style={[styles.h2]}>Result</Text>
        <Text selectable style={{ color: '#666' }}>
          {run.data ? JSON.stringify(run.data.result, null, 2) : '—'}
        </Text>
      </Card>
    </View>
  );
}

function ChatPanel({
  chatAutoRun,
  onEditInManual,
}: {
  chatAutoRun: 'off' | 'on';
  onEditInManual: (plan: any) => void;
}) {
  const { resolvedScheme } = useAppSettings();
  const theme = themeFor(resolvedScheme);

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
    useChatStore
      .getState()
      .addMessage({
        id: assistantId,
        role: 'assistant',
        text: '…',
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
          text: `Plan:\n${JSON.stringify(planned.plan, null, 2)}\n\n(Enable Auto Run in Settings or run manually)`,
          status: 'sent',
        });
      }
    } catch (e: any) {
      useChatStore.getState().updateMessage(assistantId, {
        text: e?.message ?? 'Request failed',
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
              <Text style={{ color: theme.text }}>{item.text}</Text>
            </View>
          )}
        />
      </Card>

      <View style={styles.chatInputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something…"
          placeholderTextColor={theme.muted}
          style={[styles.chatInput, { color: theme.text, borderColor: theme.hairline }]}
        />
        <Pressable onPress={onSend} style={styles.sendBtn}>
          <Text style={styles.sendBtnText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, paddingTop: 60, gap: 12 },
  title: { fontSize: 28, fontWeight: '700' },

  segment: { flexDirection: 'row', gap: 10 },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(127,127,127,0.15)',
    alignItems: 'center',
  },
  segBtnActive: { backgroundColor: '#fa5311' },
  segText: { fontWeight: '800' },
  segTextActive: { color: 'white' },

  h2: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  label: { fontSize: 12, marginBottom: 8 },

  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(127,127,127,0.15)',
  },
  chipActive: { backgroundColor: '#fa5311' },
  chipText: { fontWeight: '800' },
  chipTextActive: { color: 'white' },

  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#fa5311',
    alignItems: 'center',
  },
  primaryBtnText: { color: 'white', fontWeight: '900' },

  bubble: { padding: 10, borderRadius: 14, maxWidth: '85%' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: 'rgba(250,83,17,0.25)' },
  bubbleAssistant: { alignSelf: 'flex-start', backgroundColor: 'rgba(127,127,127,0.15)' },

  chatInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sendBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#fa5311',
  },
  sendBtnText: { color: 'white', fontWeight: '900' },
});
