import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing } from "@/constants/tokens";

type Props = {
  message?: string;
};

export function LoadingState({ message = "Chargement…" }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.ui.interactive} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[3],
    padding: spacing[8],
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.ui.textSecondary,
  },
});
