import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { eq, sql, desc } from "drizzle-orm";
import { type Db } from "../db";
import { orders, orderItems, menuItems } from "../db/schema";

const SummarySchema = z.object({
  totalOrders: z.number(),
  revenue: z.number(),
  pendingCount: z.number(),
  popularItems: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      totalQuantity: z.number(),
    })
  ),
});

const summaryRoute = createRoute({
  method: "get",
  path: "/home/summary",
  tags: ["home"],
  responses: {
    200: {
      content: { "application/json": { schema: SummarySchema } },
      description: "KPIs du dashboard",
    },
  },
});

export function registerHomeRoutes(app: OpenAPIHono, db: Db) {
  app.openapi(summaryRoute, async (c) => {
    const [totals] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.total} else 0 end), 0)::int`,
        pendingCount: sql<number>`count(case when ${orders.status} = 'pending' then 1 end)::int`,
      })
      .from(orders);

    const popularItems = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        totalQuantity: sql<number>`sum(${orderItems.quantity})::int`,
      })
      .from(menuItems)
      .innerJoin(orderItems, eq(orderItems.menuItemId, menuItems.id))
      .groupBy(menuItems.id, menuItems.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5);

    return c.json({
      totalOrders: totals?.totalOrders ?? 0,
      revenue: totals?.revenue ?? 0,
      pendingCount: totals?.pendingCount ?? 0,
      popularItems,
    });
  });
}
