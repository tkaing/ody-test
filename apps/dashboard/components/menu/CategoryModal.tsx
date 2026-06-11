import { StyleSheet, View } from "react-native";
import { useState, useEffect } from "react";
import type { MenuCategory } from "@ody/api-client";
import { Button, Input, Modal } from "@/components/ui";
import { spacing } from "@/constants/tokens";

type Props = {
  visible: boolean;
  onClose: () => void;
  category?: MenuCategory;
  onSubmit: (name: string) => void;
  loading?: boolean;
};

export function CategoryModal({ visible, onClose, category, onSubmit, loading }: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (visible) setName(category?.name ?? "");
  }, [visible, category]);

  const isEdit = !!category;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}
      size="sm"
      footer={
        <View style={styles.footer}>
          <Button variant="ghost" size="md" onPress={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="md"
            onPress={() => { if (name.trim()) onSubmit(name.trim()); }}
            loading={loading}
            disabled={!name.trim()}
          >
            {isEdit ? "Enregistrer" : "Créer"}
          </Button>
        </View>
      }
    >
      <Input
        label="Nom de la catégorie"
        value={name}
        onChangeText={setName}
        placeholder="ex : Entrées, Plats, Desserts…"
        autoFocus
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing[3],
  },
});
