import type { OrderStatus } from "@ody/types";
import type { SelectOption } from "@/components/ui/Select";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "neutral";

export const STATUS_CONFIG: Record<OrderStatus, { label: string; actionLabel?: string; variant: BadgeVariant }> = {
  pending:   { label: "En attente",     variant: "warning" },
  confirmed: { label: "Confirmée",      variant: "info" },
  preparing: { label: "En préparation", actionLabel: "Je prépare", variant: "info" },
  ready:     { label: "Prête",          variant: "success" },
  completed: { label: "Terminée",       variant: "neutral" },
  cancelled: { label: "Annulée",        actionLabel: "Annuler", variant: "error" },
};

export const STATUS_OPTIONS: SelectOption<OrderStatus>[] = (
  Object.entries(STATUS_CONFIG) as [OrderStatus, { label: string }][]
).map(([value, { label }]) => ({ value, label }));
