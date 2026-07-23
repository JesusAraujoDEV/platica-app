import { useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FormSheet } from "@/components/ui/FormSheet";
import { TextField } from "@/components/ui/TextField";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import {
  createCategory,
  updateCategory,
  removeCategory,
  type Category,
  type CategoryType,
} from "@/services/categories";

interface CategoryFormProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Category | null;
}

export function CategoryForm({ visible, onClose, onSaved, editing }: CategoryFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(editing?.name ?? "");
  const [type, setType] = useState<CategoryType>(editing?.type ?? "expense");
  const [icon, setIcon] = useState(editing?.icon ?? "");
  const [color, setColor] = useState(editing?.color ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) {
      setNameError(t("categories.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        type: (type === "income" ? "ingreso" : "gasto") as "ingreso" | "gasto",
        icon: icon.trim() || null,
        color: color.trim() || "#64748b",
        colorName: color.trim() || "",
        groupId: editing?.groupId ?? undefined,
      };
      if (editing) await updateCategory(editing.id, payload);
      else await createCategory(payload);
      onSaved();
      onClose();
    } catch (e) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!editing) return;
    Alert.alert(t("categories.deleteTitle"), t("categories.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await removeCategory(editing.id);
            onSaved();
            onClose();
          } catch (e) {
            Alert.alert(t("common.error"), e instanceof Error ? e.message : String(e));
          }
        },
      },
    ]);
  }

  return (
    <FormSheet visible={visible} onClose={onClose} title={editing ? t("categories.editTitle") : t("categories.newTitle")}>
      <TextField
        label={t("categories.name")}
        value={name}
        onChangeText={(v) => {
          setName(v);
          if (nameError) setNameError(null);
        }}
        error={nameError}
        placeholder={t("categories.namePlaceholder")}
      />
      <SegmentedToggle
        options={[
          { label: t("categories.income"), value: "income" },
          { label: t("categories.expense"), value: "expense" },
        ]}
        value={type}
        onChange={setType}
      />
      <TextField label={t("categories.icon")} value={icon} onChangeText={setIcon} placeholder={t("categories.iconPlaceholder")} autoCapitalize="none" />
      <TextField label={t("categories.color")} value={color} onChangeText={setColor} placeholder="#64748b" autoCapitalize="none" />

      <View style={styles.actions}>
        <Button title={t("common.save")} onPress={submit} loading={saving} />
        {editing ? <Button title={t("common.delete")} variant="destructive" onPress={confirmDelete} /> : null}
      </View>
    </FormSheet>
  );
}

const styles = StyleSheet.create({ actions: { gap: 10, marginTop: 4 } });
