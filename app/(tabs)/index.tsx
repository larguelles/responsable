import { Card } from '@/components/ui/Card';
import { SelectSheet } from '@/components/ui/SelectSheet';
import { theme } from '@/components/ui/theme';
import { useCategories, useCreateExpense, useItems } from '@/hooks/use-expenses';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const HomeScreen = () => {
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
      <Text style={styles.title}>New expense</Text>

      <Card>
        <Text style={styles.label}>Amount</Text>
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
            <Text style={styles.label}>Category</Text>
            <Pressable style={styles.pick} onPress={() => setCategoryOpen(true)}>
              <Text style={styles.pickText}>{categoryName || 'Select…'}</Text>
            </Pressable>
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>Item</Text>
            <Pressable style={styles.pick} onPress={() => setItemOpen(true)}>
              <Text style={styles.pickText}>{itemName || 'Select…'}</Text>
            </Pressable>
          </View>
        </View>

        <SelectSheet
          title="Category"
          visible={categoryOpen}
          items={(categories ?? []).map((c) => ({ id: c.id, name: c.name }))}
          value={categoryName}
          onClose={() => setCategoryOpen(false)}
          onSelect={setCategoryName}
        />

        <SelectSheet
          title="Item"
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
            {createExpense.isPending ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </Card>

      <Text style={styles.meta}>
        Categories: {categories?.map((c) => c.name).join(', ') || '-'}
      </Text>
      <Text style={styles.meta}>
        Items: {items?.map((i) => i.name).join(', ') || '—'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default HomeScreen;
