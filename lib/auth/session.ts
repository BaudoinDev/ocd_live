import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { authSessions } from "@/lib/db/schema";
import { SESSION_COOKIE } from "./constants";

const SESSION_DAYS = 14;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.batch([
    db.delete(authSessions).where(and(eq(authSessions.userId, userId), lt(authSessions.expiresAt, new Date()))),
    db.insert(authSessions).values({ tokenHash: hashToken(token), userId, expiresAt }),
  ]);
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(authSessions).where(eq(authSessions.tokenHash, hashToken(token)));
  store.delete(SESSION_COOKIE);
}
