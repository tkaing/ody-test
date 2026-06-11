import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useGetCustomers, useGetMenuItems, GetMenuItemsAvailable } from "@ody/api-client";
import type { PostOrdersBody } from "@ody/api-client";
import { formatPrice } from "@ody/shared";
import { Button, Modal, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { colors, spacing, fontSize, fontWeight, radius } from "@/constants/tokens";

type ItemQty = { menuItemId: number; quantity: number; unitPrice: number; name: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (body: PostOrdersBody) => void;
  loading?: boolean;
};

export function CreateOrderModal({ visible, onClose, onConfirm, loading }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [itemQtys, setItemQtys] = useState<ItemQty[]>([]);

  const { data: customers = [] } = useGetCustomers();
  const { data: menuItems = [] } = useGetMenuItems({ available: GetMenuItemsAvailable.true });

  const customerOptions: SelectOption<number>[] = customers.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const total = itemQtys.reduce((acc, { quantity, unitPrice }) => acc + quantity * unitPrice, 0);

  function changeQty(item: { id: number; name: string; price: number }, delta: number) {
    setItemQtys((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (!existing) {
        if (delta <= 0) return prev;
        return [...prev, { menuItemId: item.id, quantity: 1, unitPrice: item.price, name: item.name }];
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter((i) => i.menuItemId !== item.id);
      return prev.map((i) => (i.menuItemId === item.id ? { ...i, quantity: newQty } : i));
    });
  }

  function handleClose() {
    setStep(1);
    setCustomerId(null);
    setItemQtys([]);
    onClose();
  }

  function handleConfirm() {
    if (!customerId || itemQtys.length === 0) return;
    onConfirm({
      customerId,
      total,
      items: itemQtys.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })),
    });
    // Do not call handleClose() here — the parent closes the modal on mutation success.
    // On failure, the modal stays open so the user can retry without losing their input.
  }

  const stepTitles = { 1: "Sélectionner un client", 2: "Choisir les articles", 3: "Récapitulatif" };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={stepTitles[step]}
      size="md"
      footer={
        <View style={styles.footer}>
          {step > 1 && (
            <Button variant="ghost" size="md" onPress={() => { setStep((s) => (s - 1) as 1 | 2 | 3); }}>
              Retour
            </Button>
          )}
          {step === 1 && (
            <Button
              variant="primary"
              size="md"
              onPress={() => { setStep(2); }}
              disabled={!customerId}
            >
              Suivant
            </Button>
          )}
          {step === 2 && (
            <Button
              variant="primary"
              size="md"
              onPress={() => { setStep(3); }}
              disabled={itemQtys.length === 0}
            >
              Récapitulatif
            </Button>
          )}
          {step === 3 && (
            <Button
              variant="primary"
              size="md"
              onPress={handleConfirm}
              loading={loading}
              disabled={!customerId || itemQtys.length === 0}
            >
              Confirmer la commande
            </Button>
          )}
        </View>
      }
    >
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <Select<number>
            label="Client"
            placeholder="Choisir un client…"
            options={customerOptions}
            value={customerId ?? undefined}
            onChange={(v) => { setCustomerId(v); }}
          />
        )}

        {step === 2 && (
          <View style={styles.itemsList}>
            {menuItems.map((item) => {
              const qty = itemQtys.find((i) => i.menuItemId === item.id)?.quantity ?? 0;
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  </View>
                  <View style={styles.qtyControls}>
                    <Pressable
                      style={[styles.qtyBtn, qty === 0 && styles.qtyBtnDisabled]}
                      onPress={() => { changeQty(item, -1); }}
                    >
                      <Ionicons name="remove" size={16} color={qty === 0 ? colors.ui.textDisabled : colors.ui.textPrimary} />
                    </Pressable>
                    <Text style={styles.qtyValue}>{qty}</Text>
                    <Pressable testID="qty-add" style={styles.qtyBtn} onPress={() => { changeQty(item, 1); }}>
                      <Ionicons name="add" size={16} color={colors.ui.textPrimary} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {step === 3 && (
          <View style={styles.recap}>
            <Text style={styles.recapLabel}>Client</Text>
            <Text style={styles.recapValue}>
              {customers.find((c) => c.id === customerId)?.name ?? "—"}
            </Text>

            <Text style={[styles.recapLabel, styles.recapLabelMargin]}>Articles</Text>
            {itemQtys.map((item) => (
              <View key={item.menuItemId} style={styles.recapRow}>
                <Text style={styles.recapItemName}>
                  {item.quantity}× {item.name}
                </Text>
                <Text style={styles.recapItemPrice}>
                  {formatPrice(item.quantity * item.unitPrice)}
                </Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    maxHeight: 400,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing[3],
  },
  itemsList: {
    gap: spacing[1],
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    gap: spacing[3],
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  itemPrice: {
    fontSize: fontSize.xs,
    color: colors.ui.textSecondary,
    marginTop: 2,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textPrimary,
    minWidth: 20,
    textAlign: "center",
  },
  recap: {
    gap: spacing[3],
  },
  recapLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recapLabelMargin: {
    marginTop: spacing[3],
  },
  recapValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
    marginTop: spacing[1],
  },
  recapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  recapItemName: {
    fontSize: fontSize.sm,
    color: colors.ui.textPrimary,
  },
  recapItemPrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing[3],
    borderTopWidth: 2,
    borderTopColor: colors.ui.borderStrong,
    marginTop: spacing[2],
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
});
