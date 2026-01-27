import { Card } from "@/components/ui/Card";
import { themeFor } from "@/components/ui/theme";
import { useTranslation } from "@/i18n/i18n";
import { useAppSettings, type ThemeMode } from "@/providers/AppSettingsProvider";
import { Pressable, StyleSheet, Text, View } from "react-native";

const Btn = ({
  label,
  active,
  onPress,
  resolvedScheme
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  resolvedScheme: string;
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, active && styles.btnActive, pressed && { opacity: 0.7 }]}>
    <Text style={[styles.btnText, {color: resolvedScheme === 'dark' ? 'white' : 'black' }]}>{label}</Text> 
  </Pressable>
);

const SettingsScreen = () => {
  const { lang, setLangPref, themeMode, setThemeMode, resolvedScheme } = useAppSettings();
  const theme = themeFor(resolvedScheme);
  const t = useTranslation();

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t("settings")}</Text>

      <Card>
        <Text style={[styles.label, { color: theme.muted }]}>{t("language")}</Text>
        <View style={styles.row}>
          <Btn label="English" active={lang === "en"} onPress={() => setLangPref("en")} resolvedScheme={resolvedScheme}/>
          <Btn label="Español" active={lang === "es"} onPress={() => setLangPref("es")} resolvedScheme={resolvedScheme}/>
        </View>

        <Text style={[styles.label, { color: theme.muted, marginTop: 16 }]}>{t("theme")}</Text>
        <View style={styles.row}>
          {(["system", "light", "dark"] as ThemeMode[]).map((m) => (
            <Btn key={m} label={t(m)} active={themeMode === m} onPress={() => setThemeMode(m)} resolvedScheme={resolvedScheme} />
          ))}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, paddingTop: 60, gap: 14 },
  title: { fontSize: 28, fontWeight: "700" },
  label: { fontSize: 12, marginBottom: 8 },
  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "rgba(127,127,127,0.15)" },
  btnActive: { backgroundColor: "#fa5311" },
  btnText: { fontSize: 14, fontWeight: "700"},
});

export default SettingsScreen;
