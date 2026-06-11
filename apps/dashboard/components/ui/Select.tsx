import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fontSize, fontWeight, radius, shadow, spacing } from "@/constants/tokens";

export type SelectOption<T extends string | number = string> = {
  label: string;
  value: T;
};

type Props<T extends string | number = string> = {
  label?: string;
  placeholder?: string;
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
};

export function Select<T extends string | number = string>({
  label,
  placeholder = "Sélectionner…",
  options,
  value,
  onChange,
  error,
  hint,
  disabled = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={() => { if (!disabled) setOpen(true); }}
        style={[
          styles.trigger,
          hasError && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Text style={[styles.triggerText, !selected && styles.triggerPlaceholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.ui.textSecondary}
        />
      </Pressable>
      {hasError && <Text style={styles.error}>{error}</Text>}
      {!hasError && hint && <Text style={styles.hint}>{hint}</Text>}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => { setOpen(false); }}
      >
        <Pressable style={styles.overlay} onPress={() => { setOpen(false); }}>
          <View style={styles.dropdown}>
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={colors.ui.interactive} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: radius.md,
    backgroundColor: colors.ui.surface,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    cursor: "pointer" as never,
  },
  triggerError: {
    borderColor: colors.semantic.error.text,
  },
  triggerDisabled: {
    backgroundColor: colors.neutral[50],
    opacity: 0.6,
    cursor: "not-allowed" as never,
  },
  triggerText: {
    fontSize: fontSize.base,
    color: colors.ui.textPrimary,
    flex: 1,
  },
  triggerPlaceholder: {
    color: colors.ui.textDisabled,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[8],
  },
  dropdown: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
    maxHeight: 300,
    minWidth: 200,
    ...shadow.lg,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionText: {
    fontSize: fontSize.base,
    color: colors.ui.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: fontWeight.semibold,
    color: colors.ui.interactive,
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
