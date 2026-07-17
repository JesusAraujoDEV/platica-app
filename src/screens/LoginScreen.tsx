import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/services/api";
import { useTheme } from "@/theme/ThemeContext";

export function LoginScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setError(t("auth.required"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(identifier, password);
    } catch (loginError) {
      setError(
        loginError instanceof ApiError && loginError.status === 401
          ? t("auth.invalidCredentials")
          : loginError instanceof Error
            ? loginError.message
            : t("auth.loginError"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.hero}>
          <Image source={require("../../assets/icon.png")} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.welcome, { color: theme.colors.text }]}>{t("auth.welcome")}</Text>
          <Text style={[styles.tagline, { color: theme.colors.textMuted }]}>{t("auth.tagline")}</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t("auth.identifier")}</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
            placeholder={t("auth.identifierPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
            ]}
            value={identifier}
            onChangeText={setIdentifier}
          />
          <Text style={[styles.label, { color: theme.colors.text }]}>{t("auth.password")}</Text>
          <TextInput
            editable={!submitting}
            placeholder={t("auth.passwordPlaceholder")}
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            style={[
              styles.input,
              { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
            ]}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => void handleLogin()}
          />
          {error ? <Text style={[styles.error, { color: theme.colors.destructive }]}>{error}</Text> : null}
          <TouchableOpacity
            disabled={submitting}
            style={[styles.loginButton, { backgroundColor: theme.colors.primary, opacity: submitting ? 0.7 : 1 }]}
            onPress={() => void handleLogin()}
          >
            {submitting ? (
              <ActivityIndicator color={theme.colors.primaryForeground} />
            ) : (
              <Text style={[styles.loginText, { color: theme.colors.primaryForeground }]}>{t("auth.login")}</Text>
            )}
          </TouchableOpacity>
          <Text style={[styles.note, { color: theme.colors.textMuted }]}>{t("auth.googlePending")}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 },
  hero: { alignItems: "center", marginBottom: 32 },
  logo: { width: 132, height: 132, borderRadius: 28, marginBottom: 20 },
  welcome: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  tagline: { fontSize: 16, textAlign: "center" },
  form: { width: "100%" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
  error: { marginBottom: 12, lineHeight: 20 },
  loginButton: { minHeight: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  loginText: { fontSize: 16, fontWeight: "700" },
  note: { fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 18 },
});
