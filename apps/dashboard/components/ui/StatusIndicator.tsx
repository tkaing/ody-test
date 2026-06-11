import type { OrderStatus } from "@ody/types";
import { Badge } from "./Badge";
import { STATUS_CONFIG } from "@/constants/orderStatus";

type Props = {
  status: OrderStatus;
  size?: "sm" | "md";
};

export function StatusIndicator({ status, size = "md" }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}
