import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { or, ilike, eq, inArray, desc, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { type Db } from "../db";
import { customers, orders } from "../db/schema";
import { CustomerSchema, CustomerWithStatsSchema } from "./schemas";

const customerInsert = createInsertSchema(customers, {
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });
const QuerySchema = z.object({ q: z.string().optional() });

const listRoute = createRoute({
  method: "get",
  path: "/customers",
  tags: ["customers"],
  request: { query: QuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.array(CustomerWithStatsSchema) } },
      description: "Liste des clients avec statistiques",
    },
  },
});

const createRoute_ = createRoute({
  method: "post",
  path: "/customers",
  tags: ["customers"],
  request: {
    body: { content: { "application/json": { schema: customerInsert } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: CustomerSchema } },
      description: "Client créé",
    },
  },
});

export function registerCustomersRoutes(app: OpenAPIHono, db: Db) {
  app.openapi(listRoute, async (c) => {
    const { q } = c.req.valid("query");

    const customerStats = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        orderCount: sql<number>`count(${orders.id})::int`,
        totalSpend: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
      })
      .from(customers)
      .leftJoin(orders, eq(orders.customerId, customers.id))
      .where(
        q
          ? or(ilike(customers.name, `%${q}%`), ilike(customers.email, `%${q}%`))
          : undefined
      )
      .groupBy(
        customers.id,
        customers.name,
        customers.email,
        customers.phone,
        customers.createdAt,
        customers.updatedAt
      )
      .orderBy(customers.name);

    if (customerStats.length === 0) return c.json([]);

    const customerIds = customerStats.map((c) => c.id);
    const allRecentOrders = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(inArray(orders.customerId, customerIds))
      .orderBy(desc(orders.createdAt));

    const ordersByCustomer = new Map<number, typeof allRecentOrders>();
    for (const order of allRecentOrders) {
      const list = ordersByCustomer.get(order.customerId) ?? [];
      if (list.length < 3) {
        list.push(order);
        ordersByCustomer.set(order.customerId, list);
      }
    }

    const result = customerStats.map((customer) => ({
      ...customer,
      recentOrders: ordersByCustomer.get(customer.id) ?? [],
    }));

    return c.json(result);
  });

  app.openapi(createRoute_, async (c) => {
    const body = c.req.valid("json");
    const [row] = await db.insert(customers).values(body).returning();
    if (!row) throw new Error("Échec de l'insertion");
    return c.json(row, 201);
  });
}
