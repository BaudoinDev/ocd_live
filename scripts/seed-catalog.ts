// Inserts the initial package catalog. Safe to re-run: existing packages, and any price edited since, are left untouched.
import { existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { packages as catalog } from "../lib/packages";
import { packages } from "../lib/db/schema";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL est absente.");

async function main(databaseUrl: string) {
  const db = drizzle(neon(databaseUrl));
  const inserted = await db.insert(packages)
    .values(catalog.map((offer, sortOrder) => ({ ...offer, features: [...offer.features], recommended: offer.recommended ?? false, sortOrder })))
    .onConflictDoNothing()
    .returning({ id: packages.id });
  console.log(`Forfaits ajoutés : ${inserted.length} sur ${catalog.length}.`);
}

main(url).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Échec de l’insertion du catalogue.");
  process.exit(1);
});
