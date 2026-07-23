import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FormSheet } from "@/components/ui/FormSheet";
import { TextField } from "@/components/ui/TextField";
import { changePassword } from "@/services/profile";

/** Change-password form (current + new + confirm) → POST auth/change-password. */
export function ChangePasswordSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!current || !next) return setError(t("profile.passwordRequired"));
    if (next !== confirm) return setError(t("profile.passwordMismatch"));
    setSaving(true);
    setError(null);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      close();
      Alert.alert(t("profile.passwordChanged"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSheet visible={visible} onClose={close} title={t("profile.changePassword")}>
      <TextField
        label={t("profile.currentPassword")}
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
        autoCapitalize="none"
      />
      <TextField
        label={t("profile.newPassword")}
        value={next}
        onChangeText={setNext}
        secureTextEntry
        autoCapitalize="none"
      />
      <TextField
        label={t("profile.confirmPassword")}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
        error={error}
      />
      <Button title={t("common.save")} onPress={() => void submit()} loading={saving} />
    </FormSheet>
  );
}
