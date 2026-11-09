"use client";

import { useState, useTransition } from "react";
import { Ban, CheckCheck, CircleCheck, Eye } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { StatusBadge, statusLabels } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateBookingStatusAction } from "@/features/bookings/actions";
import { allSessionsEnded, formatDate, hourLabel, sessionStartsAt, TIME_ZONE } from "@/lib/booking-rules";
import { formatPrice } from "@/lib/packages";
import type { Booking, BookingStatus, ParticipationMode, User } from "@/types/domain";
import styles from "./booking-table.module.css";

const modeLabels: Record<ParticipationMode, string> = { agency: "À l’agence", remote: "À distance" };

const createdAtFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, dateStyle: "medium", timeStyle: "short" });

interface BookingTableProps {
  bookings: readonly Booking[];
  /** Admin view: shows the client column and the confirm / complete actions. */
  admin?: boolean;
  emptyMessage?: string;
}

export function BookingTable({ bookings, admin = false, emptyMessage = "Aucune réservation à afficher." }: BookingTableProps) {
  const { state } = useWorkspace();
  // Captured once per mount: keeps render pure and the "completable" state stable while the table is shown.
  const [now] = useState(() => Date.now());
  if (bookings.length === 0) return <p className="empty-state">{emptyMessage}</p>;
  const clients = new Map(state.users.map((user) => [user.id, user]));
  return (
    <div className={`table-scroll ${styles.wrapper}`}>
      <table className={`data-table ${styles.table}`} role="table">
        <caption className={styles.srOnly}>{admin ? "Réservations des clients" : "Vos réservations"}</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">Réservation</th>
            {admin && <th scope="col" role="columnheader">Client</th>}
            <th scope="col" role="columnheader">Séances</th>
            <th scope="col" role="columnheader">Participation</th>
            <th scope="col" role="columnheader">Montant</th>
            <th scope="col" role="columnheader">Statut</th>
            <th scope="col" role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {bookings.map((booking) => <BookingRow key={booking.id} booking={booking} client={clients.get(booking.userId)} admin={admin} now={now} />)}
        </tbody>
      </table>
    </div>
  );
}

function BookingRow({ booking, client, admin, now }: { booking: Booking; client?: User; admin: boolean; now: number }) {
  const sessions = [...booking.sessions].sort((a, b) => sessionStartsAt(a) - sessionStartsAt(b));
  const first = sessions[0];
  const active = booking.status === "pending" || booking.status === "confirmed";
  return (
    <tr id={`booking-${booking.id}`} role="row">
      <td role="cell" data-label="Réservation"><strong>{booking.packageName}</strong><small>{booking.id}</small></td>
      {admin && <td role="cell" data-label="Client"><strong>{client?.business.companyName ?? "Client supprimé"}</strong><small>{client ? `${client.firstName} ${client.lastName}` : "—"}</small></td>}
      <td role="cell" data-label="Séances">
        {first ? <><strong>{formatDate(first.date)}</strong><small>{hourLabel(first.startHour)} – {hourLabel(first.startHour + first.durationHours)}{sessions.length > 1 && ` · +${sessions.length - 1} séance${sessions.length > 2 ? "s" : ""}`}</small></> : "—"}
      </td>
      <td role="cell" data-label="Participation">{modeLabels[booking.mode]}</td>
      <td role="cell" data-label="Montant" className={styles.amount}>{formatPrice(booking.price)} FCFA</td>
      <td role="cell" data-label="Statut"><StatusBadge status={booking.status} /></td>
      <td role="cell" data-label="Actions">
        <div className="row-actions">
          <BookingDetails booking={booking} sessions={sessions} client={client} admin={admin} />
          {admin && booking.status === "pending" && <StatusAction booking={booking} status="confirmed" />}
          {admin && booking.status === "confirmed" && (allSessionsEnded(sessions, now)
            ? <StatusAction booking={booking} status="completed" />
            : <span className={styles.hint}>Terminable après la dernière séance</span>)}
          {active && <StatusAction booking={booking} status="cancelled" />}
        </div>
      </td>
    </tr>
  );
}

