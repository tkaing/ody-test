import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { type Db } from "../db";
import { settings } from "../db/schema";
import { SettingsSchema, ErrorSchema } from "./schemas";

const settingsPatch = z.object({
  restaurantName: z.string().min(1).optional(),
  prepTime: z.number().int().positive().optional(),
  autoAccept: z.boolean().optional(),
  isOpen: z.boolean().optional(),
  openingHours: z.string().optional(),
});

const getRoute = createRoute({
  method: "get",
  path: "/settings",
  tags: ["settings"],
  responses: {
    200: {
      content: { "application/json": { schema: SettingsSchema } },
      description: "Paramètres du restaurant",
    },
  },
});

const patchRoute = createRoute({
  method: "patch",
  path: "/settings",
  tags: ["settings"],
  request: {
    body: { content: { "application/json": { schema: settingsPatch } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: SettingsSchema } },
      description: "Paramètres mis à jour",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Corps invalide",
    },
  },
});

export function registerSettingsRoutes(app: OpenAPIHono, db: Db) {
  app.openapi(getRoute, async (c) => {
    await db.insert(settings).values({ id: 1 }).onConflictDoNothing();
    const [row] = await db.select().from(settings).where(eq(settings.id, 1));
    if (!row) throw new Error("Settings introuvables");
    return c.json(row);
  });

  app.openapi(patchRoute, async (c) => {
    const body = c.req.valid("json");
    const [updated] = await db
      .insert(settings)
      .values({ id: 1, ...body, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.id,
        set: { ...body, updatedAt: new Date() },
      })
      .returning();
    if (!updated) throw new Error("Échec de la mise à jour");
    return c.json(updated, 200);
  });
}
