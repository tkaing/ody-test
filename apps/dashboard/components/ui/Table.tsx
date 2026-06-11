import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/constants/tokens";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  width?: number;
  flex?: number;
  align?: "left" | "center" | "right";
  render?: (item: T, index: number) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowPress?: (item: T) => void;
  emptyComponent?: React.ReactNode;
};

export function Table<T>({ columns, data, keyExtractor, onRowPress, emptyComponent }: Props<T>) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <View
                key={String(col.key)}
                style={[
                  styles.headerCell,
                  col.width ? { width: col.width } : col.flex ? { flex: col.flex } : { flex: 1 },
                  col.align === "right" && styles.alignRight,
                  col.align === "center" && styles.alignCenter,
                ]}
              >
                <Text style={styles.headerText}>{col.header}</Text>
              </View>
            ))}
          </View>

          {data.length === 0 && emptyComponent ? (
            <View style={styles.emptyWrapper}>{emptyComponent}</View>
          ) : (
            data.map((item, index) => (
              <TableRow
                key={keyExtractor(item, index)}
                item={item}
                index={index}
                columns={columns}
                onPress={onRowPress}
                isLast={index === data.length - 1}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TableRow<T>({
  item,
  index,
  columns,
  onPress,
  isLast,
}: {
  item: T;
  index: number;
  columns: Column<T>[];
  onPress?: (item: T) => void;
  isLast: boolean;
}) {
  const rowStyle = [
    styles.row,
    index % 2 === 1 && styles.rowAlt,
    isLast && styles.rowLast,
  ] as const;

  const cells = columns.map((col) => {
    const rawValue = (item as Record<string, unknown>)[col.key as string];
    const value = col.render
      ? col.render(item, index)
      : typeof rawValue === "string" || typeof rawValue === "number" || typeof rawValue === "boolean"
        ? String(rawValue)
        : "";

    return (
      <View
        key={String(col.key)}
        style={[
          styles.cell,
          col.width ? { width: col.width } : col.flex ? { flex: col.flex } : { flex: 1 },
          col.align === "right" && styles.alignRight,
          col.align === "center" && styles.alignCenter,
        ]}
      >
        {typeof value === "string" || typeof value === "number" ? (
          <Text style={styles.cellText} numberOfLines={1}>
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
    );
  });

  if (onPress) {
    return (
      <Pressable
        onPress={() => { onPress(item); }}
        style={({ pressed }) => [
          ...rowStyle,
          pressed && styles.rowPressed,
          { cursor: "pointer" } as object,
        ]}
      >
        {cells}
      </Pressable>
    );
  }

  return <View style={[...rowStyle]}>{cells}</View>;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
    overflow: "hidden",
    backgroundColor: colors.ui.surface,
  },
  table: {
    minWidth: "100%",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    paddingHorizontal: spacing[4],
  },
  headerCell: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
  },
  headerText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    paddingHorizontal: spacing[4],
  },
  rowAlt: {
    backgroundColor: colors.neutral[50],
  },
  rowPressed: {
    backgroundColor: colors.primary[50],
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    justifyContent: "center",
  },
  cellText: {
    fontSize: fontSize.sm,
    color: colors.ui.textPrimary,
  },
  alignRight: {
    alignItems: "flex-end",
  },
  alignCenter: {
    alignItems: "center",
  },
  emptyWrapper: {
    padding: spacing[8],
    alignItems: "center",
  },
});
