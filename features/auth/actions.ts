"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { databaseErrorCode, done, failure, UNEXPECTED_ERROR, UNIQUE_VIOLATION, type ActionResult } from "@/lib/action-result";
import { safeNextPath } from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/dal";
import { burnPasswordCheck, hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { businessProfiles, users } from "@/lib/db/schema";
import { clearRateLimit, clientIp, consumeRateLimit } from "@/lib/rate-limit";
import { loginSchema, profileSchema, registrationSchema } from "./profile-schema";

const INVALID_CREDENTIALS = "E-mail ou mot de passe incorrect.";
const TOO_MANY_ATTEMPTS = "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
const EMAIL_TAKEN = "Un compte utilise déjà cette adresse e-mail.";
const WINDOW_15_MIN = 900, WINDOW_1_HOUR = 3_600;

const firstIssue = (error: { issues: { message: string }[] }) => error.issues[0]?.message ?? "Vérifiez les informations saisies.";

export async function loginAction(input: unknown, next: string | null): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return failure(INVALID_CREDENTIALS);
  const { email, password } = parsed.data;
  const emailKey = `login:email:${email}`;
  let destination: string;
  try {
    const ip = await clientIp();
    const allowed = await consumeRateLimit(emailKey, 8, WINDOW_15_MIN) && (!ip || await consumeRateLimit(`login:ip:${ip}`, 40, WINDOW_15_MIN));
    if (!allowed) return failure(TOO_MANY_ATTEMPTS);
    const [account] = await db.select({ id: users.id, role: users.role, passwordHash: users.passwordHash }).from(users).where(eq(sql`lower(${users.email})`, email)).limit(1);
    if (!account) {
      await burnPasswordCheck(password);
      return failure(INVALID_CREDENTIALS);
    }
    if (!await verifyPassword(password, account.passwordHash)) return failure(INVALID_CREDENTIALS);
    await clearRateLimit(emailKey);
    await createSession(account.id);
    destination = account.role === "admin" ? "/admin" : safeNextPath(next) ?? "/dashboard";
  } catch {
    return failure(UNEXPECTED_ERROR);
  }
  redirect(destination);
}

export async function registerAction(input: unknown, next: string | null): Promise<ActionResult> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return failure(firstIssue(parsed.error));
  const { password, firstName, lastName, email, phone, business } = parsed.data;
  try {
    const ip = await clientIp();
    if (ip && !await consumeRateLimit(`register:ip:${ip}`, 10, WINDOW_1_HOUR)) return failure(TOO_MANY_ATTEMPTS);
    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    // The role is never read from the request: public sign-up can only ever create clients.
    await db.batch([
      db.insert(users).values({ id, role: "client", firstName, lastName, email, phone, passwordHash }),
      db.insert(businessProfiles).values({ userId: id, ...business }),
    ]);
    await createSession(id);
  } catch (error) {
    return failure(databaseErrorCode(error) === UNIQUE_VIOLATION ? EMAIL_TAKEN : UNEXPECTED_ERROR);
  }
  redirect(safeNextPath(next) ?? "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/connexion");
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return failure("Votre session a expiré. Reconnectez-vous.");
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return failure(firstIssue(parsed.error));
  const { business, ...identity } = parsed.data;
  try {
    await db.batch([
      db.update(users).set(identity).where(eq(users.id, user.id)),
      db.insert(businessProfiles).values({ userId: user.id, ...business }).onConflictDoUpdate({ target: businessProfiles.userId, set: business }),
    ]);
  } catch (error) {
    return failure(databaseErrorCode(error) === UNIQUE_VIOLATION ? EMAIL_TAKEN : UNEXPECTED_ERROR);
  }
  revalidatePath("/", "layout");
  return done;
}
