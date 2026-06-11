import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { canTransition } from "@ody/shared";
import { type Db } from "../db";
import { orders } from "../db/schema";
import { OrderSchema, OrderStatusSchema, ErrorSchema } from "./schemas";

const ParamsSchema = z.object({
  id: z.coerce.number().openapi({ param: { name: "id", in: "path", required: true } }),
});
const StatusBody = z.object({ status: OrderStatusSchema });

const patchStatusRoute = createRoute({
  method: "patch",
  path: "/orders/{id}/status",
  tags: ["orders"],
  request: {
    params: ParamsSchema,
    body: { content: { "application/json": { schema: StatusBody } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: OrderSchema } },
      description: "Statut mis à jour",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Commande non trouvée",
    },
    422: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Transition invalide",
    },
  },
});

export function registerOrdersStatusRoutes(app: OpenAPIHono, db: Db) {
  app.openapi(patchStatusRoute, async (c) => {
    const { id } = c.req.valid("param");
    const { status: nextStatus } = c.req.valid("json");

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return c.json({ error: "Commande non trouvée" }, 404);

    if (!canTransition(order.status, nextStatus)) {
      return c.json(
        { error: `Transition invalide : ${order.status} → ${nextStatus}` },
        422
      );
    }

    const [updated] = await db
      .update(orders)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    if (!updated) throw new Error("Échec de la mise à jour");
    return c.json(updated, 200);
  });
}
