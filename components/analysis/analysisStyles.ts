import type { ThemeType } from '@/components/ui/theme';
import { StyleSheet } from 'react-native';

export const makeStyles = (theme: ThemeType) =>
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
    segTextActive: { color: theme.onAccent },

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
    chipActive: { backgroundColor: theme.card, borderColor: theme.accent },
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
    primaryBtnText: { color: theme.onAccent, fontWeight: '900' },

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
    sendBtnText: { color: theme.onAccent, fontWeight: '900' },
  });

export type AnalysisStyles = ReturnType<typeof makeStyles>;
