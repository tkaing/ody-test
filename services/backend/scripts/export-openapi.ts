import { writeFileSync } from "fs";
import { createDb } from "../src/db";
import { createApp } from "../src/app";

const db = createDb(process.env["DATABASE_URL"] ?? "postgresql://ody:ody_secret@localhost:5432/ody_db");
const app = createApp(db);

const spec = app.getOpenAPIDocument({
  openapi: "3.0.0",
  info: { title: "Ody API", version: "1.0.0" },
});

writeFileSync(new URL("../openapi.json", import.meta.url).pathname, JSON.stringify(spec, null, 2));
console.log("✓ openapi.json généré");
process.exit(0);
