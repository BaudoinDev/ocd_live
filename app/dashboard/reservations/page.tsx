"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { BookingTable } from "@/components/workspace/booking-table";
import { Button } from "@/components/ui/button";
import styles from "@/features/client/client.module.css";

export default function ClientBookings() {
  const { state, user } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const allBookings = state.bookings.filter((booking) => booking.userId === user.id);
  const bookings = allBookings.filter((booking) => (status === "all" || booking.status === status) && `${booking.packageName} ${booking.id} ${booking.sessions.map((session) => session.date).join(" ")}`.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr"))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <>
    <div className="page-heading"><div><p className="page-kicker">CHAQUE LIVE COMPTE</p><h1>Mes réservations</h1><p className="page-description">Retrouvez vos demandes, vos prochaines séances et votre historique.</p></div><Button asChild><Link href="/dashboard/reserver"><Plus size={18} aria-hidden="true" />Nouvelle réservation</Link></Button></div>
    <section className="panel">
      <div className="toolbar"><div className="form-field"><label htmlFor="booking-search">Rechercher un forfait, une référence ou une date</label><input className="field-input" id="booking-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex. Boost, 2026-11…" /></div><div className="form-field"><label htmlFor="booking-status">Statut</label><select className="field-input" id="booking-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Tous les statuts</option><option value="pending">En attente</option><option value="confirmed">Confirmée</option><option value="cancelled">Annulée</option><option value="completed">Terminée</option></select></div></div>
      <p className={styles.resultsCount} role="status">{bookings.length} réservation{bookings.length > 1 ? "s" : ""}{allBookings.length > 0 && ` sur ${allBookings.length}`}</p>
      {bookings.length > 0 ? <BookingTable bookings={bookings} /> : <div className="empty-state"><CalendarDays size={32} aria-hidden="true" /><h2>{allBookings.length ? "Aucun résultat pour ces filtres" : "Tout commence avec un premier live"}</h2><p>{allBookings.length ? "Essayez un autre nom de forfait ou affichez tous les statuts." : "Choisissez un forfait et une date pour créer votre première réservation."}</p>{allBookings.length ? <Button variant="secondary" onClick={() => { setQuery(""); setStatus("all"); }}>Effacer les filtres</Button> : <Button asChild><Link href="/dashboard/reserver">Réserver ma première séance</Link></Button>}</div>}
    </section>
  </>;
}
