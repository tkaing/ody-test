import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { type Db } from "./db";
import { registerSettingsRoutes } from "./routes/settings";
import { registerMenuCategoriesRoutes } from "./routes/menu-categories";
import { registerMenuItemsRoutes } from "./routes/menu-items";
import { registerCustomersRoutes } from "./routes/customers";
import { registerOrdersRoutes } from "./routes/orders";
import { registerOrdersIdRoutes } from "./routes/orders-id";
import { registerOrdersStatusRoutes } from "./routes/orders-status";
import { registerHomeRoutes } from "./routes/home";

export function createApp(db: Db) {
  const app = new OpenAPIHono();

  app.use("/*", cors());

  registerSettingsRoutes(app, db);
  registerMenuCategoriesRoutes(app, db);
  registerMenuItemsRoutes(app, db);
  registerCustomersRoutes(app, db);
  registerOrdersRoutes(app, db);
  registerOrdersIdRoutes(app, db);
  registerOrdersStatusRoutes(app, db);
  registerHomeRoutes(app, db);

  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: { title: "Ody API", version: "1.0.0" },
  });

  return app;
}
