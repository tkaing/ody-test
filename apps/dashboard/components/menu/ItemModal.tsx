import { StyleSheet, View } from "react-native";
import { useState, useEffect } from "react";
import type { MenuCategory, MenuItem } from "@ody/api-client";
import { Button, Input, Modal, Select, Toggle } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { spacing } from "@/constants/tokens";

type ItemFormData = {
  categoryId: number;
  name: string;
  priceEuros: string;
  available: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  item?: MenuItem;
  categories: MenuCategory[];
  onSubmit: (data: { categoryId: number; name: string; price: number; available: boolean }) => void;
  loading?: boolean;
};

export function ItemModal({ visible, onClose, item, categories, onSubmit, loading }: Props) {
  const [form, setForm] = useState<ItemFormData>({
    categoryId: categories.length > 0 ? categories[0].id : 0,
    name: "",
    priceEuros: "",
    available: true,
  });

  useEffect(() => {
    if (visible) {
      setForm({
        categoryId: item?.categoryId ?? (categories.length > 0 ? categories[0].id : 0),
        name: item?.name ?? "",
        priceEuros: item ? (item.price / 100).toFixed(2) : "",
        available: item?.available ?? true,
      });
    }
  }, [visible, item, categories]);

  const categoryOptions: SelectOption<number>[] = categories.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const isEdit = !!item;
  const canSubmit = !!form.name.trim() && !!form.priceEuros && form.categoryId > 0;

  function handleSubmit() {
    const priceNum = parseFloat(form.priceEuros.replace(",", "."));
    if (!canSubmit || isNaN(priceNum) || priceNum <= 0) return;
    onSubmit({
      categoryId: form.categoryId,
      name: form.name.trim(),
      price: Math.round(priceNum * 100),
      available: form.available,
    });
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isEdit ? "Modifier l'article" : "Nouvel article"}
      size="md"
      footer={
        <View style={styles.footer}>
          <Button variant="ghost" size="md" onPress={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="md"
            onPress={handleSubmit}
            loading={loading}
            disabled={!canSubmit}
          >
            {isEdit ? "Enregistrer" : "Créer"}
          </Button>
        </View>
      }
    >
      <View style={styles.form}>
        <Select<number>
          label="Catégorie"
          options={categoryOptions}
          value={form.categoryId}
          onChange={(v) => { setForm((f) => ({ ...f, categoryId: v })); }}
        />
        <Input
          label="Nom de l'article"
          value={form.name}
          onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); }}
          placeholder="ex : Salade César"
        />
        <Input
          label="Prix (€)"
          value={form.priceEuros}
          onChangeText={(v) => { setForm((f) => ({ ...f, priceEuros: v })); }}
          placeholder="9.90"
          keyboardType="decimal-pad"
        />
        <Toggle
          value={form.available}
          onChange={(v) => { setForm((f) => ({ ...f, available: v })); }}
          label="Disponible"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing[4],
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing[3],
  },
});
