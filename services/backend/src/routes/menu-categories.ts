import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { eq, and } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { type Db } from "../db";
import { menuCategories, menuItems } from "../db/schema";
import { MenuCategorySchema, ErrorSchema } from "./schemas";

const categoryInsert = createInsertSchema(menuCategories, {
  name: z.string().min(1),
}).omit({ id: true, createdAt: true, updatedAt: true });
const categoryPatch = categoryInsert.partial();
const ParamsSchema = z.object({
  id: z.coerce.number().openapi({ param: { name: "id", in: "path", required: true } }),
});

const listRoute = createRoute({
  method: "get",
  path: "/menu-categories",
  tags: ["menu-categories"],
  responses: {
    200: {
      content: { "application/json": { schema: z.array(MenuCategorySchema) } },
      description: "Liste des catégories",
    },
  },
});

const createRoute_ = createRoute({
  method: "post",
  path: "/menu-categories",
  tags: ["menu-categories"],
  request: {
    body: { content: { "application/json": { schema: categoryInsert } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: MenuCategorySchema } },
      description: "Catégorie créée",
    },
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/menu-categories/{id}",
  tags: ["menu-categories"],
  request: {
    params: ParamsSchema,
    body: { content: { "application/json": { schema: categoryPatch } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: MenuCategorySchema } },
      description: "Catégorie mise à jour",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Non trouvée",
    },
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/menu-categories/{id}",
  tags: ["menu-categories"],
  request: { params: ParamsSchema },
  responses: {
    204: { description: "Supprimée" },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Non trouvée",
    },
    422: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Catégorie contient des items actifs",
    },
  },
});

export function registerMenuCategoriesRoutes(app: OpenAPIHono, db: Db) {
  app.openapi(listRoute, async (c) => {
    const rows = await db.select().from(menuCategories);
    return c.json(rows);
  });

  app.openapi(createRoute_, async (c) => {
    const body = c.req.valid("json");
    const [row] = await db.insert(menuCategories).values(body).returning();
    if (!row) throw new Error("Échec de l'insertion");
    return c.json(row, 201);
  });

  app.openapi(patchRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const [row] = await db
      .update(menuCategories)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(menuCategories.id, id))
      .returning();
    if (!row) return c.json({ error: "Catégorie non trouvée" }, 404);
    return c.json(row, 200);
  });

  app.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid("param");
    const activeItems = await db
      .select({ id: menuItems.id })
      .from(menuItems)
      .where(and(eq(menuItems.categoryId, id), eq(menuItems.available, true)));
    if (activeItems.length > 0) {
      return c.json(
        { error: `Impossible de supprimer : ${String(activeItems.length)} item(s) actif(s) dans cette catégorie` },
        422
      );
    }
    const [row] = await db.delete(menuCategories).where(eq(menuCategories.id, id)).returning();
    if (!row) return c.json({ error: "Catégorie non trouvée" }, 404);
    return new Response(null, { status: 204 });
  });
}
