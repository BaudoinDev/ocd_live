import { getCatalog } from "@/lib/data/catalog";
import { PackageGrid } from "./package-grid";

/** Reads the prices managed from the admin area. */
export async function PackageCatalog({ compact = false }: { compact?: boolean }) {
  return <PackageGrid offers={await getCatalog()} compact={compact} />;
}
