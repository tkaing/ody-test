import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { eq, and, gte, lt, inArray } from "drizzle-orm";
import { type Db } from "../db";
import { orders, orderItems, menuItems } from "../db/schema";
import { OrderSchema, OrderStatusSchema, ErrorSchema } from "./schemas";

const QuerySchema = z.object({
  status: OrderStatusSchema.optional(),
  date: z.string().optional(),
});

const CreateOrderBody = z.object({
  customerId: z.number().int().positive(),
  total: z.number().int().positive(),
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

const listRoute = createRoute({
  method: "get",
  path: "/orders",
  tags: ["orders"],
  request: { query: QuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.array(OrderSchema) } },
      description: "Liste des commandes",
    },
  },
});

const createRoute_ = createRoute({
  method: "post",
  path: "/orders",
  tags: ["orders"],
  request: {
    body: { content: { "application/json": { schema: CreateOrderBody } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: OrderSchema } },
      description: "Commande créée",
    },
    422: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Règle métier violée",
    },
  },
});

export function registerOrdersRoutes(app: OpenAPIHono, db: Db) {
  app.openapi(listRoute, async (c) => {
    const { status, date } = c.req.valid("query");
    const conditions = [];
    if (status) conditions.push(eq(orders.status, status));
    if (date) {
      const day = new Date(date);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      conditions.push(gte(orders.createdAt, day));
      conditions.push(lt(orders.createdAt, next));
    }
    const rows = await db
      .select()
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orders.createdAt);
    return c.json(rows);
  });

  app.openapi(createRoute_, async (c) => {
    const { customerId, total, items } = c.req.valid("json");
    const menuItemIds = items.map((i) => i.menuItemId);

    if (new Set(menuItemIds).size !== menuItemIds.length) {
      return c.json({ error: "Items en double : fusionner les quantités avant envoi" }, 422);
    }

    const foundItems = await db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, menuItemIds));

    // Vérifier que tous les items existent
    if (foundItems.length !== menuItemIds.length) {
      return c.json({ error: "Un ou plusieurs items de menu sont introuvables" }, 422);
    }

    // Rejeter les items indisponibles
    const unavailable = foundItems.find((m) => !m.available);
    if (unavailable) {
      return c.json({ error: `L'item "${unavailable.name}" n'est pas disponible` }, 422);
    }

    const itemMap = new Map(foundItems.map((m) => [m.id, m]));

    // Vérifier le total server-side
    const computed = items.reduce((sum, line) => {
      const price = itemMap.get(line.menuItemId)?.price ?? 0;
      return sum + price * line.quantity;
    }, 0);

    if (computed !== total) {
      return c.json(
        { error: `Total incorrect : attendu ${String(computed)}, reçu ${String(total)}` },
        422
      );
    }

    const order = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values({ customerId, status: "pending", total })
        .returning();
      if (!newOrder) throw new Error("Échec de l'insertion de la commande");
      await tx.insert(orderItems).values(
        items.map((line) => ({
          orderId: newOrder.id,
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          unitPrice: itemMap.get(line.menuItemId)?.price ?? 0,
        }))
      );
      return newOrder;
    });

    return c.json(order, 201);
  });
}
