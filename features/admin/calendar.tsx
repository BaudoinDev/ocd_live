"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { StatusBadge } from "@/components/workspace/status-badge";
import { Button } from "@/components/ui/button";
import { addDays, formatDate, hourLabel, lomeToday, moveMonth, TIME_ZONE } from "@/lib/booking-rules";
import styles from "./admin.module.css";



export function AdminCalendar() {
  const { state } = useWorkspace();
  const [today] = useState(() => lomeToday());
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const [filter, setFilter] = useState("active");
  const first = `${month}-01`;
  const weekday = new Date(`${first}T12:00:00Z`).getUTCDay();
  const gridStart = addDays(first, -((weekday + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const sessions = state.bookings.filter((booking) => filter === "all" || booking.status === "pending" || booking.status === "confirmed")
    .flatMap((booking) => booking.sessions.map((session) => ({ booking, session })))
    .sort((a, b) => a.session.startHour - b.session.startHour);
  const daySessions = sessions.filter(({ session }) => session.date === selected);
  const monthLabel = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, month: "long", year: "numeric" }).format(new Date(`${first}T12:00:00Z`));
  function changeMonth(offset: number) { const next = moveMonth(month, offset); setMonth(next); setSelected(`${next}-01`); }
  return <div className={styles.stack}>
    <header className="page-heading"><div><p className="page-kicker">Planning du studio</p><h1>Chaque live a sa place.</h1><p className="page-description">Retrouvez toutes les séances, à l’heure de Lomé (Africa/Lome, UTC+0).</p></div></header>
    <div className={styles.split}>
      <section className="panel" aria-label="Calendrier mensuel">
        <div className={styles.monthControls}><h2 className={styles.monthTitle} aria-live="polite">{monthLabel}</h2><Button variant="secondary" size="icon" aria-label="Mois précédent" onClick={() => changeMonth(-1)}><ChevronLeft size={18} aria-hidden="true" /></Button><Button variant="secondary" size="icon" aria-label="Mois suivant" onClick={() => changeMonth(1)}><ChevronRight size={18} aria-hidden="true" /></Button><Button variant="ghost" size="sm" onClick={() => { setMonth(today.slice(0, 7)); setSelected(today); }}>Aujourd’hui</Button></div>
        <div className="form-field" style={{ marginTop: 18 }}><label htmlFor="calendar-filter">Séances affichées</label><select className="field-input" id="calendar-filter" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="active">En attente et confirmées</option><option value="all">Tous les statuts, historique inclus</option></select></div>
        <div className={styles.calendar}><div className={styles.weekdays} aria-hidden="true">{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => <span key={day}>{day}</span>)}</div><div className={styles.monthGrid}>{days.map((day) => { const entries = sessions.filter(({ session }) => session.date === day); const statuses = [...new Set(entries.map(({ booking }) => booking.status))]; return <button type="button" key={day} className={[styles.day, day.slice(0, 7) !== month ? styles.otherMonth : "", day === today ? styles.today : "", day === selected ? styles.selectedDay : ""].join(" ")} aria-pressed={day === selected} aria-label={`${formatDate(day)}, ${entries.length} séance${entries.length > 1 ? "s" : ""}`} onClick={() => { setSelected(day); setMonth(day.slice(0, 7)); }}><span className={styles.dayNumber}>{Number(day.slice(-2))}</span>{entries.length > 0 && <><span className={styles.dayCount}>{entries.length} live{entries.length > 1 ? "s" : ""}</span><span className={styles.dayDots} aria-hidden="true">{statuses.map((status) => <span key={status} className={styles[status]} />)}</span></>}</button>; })}</div></div>
        <ul className={styles.legend}><li><span className={`${styles.swatch} ${styles.pending}`} />En attente</li><li><span className={`${styles.swatch} ${styles.confirmed}`} />Confirmée</li>{filter === "all" && <><li><span className={`${styles.swatch} ${styles.completed}`} />Terminée</li><li><span className={`${styles.swatch} ${styles.cancelled}`} />Annulée</li></>}</ul>
      </section>
      <section className="panel" aria-labelledby="selected-day"><p className="page-kicker">Programme du jour</p><h2 id="selected-day" className={styles.dayHeading}>{formatDate(selected)}</h2><p className={styles.resultCount} role="status">{daySessions.length} séance{daySessions.length > 1 ? "s" : ""}</p>
        {daySessions.length ? daySessions.map(({ booking, session }) => { const client = state.users.find((item) => item.id === booking.userId); return <article className={styles.sessionCard} key={session.id}><div className={styles.sessionTop}><strong>{hourLabel(session.startHour)} – {hourLabel(session.startHour + session.durationHours)}</strong><StatusBadge status={booking.status} /></div><p>{client?.business.companyName || "Client"}<br />{booking.packageName} · {booking.mode === "agency" ? "À l’agence" : "À distance"}</p><Link className={styles.textLink} href={`/admin/reservations#booking-${booking.id}`}>Voir la réservation <ArrowUpRight size={15} aria-hidden="true" /></Link></article>; }) : <p className="empty-state">Aucune séance pour cette date avec le filtre sélectionné.</p>}
      </section>
    </div>
  </div>;
}
