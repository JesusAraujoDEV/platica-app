import { useCallback } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RemoteState } from "@/components/RemoteState";
import { useRemoteData } from "@/hooks/useRemoteData";
import { fetchAccounts } from "@/services/finance";
import { useTheme } from "@/theme/ThemeContext";

export function AccountsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const loader = useCallback(fetchAccounts, []);
  const { data, loading, error, reload } = useRemoteData(loader);

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      data={data ?? []}
      keyExtractor={(account) => account.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void reload()} tintColor={theme.colors.primary} />}
      ListHeaderComponent={<Text style={[styles.title, { color: theme.colors.text }]}>{t("accounts.title")}</Text>}
      ListEmptyComponent={loading || error
        ? <RemoteState loading={loading} error={error} onRetry={() => void reload()} />
        : <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{t("accounts.empty")}</Text>}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
            <Text style={{ color: theme.colors.textMuted }}>{item.type} · {item.currency}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.balance, { color: theme.colors.text }]}>{item.balance.toFixed(2)}</Text>
            <Text style={{ color: theme.colors.textMuted }}>{item.currency}</Text>
          </View>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  card: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 16 },
  name: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  balance: { fontSize: 18, fontWeight: "700" },
  empty: { textAlign: "center", paddingVertical: 48, fontSize: 16 },
});
