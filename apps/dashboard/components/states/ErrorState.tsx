import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/constants/tokens";

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Une erreur est survenue",
  message,
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.semantic.error.icon} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {onRetry && (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh-outline" size={14} color={colors.ui.interactive} />
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      )}
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
  message: {
    fontSize: fontSize.sm,
    color: colors.ui.textSecondary,
    textAlign: "center",
    maxWidth: 320,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    marginTop: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.ui.interactive,
    borderRadius: radius.md,
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.interactive,
  },
});
