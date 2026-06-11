import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui";
import { colors, spacing, fontSize, fontWeight, hexWithOpacity } from "@/constants/tokens";

type Props = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
};

export function KpiCard({ label, value, icon, iconColor }: Props) {
  const color = iconColor ?? colors.ui.interactive;
  return (
    <Card variant="default" padding="md" style={styles.card}>
      <View style={styles.iconRow}>
        <View style={[styles.iconBg, { backgroundColor: hexWithOpacity(color, 0.1) }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 180,
    gap: spacing[1],
  },
  iconRow: {
    marginBottom: spacing[2],
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.ui.textPrimary,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.ui.textSecondary,
  },
});
