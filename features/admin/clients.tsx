"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { BookingTable } from "@/components/workspace/booking-table";
import tableStyles from "@/components/workspace/booking-table.module.css";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Booking, User } from "@/types/domain";
import styles from "./admin.module.css";

function ClientSheet({ client, bookings }: { client: User; bookings: Booking[] }) {
  const { business } = client;
  const fields: [string, string, boolean?][] = [
    ["Téléphone", client.phone], ["Email", client.email], ["Secteur", business.sector], ["Localisation", `${business.city}, ${business.country}`],
    ["TikTok", business.tiktok || "Non renseigné"], ["Présentation", business.description, true], ["Produits ou services", business.products, true],
  ];
  return <Dialog>
    <DialogTrigger asChild><button type="button" aria-label={`Fiche de ${business.companyName}`}><Eye size={15} aria-hidden="true" />Fiche</button></DialogTrigger>
    <DialogContent className={styles.clientDialog}>
      <DialogHeader><DialogTitle>{business.companyName}</DialogTitle><DialogDescription>{client.firstName} {client.lastName}</DialogDescription></DialogHeader>
      <dl className={styles.profile}>{fields.map(([label, value, wide]) => <div key={label} className={wide ? styles.wide : ""}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className={styles.clientHistory}><h3>Historique des réservations</h3><BookingTable bookings={bookings} admin emptyMessage="Ce client n’a pas encore réservé." /></div>
    </DialogContent>
  </Dialog>;
}

export function AdminClients() {
  const { state } = useWorkspace();
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase("fr");
  const clients = state.users.filter((user) => user.role === "client" && (!query || [user.firstName, user.lastName, user.email, user.phone, user.business.companyName, user.business.sector, user.business.city].join(" ").toLocaleLowerCase("fr").includes(query)));
  const bookingsOf = (id: string) => state.bookings.filter((booking) => booking.userId === id);
  return <div className={styles.stack}>
    <header className="page-heading"><div><p className="page-kicker">Votre portefeuille</p><h1>Les clients.</h1><p className="page-description">Retrouvez chaque entreprise, ses coordonnées et son historique.</p></div></header>
    <section className="panel" aria-label="Liste des clients">
      <div className="form-field"><label htmlFor="client-search">Rechercher un client</label><input id="client-search" type="search" className="field-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Entreprise, contact, ville, secteur…" /></div>
      <p className={styles.resultCount} role="status">{clients.length} client{clients.length > 1 ? "s" : ""}</p>
      {clients.length ? <div className={`table-scroll ${tableStyles.wrapper}`}><table className={`data-table ${tableStyles.table}`}>
        <caption className={tableStyles.srOnly}>Clients inscrits</caption>
        <thead><tr><th scope="col">Entreprise</th><th scope="col">Contact</th><th scope="col">Localisation</th><th scope="col">Réservations</th><th scope="col">Actions</th></tr></thead>
        <tbody>{clients.map((client) => {
          const bookings = bookingsOf(client.id);
          return <tr key={client.id}>
            <td data-label="Entreprise"><strong>{client.business.companyName}</strong><small>{client.business.sector}</small></td>
            <td data-label="Contact"><strong>{client.firstName} {client.lastName}</strong><small>{client.phone}</small></td>
            <td data-label="Localisation">{client.business.city}, {client.business.country}</td>
            <td data-label="Réservations">{bookings.length}</td>
            <td data-label="Actions"><div className="row-actions"><ClientSheet client={client} bookings={bookings} /></div></td>
          </tr>;
        })}</tbody>
      </table></div> : <p className="empty-state">{state.users.some((user) => user.role === "client") ? "Aucun client ne correspond à cette recherche." : "Aucun client inscrit pour le moment."}</p>}
    </section>
  </div>;
}
