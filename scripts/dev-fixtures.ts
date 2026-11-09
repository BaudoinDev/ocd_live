// Fictional data for the development database and the end-to-end tests. Erases existing data: refuses to run unless explicitly allowed.
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { addDays, lomeToday } from "../lib/booking-rules";
import { hashPassword } from "../lib/auth/password";
import { packages as catalog } from "../lib/packages";
import { authSessions, bookingSessions, bookings, businessProfiles, notifications, packages, rateLimits, users } from "../lib/db/schema";

export const DEV_PASSWORD = "Test-OCD-Live-2026";
export const DEV_ADMIN_EMAIL = "admin@ocd-live.test";
export const DEV_CLIENT_EMAIL = "afi@ocd-live.test";
export const DEV_SECOND_CLIENT_EMAIL = "kossi@ocd-live.test";

type Status = "pending" | "confirmed" | "cancelled" | "completed";

export async function resetDevDatabase(): Promise<void> {
  if (process.env.OCD_ALLOW_DB_RESET !== "true" || process.env.NODE_ENV === "production") throw new Error("Remise à zéro refusée : définissez OCD_ALLOW_DB_RESET=true, uniquement sur une base de développement.");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL est absente.");
  const db = drizzle(neon(url));

  const today = lomeToday();
  const workday = (offset: number) => {
    const day = addDays(today, offset);
    return new Date(`${day}T12:00:00Z`).getUTCDay() === 0 ? addDays(day, 1) : day;
  };
  const passwordHash = await hashPassword(DEV_PASSWORD);
  const person = (firstName: string, lastName: string, email: string, companyName: string, sector: string) => ({ id: randomUUID(), firstName, lastName, email, companyName, sector });
  const afi = person("Afi", "Mensah", DEV_CLIENT_EMAIL, "Atelier Afi", "Mode & accessoires");
  const kossi = person("Kossi", "Amétépé", DEV_SECOND_CLIENT_EMAIL, "Saveurs du pays", "Alimentation");
  const akouvi = person("Akouvi", "Dossou", "akouvi@ocd-live.test", "Karité & Nature", "Beauté & bien-être");
  const sena = person("Sena", "Lawson", "sena@ocd-live.test", "Maison Sena", "Décoration");
  const clients = [afi, kossi, akouvi, sena];

  const booking = (id: string, owner: typeof afi, packageIndex: number, status: Status, offset: number, startHour: number) => {
    const offer = catalog[packageIndex];
    return {
      row: { id, userId: owner.id, packageId: offer.id, packageName: offer.name, price: offer.price, durationHours: offer.durationHours, sessionCount: offer.sessionCount, mode: packageIndex % 2 === 0 ? "agency" as const : "remote" as const, status, createdAt: new Date(`${addDays(today, Math.min(offset - 3, -1))}T10:00:00Z`) },
      sessions: Array.from({ length: offer.sessionCount }, (_, index) => ({ bookingId: id, date: workday(offset + index * 2), startHour, durationHours: offer.durationHours, occupiesSlot: status === "pending" || status === "confirmed" })),
      owner,
    };
  };
  const seeded = [
    booking("OCD-DEMO-001", afi, 0, "completed", -10, 10),
    booking("OCD-DEMO-002", afi, 1, "confirmed", 2, 9),
    booking("OCD-DEMO-003", afi, 3, "pending", 5, 15),
    booking("OCD-DEMO-004", afi, 0, "cancelled", -4, 14),
    booking("OCD-DEMO-005", kossi, 2, "confirmed", 3, 14),
    booking("OCD-DEMO-006", akouvi, 0, "pending", 1, 16),
    booking("OCD-DEMO-007", sena, 1, "completed", -6, 10),
  ];

  await db.execute(sql`truncate table ${notifications}, ${bookingSessions}, ${bookings}, ${businessProfiles}, ${authSessions}, ${users}, ${rateLimits}, ${packages}`);
  await db.batch([
    db.insert(packages).values(catalog.map((offer, sortOrder) => ({ ...offer, features: [...offer.features], recommended: offer.recommended ?? false, sortOrder }))),
    db.insert(users).values([
      ...clients.map(({ id, firstName, lastName, email }) => ({ id, role: "client" as const, firstName, lastName, email, phone: "+228 90 00 00 00", passwordHash })),
      { role: "admin" as const, firstName: "Équipe", lastName: "OCD", email: DEV_ADMIN_EMAIL, phone: "+228 90 00 00 01", passwordHash },
    ]),
    db.insert(businessProfiles).values(clients.map(({ id, companyName, sector }) => ({ userId: id, companyName, sector, country: "Togo", city: "Lomé", description: "Entreprise fictive pour les tests.", products: "Une sélection de produits locaux" }))),
    db.insert(bookings).values(seeded.map((item) => item.row)),
    db.insert(bookingSessions).values(seeded.flatMap((item) => item.sessions)),
    db.insert(notifications).values(seeded.filter((item) => item.row.status === "pending").map((item) => ({ bookingId: item.row.id, title: "Nouvelle réservation", message: `${item.owner.companyName} souhaite réserver le forfait ${item.row.packageName}.`, createdAt: item.row.createdAt }))),
  ]);
}
