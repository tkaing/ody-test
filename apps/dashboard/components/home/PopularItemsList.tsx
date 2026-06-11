import { StyleSheet, Text, View } from "react-native";
import type { GetHomeSummary200PopularItemsItem } from "@ody/api-client";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/tokens";

type Props = {
  items: GetHomeSummary200PopularItemsItem[];
};

export function PopularItemsList({ items }: Props) {
  if (items.length === 0) {
    return (
      <Text style={styles.empty}>Aucune donnée de vente disponible.</Text>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.count}>{item.totalQuantity} vendus</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing[2],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.ui.interactive + "1a",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.ui.interactive,
  },
  name: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  count: {
    fontSize: fontSize.sm,
    color: colors.ui.textSecondary,
  },
  empty: {
    fontSize: fontSize.sm,
    color: colors.ui.textSecondary,
    fontStyle: "italic",
  },
});
