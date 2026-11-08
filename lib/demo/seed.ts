import { packages } from "@/lib/packages";
import type { Booking, BookingStatus, DemoState, User } from "@/types/demo";
import { addDays, lomeToday } from "./booking-rules";

function sampleUser(id: string, firstName: string, lastName: string, companyName: string, sector: string): User {
  return {
    id, role: id === "admin-demo" ? "admin" : "client", firstName, lastName,
    email: `${id}@example.test`, phone: "+228 90 00 00 00",
    business: { companyName, country: "Togo", city: "Lomé", sector, description: "Entreprise fictive de démonstration.", products: "Une sélection de produits locaux", tiktok: "" },
  };
}

export function createSeedState(now = new Date()): DemoState {
  const today = lomeToday(now);
  const workday = (offset: number) => {
    const day = addDays(today, offset);
    return new Date(`${day}T12:00:00Z`).getUTCDay() === 0 ? addDays(day, 1) : day;
  };
  const users = [
    sampleUser("client-demo", "Afi", "Mensah", "Atelier Afi", "Mode & accessoires"),
    sampleUser("client-2", "Kossi", "Amétépé", "Saveurs du pays", "Alimentation"),
    sampleUser("client-3", "Akouvi", "Dossou", "Karité & Nature", "Beauté & bien-être"),
    sampleUser("client-4", "Sena", "Lawson", "Maison Sena", "Décoration"),
    sampleUser("admin-demo", "Équipe", "OCD Live", "OCD Live", "Communication"),
  ];
  function booking(id: string, userId: string, packageIndex: number, status: BookingStatus, offset: number, startHour: number): Booking {
    const offer = packages[packageIndex];
    return {
      id, userId, packageId: offer.id, packageName: offer.name, price: offer.price,
      durationHours: offer.durationHours, sessionCount: offer.sessionCount,
      mode: packageIndex % 2 === 0 ? "agency" : "remote", status,
      sessions: Array.from({ length: offer.sessionCount }, (_, index) => ({ id: `${id}-s${index + 1}`, date: workday(offset + index * 2), startHour, durationHours: offer.durationHours })),
      createdAt: `${addDays(today, Math.min(offset - 3, -1))}T10:00:00.000Z`,
    };
  }
  const bookings = [
    booking("OCD-DEMO-001", "client-demo", 0, "completed", -10, 10),
    booking("OCD-DEMO-002", "client-demo", 1, "confirmed", 2, 9),
    booking("OCD-DEMO-003", "client-demo", 3, "pending", 5, 15),
    booking("OCD-DEMO-004", "client-demo", 0, "cancelled", -4, 14),
    booking("OCD-DEMO-005", "client-2", 2, "confirmed", 3, 14),
    booking("OCD-DEMO-006", "client-3", 0, "pending", 1, 16),
    booking("OCD-DEMO-007", "client-4", 1, "completed", -6, 10),
  ];
  return {
    version: 1, users, packages: packages.map((offer) => ({ ...offer, features: [...offer.features] })), bookings,
    notifications: bookings.filter((item) => item.status === "pending").map((item) => ({
      id: `notification-${item.id}`, bookingId: item.id, title: "Nouvelle réservation",
      message: `${users.find((user) => user.id === item.userId)?.business.companyName} souhaite réserver le forfait ${item.packageName}.`,
      read: false, createdAt: item.createdAt,
    })), sessionUserId: null,
  };
}
