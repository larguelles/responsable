import {
  BarChart3,
  Home,
  Settings,
  Wallet,
  type LucideProps,
} from '@/components/ui/Icon';
import { themeFor } from '@/components/ui/theme';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { Tabs } from 'expo-router';

const TAB_ICON_SIZE = 24;

const tabIcon = (Icon: React.ComponentType<LucideProps>) => {
  const TabIconComponent = ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon size={TAB_ICON_SIZE} color={color} strokeWidth={focused ? 2.5 : 2} />
  );
  TabIconComponent.displayName = `TabIcon_${Icon.displayName || Icon.name || 'Icon'}`;
  return TabIconComponent;
};

const TabsLayout = () => {
  const { resolvedScheme, themeVariant } = useAppSettings();
  const theme = themeFor(resolvedScheme, themeVariant);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.hairline,
          borderTopWidth: 1,
          paddingVertical: 12,
          minHeight: 64,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon(Home) }} />
      <Tabs.Screen name="analysis" options={{ title: 'Analysis', tabBarIcon: tabIcon(BarChart3) }} />
      <Tabs.Screen name="expenses" options={{ title: 'Expenses', tabBarIcon: tabIcon(Wallet) }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon(Settings) }} />
    </Tabs>
  );
};

export default TabsLayout;
