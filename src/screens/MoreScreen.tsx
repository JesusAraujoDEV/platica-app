import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FEATURE_DEFINITIONS } from "@/services/finance";
import { useTheme } from "@/theme/ThemeContext";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export function MoreScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      data={FEATURE_DEFINITIONS}
      keyExtractor={(item) => item.slug}
      ListHeaderComponent={<Text style={[styles.title, { color: theme.colors.text }]}>{t("nav.more")}</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}
          onPress={() => router.push(`/feature/${item.slug}` as never)}
        >
          <Ionicons name={item.icon as IoniconsName} size={22} color={theme.colors.primary} />
          <Text style={[styles.label, { color: theme.colors.text }]}>{t(item.titleKey)}</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 16 },
  label: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: "600" },
});
