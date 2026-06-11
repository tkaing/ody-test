import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import type {
  PressableProps} from "react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/constants/tokens";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

type Props = Omit<PressableProps, "style"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  children?: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  onPress,
  ...rest
}: Props) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;

  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const iconColor = getIconColor(variant, isDisabled);

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      onHoverIn={() => { setHovered(true); }}
      onHoverOut={() => { setHovered(false); }}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant].base,
        hovered && !isDisabled && variantStyles[variant].hover,
        pressed && !isDisabled && variantStyles[variant].pressed,
        isDisabled && styles.disabled,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={iconColor}
          style={styles.loadingIndicator}
        />
      ) : leftIcon ? (
        <Ionicons name={leftIcon} size={iconSize} color={iconColor} />
      ) : null}
      <Text
        style={[
          styles.label,
          sizeLabelStyles[size],
          variantStyles[variant].label,
          isDisabled && styles.labelDisabled,
        ]}
      >
        {children}
      </Text>
      {rightIcon && !loading && (
        <Ionicons name={rightIcon} size={iconSize} color={iconColor} />
      )}
    </Pressable>
  );
}

function getIconColor(variant: Variant, disabled: boolean): string {
  if (disabled) return colors.ui.textDisabled;
  switch (variant) {
    case "primary":
      return colors.ui.textInverse;
    case "destructive":
      return colors.ui.textInverse;
    case "secondary":
      return colors.ui.interactive;
    case "ghost":
      return colors.ui.textSecondary;
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
    cursor: "pointer" as never,
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed" as never,
  },
  label: {
    fontWeight: fontWeight.semibold,
  },
  labelDisabled: {
    color: colors.ui.textDisabled,
  },
  loadingIndicator: {
    width: 16,
    height: 16,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    gap: spacing[1],
  },
  md: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  lg: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
});

const sizeLabelStyles = StyleSheet.create({
  sm: { fontSize: fontSize.sm },
  md: { fontSize: fontSize.base },
  lg: { fontSize: fontSize.md },
});

const variantStyles = {
  primary: StyleSheet.create({
    base: { backgroundColor: colors.ui.interactive, borderColor: colors.ui.interactive },
    hover: { backgroundColor: colors.ui.interactiveHover, borderColor: colors.ui.interactiveHover },
    pressed: { backgroundColor: colors.ui.interactivePressed, borderColor: colors.ui.interactivePressed },
    label: { color: colors.ui.textInverse },
  }),
  secondary: StyleSheet.create({
    base: { backgroundColor: colors.ui.surface, borderColor: colors.ui.border },
    hover: { backgroundColor: colors.neutral[50], borderColor: colors.neutral[300] },
    pressed: { backgroundColor: colors.neutral[100] },
    label: { color: colors.ui.interactive },
  }),
  ghost: StyleSheet.create({
    base: { backgroundColor: "transparent", borderColor: "transparent" },
    hover: { backgroundColor: colors.neutral[100] },
    pressed: { backgroundColor: colors.neutral[200] },
    label: { color: colors.ui.textSecondary },
  }),
  destructive: StyleSheet.create({
    base: { backgroundColor: colors.semantic.error.text, borderColor: colors.semantic.error.text },
    hover: { backgroundColor: colors.red[700], borderColor: colors.red[700] },
    pressed: { backgroundColor: colors.red[700] },
    label: { color: colors.ui.textInverse },
  }),
};
