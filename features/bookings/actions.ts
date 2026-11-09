"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { databaseErrorCode, done, EXCLUSION_VIOLATION, failure, success, UNEXPECTED_ERROR, type ActionResult } from "@/lib/action-result";
import { sendManagerAlert } from "@/lib/alerts";
import { getCurrentUser } from "@/lib/auth/dal";
import { allSessionsEnded, validateBookingSessions } from "@/lib/booking-rules";
import { selectOccupiedSlots } from "@/lib/data/workspace";
import { db } from "@/lib/db";
import { bookings, bookingSessions, notifications, packages } from "@/lib/db/schema";
import { PAYMENT_METHODS } from "@/lib/payment";
import { consumeRateLimit } from "@/lib/rate-limit";
import type { BookingStatus } from "@/types/domain";

const SLOT_TAKEN = "Ce créneau vient d’être réservé par un autre client. Choisissez un autre horaire.";
const SESSION_EXPIRED = "Votre session a expiré. Reconnectez-vous.";

const bookingInput = z.object({
  packageId: z.string().min(1).max(60),
  mode: z.enum(["agency", "remote"]),
  // Recorded as chosen; by design, no payment is verified or taken.
  paymentMethod: z.enum(PAYMENT_METHODS),
  sessions: z.array(z.object({ date: z.string().max(10), startHour: z.number().int(), durationHours: z.number().int() })).min(1).max(31),
});

/** Readable by a person over the phone; omits look-alike characters. */
function newReference(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return `OCD-${[...randomBytes(8)].map((byte) => alphabet[byte % alphabet.length]).join("")}`;
}

export async function createBookingAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return failure(SESSION_EXPIRED);
  if (user.role !== "client") return failure("Utilisez un compte client pour réserver un live.");
  const parsed = bookingInput.safeParse(input);
  if (!parsed.success) return failure("Vérifiez le forfait, le mode de participation et les créneaux choisis.");
  const { packageId, mode, sessions, paymentMethod } = parsed.data;
  const id = newReference();
  try {
    if (!await consumeRateLimit(`booking:${user.id}`, 20, 3_600)) return failure("Trop de réservations en peu de temps. Réessayez plus tard ou contactez l’agence.");
    const [offer] = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
    if (!offer) return failure("Ce forfait n’existe plus. Choisissez un autre forfait.");
    // The price and durations come from the database, never from the browser.
    const invalid = validateBookingSessions(sessions, offer, await selectOccupiedSlots());
    if (invalid) return failure(invalid);
    await db.batch([
      db.insert(bookings).values({ id, userId: user.id, packageId: offer.id, packageName: offer.name, price: offer.price, durationHours: offer.durationHours, sessionCount: offer.sessionCount, mode, paymentMethod }),
      db.insert(bookingSessions).values(sessions.map((session) => ({ ...session, bookingId: id }))),
      db.insert(notifications).values({ bookingId: id, title: "Nouvelle réservation", message: `${user.business.companyName} souhaite réserver le forfait ${offer.name}.` }),
    ]);
    after(() => sendManagerAlert({ reference: id, packageName: offer.name, price: offer.price, mode, paymentMethod, sessions, client: user }));
  } catch (error) {
    // Two clients can pass the check above at once; the database constraint decides who gets the slot.
    return failure(databaseErrorCode(error) === EXCLUSION_VIOLATION ? SLOT_TAKEN : UNEXPECTED_ERROR);
  }
  revalidatePath("/", "layout");
  return success({ id });
}

const transitions: Record<BookingStatus, readonly BookingStatus[]> = { pending: ["confirmed", "cancelled"], confirmed: ["completed", "cancelled"], cancelled: [], completed: [] };
const statusInput = z.object({ id: z.string().min(1).max(60), status: z.enum(["confirmed", "cancelled", "completed"]) });

export async function updateBookingStatusAction(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return failure(SESSION_EXPIRED);
  const parsed = statusInput.safeParse(input);
  if (!parsed.success) return failure("Ce changement de statut n’est pas autorisé.");
  const { id, status } = parsed.data;
  try {
    const [booking] = await db.select({ userId: bookings.userId, status: bookings.status }).from(bookings).where(eq(bookings.id, id)).limit(1);
    // A client gets the same answer for another client's booking as for a missing one.
    if (!booking || (user.role !== "admin" && booking.userId !== user.id)) return failure("Cette réservation n’existe plus.");
    if (user.role !== "admin" && status !== "cancelled") return failure("Vous pouvez uniquement annuler vos propres réservations.");
    if (!transitions[booking.status].includes(status)) return failure("Ce changement de statut n’est pas autorisé.");
    if (status === "completed") {
      const sessions = await db.select({ date: bookingSessions.date, startHour: bookingSessions.startHour, durationHours: bookingSessions.durationHours }).from(bookingSessions).where(eq(bookingSessions.bookingId, id));
      if (!allSessionsEnded(sessions, Date.now())) return failure("Une réservation ne peut être terminée qu’après la fin de toutes ses séances.");
    }
    // Guarded on the status just read, so two simultaneous changes cannot both apply; both writes commit together.
    const [updated] = await db.batch([
      db.update(bookings).set({ status }).where(and(eq(bookings.id, id), eq(bookings.status, booking.status))).returning({ id: bookings.id }),
      db.update(bookingSessions).set({ occupiesSlot: sql`(select ${bookings.status} in ('pending', 'confirmed') from ${bookings} where ${bookings.id} = ${id})` }).where(eq(bookingSessions.bookingId, id)),
    ]);
    if (updated.length === 0) return failure("Cette réservation vient d’être modifiée. Actualisez la page.");
  } catch {
    return failure(UNEXPECTED_ERROR);
  }
  revalidatePath("/", "layout");
  return done;
}
