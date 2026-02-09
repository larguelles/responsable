import { Card } from '@/components/ui/Card';
import { ChatResultCard } from '@/components/ui/ChatResultCard';
import type { ThemeType } from '@/components/ui/theme';
import { ThinkingDots } from '@/components/ui/thinkingDots';
import { usePlanFromText, useRunPlan } from '@/hooks/use-analysis';
import { useTranslation } from '@/i18n/i18n';
import { useChatStore } from '@/store/chatStore';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import type { AnalysisStyles } from './analysisStyles';

export type ChatPanelProps = {
  styles: AnalysisStyles;
  theme: ThemeType;
  chatAutoRun: 'off' | 'on';
  onEditInManual: (plan: any) => void;
};

export function ChatPanel({
  styles,
  theme,
  chatAutoRun,
}: ChatPanelProps) {
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
      text: '…',
      createdAt: Date.now(),
      status: 'sending',
    });

    try {
      const planned = await planMut.mutateAsync({ question, timezone });

      if (chatAutoRun === 'on') {
        const run = await runMut.mutateAsync({ plan: planned.plan, timezone });
        useChatStore.getState().updateMessage(assistantId, {
          result: run.result,
          text: undefined,
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
        {messages.length === 0 ? (
          <View style={{ paddingBottom: 10 }}>
            <View style={[styles.bubble, styles.bubbleAssistant]}>
              <Text style={{ color: theme.text }}>{t('chatHint')}</Text>
            </View>
          </View>
        ) : null}
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 10 }}
          renderItem={({ item }) => {
            const isUser = item.role === 'user';

            if (!isUser && item.result) {
              return (
                <View style={{ alignSelf: 'stretch' }}>
                  <ChatResultCard result={item.result as any} />
                </View>
              );
            }

            return (
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
            );
          }}
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
