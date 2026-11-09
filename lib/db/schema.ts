import { sql } from "drizzle-orm";
import { boolean, check, date, index, integer, pgEnum, pgTable, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["client", "admin"]);
export const participationMode = pgEnum("participation_mode", ["agency", "remote"]);
export const bookingStatus = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "completed"]);

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  role: userRole().notNull().default("client"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("users_email_unique").on(sql`lower(${table.email})`)]);

export const businessProfiles = pgTable("business_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  country: text().notNull(),
  city: text().notNull(),
  sector: text().notNull(),
  description: text().notNull(),
  products: text().notNull(),
  tiktok: text().notNull().default(""),
});

/** Only a SHA-256 of the cookie token is stored: a database leak cannot be replayed as a session. */
export const authSessions = pgTable("auth_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("auth_sessions_user_idx").on(table.userId), index("auth_sessions_expiry_idx").on(table.expiresAt)]);

export const packages = pgTable("packages", {
  id: text().primaryKey(),
  name: text().notNull(),
  price: integer().notNull(),
  durationHours: smallint("duration_hours").notNull(),
  sessionCount: smallint("session_count").notNull(),
  description: text().notNull(),
  features: text().array().notNull(),
  cadence: text().notNull(),
  recommended: boolean().notNull().default(false),
  sortOrder: smallint("sort_order").notNull().default(0),
}, (table) => [
  check("packages_price_positive", sql`${table.price} > 0`),
  check("packages_duration_range", sql`${table.durationHours} between 1 and 10`),
  check("packages_session_count_range", sql`${table.sessionCount} between 1 and 31`),
]);

/** Price, name and durations are snapshots: editing a package never rewrites past bookings. */
export const bookings = pgTable("bookings", {
  id: text().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  packageId: text("package_id").notNull().references(() => packages.id, { onDelete: "restrict" }),
  packageName: text("package_name").notNull(),
  price: integer().notNull(),
  durationHours: smallint("duration_hours").notNull(),
  sessionCount: smallint("session_count").notNull(),
  mode: participationMode().notNull(),
  status: bookingStatus().notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("bookings_user_idx").on(table.userId),
  index("bookings_status_idx").on(table.status),
  index("bookings_created_at_idx").on(table.createdAt.desc()),
  check("bookings_price_positive", sql`${table.price} > 0`),
]);

/**
 * `occupiesSlot` mirrors "booking is pending or confirmed". An exclusion constraint can only read its
 * own row, so this flag is what lets the database refuse overlaps (see migration 0001).
 */
export const bookingSessions = pgTable("booking_sessions", {
  id: uuid().primaryKey().defaultRandom(),
  bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  date: date({ mode: "string" }).notNull(),
  startHour: smallint("start_hour").notNull(),
  durationHours: smallint("duration_hours").notNull(),
  occupiesSlot: boolean("occupies_slot").notNull().default(true),
}, (table) => [
  index("booking_sessions_booking_idx").on(table.bookingId),
  check("booking_sessions_opening_hours", sql`${table.startHour} >= 9 and ${table.durationHours} >= 1 and ${table.startHour} + ${table.durationHours} <= 19`),
]);

export const notifications = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  title: text().notNull(),
  message: text().notNull(),
  read: boolean().notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("notifications_unread_idx").on(table.createdAt.desc()).where(sql`not ${table.read}`)]);
