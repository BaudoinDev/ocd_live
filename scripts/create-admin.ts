// Creates an administrator. There is deliberately no web page for this.
// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_FIRST_NAME=... ADMIN_LAST_NAME=... ADMIN_PHONE=... npm run db:create-admin
import { existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashPassword } from "../lib/auth/password";
import { users } from "../lib/db/schema";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

async function main() {
  const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_PHONE } = process.env;
  if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_FIRST_NAME || !ADMIN_LAST_NAME || !ADMIN_PHONE) throw new Error("Renseignez DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME et ADMIN_PHONE.");
  if (ADMIN_PASSWORD.length < 12) throw new Error("Le mot de passe administrateur doit contenir au moins 12 caractères.");
  await drizzle(neon(DATABASE_URL)).insert(users).values({ role: "admin", email: ADMIN_EMAIL.trim().toLowerCase(), firstName: ADMIN_FIRST_NAME, lastName: ADMIN_LAST_NAME, phone: ADMIN_PHONE, passwordHash: await hashPassword(ADMIN_PASSWORD) });
  console.log("Compte administrateur créé.");
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Échec de la création du compte."); process.exit(1); });
