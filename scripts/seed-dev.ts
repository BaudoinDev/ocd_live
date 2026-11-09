import { existsSync } from "node:fs";
import { resetDevDatabase } from "./dev-fixtures";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

resetDevDatabase()
  .then(() => console.log("Base de développement réinitialisée."))
  .catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Échec de la réinitialisation."); process.exit(1); });
