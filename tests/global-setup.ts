import { existsSync } from "node:fs";
import { resetDevDatabase } from "../scripts/dev-fixtures";

/** Every run starts from the same data. `resetDevDatabase` refuses to run without OCD_ALLOW_DB_RESET=true. */
export default async function globalSetup() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  await resetDevDatabase();
}
