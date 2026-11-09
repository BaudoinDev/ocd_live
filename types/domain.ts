import type { PromotionPackage } from "@/lib/packages";

export type UserRole = "client" | "admin";
export type ParticipationMode = "agency" | "remote";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type Package = PromotionPackage;

export interface BusinessProfile {
  companyName: string;
  country: string;
  city: string;
  sector: string;
  description: string;
  products: string;
  tiktok: string;
}
export interface ProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  business: BusinessProfile;
}
export interface User extends ProfileInput {
  id: string;
  role: UserRole;
}
export interface SessionSelection {
  date: string;
  startHour: number;
  durationHours: number;
}
export interface BookingSession extends SessionSelection { id: string; }
export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  price: number;
  durationHours: number;
  sessionCount: number;
  mode: ParticipationMode;
  status: BookingStatus;
  sessions: BookingSession[];
  createdAt: string;
}
export interface Notification {
  id: string;
  bookingId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
/** What the server sends to a signed-in browser. A client's copy only ever holds that client's own rows. */
export interface WorkspaceState {
  users: User[];
  packages: PromotionPackage[];
  bookings: Booking[];
  notifications: Notification[];
  /** Upcoming occupied slots, anonymous, used to show availability. */
  occupied: SessionSelection[];
}
