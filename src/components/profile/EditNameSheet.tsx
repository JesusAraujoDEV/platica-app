import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FormSheet } from "@/components/ui/FormSheet";
import { TextField } from "@/components/ui/TextField";
import { updateProfileName } from "@/services/profile";

interface Props {
  visible: boolean;
  onClose: () => void;
  initialName: string;
  /** Refresh the auth user after a successful save (AuthContext.retry). */
  onSaved: () => void;
}

/** Edit display name → PATCH auth/me. */
export function EditNameSheet({ visible, onClose, initialName, onSaved }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return setError(t("profile.nameRequired"));
    setSaving(true);
    setError(null);
    try {
      await updateProfileName(name.trim());
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSheet visible={visible} onClose={onClose} title={t("profile.editName")}>
      <TextField label={t("profile.name")} value={name} onChangeText={setName} error={error} />
      <Button title={t("common.save")} onPress={() => void submit()} loading={saving} />
    </FormSheet>
  );
}
