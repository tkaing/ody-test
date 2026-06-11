import { StyleSheet, Text, View } from "react-native";
import type { CustomerWithStats } from "@ody/api-client";
import { formatPrice } from "@ody/shared";
import { Badge, StatusIndicator } from "@/components/ui";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/tokens";

type Props = {
  customer: CustomerWithStats;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export function CustomerRow({ customer }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.contact}>
            {customer.email ?? customer.phone ?? "Aucun contact"}
          </Text>
        </View>
        <View style={styles.stats}>
          <Badge variant="info" size="sm">
            {customer.orderCount} commande{customer.orderCount > 1 ? "s" : ""}
          </Badge>
          <Text style={styles.spend}>{formatPrice(customer.totalSpend)}</Text>
        </View>
      </View>

      {customer.recentOrders.length > 0 && (
        <View style={styles.recentOrders}>
          <Text style={styles.recentTitle}>Commandes récentes</Text>
          {customer.recentOrders.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <Text style={styles.orderId}>#{order.id}</Text>
              <StatusIndicator status={order.status} size="sm" />
              <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
    padding: spacing[4],
    gap: spacing[3],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.ui.interactive + "1a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ui.interactive,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textPrimary,
  },
  contact: {
    fontSize: fontSize.xs,
    color: colors.ui.textSecondary,
    marginTop: 2,
  },
  stats: {
    alignItems: "flex-end",
    gap: spacing[1],
  },
  spend: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.semantic.success.text,
  },
  recentOrders: {
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    paddingTop: spacing[3],
    gap: spacing[2],
  },
  recentTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  orderId: {
    fontSize: fontSize.xs,
    color: colors.ui.textSecondary,
    width: 32,
  },
  orderTotal: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.ui.textPrimary,
    textAlign: "right",
  },
  orderDate: {
    fontSize: fontSize.xs,
    color: colors.ui.textSecondary,
    width: 56,
    textAlign: "right",
  },
});
