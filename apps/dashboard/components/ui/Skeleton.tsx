import { useEffect, useRef } from "react";
import type { DimensionValue, ViewStyle } from "react-native";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/constants/tokens";

type Props = {
  variant?: "line" | "block" | "avatar" | "card";
  width?: DimensionValue;
  height?: number;
  style?: ViewStyle;
};

export function Skeleton({ variant = "line", width, height, style }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => { animation.stop(); };
  }, [opacity]);

  const variantStyle = variantStyles[variant];

  return (
    <Animated.View
      style={[
        styles.base,
        variantStyle,
        width !== undefined && { width },
        height !== undefined && { height },
        { opacity },
        style,
      ]}
    />
  );
}

export function SkeletonRow({ columns = 3 }: { columns?: number }) {
  return (
    <View style={skeletonRowStyles.row}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="line" style={{ flex: 1 }} />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View style={skeletonCardStyles.card}>
      <Skeleton variant="line" width="40%" height={12} />
      <Skeleton variant="block" height={40} style={{ marginTop: spacing[2] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.neutral[200],
    borderRadius: radius.sm,
  },
});

const variantStyles = StyleSheet.create({
  line: { height: 14, borderRadius: radius.sm },
  block: { height: 64, borderRadius: radius.md },
  avatar: { width: 40, height: 40, borderRadius: radius.full },
  card: { height: 120, borderRadius: radius.lg },
});

const skeletonRowStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing[4], paddingVertical: spacing[3] },
});

const skeletonCardStyles = StyleSheet.create({
  card: { padding: spacing[4], gap: spacing[2] },
});
