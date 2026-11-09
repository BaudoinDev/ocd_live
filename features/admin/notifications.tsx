"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, Bell, CheckCheck } from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Button } from "@/components/ui/button";
import { TIME_ZONE } from "@/lib/booking-rules";
import type { ActionResult } from "@/lib/action-result";
import { markAllNotificationsReadAction, markNotificationReadAction } from "./actions";
import styles from "./admin.module.css";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, dateStyle: "medium", timeStyle: "short" });

export function AdminNotifications() {
  const { state } = useWorkspace();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const unread = state.notifications.filter((item) => !item.read).length;
  const run = (action: () => Promise<ActionResult>) => {
    setError("");
    startTransition(async () => { const result = await action(); if (!result.ok) setError(result.error); });
  };
  return <div className={styles.stack}>
    <header className="page-heading"><div><p className="page-kicker">Restez alerté</p><h1>Les notifications.</h1><p className="page-description">Chaque nouvelle réservation apparaît ici. Cette page se met à jour toute seule.</p></div>{unread > 0 && <Button variant="secondary" disabled={pending} onClick={() => run(markAllNotificationsReadAction)}><CheckCheck size={17} aria-hidden="true" />Tout marquer comme lu</Button>}</header>
    {error && <p role="alert" className="notice notice-error">{error}</p>}
    <section className="panel" aria-label="Liste des notifications">
      <p className={styles.resultCount} role="status">{unread} non lue{unread > 1 ? "s" : ""}</p>
      {state.notifications.length ? <ul className={styles.notificationList}>{state.notifications.map((item) => <li key={item.id} className={`${styles.notification} ${item.read ? "" : styles.unread}`}>
        <span className={styles.notificationMark}><Bell size={18} aria-hidden="true" /></span>
        <div className={styles.notificationBody}>
          <div className={styles.notificationTitle}><h2>{item.title}</h2>{!item.read && <span className={styles.unreadBadge}>Nouveau</span>}</div>
          <p>{item.message}</p>
          <time dateTime={item.createdAt}>{dateFormat.format(new Date(item.createdAt))}</time>
          <div className={styles.notificationActions}>
            <Link className={styles.textLink} href={`/admin/reservations#booking-${item.bookingId}`}>Voir la réservation <ArrowUpRight size={15} aria-hidden="true" /></Link>
            {!item.read && <Button variant="ghost" size="sm" disabled={pending} onClick={() => run(() => markNotificationReadAction(item.id))}>Marquer comme lu</Button>}
          </div>
        </div>
      </li>)}</ul> : <p className="empty-state">Aucune notification pour le moment. Les nouvelles réservations apparaîtront ici.</p>}
    </section>
  </div>;
}
