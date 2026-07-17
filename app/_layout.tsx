import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack, router, usePathname, useRootNavigationState, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";
import "@/i18n";

function RootNavigator() {
  const { theme, mode } = useTheme();
  const { status, error, retry } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const pendingPath = useRef<string | null>(null);
  const previousStatus = useRef(status);
  const inAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (!rootNavigationState?.key || status === "loading" || status === "error") return;

    const priorStatus = previousStatus.current;
    previousStatus.current = status;

    if (status === "anonymous" && !inAuthGroup) {
      if (priorStatus === "authenticated") {
        pendingPath.current = null;
      } else if (pathname && pathname !== "/") {
        pendingPath.current = pathname;
      }
      router.replace("/(auth)/login");
      return;
    }

    if (status === "authenticated" && inAuthGroup) {
      const destination = pendingPath.current;
      pendingPath.current = null;
      router.replace((destination || "/(tabs)") as never);
    }
  }, [inAuthGroup, pathname, rootNavigationState?.key, status]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      {status === "loading" ? (
        <View style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.message, { color: theme.colors.textMuted }]}>Validando sesión…</Text>
        </View>
      ) : null}
      {status === "error" ? (
        <View style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>No pudimos conectar</Text>
          <Text style={[styles.message, { color: theme.colors.textMuted }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => void retry()}
          >
            <Text style={{ color: theme.colors.primaryForeground, fontWeight: "700" }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  message: { marginTop: 12, textAlign: "center", lineHeight: 20 },
  retryButton: { marginTop: 20, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
});
