import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import type {
  TextInputProps} from "react-native";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, fontSize, fontWeight, radius, spacing } from "@/constants/tokens";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
};

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          rest.editable === false && styles.inputContainerDisabled,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={16}
            color={hasError ? colors.semantic.error.text : colors.ui.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.ui.textDisabled}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={16}
            color={colors.ui.textSecondary}
            style={styles.rightIcon}
          />
        )}
      </View>
      {hasError && <Text style={styles.error}>{error}</Text>}
      {!hasError && hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[1],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    backgroundColor: colors.ui.surface,
    paddingHorizontal: spacing[3],
  },
  inputContainerFocused: {
    borderColor: colors.ui.interactive,
    shadowColor: colors.ui.interactive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  inputContainerError: {
    borderColor: colors.semantic.error.text,
  },
  inputContainerDisabled: {
    backgroundColor: colors.neutral[50],
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.ui.textPrimary,
    paddingVertical: spacing[2],
  },
  leftIcon: {
    marginRight: spacing[2],
  },
  rightIcon: {
    marginLeft: spacing[2],
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.semantic.error.text,
    fontWeight: fontWeight.medium,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.ui.textSecondary,
  },
});
