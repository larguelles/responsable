import { ManualPanel } from '@/components/analysis/ManualPanel';
import { ChatPanel } from '@/components/analysis/ChatPanel';
import { makeStyles } from '@/components/analysis/analysisStyles';
import { themeFor } from '@/components/ui/theme';
import { useTranslation } from '@/i18n/i18n';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

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

export default function Analysis() {
  const t = useTranslation();
  const { resolvedScheme, chatAutoRun, analysisDefaultMode, themeVariant } = useAppSettings();

  const theme = useMemo(() => themeFor(resolvedScheme, themeVariant), [resolvedScheme, themeVariant]);
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
