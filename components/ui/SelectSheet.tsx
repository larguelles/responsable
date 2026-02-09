import { useTranslation } from '@/i18n/i18n';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { themeFor, ThemeType } from './theme';

type Item = { id: string; name: string };

type Props = {
  title: string;
  visible: boolean;
  items: Item[];
  value: string;
  placeholder?: string;
  placeholderShowOrAdd?: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
};

const makeStyles = (theme: ThemeType) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.bg,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      padding: theme.pad,
      paddingBottom: 50,
      borderWidth: 1,
      borderColor: theme.hairline,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: { color: theme.text, fontSize: 16, fontWeight: '700' },
    close: { color: theme.muted, fontSize: 14 },
    searchWrap: {
      marginTop: 12,
      marginBottom: 10,
      position: 'relative',
    },
    search: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: theme.card,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.hairline,
    },
    placeholderOverlay: {
      ...StyleSheet.absoluteFillObject,
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    placeholderMuted: { color: theme.muted, fontSize: 16 },
    placeholderAccent: { color: theme.accent, fontSize: 16 },
    addRow: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.hairline,
      marginBottom: 10,
    },
    addText: { color: theme.accent, fontWeight: '700' },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
    rowText: { color: theme.text, fontSize: 16 },
    check: { color: theme.accent, fontSize: 16, fontWeight: '800' },
    sep: { height: 1, backgroundColor: theme.hairline },
  });

function ListSeparator({ style }: Readonly<{ style: StyleProp<ViewStyle> }>) {
  return <View style={style} />;
}

export const SelectSheet = ({
  title,
  visible,
  items,
  value,
  placeholder = 'Search...',
  placeholderShowOrAdd = true,
  onClose,
  onSelect,
}: Props) => {
  const { resolvedScheme, themeVariant } = useAppSettings();
  const theme = useMemo(() => themeFor(resolvedScheme, themeVariant), [resolvedScheme, themeVariant]);
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const t = useTranslation();

  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);

  const normalized = (s: string) => s.trim().toLowerCase();

  const filtered = useMemo(() => {
    const nq = normalized(q);
    if (!nq) return items;
    return items.filter((it) => normalized(it.name).includes(nq));
  }, [items, q]);

  const canAdd = useMemo(() => {
    const nq = normalized(q);
    if (!nq) return false;
    return !items.some((it) => normalized(it.name) === nq);
  }, [items, q]);

  const onPick = (name: string) => {
    onSelect(name);
    setQ('');
    onClose();
  };

  const itemSeparator = useCallback(
    () => <ListSeparator style={styles.sep} />,
    [styles.sep],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>{t('close')}</Text>
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <TextInput
              value={q}
              onChangeText={setQ}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder=""
              style={styles.search}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!q && !focused ? (
              <View style={styles.placeholderOverlay} pointerEvents="none">
                <Text style={styles.placeholderMuted}>{t('search')}</Text>
                {placeholderShowOrAdd ? (
                  <Text style={styles.placeholderAccent}> {t('orAdd')}</Text>
                ) : null}
              </View>
            ) : null}
          </View>

          {canAdd ? (
            <Pressable style={styles.addRow} onPress={() => onPick(q.trim())}>
              <Text style={styles.addText}>
                {t('add')} {'"'}
                {q.trim()}
                {'"'}
              </Text>
            </Pressable>
          ) : null}

          <FlatList
            data={filtered}
            keyExtractor={(it) => it.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => onPick(item.name)}>
                <Text style={styles.rowText}>{item.name}</Text>
                {normalized(item.name) === normalized(value) ? (
                  <Text style={styles.check}>✓</Text>
                ) : null}
              </Pressable>
            )}
            ItemSeparatorComponent={itemSeparator}
          />
        </View>
      </View>
    </Modal>
  );
};
