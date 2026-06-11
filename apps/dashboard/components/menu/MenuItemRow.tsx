import { StyleSheet, Text, View } from "react-native";
import type { MenuItem } from "@ody/api-client";
import { formatPrice } from "@ody/shared";
import { Button, Toggle } from "@/components/ui";
import { colors, spacing, fontSize, fontWeight } from "@/constants/tokens";

type Props = {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggleAvailable: (item: MenuItem) => void;
};

export function MenuItemRow({ item, onEdit, onDelete, onToggleAvailable }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={[styles.name, !item.available && styles.unavailable]}>
          {item.name}
        </Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
      <View style={styles.actions}>
        <Toggle
          value={item.available}
          onChange={() => { onToggleAvailable(item); }}
        />
        <Button
          testID="edit-item"
          variant="ghost"
          size="sm"
          onPress={() => { onEdit(item); }}
          leftIcon="pencil-outline"
        />
        <Button
          variant="ghost"
          size="sm"
          onPress={() => { onDelete(item.id); }}
          leftIcon="trash-outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    gap: spacing[3],
  },
  info: {
    flex: 1,
    gap: spacing["0.5"],
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  unavailable: {
    color: colors.ui.textDisabled,
    textDecorationLine: "line-through",
  },
  price: {
    fontSize: fontSize.xs,
    color: colors.ui.textSecondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
  },
});
