import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { colors, spacing, radius } from "@/constants/tokens";
import { fontSize, fontWeight } from "@/constants/tokens";

type Props = {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function Toggle({ value, onChange, label, disabled = false }: Props) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 18],
  });

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => { if (!disabled) onChange(!value); }}
        style={[
          styles.track,
          value ? styles.trackOn : styles.trackOff,
          disabled && styles.trackDisabled,
        ]}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
      >
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Pressable>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  track: {
    width: 40,
    height: 22,
    borderRadius: radius.full,
    justifyContent: "center",
  },
  trackOn: {
    backgroundColor: colors.semantic.success.icon,
  },
  trackOff: {
    backgroundColor: colors.ui.border,
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.ui.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  labelDisabled: {
    color: colors.ui.textDisabled,
  },
});
