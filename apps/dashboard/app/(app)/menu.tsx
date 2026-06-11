import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMenuCategories,
  useGetMenuItems,
  usePostMenuCategories,
  usePatchMenuCategoriesId,
  useDeleteMenuCategoriesId,
  usePostMenuItems,
  usePatchMenuItemsId,
  useDeleteMenuItemsId,
  getGetMenuCategoriesQueryKey,
  getGetMenuItemsQueryKey,
  type MenuCategory,
  type MenuItem,
} from "@ody/api-client";
import { CategorySection } from "@/components/menu/CategorySection";
import { CategoryModal } from "@/components/menu/CategoryModal";
import { ItemModal } from "@/components/menu/ItemModal";
import { Button, useToast } from "@/components/ui";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { colors, spacing, fontSize, fontWeight } from "@/constants/tokens";

type CategoryModalState =
  | { open: false }
  | { open: true; category?: MenuCategory };

type ItemModalState =
  | { open: false }
  | { open: true; item?: MenuItem; defaultCategoryId?: number };

export default function MenuScreen() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  const [categoryModal, setCategoryModal] = useState<CategoryModalState>({ open: false });
  const [itemModal, setItemModal] = useState<ItemModalState>({ open: false });

  const { data: categories = [], isLoading: catLoading, isError: catError, refetch: catRefetch } =
    useGetMenuCategories();
  const { data: items = [], isLoading: itemLoading, isError: itemError, refetch: itemRefetch } =
    useGetMenuItems();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: getGetMenuCategoriesQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetMenuItemsQueryKey() });
  };

  const postCategory = usePostMenuCategories({
    mutation: {
      onSuccess: () => { show("Catégorie créée.", "success"); invalidate(); setCategoryModal({ open: false }); },
      onError: () => { show("Échec de la création.", "error"); },
    },
  });

  const patchCategory = usePatchMenuCategoriesId({
    mutation: {
      onSuccess: () => { show("Catégorie mise à jour.", "success"); invalidate(); setCategoryModal({ open: false }); },
      onError: () => { show("Échec de la mise à jour.", "error"); },
    },
  });

  const deleteCategory = useDeleteMenuCategoriesId({
    mutation: {
      onSuccess: () => { show("Catégorie supprimée.", "success"); invalidate(); },
      onError: () => { show("Échec de la suppression.", "error"); },
    },
  });

  const postItem = usePostMenuItems({
    mutation: {
      onSuccess: () => { show("Article créé.", "success"); invalidate(); setItemModal({ open: false }); },
      onError: () => { show("Échec de la création.", "error"); },
    },
  });

  const patchItem = usePatchMenuItemsId({
    mutation: {
      onSuccess: () => { show("Article mis à jour.", "success"); invalidate(); setItemModal({ open: false }); },
      onError: () => { show("Échec de la mise à jour.", "error"); },
    },
  });

  const deleteItem = useDeleteMenuItemsId({
    mutation: {
      onSuccess: () => { show("Article supprimé.", "success"); invalidate(); },
      onError: () => { show("Échec de la suppression.", "error"); },
    },
  });

  const itemsByCategoryId = useMemo(
    () =>
      items.reduce<Record<number, MenuItem[]>>((acc, item) => {
        const list = acc[item.categoryId] ?? [];
        list.push(item);
        acc[item.categoryId] = list;
        return acc;
      }, {}),
    [items]
  );

  if (catLoading || itemLoading) return <LoadingState message="Chargement du menu…" />;
  if (catError || itemError)
    return <ErrorState onRetry={() => { void catRefetch(); void itemRefetch(); }} />;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Menu</Text>
        <Button
          variant="primary"
          size="sm"
          onPress={() => { setCategoryModal({ open: true }); }}
          leftIcon="add-outline"
        >
          Nouvelle catégorie
        </Button>
      </View>

      {categories.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title="Menu vide"
          description="Ajoutez une catégorie pour commencer."
          action={
            <Button
              variant="primary"
              size="md"
              onPress={() => { setCategoryModal({ open: true }); }}
            >
              Créer une catégorie
            </Button>
          }
        />
      ) : (
        <View style={styles.list}>
          {categories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              items={itemsByCategoryId[cat.id] ?? []}
              onEditCategory={(c) => { setCategoryModal({ open: true, category: c }); }}
              onDeleteCategory={(id) => { deleteCategory.mutate({ id }); }}
              onAddItem={(catId) => { setItemModal({ open: true, defaultCategoryId: catId }); }}
              onEditItem={(it) => { setItemModal({ open: true, item: it }); }}
              onDeleteItem={(id) => { deleteItem.mutate({ id }); }}
              onToggleItem={(it) =>
                { patchItem.mutate({ id: it.id, data: { available: !it.available } }); }
              }
            />
          ))}
        </View>
      )}

      {categoryModal.open && (
        <CategoryModal
          visible
          onClose={() => { setCategoryModal({ open: false }); }}
          category={categoryModal.category}
          onSubmit={(name) => {
            if (categoryModal.category) {
              patchCategory.mutate({ id: categoryModal.category.id, data: { name } });
            } else {
              postCategory.mutate({ data: { name } });
            }
          }}
          loading={postCategory.isPending || patchCategory.isPending}
        />
      )}

      {itemModal.open && (
        <ItemModal
          visible
          onClose={() => { setItemModal({ open: false }); }}
          item={itemModal.item}
          categories={categories}
          onSubmit={(data) => {
            if (itemModal.item) {
              patchItem.mutate({ id: itemModal.item.id, data });
            } else {
              postItem.mutate({ data: { ...data, categoryId: data.categoryId } });
            }
          }}
          loading={postItem.isPending || patchItem.isPending}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  container: {
    padding: spacing[6],
    gap: spacing[5],
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.ui.textPrimary,
  },
  list: {
    gap: spacing[5],
  },
});
