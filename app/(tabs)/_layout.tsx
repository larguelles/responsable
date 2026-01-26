import { Tabs } from 'expo-router';

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="analysis" options={{ title: 'Analysis' }} />
    </Tabs>
  );
};

export default TabsLayout;
