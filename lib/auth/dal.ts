import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { authSessions, businessProfiles, users } from "@/lib/db/schema";
import type { User, UserRole } from "@/types/domain";
import { SESSION_COOKIE } from "./constants";
import { hashToken } from "./session";

// An explicit allowlist with no password hash: every User object built from it can safely reach the client.
export const userSelection = {
  id: users.id, role: users.role, firstName: users.firstName, lastName: users.lastName, email: users.email, phone: users.phone,
  business: {
    companyName: businessProfiles.companyName, country: businessProfiles.country, city: businessProfiles.city, sector: businessProfiles.sector,
    description: businessProfiles.description, products: businessProfiles.products, tiktok: businessProfiles.tiktok,
  },
};

type UserRow = Omit<User, "business"> & { business: User["business"] | null };
const emptyBusiness: User["business"] = { companyName: "", country: "", city: "", sector: "", description: "", products: "", tiktok: "" };

export const toUser = (row: UserRow): User => ({ ...row, business: row.business ?? emptyBusiness });

/** Resolves the session once per request. Always checked against the database, so a revoked session stops immediately. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db.select(userSelection).from(authSessions)
    .innerJoin(users, eq(users.id, authSessions.userId))
    .leftJoin(businessProfiles, eq(businessProfiles.userId, users.id))
    .where(and(eq(authSessions.tokenHash, hashToken(token)), gt(authSessions.expiresAt, sql`now()`)))
    .limit(1);
  return row ? toUser(row) : null;
});

/** For pages and layouts. */
export async function requireRole(role: UserRole): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.role !== role) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  return user;
}
