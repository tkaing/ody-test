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
  rows?: number;
};

export function TextArea({ label, error, hint, rows = 4, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        multiline
        numberOfLines={rows}
        style={[
          styles.input,
          focused && styles.inputFocused,
          hasError && styles.inputError,
          rest.editable === false && styles.inputDisabled,
          style,
        ]}
        placeholderTextColor={colors.ui.textDisabled}
        textAlignVertical="top"
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
  input: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    backgroundColor: colors.ui.surface,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: fontSize.base,
    color: colors.ui.textPrimary,
    minHeight: 80,
  },
  inputFocused: {
    borderColor: colors.ui.interactive,
  },
  inputError: {
    borderColor: colors.semantic.error.text,
  },
  inputDisabled: {
    backgroundColor: colors.neutral[50],
    opacity: 0.6,
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
