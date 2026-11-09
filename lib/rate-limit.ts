import "server-only";
import { createHash } from "node:crypto";
import { eq, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";

const digest = (key: string) => createHash("sha256").update(key).digest("hex");

/** Atomically counts one attempt. Returns false once `max` attempts were used in the current window. */
export async function consumeRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const expired = sql`${rateLimits.windowStartedAt} < now() - make_interval(secs => ${windowSeconds})`;
  const [row] = await db.insert(rateLimits).values({ key: digest(key), count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
        windowStartedAt: sql`case when ${expired} then now() else ${rateLimits.windowStartedAt} end`,
      },
    })
    .returning({ count: rateLimits.count });
  // Occasional housekeeping keeps the table small without a scheduled job.
  if (Math.random() < 0.02) await db.delete(rateLimits).where(lt(rateLimits.windowStartedAt, sql`now() - interval '2 days'`));
  return row.count <= max;
}

export async function clearRateLimit(key: string): Promise<void> {
  await db.delete(rateLimits).where(eq(rateLimits.key, digest(key)));
}

/** The client IP behind Vercel's proxy, or null outside production, where the header is not trustworthy. */
export async function clientIp(): Promise<string | null> {
  if (process.env.NODE_ENV !== "production") return null;
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}
