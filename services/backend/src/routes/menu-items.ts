import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { type Db } from "../db";
import { menuItems } from "../db/schema";
import { MenuItemSchema, ErrorSchema } from "./schemas";

const itemInsert = createInsertSchema(menuItems, {
  name: z.string().min(1),
  price: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  available: z.boolean().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });
const itemPatch = itemInsert.partial();
const ParamsSchema = z.object({
  id: z.coerce.number().openapi({ param: { name: "id", in: "path", required: true } }),
});
const QuerySchema = z.object({
  categoryId: z.coerce.number().optional(),
  available: z.enum(["true", "false"]).optional(),
});

const listRoute = createRoute({
  method: "get",
  path: "/menu-items",
  tags: ["menu-items"],
  request: { query: QuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.array(MenuItemSchema) } },
      description: "Liste des items",
    },
  },
});

const createRoute_ = createRoute({
  method: "post",
  path: "/menu-items",
  tags: ["menu-items"],
  request: {
    body: { content: { "application/json": { schema: itemInsert } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: MenuItemSchema } },
      description: "Item créé",
    },
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/menu-items/{id}",
  tags: ["menu-items"],
  request: {
    params: ParamsSchema,
    body: { content: { "application/json": { schema: itemPatch } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: MenuItemSchema } },
      description: "Item mis à jour",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Non trouvé",
    },
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/menu-items/{id}",
  tags: ["menu-items"],
  request: { params: ParamsSchema },
  responses: {
    204: { description: "Supprimé" },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Non trouvé",
    },
  },
});

export function registerMenuItemsRoutes(app: OpenAPIHono, db: Db) {
  app.openapi(listRoute, async (c) => {
    const { categoryId, available } = c.req.valid("query");
    const conditions = [];
    if (categoryId !== undefined) conditions.push(eq(menuItems.categoryId, categoryId));
    if (available !== undefined) conditions.push(eq(menuItems.available, available === "true"));
    const rows = await db
      .select()
      .from(menuItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    return c.json(rows);
  });

  app.openapi(createRoute_, async (c) => {
    const body = c.req.valid("json");
    const [row] = await db.insert(menuItems).values(body).returning();
    if (!row) throw new Error("Échec de l'insertion");
    return c.json(row, 201);
  });

  app.openapi(patchRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const [row] = await db
      .update(menuItems)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    if (!row) return c.json({ error: "Item non trouvé" }, 404);
    return c.json(row, 200);
  });

  app.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid("param");
    const [row] = await db.delete(menuItems).where(eq(menuItems.id, id)).returning();
    if (!row) return c.json({ error: "Item non trouvé" }, 404);
    return new Response(null, { status: 204 });
  });
}
