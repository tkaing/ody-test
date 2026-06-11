import { StyleSheet, View } from "react-native";
import type { OrderStatus } from "@ody/types";
import { ORDER_STATUS_TRANSITIONS } from "@ody/shared";
import { Button } from "@/components/ui";
import { STATUS_CONFIG } from "@/constants/orderStatus";
import { spacing } from "@/constants/tokens";

type Props = {
  status: OrderStatus;
  onTransition: (next: OrderStatus) => void;
  loading?: boolean;
};

export function StatusActions({ status, onTransition, loading }: Props) {
  const nextStatuses = ORDER_STATUS_TRANSITIONS[status];
  if (nextStatuses.length === 0) return null;

  return (
    <View style={styles.row}>
      {nextStatuses.map((next) => (
        <Button
          key={next}
          variant={next === "cancelled" ? "destructive" : "primary"}
          size="sm"
          onPress={() => { onTransition(next); }}
          loading={loading}
        >
          {STATUS_CONFIG[next].actionLabel ?? STATUS_CONFIG[next].label}
        </Button>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing[2],
    flexWrap: "wrap",
  },
});
