import { useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FormSheet } from "@/components/ui/FormSheet";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import {
  createCategoryGroup,
  updateCategoryGroup,
  deleteCategoryGroup,
  type CategoryGroup,
  type CategoryGroupType,
  type AnalyticsBehavior,
} from "@/services/categoryGroups";

interface CategoryGroupFormProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: CategoryGroup | null;
}

export function CategoryGroupForm({ visible, onClose, onSaved, editing }: CategoryGroupFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(editing?.name ?? "");
  const [type, setType] = useState<CategoryGroupType>(editing?.type ?? "neutral");
  const [behavior, setBehavior] = useState<AnalyticsBehavior>(editing?.analyticsBehavior ?? "include");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) {
      setNameError(t("categoryGroups.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), type, analyticsBehavior: behavior };
      if (editing) await updateCategoryGroup(editing.id, payload);
      else await createCategoryGroup(payload);
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
    Alert.alert(t("categoryGroups.deleteTitle"), t("categoryGroups.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategoryGroup(editing.id);
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
    <FormSheet visible={visible} onClose={onClose} title={editing ? t("categoryGroups.editTitle") : t("categoryGroups.newTitle")}>
      <TextField
        label={t("categoryGroups.name")}
        value={name}
        onChangeText={(v) => {
          setName(v);
          if (nameError) setNameError(null);
        }}
        error={nameError}
        placeholder={t("categoryGroups.namePlaceholder")}
      />
      <Select
        label={t("categoryGroups.type")}
        value={type}
        onChange={setType}
        options={[
          { label: t("categoryGroups.typeIncome"), value: "ingreso" },
          { label: t("categoryGroups.typeExpense"), value: "gasto" },
          { label: t("categoryGroups.typeNeutral"), value: "neutral" },
        ]}
      />
      <View style={styles.field}>
        <SegmentedToggle
          options={[
            { label: t("categoryGroups.include"), value: "include" },
            { label: t("categoryGroups.exclude"), value: "exclude" },
          ]}
          value={behavior}
          onChange={setBehavior}
        />
      </View>

      <View style={styles.actions}>
        <Button title={t("common.save")} onPress={submit} loading={saving} />
        {editing ? <Button title={t("common.delete")} variant="destructive" onPress={confirmDelete} /> : null}
      </View>
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  actions: { gap: 10, marginTop: 4 },
});
