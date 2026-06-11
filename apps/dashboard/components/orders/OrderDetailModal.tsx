import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { OrderStatus } from "@ody/types";
import { useGetOrdersId } from "@ody/api-client";
import { formatPrice } from "@ody/shared";
import { Button, Modal, StatusIndicator } from "@/components/ui";
import { ErrorState } from "@/components/states";
import { StatusActions } from "./StatusActions";
import { colors, spacing, fontSize, fontWeight } from "@/constants/tokens";

type Props = {
  orderId: number | null;
  onClose: () => void;
  onTransition: (id: number, next: OrderStatus) => void;
  transitionLoading?: boolean;
};

export function OrderDetailModal({ orderId, onClose, onTransition, transitionLoading }: Props) {
  const { data: order, isLoading, isError } = useGetOrdersId(orderId);

  return (
    <Modal
      visible={orderId !== null}
      onClose={onClose}
      title={order ? `Commande #${String(order.id)}` : "Commande"}
      size="md"
      footer={
        <View style={styles.footer}>
          {order && (
            <StatusActions
              status={order.status}
              onTransition={(next) => { onTransition(order.id, next); }}
              loading={transitionLoading}
            />
          )}
          <Button variant="ghost" size="md" onPress={onClose}>
            Fermer
          </Button>
        </View>
      }
    >
      {isLoading && (
        <ActivityIndicator color={colors.ui.interactive} style={styles.loader} />
      )}
      {isError && <ErrorState title="Impossible de charger la commande" />}
      {order && (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Statut</Text>
            <StatusIndicator status={order.status} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Client</Text>
            <Text style={styles.value}>{order.customer.name}</Text>
            {order.customer.email && (
              <Text style={styles.secondary}>{order.customer.email}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Articles</Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.quantity}× {item.menuItem.name}
                </Text>
                <Text style={styles.itemPrice}>
                  {formatPrice(item.unitPrice * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: spacing[8],
  },
  content: {
    gap: spacing[5],
  },
  section: {
    gap: spacing[2],
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  secondary: {
    fontSize: fontSize.xs,
    color: colors.ui.textSecondary,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  itemName: {
    fontSize: fontSize.sm,
    color: colors.ui.textPrimary,
  },
  itemPrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderStrong,
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textPrimary,
  },
  totalValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.ui.textPrimary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing[2],
  },
});
