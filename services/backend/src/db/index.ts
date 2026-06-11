import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export function createDb(url: string) {
  return drizzle(postgres(url, { max: 1 }), { schema });
}

export type Db = ReturnType<typeof createDb>;
