"use server";

import { revalidatePath, updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { done, failure, UNEXPECTED_ERROR, type ActionResult } from "@/lib/action-result";
import { getCurrentUser } from "@/lib/auth/dal";
import { CATALOG_TAG } from "@/lib/data/catalog";
import { db } from "@/lib/db";
import { notifications, packages } from "@/lib/db/schema";

const FORBIDDEN = "Cette action est réservée à l’administration.";

const isAdmin = async () => (await getCurrentUser())?.role === "admin";

const packageInput = z.object({
  id: z.string().min(1).max(60),
  name: z.string().trim().min(2, "Renseignez le nom du forfait.").max(80),
  description: z.string().trim().min(5, "Renseignez la description du forfait.").max(300),
  cadence: z.string().trim().min(2, "Renseignez le rythme du forfait.").max(120),
  price: z.number().int("Le tarif doit être un montant entier.").positive("Le tarif doit être supérieur à zéro.").max(100_000_000, "Ce tarif est trop élevé."),
  durationHours: z.number().int().min(1, "La durée doit être comprise entre 1 et 10 heures.").max(10, "La durée doit être comprise entre 1 et 10 heures."),
  sessionCount: z.number().int().min(1, "Le nombre de séances doit être compris entre 1 et 31.").max(31, "Le nombre de séances doit être compris entre 1 et 31."),
  features: z.array(z.string().trim().min(1).max(200)).min(1, "Ajoutez au moins un avantage.").max(12, "Limitez-vous à 12 avantages."),
  recommended: z.boolean(),
});

export async function updatePackageAction(input: unknown): Promise<ActionResult> {
  if (!await isAdmin()) return failure(FORBIDDEN);
  const parsed = packageInput.safeParse(input);
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? "Vérifiez les champs du forfait.");
  const { id, ...values } = parsed.data;
  try {
    const save = db.update(packages).set(values).where(eq(packages.id, id)).returning({ id: packages.id });
    let saved: { id: string }[];
    if (values.recommended) {
      // Only one package carries the "recommended" badge.
      [, saved] = await db.batch([db.update(packages).set({ recommended: false }).where(and(ne(packages.id, id), eq(packages.recommended, true))), save]);
    } else {
      saved = await save;
    }
    if (saved.length === 0) return failure("Ce forfait n’existe plus.");
  } catch {
    return failure(UNEXPECTED_ERROR);
  }
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  return done;
}

export async function markNotificationReadAction(id: unknown): Promise<ActionResult> {
  if (!await isAdmin()) return failure(FORBIDDEN);
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure("Cette notification n’existe plus.");
  try {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, parsed.data));
  } catch {
    return failure(UNEXPECTED_ERROR);
  }
  revalidatePath("/", "layout");
  return done;
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  if (!await isAdmin()) return failure(FORBIDDEN);
  try {
    await db.update(notifications).set({ read: true }).where(eq(notifications.read, false));
  } catch {
    return failure(UNEXPECTED_ERROR);
  }
  revalidatePath("/", "layout");
  return done;
}
