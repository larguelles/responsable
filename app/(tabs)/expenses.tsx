import { Card } from "@/components/ui/Card";
import { themeFor, ThemeType } from "@/components/ui/theme";
import { useExpenses } from "@/hooks/use-expenses";
import { useTranslation } from "@/i18n/i18n";
import { dayKeyFromIso, makeDayTitleFormatter } from "@/lib/dates";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

type Row =
  | { type: "header"; key: string; title: string; totalCents: number }
  | {
      type: "item";
      key: string;
      id: string;
      amountCents: number;
      occurredAt: string;
      categoryName: string;
      itemName: string;
    };

const localeForLang = (lang: "en" | "es") =>
  lang === "es" ? "es-AR" : "en-US";

const capitalizeWords = (s: string) =>
  s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());


const formatMoney = (cents: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(cents / 100);

const makeStyles = (theme: ThemeType) => 
    StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.bg, padding: theme.pad, paddingTop: 60 },
        top: { gap: 6, marginBottom: 10 },
        title: { color: theme.text, fontSize: 28, fontWeight: "700" },
        muted: { color: theme.muted, fontSize: 12 },
    
        listContent: { paddingBottom: 24 },
    
        headerRow: {
        marginTop: 10,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        },
        headerTitle: { color: theme.text, fontSize: 13, fontWeight: "700", opacity: 0.9 },
        headerTotal: { color: theme.muted, fontSize: 13, fontWeight: "700" },
    
        card: { paddingVertical: 14, paddingHorizontal: 14, marginBottom: 10 },
        cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
        main: { color: theme.text, fontSize: 16, fontWeight: "700" },
        sub: { color: theme.muted, fontSize: 12, marginTop: 2 },
        amount: { color: theme.text, fontSize: 16, fontWeight: "800" },
    });

const ExpensesScreen = () => {
    const { resolvedScheme, lang } = useAppSettings();
    const locale = useMemo(() => localeForLang(lang), [lang]);
    const theme = useMemo(() => themeFor(resolvedScheme), [resolvedScheme]);
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const t = useTranslation();
    const q = useExpenses();
    const expenses = q.data ?? [];

    const dayTitleFormatter = useMemo(
      () =>
        new Intl.DateTimeFormat(locale, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      [locale]
    );
    
    const formatDayTitle = useMemo(() => makeDayTitleFormatter(lang), [lang]);

    const monthToDateTotal = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return expenses.filter((e) => new Date(e.occurredAt) >= start).reduce((sum, e) => sum + e.amountCents, 0);
    },[expenses]);

    const rows: Row[] = useMemo(() => {
        const byDay = new Map<string, typeof expenses>();

        for (const e of expenses) {
            const k = dayKeyFromIso(e.occurredAt);
            const arr = byDay.get(k) ?? [];
            arr.push(e);
            byDay.set(k, arr);
        }

        const dayKeys = Array.from(byDay.keys()).sort((a,b) => (a < b ? 1 : -1));

        const out: Row[] = [];
        for (const dayKey of dayKeys){
            const dayItems = byDay.get(dayKey);
            if(!dayItems) continue;

            const totalCents = dayItems.reduce((s,e) => s + e.amountCents, 0);

            out.push({
                type: "header",
                key: `h-${dayKey}`,
                title: formatDayTitle(dayKey),
                totalCents,
            });

            for (const e of dayItems) {
                out.push({
                    type: "item",
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
    }, [expenses]);

    return (
        <View style={styles.screen}>
            <View style={styles.top}>
                <Text style={styles.title}>{t("expenses")}</Text>
                <Text style={styles.muted}>{t("month_to_date")}: {formatMoney(monthToDateTotal)}</Text>
            </View>

            <FlatList
                data={rows}
                keyExtractor={(r) => r.key}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={q?.isFetching} onRefresh={q?.refetch}/>}
                renderItem={({ item }) => {
                    if (item.type === "header") {
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
                    q?.isLoading ? <Text style={styles.muted}>{t("loading")}</Text> : <Text style={styles.muted}>No expenses yet.</Text>
                  }
            />
        </View>
    );
};
  
export default ExpensesScreen;