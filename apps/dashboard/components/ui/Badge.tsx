import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/constants/tokens";

type Variant = "default" | "success" | "warning" | "error" | "info" | "neutral";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
};

export function Badge({ children, variant = "default", size = "md" }: Props) {
  return (
    <View style={[styles.base, variantStyles[variant].container, sizeStyles[size]]}>
      <Text style={[styles.text, variantStyles[variant].text, sizeTextStyles[size]]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: spacing[0.5], paddingHorizontal: spacing[2] },
  md: { paddingVertical: spacing[1], paddingHorizontal: spacing[3] },
});

const sizeTextStyles = StyleSheet.create({
  sm: { fontSize: fontSize["2xs"] },
  md: { fontSize: fontSize.xs },
});

const variantStyles = {
  default: StyleSheet.create({
    container: { backgroundColor: colors.neutral[100], borderColor: colors.neutral[200] },
    text: { color: colors.neutral[700] },
  }),
  success: StyleSheet.create({
    container: { backgroundColor: colors.semantic.success.bg, borderColor: colors.semantic.success.border },
    text: { color: colors.semantic.success.text },
  }),
  warning: StyleSheet.create({
    container: { backgroundColor: colors.semantic.warning.bg, borderColor: colors.semantic.warning.border },
    text: { color: colors.semantic.warning.text },
  }),
  error: StyleSheet.create({
    container: { backgroundColor: colors.semantic.error.bg, borderColor: colors.semantic.error.border },
    text: { color: colors.semantic.error.text },
  }),
  info: StyleSheet.create({
    container: { backgroundColor: colors.semantic.info.bg, borderColor: colors.semantic.info.border },
    text: { color: colors.semantic.info.text },
  }),
  neutral: StyleSheet.create({
    container: { backgroundColor: colors.neutral[50], borderColor: colors.neutral[300] },
    text: { color: colors.neutral[600] },
  }),
};
