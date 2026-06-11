import type { ViewProps } from "react-native";
import { StyleSheet, View } from "react-native";
import { colors, radius, shadow, spacing } from "@/constants/tokens";

type Props = ViewProps & {
  variant?: "default" | "flat" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
};

export function Card({ variant = "default", padding = "md", style, children, ...rest }: Props) {
  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        paddingStyles[padding],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    backgroundColor: colors.ui.surface,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...shadow.sm,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  elevated: {
    ...shadow.md,
  },
});

const paddingStyles = StyleSheet.create({
  none: {},
  sm: { padding: spacing[3] },
  md: { padding: spacing[5] },
  lg: { padding: spacing[8] },
});
