import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, spacing } from "@/constants/tokens";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon = "file-tray-outline",
  title,
  description,
  action,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={32} color={colors.ui.textDisabled} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.actionWrapper}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[8],
  },
  iconWrapper: {
    marginBottom: spacing[2],
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textPrimary,
    textAlign: "center",
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.ui.textSecondary,
    textAlign: "center",
    maxWidth: 320,
  },
  actionWrapper: {
    marginTop: spacing[2],
  },
});
