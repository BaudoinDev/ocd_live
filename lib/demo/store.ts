import { packages, type PromotionPackage } from "@/lib/packages";
import type { Booking, BookingStatus, CreateBookingInput, DemoState, ProfileInput, User, UserRole } from "@/types/demo";
import { allSessionsEnded, validateBookingSessions } from "./booking-rules";
import { BookingRepository, NotificationRepository, PackageRepository, UserRepository } from "./repositories";
import { createSeedState } from "./seed";
import { DEMO_STORAGE_KEY, LocalStorageDemoAdapter } from "./storage";

export interface DemoActions {
  login(role: UserRole): User;
  loginByEmail(email: string): User;
  register(input: ProfileInput): User;
  logout(): void;
  updateProfile(input: ProfileInput): void;
  createBooking(input: CreateBookingInput): Booking;
  updateBookingStatus(id: string, status: BookingStatus): void;
  updatePackage(offer: PromotionPackage): void;
  markNotificationRead(id: string): void;
  markAllNotificationsRead(): void;
  resetDemo(): void;
}

export interface DemoSnapshot { state: DemoState; ready: boolean; error: string | null }
// No browser access or variable dates during SSR or the first client render.
const initialSnapshot: DemoSnapshot = {
  state: { version: 1, users: [], packages: packages.map((offer) => ({ ...offer, features: [...offer.features] })), bookings: [], notifications: [], sessionUserId: null },
  ready: false, error: null,
};

function normalizeProfile(input: ProfileInput): ProfileInput {
  const firstName = input.firstName.trim(), lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase(), phone = input.phone.trim();
  if (!firstName || !lastName) throw new Error("Renseignez votre prénom et votre nom.");
  if (firstName.length > 80 || lastName.length > 80) throw new Error("Le prénom et le nom sont limités à 80 caractères.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Renseignez une adresse e-mail valide.");
  if (phone.replace(/\D/g, "").length < 6) throw new Error("Renseignez un numéro de téléphone valide.");
  const business = Object.fromEntries(Object.entries(input.business).map(([key, value]) => [key, value.trim()])) as ProfileInput["business"];
  if (!business.companyName) throw new Error("Renseignez le nom de votre entreprise.");
  if (!business.country || !business.city || !business.sector || !business.description || !business.products) throw new Error("Renseignez le pays, la ville, le secteur, la présentation et les produits de votre entreprise.");
  if (Object.values(business).some((value) => value.length > 2000)) throw new Error("Un champ de l’entreprise dépasse 2 000 caractères.");
  return { firstName, lastName, email, phone, business };
}

function currentUser(state: DemoState, role?: UserRole): User {
  const user = state.users.find((item) => item.id === state.sessionUserId);
  if (!user) throw new Error("Connectez-vous à un compte de démonstration pour continuer.");
  if (role && user.role !== role) throw new Error(role === "admin" ? "Cette action est réservée à l’administration de démonstration." : "Utilisez un compte client pour réserver un live.");
  return user;
}

const makeId = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;

