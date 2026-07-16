import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import i18n from "@/i18n";

export function ProfileScreen() {
  const { t } = useTranslation();
  const { theme, mode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language);

  const handleLanguageChange = () => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex((l) => l.code === i18n.language);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    i18n.changeLanguage(SUPPORTED_LANGUAGES[nextIndex].code);
  };

  const handleLogout = () => {
    Alert.alert(
      t("profile.logout"),
      t("profile.logoutConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("profile.logout"), style: "destructive", onPress: () => {} },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t("profile.title")}
      </Text>

      <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
          {t("profile.settings")}
        </Text>

        <TouchableOpacity style={styles.row} onPress={toggleTheme}>
          <Ionicons
            name={mode === "dark" ? "moon" : "sunny"}
            size={20}
            color={theme.colors.icon}
          />
          <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
            {t("profile.theme")}
          </Text>
          <Text style={[styles.rowValue, { color: theme.colors.textMuted }]}>
            {mode === "dark" ? t("common.darkMode") : t("common.lightMode")}
          </Text>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.colors.surfaceBorder }]} />

        <TouchableOpacity style={styles.row} onPress={handleLanguageChange}>
          <Ionicons name="language" size={20} color={theme.colors.icon} />
          <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
            {t("profile.language")}
          </Text>
          <Text style={[styles.rowValue, { color: theme.colors.textMuted }]}>
            {currentLang?.label}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: theme.colors.destructive }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.colors.destructive} />
        <Text style={[styles.logoutText, { color: theme.colors.destructive }]}>
          {t("profile.logout")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  rowValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
