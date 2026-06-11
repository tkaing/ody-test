import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { type Db } from "../db";
import { orders, orderItems, menuItems, customers } from "../db/schema";
import { OrderDetailSchema, ErrorSchema } from "./schemas";

const ParamsSchema = z.object({
  id: z.coerce.number().openapi({ param: { name: "id", in: "path", required: true } }),
});

const detailRoute = createRoute({
  method: "get",
  path: "/orders/{id}",
  tags: ["orders"],
  request: { params: ParamsSchema },
  responses: {
    200: {
      content: { "application/json": { schema: OrderDetailSchema } },
      description: "Détail de la commande",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Non trouvée",
    },
  },
});

export function registerOrdersIdRoutes(app: OpenAPIHono, db: Db) {
  app.openapi(detailRoute, async (c) => {
    const { id } = c.req.valid("param");

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return c.json({ error: "Commande non trouvée" }, 404);

    const lines = await db
      .select({ orderItem: orderItems, menuItem: menuItems })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, id));

    const [customer = null] = await db.select().from(customers).where(eq(customers.id, order.customerId));

    return c.json({
      ...order,
      items: lines.map((l) => ({ ...l.orderItem, menuItem: l.menuItem })),
      customer,
    }, 200);
  });
}
