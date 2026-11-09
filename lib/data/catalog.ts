import "server-only";
import { asc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { packages } from "@/lib/db/schema";
import type { PromotionPackage } from "@/lib/packages";

export const CATALOG_TAG = "packages";

const packageColumns = {
  id: packages.id, name: packages.name, price: packages.price, durationHours: packages.durationHours, sessionCount: packages.sessionCount,
  description: packages.description, features: packages.features, cadence: packages.cadence, recommended: packages.recommended,
};

export const selectPackages = () => db.select(packageColumns).from(packages).orderBy(asc(packages.sortOrder), asc(packages.name));

/** Public catalog, identical for every visitor, so it can be cached until an administrator edits a package. */
export async function getCatalog(): Promise<PromotionPackage[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  return selectPackages();
}
