export * from "@ody/types";

import type { OrderStatus } from "@ody/types";

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export const CURRENCY = "EUR";
export const CURRENCY_SYMBOL = "€";

export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)}${CURRENCY_SYMBOL}`;
}
