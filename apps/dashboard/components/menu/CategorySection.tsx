import { StyleSheet, Text, View } from "react-native";
import type { MenuCategory, MenuItem } from "@ody/api-client";
import { Button, Card } from "@/components/ui";
import { MenuItemRow } from "./MenuItemRow";
import { colors, spacing, fontSize, fontWeight } from "@/constants/tokens";

type Props = {
  category: MenuCategory;
  items: MenuItem[];
  onEditCategory: (category: MenuCategory) => void;
  onDeleteCategory: (id: number) => void;
  onAddItem: (categoryId: number) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: number) => void;
  onToggleItem: (item: MenuItem) => void;
};

export function CategorySection({
  category,
  items,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItem,
}: Props) {
  return (
    <Card variant="default" padding="none" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.itemCount}>{items.length} article(s)</Text>
        <View style={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => { onEditCategory(category); }}
            leftIcon="pencil-outline"
          />
          <Button
            variant="ghost"
            size="sm"
            onPress={() => { onDeleteCategory(category.id); }}
            leftIcon="trash-outline"
          />
        </View>
      </View>

      {items.length === 0 ? (
        <Text style={styles.empty}>Aucun article dans cette catégorie.</Text>
      ) : (
        <View>
          {items.map((item) => (
            <MenuItemRow
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              onToggleAvailable={onToggleItem}
            />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Button
          variant="secondary"
          size="sm"
          onPress={() => { onAddItem(category.id); }}
          leftIcon="add-outline"
        >
          Ajouter un article
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
    backgroundColor: colors.ui.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    gap: spacing[2],
  },
  categoryName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textPrimary,
  },
  itemCount: {
    fontSize: fontSize.xs,
    color: colors.ui.textSecondary,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing[1],
  },
  empty: {
    padding: spacing[4],
    fontSize: fontSize.sm,
    color: colors.ui.textSecondary,
    fontStyle: "italic",
  },
  footer: {
    padding: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
  },
});
