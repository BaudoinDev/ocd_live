import "server-only";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { toUser, userSelection } from "@/lib/auth/dal";
import { TIME_ZONE } from "@/lib/booking-rules";
import { db } from "@/lib/db";
import { bookingSessions, bookings, businessProfiles, notifications, users } from "@/lib/db/schema";
import type { Booking, BookingSession, Notification, SessionSelection, User, WorkspaceState } from "@/types/domain";
import { selectPackages } from "./catalog";

/** Upcoming slots taken by anyone, without any identity: the only cross-client data a client ever receives. */
export function selectOccupiedSlots(): Promise<SessionSelection[]> {
  return db.select({ date: bookingSessions.date, startHour: bookingSessions.startHour, durationHours: bookingSessions.durationHours })
    .from(bookingSessions)
    .where(and(eq(bookingSessions.occupiesSlot, true), gte(bookingSessions.date, sql`(now() at time zone ${TIME_ZONE})::date`)));
}

const sessionColumns = { bookingId: bookingSessions.bookingId, id: bookingSessions.id, date: bookingSessions.date, startHour: bookingSessions.startHour, durationHours: bookingSessions.durationHours };

type BookingRow = Omit<Booking, "sessions" | "createdAt"> & { createdAt: Date };

function assemble(rows: BookingRow[], sessions: (BookingSession & { bookingId: string })[]): Booking[] {
  const byBooking = Map.groupBy(sessions, (session) => session.bookingId);
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    sessions: (byBooking.get(row.id) ?? []).map(({ id, date, startHour, durationHours }) => ({ id, date, startHour, durationHours })),
  }));
}

async function clientState(user: User): Promise<WorkspaceState> {
  const [packages, rows, sessions, occupied] = await Promise.all([
    selectPackages(),
    db.select().from(bookings).where(eq(bookings.userId, user.id)).orderBy(desc(bookings.createdAt)),
    db.select(sessionColumns).from(bookingSessions).innerJoin(bookings, eq(bookings.id, bookingSessions.bookingId)).where(eq(bookings.userId, user.id)),
    selectOccupiedSlots(),
  ]);
  return { users: [user], packages, bookings: assemble(rows, sessions), notifications: [], occupied };
}

async function adminState(): Promise<WorkspaceState> {
  const [packages, userRows, rows, sessions, alerts, occupied] = await Promise.all([
    selectPackages(),
    db.select(userSelection).from(users).leftJoin(businessProfiles, eq(businessProfiles.userId, users.id)).orderBy(desc(users.createdAt)),
    db.select().from(bookings).orderBy(desc(bookings.createdAt)),
    db.select(sessionColumns).from(bookingSessions),
    db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(200),
    selectOccupiedSlots(),
  ]);
  const toNotification = ({ createdAt, ...rest }: (typeof alerts)[number]): Notification => ({ ...rest, createdAt: createdAt.toISOString() });
  return { users: userRows.map(toUser), packages, bookings: assemble(rows, sessions), notifications: alerts.map(toNotification), occupied };
}

/** The role decides the data set: a client's payload is built only from that client's own rows. */
export function loadWorkspaceState(user: User): Promise<WorkspaceState> {
  return user.role === "admin" ? adminState() : clientState(user);
}
