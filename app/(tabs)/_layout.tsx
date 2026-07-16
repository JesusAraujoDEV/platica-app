import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const tabIcon = (name: IoniconsName, focused: boolean) => (
    <Ionicons
      name={name}
      size={24}
      color={focused ? theme.colors.tabBarActive : theme.colors.tabBarInactive}
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.dashboard"),
          tabBarIcon: ({ focused }) => tabIcon("home-outline", focused),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t("nav.transactions"),
          tabBarIcon: ({ focused }) => tabIcon("swap-horizontal-outline", focused),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: t("nav.accounts"),
          tabBarIcon: ({ focused }) => tabIcon("wallet-outline", focused),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav.profile"),
          tabBarIcon: ({ focused }) => tabIcon("person-outline", focused),
        }}
      />
    </Tabs>
  );
}
