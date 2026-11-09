import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL est absente : renseignez-la dans .env.local ou dans l’environnement de déploiement.");

/** HTTP driver: atomic multi-statement writes go through `db.batch([...])`. */
export const db = drizzle(neon(url), { schema });
