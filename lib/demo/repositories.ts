import type { PromotionPackage } from "@/lib/packages";
import type { Booking, DemoState, Notification, User } from "@/types/demo";

/** Repository boundaries keep a future API/database adapter independent from the UI. */
export class UserRepository {
  constructor(private readonly state: DemoState) {}
  all(): User[] { return this.state.users; }
  findById(id: string): User | undefined { return this.state.users.find((user) => user.id === id); }
  findByEmail(email: string): User | undefined { return this.state.users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()); }
  save(user: User): void {
    const index = this.state.users.findIndex((item) => item.id === user.id);
    if (index === -1) this.state.users.push(user);
    else this.state.users[index] = user;
  }
}

export class BookingRepository {
  constructor(private readonly state: DemoState) {}
  all(): Booking[] { return this.state.bookings; }
  forUser(userId: string): Booking[] { return this.state.bookings.filter((booking) => booking.userId === userId); }
  findById(id: string): Booking | undefined { return this.state.bookings.find((booking) => booking.id === id); }
  save(booking: Booking): void {
    const index = this.state.bookings.findIndex((item) => item.id === booking.id);
    if (index === -1) this.state.bookings.unshift(booking);
    else this.state.bookings[index] = booking;
  }
}

export class PackageRepository {
  constructor(private readonly state: DemoState) {}
  all(): PromotionPackage[] { return this.state.packages; }
  findById(id: string): PromotionPackage | undefined { return this.state.packages.find((offer) => offer.id === id); }
  save(offer: PromotionPackage): void {
    const index = this.state.packages.findIndex((item) => item.id === offer.id);
    if (index === -1) throw new Error("Ce forfait n’existe plus.");
    this.state.packages[index] = offer;
  }
}

export class NotificationRepository {
  constructor(private readonly state: DemoState) {}
  all(): Notification[] { return this.state.notifications; }
  save(notification: Notification): void {
    const index = this.state.notifications.findIndex((item) => item.id === notification.id);
    if (index === -1) this.state.notifications.unshift(notification);
    else this.state.notifications[index] = notification;
  }
  markRead(id: string): void {
    const item = this.state.notifications.find((notification) => notification.id === id);
    if (!item) throw new Error("Cette notification n’existe plus.");
    item.read = true;
  }
  markAllRead(): void { this.state.notifications.forEach((notification) => { notification.read = true; }); }
}
