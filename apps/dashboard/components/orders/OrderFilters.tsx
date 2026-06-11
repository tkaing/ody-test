import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import type { OrderStatus } from "@ody/types";
import { Input, Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { STATUS_OPTIONS } from "@/constants/orderStatus";
import { colors, fontSize, radius, spacing } from "@/constants/tokens";

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

const webDatePickerStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  paddingInline: spacing[3],
  fontSize: fontSize.base,
  color: colors.ui.textPrimary,
  backgroundColor: colors.ui.surface,
  border: `1px solid ${colors.ui.border}`,
  borderRadius: radius.md,
  outline: "none",
  cursor: "pointer",
  boxSizing: "border-box",
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
        {Platform.OS === "web" ? (
          <input
            type="date"
            value={date}
            onChange={(e) => { onDateChange(e.target.value); }}
            style={webDatePickerStyle}
          />
        ) : (
          <Input
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={onDateChange}
            leftIcon="calendar-outline"
          />
        )}
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
