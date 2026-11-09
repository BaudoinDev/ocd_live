"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Users, Radio, Clock3, CheckCheck, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDemo } from "@/components/demo/demo-provider";
import { BookingTable } from "@/components/demo/booking-table";
import { StatusBadge } from "@/components/demo/status-badge";
import { formatPrice } from "@/lib/packages";
import { formatDate, hourLabel, sessionStartsAt } from "@/lib/demo/booking-rules";
import styles from "./admin.module.css";

export function AdminOverview() {
  const { state, user } = useDemo();
  // Read the clock once per mount: render must stay pure (react-hooks/purity).
  const [now] = useState(() => Date.now());
  if (!user) return null;
  const pending = state.bookings.filter((booking) => booking.status === "pending");
  const confirmed = state.bookings.filter((booking) => booking.status === "confirmed");
  const completed = state.bookings.filter((booking) => booking.status === "completed");
  const upcoming = state.bookings.filter((booking) => booking.status === "confirmed" || booking.status === "pending")
    .flatMap((booking) => booking.sessions.map((session) => ({ booking, session })))
    .filter(({ session }) => sessionStartsAt(session) > now)
    .sort((a, b) => sessionStartsAt(a.session) - sessionStartsAt(b.session));
  const scheduled = upcoming.filter(({ booking }) => booking.status === "confirmed").length;
  const turnover = [...confirmed, ...completed].reduce((sum, booking) => sum + booking.price, 0);
  const statusData = [
    { name: "En attente", reservations: pending.length },
    { name: "Confirmées", reservations: confirmed.length },
    { name: "Terminées", reservations: completed.length },
    { name: "Annulées", reservations: state.bookings.filter((booking) => booking.status === "cancelled").length },
  ];
  const metrics = [
    { label: "Clients de démonstration", value: state.users.filter((client) => client.role === "client").length, icon: Users },
    { label: "Réservations au total", value: state.bookings.length, icon: CalendarDays },
    { label: "Demandes en attente", value: pending.length, icon: Clock3 },
    { label: "Séances à venir confirmées", value: scheduled, icon: Radio },
    { label: "Réservations terminées", value: completed.length, icon: CheckCheck },
    { label: "Chiffre d’affaires simulé", value: `${formatPrice(turnover)} FCFA`, icon: Wallet },
  ];
  return (
    <div className={styles.stack}>
      <header className="page-heading"><div><p className="page-kicker">Vue d’ensemble</p><h1>Le studio, en un coup d’œil.</h1><p className="page-description">Les demandes, les prochains lives et l’activité de votre démo.</p></div></header>
      <div className="metric-grid">{metrics.map(({ label, value, icon: Icon }) => <div className="metric-card" key={label}><Icon size={19} aria-hidden="true" /><p className="metric-value">{value}</p><p className="metric-label">{label}</p></div>)}</div>
      <p className="form-hint">Le chiffre d’affaires simulé additionne les prix enregistrés des réservations confirmées et terminées. Aucun paiement n’est collecté.</p>
      <div className={styles.split}>
        <section className="panel" aria-labelledby="activity-title"><div className="panel-heading"><div><p className="page-kicker">Activité locale</p><h2 id="activity-title">Répartition des réservations</h2></div></div>
          {state.bookings.length ? <><div className={styles.chart} aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusData} margin={{ top: 12, right: 6, left: -25, bottom: 4 }}><CartesianGrid stroke="var(--line)" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} /><Tooltip cursor={{ fill: "var(--sand)" }} formatter={(value) => [value, "Réservations"]} /><Bar dataKey="reservations" fill="var(--brand)" radius={[5, 5, 0, 0]} maxBarSize={44} isAnimationActive={false} /></BarChart></ResponsiveContainer></div><ul className={styles.legend} aria-label="Nombre de réservations par statut">{statusData.map((item) => <li key={item.name}><span>{item.name} :</span><strong>{item.reservations}</strong></li>)}</ul></> : <p className="empty-state">Le graphique apparaîtra à la première réservation.</p>}
        </section>
        <section className="panel" aria-labelledby="agenda-title"><div className="panel-heading"><h2 id="agenda-title">À l’agenda</h2><Link className={styles.textLink} href="/admin/calendrier">Calendrier <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
          {upcoming.length ? <ul className={styles.agenda}>{upcoming.slice(0, 3).map(({ booking, session }) => { const client = state.users.find((item) => item.id === booking.userId); return <li key={session.id} className={styles.agendaItem}><span className={styles.agendaIcon}><CalendarDays size={18} aria-hidden="true" /></span><div className={styles.agendaBody}><strong>{client?.business.companyName || booking.packageName}</strong><p>{formatDate(session.date)} · {hourLabel(session.startHour)}<br />{booking.packageName} · {session.durationHours} h</p><StatusBadge status={booking.status} /></div></li>; })}</ul> : <p className="empty-state">Aucune séance à venir pour le moment.</p>}
        </section>
      </div>
      <section className="panel"><div className="panel-heading"><div><p className="page-kicker">À traiter</p><h2>Les demandes en attente</h2></div><Link className={styles.textLink} href="/admin/reservations">Tout consulter <ArrowUpRight size={16} aria-hidden="true" /></Link></div><BookingTable bookings={pending.slice(0, 5)} admin emptyMessage="Aucune demande en attente. Tout est à jour." /></section>
    </div>
  );
}
