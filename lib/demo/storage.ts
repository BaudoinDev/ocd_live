import type { DemoState } from "@/types/demo";
import { isValidDay } from "./booking-rules";

export const DEMO_STORAGE_KEY = "ocd-live-demo-v1";
type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string";
const positiveInteger = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0;
const uniqueIds = (values: unknown[]) => values.every(record) && new Set(values.map((value) => (value as RecordValue).id)).size === values.length;

/** Validate persisted input before using it; invalid data remains untouched until an explicit reset. */
export function isDemoState(value: unknown): value is DemoState {
  if (!record(value) || value.version !== 1 || !Array.isArray(value.users) || !Array.isArray(value.packages) || !Array.isArray(value.bookings) || !Array.isArray(value.notifications)) return false;
  if (![value.users, value.packages, value.bookings, value.notifications].every(uniqueIds)) return false;
  if (!value.users.every((user: unknown) => record(user) && text(user.id) && (user.role === "client" || user.role === "admin") && ["firstName", "lastName", "email", "phone"].every((field) => text(user[field])) && record(user.business) && ["companyName", "country", "city", "sector", "description", "products", "tiktok"].every((field) => text((user.business as RecordValue)[field])))) return false;
  if (!value.packages.length || !value.packages.every((offer: unknown) => record(offer) && ["id", "name", "description", "cadence"].every((field) => text(offer[field])) && positiveInteger(offer.price) && positiveInteger(offer.durationHours) && offer.durationHours <= 10 && positiveInteger(offer.sessionCount) && offer.sessionCount <= 31 && Array.isArray(offer.features) && offer.features.every(text) && (offer.recommended === undefined || typeof offer.recommended === "boolean"))) return false;
  if (!value.bookings.every((booking: unknown) => record(booking) && ["id", "userId", "packageId", "packageName", "createdAt"].every((field) => text(booking[field])) && !Number.isNaN(Date.parse(booking.createdAt as string)) && positiveInteger(booking.price) && positiveInteger(booking.durationHours) && positiveInteger(booking.sessionCount) && ["agency", "remote"].includes(booking.mode as string) && ["pending", "confirmed", "completed", "cancelled"].includes(booking.status as string) && Array.isArray(booking.sessions) && booking.sessions.length === booking.sessionCount && uniqueIds(booking.sessions) && booking.sessions.every((session: unknown) => record(session) && text(session.id) && text(session.date) && isValidDay(session.date) && typeof session.startHour === "number" && Number.isInteger(session.startHour) && session.startHour >= 9 && positiveInteger(session.durationHours) && session.durationHours === booking.durationHours && session.startHour + session.durationHours <= 19))) return false;
  const userIds = new Set(value.users.map((user) => user.id));
  const bookingIds = new Set(value.bookings.map((booking) => booking.id));
  if (!value.bookings.every((booking) => userIds.has(booking.userId))) return false;
  if (!value.notifications.every((item: unknown) => record(item) && ["id", "bookingId", "title", "message", "createdAt"].every((field) => text(item[field])) && typeof item.read === "boolean" && !Number.isNaN(Date.parse(item.createdAt as string)) && bookingIds.has(item.bookingId))) return false;
  return value.sessionUserId === null || (text(value.sessionUserId) && userIds.has(value.sessionUserId));
}

export class LocalStorageDemoAdapter {
  constructor(private readonly storage: Pick<Storage, "getItem" | "setItem">) {}

  read(): DemoState | null {
    let raw: string | null;
    try { raw = this.storage.getItem(DEMO_STORAGE_KEY); }
    catch { throw new Error("Le stockage du navigateur est inaccessible. Autorisez le stockage local pour utiliser la démo."); }
    if (raw === null) return null;
    let parsed: unknown;
    try { parsed = JSON.parse(raw); }
    catch { throw new Error("Les données de démonstration sont illisibles. Réinitialisez la démo pour repartir avec les données fictives."); }
    if (!isDemoState(parsed)) throw new Error("Les données de démonstration sont incompatibles ou endommagées. Réinitialisez la démo pour continuer.");
    return parsed;
  }

  write(state: DemoState): void {
    try { this.storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state)); }
    catch { throw new Error("Enregistrement impossible dans ce navigateur. Aucune modification n’a été enregistrée. Vérifiez l’espace disponible et les autorisations de stockage."); }
  }
}
