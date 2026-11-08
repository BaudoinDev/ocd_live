"use client";

import { useState } from "react";
import { useDemo } from "@/components/demo/demo-provider";
import { BookingTable } from "@/components/demo/booking-table";
import styles from "./admin.module.css";

export function AdminReservations() {
  const { state, user } = useDemo();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [mode, setMode] = useState("all");
  if (!user) return null;
  const query = search.trim().toLocaleLowerCase("fr");
  const bookings = state.bookings.filter((booking) => {
    const client = state.users.find((item) => item.id === booking.userId);
    const text = [booking.id, booking.packageName, client?.firstName, client?.lastName, client?.business.companyName, client?.email].join(" ").toLocaleLowerCase("fr");
    return (!query || text.includes(query)) && (status === "all" || booking.status === status) && (mode === "all" || booking.mode === mode);
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <div className={styles.stack}>
    <header className="page-heading"><div><p className="page-kicker">Gestion des lives</p><h1>Les réservations.</h1><p className="page-description">Consultez chaque demande, puis confirmez, annulez ou terminez les promotions.</p></div></header>
    <section className="panel" aria-label="Liste des réservations"><div className={styles.inlineControls}>
      <div className={`form-field ${styles.search}`}><label htmlFor="booking-search">Rechercher une réservation</label><input id="booking-search" type="search" className="field-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Client, entreprise, forfait, référence…" /></div>
      <div className={`form-field ${styles.select}`}><label htmlFor="booking-status">Statut</label><select id="booking-status" className="field-input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Tous les statuts</option><option value="pending">En attente</option><option value="confirmed">Confirmées</option><option value="completed">Terminées</option><option value="cancelled">Annulées</option></select></div>
      <div className={`form-field ${styles.select}`}><label htmlFor="booking-mode">Participation</label><select id="booking-mode" className="field-input" value={mode} onChange={(event) => setMode(event.target.value)}><option value="all">Tous les modes</option><option value="agency">À l’agence</option><option value="remote">À distance</option></select></div>
    </div><p className={styles.resultCount} role="status">{bookings.length} réservation{bookings.length > 1 ? "s" : ""} affichée{bookings.length > 1 ? "s" : ""}</p><BookingTable bookings={bookings} admin />
    </section>
  </div>;
}