export function createDemoStore() {
  let snapshot = initialSnapshot;
  let adapter: LocalStorageDemoAdapter | null = null;
  const listeners = new Set<() => void>();
  const emit = (next: DemoSnapshot) => { snapshot = next; listeners.forEach((listener) => listener()); };
  const fail = (error: unknown): never => {
    const message = error instanceof Error ? error.message : "Une erreur empêche cette action. Réessayez.";
    emit({ ...snapshot, error: message });
    throw new Error(message);
  };
  function transaction<T>(mutation: (state: DemoState) => T): T {
    try {
      if (!adapter || !snapshot.ready) throw new Error("La démo est en cours de chargement.");
      // Always re-read persisted state before validating conflicts and committing a mutation.
      const state = adapter.read() ?? createSeedState();
      const result = mutation(state);
      adapter.write(state);
      emit({ state, ready: true, error: null });
      return result;
    } catch (error) { return fail(error); }
  }
  const actions: DemoActions = {
    login(role) {
      return transaction((state) => {
        const user = state.users.find((item) => item.id === (role === "admin" ? "admin-demo" : "client-demo") && item.role === role);
        if (!user) throw new Error("Le compte de démonstration est introuvable. Réinitialisez la démo.");
        state.sessionUserId = user.id;
        return user;
      });
    },
    loginByEmail(email) {
      return transaction((state) => {
        const user = new UserRepository(state).findByEmail(email);
        if (!user) throw new Error("Aucun compte local ne correspond à cet e-mail. Créez un compte ou utilisez l’accès de démonstration.");
        state.sessionUserId = user.id;
        return user;
      });
    },
    register(input) {
      return transaction((state) => {
        const profile = normalizeProfile(input);
        const repository = new UserRepository(state);
        if (repository.findByEmail(profile.email)) throw new Error("Un compte utilise déjà cet e-mail dans cette démo.");
        const user: User = { ...profile, id: makeId("client"), role: "client" };
        repository.save(user);
        state.sessionUserId = user.id;
        return user;
      });
    },
    logout() { transaction((state) => { state.sessionUserId = null; }); },
    updateProfile(input) {
      transaction((state) => {
        const user = currentUser(state);
        const profile = normalizeProfile(input);
        const repository = new UserRepository(state);
        const duplicate = repository.findByEmail(profile.email);
        if (duplicate && duplicate.id !== user.id) throw new Error("Un autre compte utilise déjà cet e-mail.");
        repository.save({ ...profile, id: user.id, role: user.role });
      });
    },
    createBooking(input) {
      return transaction((state) => {
        const user = currentUser(state, "client");
        const offer = new PackageRepository(state).findById(input.packageId);
        if (!offer) throw new Error("Ce forfait n’existe plus. Choisissez un autre forfait.");
        if (input.mode !== "agency" && input.mode !== "remote") throw new Error("Choisissez votre mode de participation.");
        const validation = validateBookingSessions(input.sessions, offer, state.bookings);
        if (validation) throw new Error(validation);
        const createdAt = new Date().toISOString();
        const booking: Booking = {
          id: makeId("OCD"), userId: user.id, packageId: offer.id, packageName: offer.name,
          price: offer.price, durationHours: offer.durationHours, sessionCount: offer.sessionCount,
          mode: input.mode, status: "pending", createdAt,
          sessions: input.sessions.map((session) => ({ ...session, id: makeId("session") })),
        };
        new BookingRepository(state).save(booking);
        new NotificationRepository(state).save({
          id: makeId("notification"), bookingId: booking.id, title: "Nouvelle réservation",
          message: `${user.business.companyName} souhaite réserver le forfait ${offer.name}.`, read: false, createdAt,
        });
        return booking;
      });
    },
    updateBookingStatus(id, status) {
      transaction((state) => {
        const user = currentUser(state);
        const repository = new BookingRepository(state);
        const booking = repository.findById(id);
        if (!booking) throw new Error("Cette réservation n’existe plus.");
        if (user.role !== "admin" && (booking.userId !== user.id || status !== "cancelled")) throw new Error("Vous pouvez uniquement annuler vos propres réservations.");
        const transitions: Record<BookingStatus, readonly BookingStatus[]> = { pending: ["confirmed", "cancelled"], confirmed: ["completed", "cancelled"], cancelled: [], completed: [] };
        if (!transitions[booking.status].includes(status)) throw new Error("Ce changement de statut n’est pas autorisé.");
        if (status === "completed" && !allSessionsEnded(booking.sessions, Date.now())) throw new Error("Une réservation ne peut être terminée qu’après la fin de toutes ses séances.");
        repository.save({ ...booking, status });
      });
    },
    updatePackage(offer) {
      transaction((state) => {
        currentUser(state, "admin");
        if (!offer.name.trim() || !offer.description.trim() || !offer.cadence.trim()) throw new Error("Renseignez le nom, la description et le rythme du forfait.");
        if (!Number.isSafeInteger(offer.price) || offer.price <= 0) throw new Error("Le tarif doit être un montant entier strictement positif.");
        if (!Number.isInteger(offer.durationHours) || offer.durationHours < 1 || offer.durationHours > 10) throw new Error("La durée doit être comprise entre 1 et 10 heures entières.");
        if (!Number.isInteger(offer.sessionCount) || offer.sessionCount < 1 || offer.sessionCount > 31) throw new Error("Le nombre de séances doit être un entier entre 1 et 31.");
        if (!Array.isArray(offer.features) || offer.features.some((feature) => typeof feature !== "string" || !feature.trim())) throw new Error("Chaque avantage du forfait doit être renseigné.");
        new PackageRepository(state).save({ ...offer, name: offer.name.trim(), description: offer.description.trim(), cadence: offer.cadence.trim(), features: [...offer.features] });
      });
    },
    markNotificationRead(id) { transaction((state) => { currentUser(state, "admin"); new NotificationRepository(state).markRead(id); }); },
    markAllNotificationsRead() { transaction((state) => { currentUser(state, "admin"); new NotificationRepository(state).markAllRead(); }); },
    resetDemo() {
      try {
        if (!adapter) throw new Error("Le stockage du navigateur n’est pas disponible.");
        const previousUser = snapshot.state.users.find((user) => user.id === snapshot.state.sessionUserId);
        const state = createSeedState();
        state.sessionUserId = previousUser ? (previousUser.role === "admin" ? "admin-demo" : "client-demo") : null;
        adapter.write(state);
        emit({ state, ready: true, error: null });
      } catch (error) { fail(error); }
    },
  };
  return {
    actions,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initialSnapshot,
    initialize() {
      const load = () => {
        try {
          adapter = new LocalStorageDemoAdapter(window.localStorage);
          const persisted = adapter.read();
          const state = persisted ?? createSeedState();
          if (!persisted) adapter.write(state);
          emit({ state, ready: true, error: null });
        } catch (error) {
          emit({ state: snapshot.ready ? snapshot.state : createSeedState(), ready: true, error: error instanceof Error ? error.message : "Le stockage du navigateur est inaccessible." });
        }
      };
      load();
      const onStorage = (event: StorageEvent) => { if (event.key === DEMO_STORAGE_KEY || event.key === null) load(); };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },
  };
}
