import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetOrders,
  usePostOrders,
  usePatchOrdersIdStatus,
  getGetOrdersQueryKey,
  getGetOrdersIdQueryKey,
  type PostOrdersBody,
} from "@ody/api-client";
import type { OrderStatus } from "@ody/types";
import { formatPrice } from "@ody/shared";
import { Button, StatusIndicator, useToast } from "@/components/ui";
import type { Column } from "@/components/ui";
import { Table } from "@/components/ui";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { CreateOrderModal } from "@/components/orders/CreateOrderModal";
import { colors, spacing, fontSize, fontWeight } from "@/constants/tokens";

type OrderRow = {
  id: number;
  customerName?: string | null;
  status: OrderStatus;
  total: number;
  createdAt: string;
};

export default function OrdersScreen() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const params = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(dateFilter ? { date: dateFilter } : {}),
  };
  const { data: orders = [], isLoading, isError, refetch } = useGetOrders(
    Object.keys(params).length > 0 ? params : undefined
  );

  const createOrder = usePostOrders({
    mutation: {
      onSuccess: () => {
        show("Commande créée.", "success");
        void queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        setCreateOpen(false);
      },
      onError: () => { show("Échec de la création.", "error"); },
    },
  });

  const patchStatus = usePatchOrdersIdStatus({
    mutation: {
      onSuccess: (order) => {
        show("Statut mis à jour.", "success");
        void queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getGetOrdersIdQueryKey(order.id) });
      },
      onError: () => { show("Transition invalide.", "error"); },
    },
  });

  const columns: Column<OrderRow>[] = [
    { key: "id", header: "#", width: 60, render: (r) => <Text style={styles.cellId}>#{r.id}</Text> },
    { key: "status", header: "Statut", width: 140, render: (r) => <StatusIndicator status={r.status} size="sm" /> },
    { key: "total", header: "Total", width: 100, align: "right", render: (r) => <Text style={styles.cell}>{formatPrice(r.total)}</Text> },
    {
      key: "createdAt",
      header: "Date",
      flex: 1,
      render: (r) => (
        <Text style={styles.cellSecondary}>
          {new Date(r.createdAt).toLocaleDateString("fr-FR")}
        </Text>
      ),
    },
  ];

  if (isLoading) return <LoadingState message="Chargement des commandes…" />;
  if (isError) return <ErrorState onRetry={() => { void refetch(); }} />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Commandes</Text>
        <Button
          variant="primary"
          size="sm"
          onPress={() => { setCreateOpen(true); }}
          leftIcon="add-outline"
        >
          Nouvelle commande
        </Button>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <OrderFilters
          status={statusFilter}
          date={dateFilter}
          onStatusChange={setStatusFilter}
          onDateChange={setDateFilter}
        />

        {orders.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="Aucune commande"
            description={statusFilter || dateFilter ? "Aucun résultat pour ces filtres." : undefined}
          />
        ) : (
          <Table
            columns={columns}
            data={orders}
            keyExtractor={(r) => String(r.id)}
            onRowPress={(r) => { setSelectedOrderId(r.id); }}
          />
        )}
      </ScrollView>

      {selectedOrderId !== null && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => { setSelectedOrderId(null); }}
          onTransition={(id, next) =>
            { patchStatus.mutate({ id, data: { status: next } }); }
          }
          transitionLoading={patchStatus.isPending}
        />
      )}

      {createOpen && (
        <CreateOrderModal
          visible
          onClose={() => { setCreateOpen(false); }}
          onConfirm={(body: PostOrdersBody) =>
            { createOrder.mutate({ data: body }); }
          }
          loading={createOrder.isPending}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing[6],
    paddingBottom: 0,
  },
  pageTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.ui.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: spacing[6],
    gap: spacing[5],
  },
  cell: {
    fontSize: fontSize.sm,
    color: colors.ui.textPrimary,
  },
  cellId: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  cellSecondary: {
    fontSize: fontSize.sm,
    color: colors.ui.textSecondary,
  },
});
