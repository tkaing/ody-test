import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "../../src/db/schema";
import { createApp } from "../../src/app";

const TEST_DB_URL =
  process.env["DATABASE_URL"] ?? "postgresql://ody:ody_secret@localhost:5432/ody_db";

const client = postgres(TEST_DB_URL, { max: 1 });
export const testDb = drizzle(client, { schema });
export const testApp = createApp(testDb as any);

export async function truncateAll() {
  await testDb.execute(
    sql`TRUNCATE TABLE order_items, orders, customers, menu_items, menu_categories, settings RESTART IDENTITY CASCADE`
  );
}

export async function closeDb() {
  await client.end();
}
