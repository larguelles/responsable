import { Card } from '@/components/ui/Card';
import { SelectSheet } from '@/components/ui/SelectSheet';
import { themeFor, ThemeType } from '@/components/ui/theme';
import { useCategories, useCreateExpense, useItems } from '@/hooks/use-expenses';
import { useTranslation } from '@/i18n/i18n';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const makeStyles = (theme: ThemeType) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: theme.bg,
      padding: theme.pad,
      paddingTop: 64,
      gap: 14,
    },
    title: { color: theme.text, fontSize: 28, fontWeight: '700' },
    label: { color: theme.muted, fontSize: 12, marginBottom: 8 },
    amount: {
      color: theme.text,
      fontSize: 44,
      fontWeight: '700',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.hairline,
      marginBottom: 14,
    },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
    input: {
      color: theme.text,
      fontSize: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.hairline,
    },
    cta: {
      marginTop: 18,
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
    },
    ctaText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
    meta: { color: theme.muted, fontSize: 12, marginTop: 10 },
    pick: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.hairline,
    },
    pickText: { color: theme.text, fontSize: 16 },
  });

const HomeScreen = () => {
  const { resolvedScheme } = useAppSettings();
  const theme = useMemo(() => themeFor(resolvedScheme), [resolvedScheme]);
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const t = useTranslation();

  const { data: categories } = useCategories();
  const { data: items } = useItems();
  const createExpense = useCreateExpense();

  const [amountText, setAmountText] = useState('');
  const [categoryName, setCategoryName] = useState('Groceries');
  const [itemName, setItemName] = useState('Carrefour');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);

  const amountCents = useMemo(() => {
    const n = Number(amountText.replace(',', '.'));
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100);
  }, [amountText]);

  const onSubmit = async () => {
    if (!amountCents || amountCents <= 0) {
      Alert.alert('Invalid amountCents', 'Use a positive integer (cents).');
      return;
    }

    try {
      await createExpense.mutateAsync({
        amountCents: amountCents,
        categoryName: categoryName.trim(),
        itemName: itemName.trim(),
      });
      Alert.alert('Saved', 'Expense created.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create expense.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{t('home_title')}</Text>

      <Card>
        <Text style={styles.label}>{t('amount')}</Text>
        <TextInput
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="decimal-pad"
          style={styles.amount}
          placeholder="0.00"
          placeholderTextColor={theme.muted}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>{t('category')}</Text>
            <Pressable style={styles.pick} onPress={() => setCategoryOpen(true)}>
              <Text style={styles.pickText}>{categoryName || t('select')}</Text>
            </Pressable>
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>Item</Text>
            <Pressable style={styles.pick} onPress={() => setItemOpen(true)}>
              <Text style={styles.pickText}>{itemName || t('select')}</Text>
            </Pressable>
          </View>
        </View>

        <SelectSheet
          title={t('category')}
          visible={categoryOpen}
          items={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
          value={categoryName}
          onClose={() => setCategoryOpen(false)}
          onSelect={setCategoryName}
        />

        <SelectSheet
          title={t('item')}
          visible={itemOpen}
          items={(items ?? []).map((i) => ({ id: i.id, name: i.name }))}
          value={itemName}
          onClose={() => setItemOpen(false)}
          onSelect={setItemName}
        />
        <Pressable
          onPress={onSubmit}
          disabled={createExpense.isPending}
          style={({ pressed }) => [
            styles.cta,
            (pressed || createExpense.isPending) && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.ctaText}>
            {createExpense.isPending ? t('saving') : t('save')}
          </Text>
        </Pressable>
      </Card>

      <Text style={styles.meta}>
        {t('categories')}: {categories?.map((c) => c.name).join(', ') || '-'}
      </Text>
      <Text style={styles.meta}>
        {t('items')}: {items?.map((i) => i.name).join(', ') || '—'}
      </Text>
    </View>
  );
};

export default HomeScreen;