const actionCopy: Record<Exclude<BookingStatus, "pending">, { label: string; Icon: typeof Ban; confirm?: { title: string; description: string; submit: string } }> = {
  confirmed: { label: "Confirmer", Icon: CircleCheck },
  completed: {
    label: "Terminer", Icon: CheckCheck,
    confirm: { title: "Marquer comme terminée ?", description: "Toutes les séances de cette réservation sont passées. Ce statut est définitif.", submit: "Marquer comme terminée" },
  },
  cancelled: {
    label: "Annuler", Icon: Ban,
    confirm: { title: "Annuler cette réservation ?", description: "Les créneaux seront libérés pour d’autres clients. Une réservation annulée ne peut pas être rétablie.", submit: "Confirmer l’annulation" },
  },
};

function StatusAction({ booking, status }: { booking: Booking; status: Exclude<BookingStatus, "pending"> }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const { label, Icon, confirm } = actionCopy[status];
  const accessibleName = `${label} la réservation ${booking.id}`;
  function apply() {
    setError("");
    startTransition(async () => {
      const result = await updateBookingStatusAction({ id: booking.id, status });
      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  }
  if (!confirm) {
    return <>
      <button type="button" onClick={apply} disabled={pending} aria-label={accessibleName}><Icon size={15} aria-hidden="true" />{pending ? "…" : label}</button>
      {error && <span role="alert" className="form-error">{error}</span>}
    </>;
  }
  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setError(""); }}>
      <DialogTrigger asChild><button type="button" aria-label={accessibleName}><Icon size={15} aria-hidden="true" />{label}</button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{confirm.title}</DialogTitle><DialogDescription>{booking.packageName} · {booking.id}. {confirm.description}</DialogDescription></DialogHeader>
        {error && <p role="alert" className="notice notice-error" style={{ marginTop: 20, marginBottom: 0 }}>{error}</p>}
        <div className="dialog-actions">
          <Button variant={status === "cancelled" ? "dark" : "default"} onClick={apply} disabled={pending}>{pending ? "Enregistrement…" : confirm.submit}</Button>
          <DialogClose asChild><Button variant="secondary">Revenir</Button></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookingDetails({ booking, sessions, client, admin }: { booking: Booking; sessions: Booking["sessions"]; client?: User; admin: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild><button type="button" aria-label={`Détails de la réservation ${booking.id}`}><Eye size={15} aria-hidden="true" />Détails</button></DialogTrigger>
      <DialogContent className={styles.details}>
        <DialogHeader><DialogTitle>{booking.packageName}</DialogTitle><DialogDescription>Réservation {booking.id}</DialogDescription></DialogHeader>
        <dl className="booking-details-list">
          <div><dt>Statut</dt><dd>{statusLabels[booking.status]}</dd></div>
          <div><dt>Participation</dt><dd>{modeLabels[booking.mode]}</dd></div>
          <div><dt>Montant</dt><dd>{formatPrice(booking.price)} FCFA</dd></div>
          <div><dt>Demandée le</dt><dd>{createdAtFormat.format(new Date(booking.createdAt))}</dd></div>
          {admin && <>
            <div><dt>Entreprise</dt><dd>{client?.business.companyName ?? "Client supprimé"}</dd></div>
            <div><dt>Contact</dt><dd>{client ? `${client.firstName} ${client.lastName}` : "—"}</dd></div>
            {client && <div><dt>E-mail</dt><dd className={styles.breakAll}><a href={`mailto:${client.email}`}>{client.email}</a></dd></div>}
            {client && <div><dt>Téléphone</dt><dd><a href={`tel:${client.phone.replace(/[^\d+]/g, "")}`}>{client.phone}</a></dd></div>}
          </>}
        </dl>
        <h3 className={styles.sessionsTitle}>{sessions.length} séance{sessions.length > 1 ? "s" : ""} de {booking.durationHours} h</h3>
        <ul className="booking-session-list">
          {sessions.map((session) => <li key={session.id}><strong>{formatDate(session.date)}</strong> · {hourLabel(session.startHour)} – {hourLabel(session.startHour + session.durationHours)}</li>)}
        </ul>
        <p className="dialog-note">Horaires à l’heure de Lomé (UTC+0).</p>
      </DialogContent>
    </Dialog>
  );
}
