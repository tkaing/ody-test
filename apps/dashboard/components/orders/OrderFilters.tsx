import { StyleSheet, View } from "react-native";
import type { OrderStatus } from "@ody/types";
import { Input, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { STATUS_OPTIONS } from "@/constants/orderStatus";
import { spacing } from "@/constants/tokens";

const STATUS_FILTER_OPTIONS: SelectOption<OrderStatus | "">[] = [
  { value: "", label: "Tous les statuts" },
  ...STATUS_OPTIONS,
];

type Props = {
  status: OrderStatus | "";
  date: string;
  onStatusChange: (v: OrderStatus | "") => void;
  onDateChange: (v: string) => void;
};

export function OrderFilters({ status, date, onStatusChange, onDateChange }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.statusFilter}>
        <Select
          label=""
          placeholder="Tous les statuts"
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={onStatusChange}
        />
      </View>
      <View style={styles.dateFilter}>
        <Input
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={onDateChange}
          leftIcon="calendar-outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing[3],
    alignItems: "flex-end",
  },
  statusFilter: {
    flex: 1,
  },
  dateFilter: {
    flex: 1,
  },
});
