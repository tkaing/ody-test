import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { orders, orderItems, menuItems, menuCategories, customers, settings, orderStatusEnum } from "../db/schema";

export const OrderStatusSchema = z.enum(orderStatusEnum.enumValues).openapi("OrderStatus");

export const MenuCategorySchema = createSelectSchema(menuCategories).openapi("MenuCategory");
export const MenuItemSchema = createSelectSchema(menuItems).openapi("MenuItem");
export const CustomerSchema = createSelectSchema(customers).openapi("Customer");
export const OrderItemSchema = createSelectSchema(orderItems).openapi("OrderItem");
export const OrderSchema = createSelectSchema(orders, { status: OrderStatusSchema }).openapi("Order");
export const SettingsSchema = createSelectSchema(settings).openapi("Settings");

export const OrderDetailSchema = OrderSchema.extend({
  items: z.array(OrderItemSchema.extend({ menuItem: MenuItemSchema })),
  customer: CustomerSchema.nullable(),
}).openapi("OrderDetail");

export const CustomerWithStatsSchema = CustomerSchema.extend({
  orderCount: z.number().int(),
  totalSpend: z.number().int(),
  recentOrders: z.array(
    OrderSchema.pick({ id: true, status: true, total: true, createdAt: true })
  ),
}).openapi("CustomerWithStats");

export const ErrorSchema = z.object({ error: z.string() }).openapi("Error");
