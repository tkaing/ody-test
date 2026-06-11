import { pgTable, serial, integer, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { ORDER_STATUSES } from "@ody/types";

export const orderStatusEnum = pgEnum("order_status", ORDER_STATUSES);

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .references(() => menuCategories.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // centimes
  available: boolean("available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  total: integer("total").notNull(), // centimes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  menuItemId: integer("menu_item_id")
    .references(() => menuItems.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // snapshot au moment de la commande
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1).notNull(),
  restaurantName: text("restaurant_name").default("Mon Restaurant").notNull(),
  prepTime: integer("prep_time").default(15).notNull(), // minutes
  autoAccept: boolean("auto_accept").default(false).notNull(),
  isOpen: boolean("is_open").default(true).notNull(),
  openingHours: text("opening_hours").default("").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
