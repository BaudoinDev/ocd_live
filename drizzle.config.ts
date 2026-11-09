import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL est absente : renseignez-la dans .env.local.");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations use Neon's direct endpoint, not the connection pooler.
  dbCredentials: { url: url.replace("-pooler.", ".") },
  strict: true,
});
