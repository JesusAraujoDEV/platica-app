import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";

export function LoginScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    router.replace("/(tabs)");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.hero}>
        <Text style={[styles.brand, { color: theme.colors.primary }]}>Platica</Text>
        <Text style={[styles.welcome, { color: theme.colors.text }]}>
          {t("auth.welcome")}
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.textMuted }]}>
          {t("auth.tagline")}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder }]}
          onPress={handleGoogleLogin}
        >
          <Ionicons name="logo-google" size={20} color={theme.colors.text} />
          <Text style={[styles.googleText, { color: theme.colors.text }]}>
            {t("auth.loginWith", { provider: "Google" })}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  brand: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  welcome: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
  },
  actions: {
    paddingBottom: 24,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  googleText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
