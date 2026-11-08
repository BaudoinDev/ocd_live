import { expect, test } from "@playwright/test";
import { packages } from "../lib/packages";
import { addDays, getAvailableStartHours, lomeToday, validateBookingSessions } from "../lib/demo/booking-rules";
import { createSeedState } from "../lib/demo/seed";
import { DEMO_STORAGE_KEY, isDemoState, LocalStorageDemoAdapter } from "../lib/demo/storage";
import type { Booking, SessionSelection } from "../types/demo";

const now = new Date("2030-01-07T08:30:00Z"); // Monday in Lomé.
const date = "2030-01-08";
const selection = (startHour: number, durationHours = 1, day = date): SessionSelection => ({ date: day, startHour, durationHours });
const occupied = (status: Booking["status"] = "confirmed", startHour = 11, durationHours = 3): Booking => ({
  id: "test-booking", userId: "client-demo", packageId: "boost", packageName: "Boost", price: 25000,
  durationHours, sessionCount: 1, mode: "agency", status, createdAt: now.toISOString(),
  sessions: [{ ...selection(startHour, durationHours), id: "session-1" }],
});

test("a full duration must fit before the 19 h closing time", () => {
  expect(getAvailableStartHours(date, 5, [], [], now)).toEqual([9, 10, 11, 12, 13, 14]);
  expect(getAvailableStartHours(date, 10, [], [], now)).toEqual([9]);
  expect(getAvailableStartHours(date, 11, [], [], now)).toEqual([]);
  expect(validateBookingSessions([selection(14, 5)], packages[2], [], now)).toBeNull();
  expect(validateBookingSessions([selection(15, 5)], packages[2], [], now)).toMatch(/créneau/);
});

test("adjacent sessions are allowed; every occupied hour blocks intersecting sessions", () => {
  expect(getAvailableStartHours(date, 1, [occupied()], [], now)).toEqual([9, 10, 14, 15, 16, 17, 18]);
  expect(getAvailableStartHours(date, 3, [occupied()], [], now)).toEqual([14, 15, 16]);
  expect(getAvailableStartHours(date, 3, [occupied("confirmed", 12, 3)], [], now)).toContain(9);
});

test("pending bookings occupy their full duration and cancellations release it", () => {
  expect(getAvailableStartHours(date, 1, [occupied("pending")], [], now)).not.toContain(12);
  expect(getAvailableStartHours(date, 3, [occupied("cancelled")], [], now)).toContain(12);
  expect(getAvailableStartHours(date, 1, [occupied("completed")], [], now)).toContain(12);
});

test("past dates and already elapsed starts cannot be selected", () => {
  expect(getAvailableStartHours("2030-01-05", 1, [], [], now)).toEqual([]);
  expect(getAvailableStartHours("2030-01-07", 1, [], [], new Date("2030-01-07T11:30:00Z"))).toEqual([12, 13, 14, 15, 16, 17, 18]);
  expect(getAvailableStartHours("2030-01-07", 1, [], [], new Date("2030-01-07T12:00:00Z"))).not.toContain(12);
});

test("Sunday closure, malformed dates and invalid durations have no slots", () => {
  for (const invalid of ["2030-01-13", "2030-02-30", "not-a-date"]) expect(getAvailableStartHours(invalid, 1, [], [], now)).toEqual([]);
  for (const invalid of [0, -1, 1.5, Number.NaN, Infinity]) expect(getAvailableStartHours(date, invalid, [], [], now)).toEqual([]);
});

test("a multi-session offer requires exactly its session count", () => {
  const offer = packages[3];
  expect(validateBookingSessions([selection(9), selection(10)], offer, [], now)).toMatch(/exactement 3/);
  expect(validateBookingSessions([selection(9), selection(10), selection(11)], offer, [], now)).toBeNull();
});

test("sessions selected together cannot overlap or duplicate", () => {
  const offer = { ...packages[3], durationHours: 3 };
  expect(validateBookingSessions([selection(9, 3), selection(11, 3), selection(15, 3)], offer, [], now)).toMatch(/créneau/);
  expect(validateBookingSessions([selection(9, 3), selection(9, 3), selection(15, 3)], offer, [], now)).toMatch(/créneau/);
  expect(validateBookingSessions([selection(9, 3), selection(12, 3), selection(15, 3)], offer, [], now)).toBeNull();
  expect(getAvailableStartHours(date, 1, [], [selection(10, 3)], now)).toEqual([9, 13, 14, 15, 16, 17, 18]);
});

test("each session uses the package duration snapshot", () => {
  expect(validateBookingSessions([selection(10, 1)], packages[1], [], now)).toMatch(/durée/);
  expect(validateBookingSessions([selection(10.5, 3)], packages[1], [], now)).toMatch(/durée/);
});

test("Lomé date helpers remain independent of the browser timezone", () => {
  expect(lomeToday(new Date("2030-01-07T00:01:00Z"))).toBe("2030-01-07");
  expect(addDays("2030-01-31", 1)).toBe("2030-02-01");
  expect(addDays("2032-02-28", 1)).toBe("2032-02-29");
  expect(() => addDays("2030-02-30", 1)).toThrow();
});

test("seed data passes persistence validation on any weekday without active overlaps", () => {
  for (let offset = 0; offset < 7; offset++) {
    const seed = createSeedState(new Date(`${addDays("2030-01-07", offset)}T08:30:00Z`));
    expect(isDemoState(seed)).toBe(true);
    const active = seed.bookings.filter((booking) => ["pending", "confirmed"].includes(booking.status));
    for (const booking of active) {
      expect(validateBookingSessions(booking.sessions, seed.packages.find((offer) => offer.id === booking.packageId)!, active.filter((other) => other.id !== booking.id), new Date(`${addDays("2030-01-07", offset)}T08:30:00Z`))).toBeNull();
    }
  }
});

test("corrupt persisted data is reported and preserved for an explicit reset", () => {
  const values = new Map([[DEMO_STORAGE_KEY, "{invalid json"]]);
  const adapter = new LocalStorageDemoAdapter({ getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } });
  expect(() => adapter.read()).toThrow(/Réinitialisez/);
  expect(values.get(DEMO_STORAGE_KEY)).toBe("{invalid json");
  const seed = createSeedState(now);
  adapter.write(seed);
  expect(adapter.read()).toEqual(seed);
  values.set(DEMO_STORAGE_KEY, JSON.stringify({ ...seed, bookings: [{ id: "invalid" }] }));
  expect(() => adapter.read()).toThrow(/endommagées/);
});

test("storage write errors cannot report a successful save", () => {
  const adapter = new LocalStorageDemoAdapter({ getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); } });
  expect(() => adapter.write(createSeedState(now))).toThrow(/Aucune modification n’a été enregistrée/);
});
