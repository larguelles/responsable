import { Card } from "@/components/ui/Card";
import { themeFor } from "@/components/ui/theme";
import { useTranslation } from "@/i18n/i18n";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type MetricResult = {
  kind: "metric";
  op: "sum" | "avg" | "count" | "min" | "max";
  field?: "amountCents";
  value: number;
};

type BreakdownRow = { key: string; value: number };
type BreakdownResult = {
  kind: "breakdown";
  op: "sum" | "count";
  groupBy: "day" | "week" | "month" | "category" | "item";
  rows: BreakdownRow[];
  total?: number;
  limit?: number;
};

type ListItem = {
  id: string;
  amountCents: number;
  occurredAt: string;
  categoryName?: string;
  itemName?: string;
};
type ListResult = {
  kind: "list";
  items: ListItem[];
  nextCursor?: string;
};

type CompareResult = {
  kind: "compare";
  op: "sum" | "avg" | "count" | "min" | "max";
  aValue: number;
  bValue: number;
};

type ForecastResult = {
  kind: "forecast";
  horizonDays: number;
  value: number;
};

export type AnalysisResult =
  | MetricResult
  | BreakdownResult
  | ListResult
  | CompareResult
  | ForecastResult;

const formatMoney = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatMaybeMoneyOrCount = (op: string, value: number) => {
  if (op === "count") return value.toLocaleString();
  return formatMoney(value);
};

const pct = (a: number, b: number) => {
  if (b === 0) return null;
  return ((a - b) / b) * 100;
};

export const ChatResultCard = ({
  result,
  title,
  subtitle,
}: {
  result: AnalysisResult;
  title?: string;
  subtitle?: string;
}) => {
  const t = useTranslation();
  const { resolvedScheme, themeVariant } = useAppSettings();
  const theme = useMemo(() => themeFor(resolvedScheme, themeVariant), [resolvedScheme, themeVariant]);

  const styles = makeStyles(theme);

  const headerTitle = title ?? t("analysisResult");
  const headerSubtitle = subtitle ?? "";

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{headerTitle}</Text>
        {headerSubtitle ? <Text style={styles.subtitle}>{headerSubtitle}</Text> : null}
      </View>

      {result.kind === "metric" ? (
        <View style={styles.metricWrap}>
          <Text style={styles.bigValue}>{formatMaybeMoneyOrCount(result.op, result.value)}</Text>
          <Text style={styles.muted}>
            {t("metricOp")} {result.op}
          </Text>
        </View>
      ) : null}

      {result.kind === "breakdown" ? (
        <View style={styles.section}>
          <Text style={styles.muted}>
            {t("groupBy")}: {result.groupBy}
          </Text>

          <View style={{ marginTop: 10, gap: 10 }}>
            {(result.rows ?? []).slice(0, 6).map((r) => (
              <View key={r.key} style={styles.row}>
                <Text style={styles.rowKey} numberOfLines={1}>
                  {r.key}
                </Text>
                <Text style={styles.rowVal}>{formatMaybeMoneyOrCount(result.op, r.value)}</Text>
              </View>
            ))}
          </View>

          {typeof result.total === "number" ? (
            <View style={[styles.row, { marginTop: 12 }]}>
              <Text style={[styles.rowKey, styles.totalKey]}>{t("total")}</Text>
              <Text style={[styles.rowVal, styles.totalVal]}>
                {formatMaybeMoneyOrCount(result.op, result.total)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {result.kind === "list" ? (
        <View style={styles.section}>
          <Text style={styles.muted}>
            {t("transactionsShown")}: {(result.items ?? []).length.toLocaleString()}
          </Text>

          <View style={{ marginTop: 10, gap: 10 }}>
            {(result.items ?? []).slice(0, 5).map((it) => (
              <View key={it.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowKey} numberOfLines={1}>
                    {it.itemName ?? it.categoryName ?? t("transaction")}
                  </Text>
                  <Text style={styles.mutedSmall} numberOfLines={1}>
                    {new Date(it.occurredAt).toLocaleDateString()}
                    {it.categoryName ? ` · ${it.categoryName}` : ""}
                  </Text>
                </View>
                <Text style={styles.rowVal}>{formatMoney(it.amountCents)}</Text>
              </View>
            ))}
          </View>

          {result.nextCursor ? <Text style={[styles.mutedSmall, { marginTop: 10 }]}>{t("moreAvailable")}</Text> : null}
        </View>
      ) : null}

      {result.kind === "compare" ? (
        <View style={styles.section}>
          <View style={{ gap: 10 }}>
            <View style={styles.row}>
              <Text style={styles.rowKey}>{t("periodA")}</Text>
              <Text style={styles.rowVal}>{formatMaybeMoneyOrCount(result.op, result.aValue)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowKey}>{t("periodB")}</Text>
              <Text style={styles.rowVal}>{formatMaybeMoneyOrCount(result.op, result.bValue)}</Text>
            </View>

            {result.op === "count" ? null : (
              <View style={[styles.row, { marginTop: 6 }]}>
                <Text style={[styles.rowKey, styles.totalKey]}>{t("delta")}</Text>
                <Text style={[styles.rowVal, styles.totalVal]}>
                  {formatMoney(result.aValue - result.bValue)}
                  {pct(result.aValue, result.bValue) === null
                    ? ""
                    : ` (${pct(result.aValue, result.bValue)!.toFixed(1)}%)`}
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : null}

      {result.kind === "forecast" ? (
        <View style={styles.metricWrap}>
          <Text style={styles.bigValue}>{formatMoney(result.value)}</Text>
          <Text style={styles.muted}>
            {t("forecastHorizon")}: {result.horizonDays}d
          </Text>
        </View>
      ) : null}
    </Card>
  );
};

const makeStyles = (theme: ReturnType<typeof themeFor>) =>
  StyleSheet.create({
    card: { gap: 10 },
    header: { gap: 2 },
    title: { color: theme.text, fontSize: 14, fontWeight: "800" },
    subtitle: { color: theme.muted, fontSize: 12, fontWeight: "600" },

    metricWrap: { gap: 4, paddingTop: 6 },
    bigValue: { color: theme.text, fontSize: 28, fontWeight: "900" },
    muted: { color: theme.muted, fontSize: 12, fontWeight: "700" },
    mutedSmall: { color: theme.muted, fontSize: 11, fontWeight: "600" },

    section: { paddingTop: 6 },

    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    rowKey: { color: theme.text, fontSize: 14, fontWeight: "700", flex: 1 },
    rowVal: { color: theme.text, fontSize: 14, fontWeight: "900" },

    totalKey: { color: theme.muted },
    totalVal: { color: theme.text },
  });
