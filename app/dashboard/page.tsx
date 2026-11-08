"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, CheckCheck, Clock3, Radio, Plus, CalendarClock } from "lucide-react";
import { useDemo } from "@/components/demo/demo-provider";
import { BookingTable } from "@/components/demo/booking-table";
import { Button } from "@/components/ui/button";
import styles from "@/features/client/client.module.css";

const dateLabel = (date: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", { ...options, timeZone: "Africa/Lome" }).format(new Date(`${date}T12:00:00Z`));

export default function ClientOverview() {
  const { state, user } = useDemo();
  const [now] = useState(() => Date.now());
  if (!user || user.role !== "client") return null;
  const bookings = state.bookings.filter((booking) => booking.userId === user.id);
  const next = bookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed").flatMap((booking) => booking.sessions.map((session) => ({ booking, session }))).filter(({ session }) => new Date(`${session.date}T${String(session.startHour).padStart(2, "0")}:00:00Z`).getTime() >= now).sort((a, b) => `${a.session.date}-${String(a.session.startHour).padStart(2, "0")}`.localeCompare(`${b.session.date}-${String(b.session.startHour).padStart(2, "0")}`))[0];
  const pendingSessions = bookings.filter((booking) => booking.status === "pending").reduce((total, booking) => total + booking.sessions.length, 0);
  const metrics = [
    { label: "Réservations au total", value: bookings.length, Icon: CalendarDays },
    { label: "Séances en attente", value: pendingSessions, Icon: Clock3 },
    { label: "Séances confirmées", value: bookings.filter((booking) => booking.status === "confirmed").reduce((total, booking) => total + booking.sessions.length, 0), Icon: CalendarClock },
    { label: "Réservations terminées", value: bookings.filter((booking) => booking.status === "completed").length, Icon: CheckCheck },
  ];
  return <>
    <div className="page-heading"><div><p className="page-kicker">VOTRE ESPACE CLIENT</p><h1>Bonjour, {user.firstName}.</h1><p className="page-description">La visibilité de {user.business.companyName} se construit, live après live.</p></div></div>
    <section className={styles.welcome} aria-labelledby="welcome-title"><div><h2 id="welcome-title">Votre prochain live commence ici.</h2><p>Choisissez votre forfait, trouvez le bon créneau et préparez votre prochaine rencontre avec l’audience.</p><Button asChild><Link href="/dashboard/reserver"><Plus size={18} aria-hidden="true" />Réserver une séance</Link></Button></div><div className={styles.welcomeIcon}><Radio size={45} strokeWidth={1.5} aria-hidden="true" /></div></section>
    <div className={`metric-grid ${styles.metrics}`}>{metrics.map(({ label, value, Icon }) => <section className="metric-card" key={label}><div className={styles.metricHead}><span className="metric-label">{label}</span><Icon size={19} aria-hidden="true" /></div><p className="metric-value">{String(value).padStart(2, "0")}</p></section>)}</div>
    <div className="workspace-grid">
      <section className="panel"><div className="panel-heading"><h2>Votre prochaine séance</h2><CalendarDays size={19} aria-hidden="true" /></div>
        {next ? <div className={styles.nextCard}><div className={styles.dateTile}><span>{dateLabel(next.session.date, { month: "short" })}</span><strong>{dateLabel(next.session.date, { day: "2-digit" })}</strong></div><div className={styles.nextInfo}><span className={`status-badge status-${next.booking.status}`}>{next.booking.status === "pending" ? "En attente" : "Confirmée"}</span><h3>{next.booking.packageName}</h3><p>{dateLabel(next.session.date, { weekday: "long", day: "numeric", month: "long" })} · {next.session.startHour}h00 – {next.session.startHour + next.session.durationHours}h00</p><p>{next.booking.mode === "agency" ? "À l’agence OCD à Lomé" : "À distance via TikTok co-host"} · Heure de Lomé (GMT)</p><Link href="/dashboard/reservations">Consulter ma réservation</Link></div></div> : <div className="empty-state"><CalendarClock size={30} aria-hidden="true" /><h3>Votre agenda est libre</h3><p>Votre prochaine séance apparaîtra ici après une réservation.</p><Link className={styles.link} href="/dashboard/reserver">Choisir un créneau<ArrowRight size={15} aria-hidden="true" /></Link></div>}
      </section>
      <section className="panel"><div className="panel-heading"><h2>Votre entreprise</h2><Link href="/dashboard/profil" className={styles.link}>Modifier<ArrowRight size={14} aria-hidden="true" /></Link></div><div className={styles.business}><span className="avatar">{user.business.companyName.slice(0, 2).toUpperCase()}</span><div><h3>{user.business.companyName}</h3><p>{user.business.sector} · {user.business.city}, {user.business.country}</p></div></div><p className="muted" style={{ fontSize: 13, marginTop: 18 }}>{user.business.description}</p><div className={styles.businessFoot}><span>{user.email}</span>{user.business.tiktok && <span>{user.business.tiktok.startsWith("@") ? user.business.tiktok : `@${user.business.tiktok}`}</span>}</div></section>
    </div>
    <section className={`panel ${styles.section}`}><div className="panel-heading"><h2>Vos dernières réservations</h2><Link href="/dashboard/reservations" className={styles.link}>Tout voir<ArrowRight size={15} aria-hidden="true" /></Link></div>{bookings.length ? <BookingTable bookings={[...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)} /> : <div className="empty-state"><CalendarDays size={32} aria-hidden="true" /><h3>Votre première réservation vous attend</h3><p>Découvrez les forfaits et choisissez le format adapté à votre marque.</p><Button asChild variant="secondary"><Link href="/dashboard/forfaits">Découvrir les forfaits</Link></Button></div>}</section>
  </>;
}
