import type { PromotionPackage } from "./packages";
import type { SessionSelection } from "../types/domain";

export const TIME_ZONE = "Africa/Lome";
export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 19;
/** How far ahead a session can be booked. */
export const MAX_ADVANCE_DAYS = 180;
/** The agency closes on Sundays. */
export const CLOSED_WEEKDAYS: readonly number[] = [0];

export function lomeToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isValidDay(day: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const parsed = new Date(`${day}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day;
}

export function addDays(day: string, offset: number): string {
  if (!isValidDay(day) || !Number.isInteger(offset)) throw new Error("Date invalide.");
  const value = new Date(`${day}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}

/** Shifts a "YYYY-MM" month by `offset` months. */
export function moveMonth(month: string, offset: number): string {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}

/** The 42 days (Monday first) that fill a month view. */
export function monthGridDays(month: string): string[] {
  const first = `${month}-01`;
  const start = addDays(first, -((new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function formatDate(day: string): string {
  if (!isValidDay(day)) return "Date invalide";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIME_ZONE, weekday: "short", day: "numeric", month: "short", year: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")} h`;
}

/** Absolute start instant of a session. Africa/Lome is UTC+0 all year, so the wall-clock hour maps to UTC. */
export function sessionStartsAt(session: SessionSelection): number {
  return Date.UTC(...dayParts(session.date), session.startHour);
}

/** Absolute end instant of a session (start + duration). */
export function sessionEndsAt(session: SessionSelection): number {
  return Date.UTC(...dayParts(session.date), session.startHour + session.durationHours);
}

/** A booking can be marked completed only once every one of its sessions has ended. */
export function allSessionsEnded(sessions: readonly SessionSelection[], now: number): boolean {
  return sessions.every((session) => sessionEndsAt(session) <= now);
}

function dayParts(day: string): [number, number, number] {
  const [year, month, date] = day.split("-").map(Number);
  return [year, month - 1, date];
}

export function sessionsOverlap(a: SessionSelection, b: SessionSelection): boolean {
  return a.date === b.date && a.startHour < b.startHour + b.durationHours && b.startHour < a.startHour + a.durationHours;
}

export function getAvailableStartHours(
  date: string,
  durationHours: number,
  occupied: readonly SessionSelection[],
  selected: readonly SessionSelection[] = [],
  now: Date = new Date(),
): number[] {
  if (!isValidDay(date) || !Number.isInteger(durationHours) || durationHours < 1 ||
      CLOSED_WEEKDAYS.includes(new Date(`${date}T12:00:00Z`).getUTCDay()) || date < lomeToday(now) || date > addDays(lomeToday(now), MAX_ADVANCE_DAYS)) return [];
  return Array.from({ length: Math.max(0, CLOSING_HOUR - OPENING_HOUR - durationHours + 1) }, (_, index) => OPENING_HOUR + index)
    .filter((startHour) => {
      // Africa/Lome currently uses UTC all year; Intl keeps the comparison tied to the declared zone.
      const candidate = { date, startHour, durationHours };
      const start = new Date(`${date}T${String(startHour).padStart(2, "0")}:00:00Z`);
      return start.getTime() > now.getTime() && ![...occupied, ...selected].some((session) => sessionsOverlap(candidate, session));
    });
}

export function validateBookingSessions(
  sessions: readonly SessionSelection[],
  offer: Pick<PromotionPackage, "sessionCount" | "durationHours">,
  occupied: readonly SessionSelection[],
  now: Date = new Date(),
): string | null {
  if (sessions.length !== offer.sessionCount) return `Sélectionnez exactement ${offer.sessionCount} séance${offer.sessionCount > 1 ? "s" : ""}.`;
  for (let index = 0; index < sessions.length; index++) {
    const session = sessions[index];
    if (!isValidDay(session.date)) return "Choisissez une date valide pour chaque séance.";
    if (!Number.isInteger(session.startHour) || session.durationHours !== offer.durationHours) return "La durée ou l’heure d’une séance ne correspond pas au forfait.";
    if (!getAvailableStartHours(session.date, offer.durationHours, occupied, sessions.slice(0, index), now).includes(session.startHour)) {
      return "Un créneau est passé, fermé ou déjà occupé. Choisissez un autre horaire (lundi à samedi, 9 h à 19 h, heure de Lomé).";
    }
  }
  return null;
}
