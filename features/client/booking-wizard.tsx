"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarCheck, ChevronLeft, ChevronRight, MapPin, Video, X } from "lucide-react";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/features/auth/use-auth-target";
import { createBookingAction } from "@/features/bookings/actions";
import { addDays, formatDate, getAvailableStartHours, hourLabel, lomeToday, MAX_ADVANCE_DAYS, monthGridDays, moveMonth, sessionStartsAt, sessionsOverlap, TIME_ZONE } from "@/lib/booking-rules";
import { formatPrice, type PromotionPackage } from "@/lib/packages";
import type { ParticipationMode, SessionSelection } from "@/types/domain";
import { paymentLabels, type PaymentMethod } from "@/lib/payment";
import { PaymentDialog } from "./payment-dialog";
import styles from "./booking-wizard.module.css";

const modes: { value: ParticipationMode; label: string; detail: string; Icon: typeof MapPin }[] = [
  { value: "agency", label: "À l’agence", detail: "Dans nos locaux, à Lomé", Icon: MapPin },
  { value: "remote", label: "À distance", detail: "Depuis chez vous, en co-host TikTok", Icon: Video },
];
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const plural = (count: number) => (count > 1 ? "s" : "");

function monthLabel(month: string) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, month: "long", year: "numeric" }).format(new Date(`${month}-01T12:00:00Z`));
}

export function BookingWizard() {
  const { state } = useWorkspace();
  const router = useRouter();
  const query = useSearch();
  const [now] = useState(() => new Date());
  const today = lomeToday(now);
  const lastMonth = addDays(today, MAX_ADVANCE_DAYS).slice(0, 7);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [mode, setMode] = useState<ParticipationMode | null>(null);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSelection[]>([]);
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const paymentButton = useRef<HTMLButtonElement>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [chosenMethod, setChosenMethod] = useState<PaymentMethod | null>(null);

  const byId = (id: string | null) => state.packages.find((item) => item.id === id);
  const offer: PromotionPackage | undefined = byId(pickedId) ?? byId(query.get("forfait")) ?? state.packages.find((item) => item.recommended) ?? state.packages[0];

  if (reference) return <section className={`panel ${styles.done}`} aria-labelledby="booking-done">
    <span className={styles.doneIcon}><CalendarCheck size={30} aria-hidden="true" /></span>
    <h1 id="booking-done">Votre réservation est enregistrée.</h1>
    <p>Référence <strong>{reference}</strong>. Paiement validé{chosenMethod ? ` par ${paymentLabels[chosenMethod]}` : ""}. L’équipe OCD a été alertée.</p>
    <div className="dialog-actions"><Button asChild><Link href="/dashboard/reservations">Voir mes réservations<ArrowRight size={17} aria-hidden="true" /></Link></Button></div>
  </section>;
  if (!offer) return <p className="empty-state">Aucun forfait n’est disponible pour le moment.</p>;

  const durationHours = offer.durationHours;
  const remaining = offer.sessionCount - sessions.length;
  const slotsFor = (day: string) => getAvailableStartHours(day, durationHours, state.occupied, sessions, now);
  const activeSlots = activeDay ? slotsFor(activeDay) : [];
  // Another client may have taken a chosen slot since the page loaded.
  const taken = sessions.filter((session) => state.occupied.some((slot) => sessionsOverlap(session, slot)));
  const ordered = [...sessions].sort((a, b) => sessionStartsAt(a) - sessionStartsAt(b));
  const ready = remaining === 0 && mode !== null && taken.length === 0;

  function chooseOffer(id: string) {
    setPickedId(id);
    setSessions([]);
    setActiveDay(null);
    setError("");
  }
  function addSlot(startHour: number) {
    if (!activeDay) return;
    const session = { date: activeDay, startHour, durationHours };
    setError("");
    setSessions(offer!.sessionCount === 1 ? [session] : [...sessions, session]);
  }
  function submit(paymentMethod: PaymentMethod) {
    setChosenMethod(paymentMethod);
    if (!ready || !mode) return;
    setError("");
    startSubmit(async () => {
      const result = await createBookingAction({ packageId: offer!.id, mode, sessions, paymentMethod });
      if (result.ok) setReference(result.value.id);
      else { setError(result.error); setPaymentOpen(false); router.refresh(); }
    });
  }

  const missing = sessions.length < offer.sessionCount
    ? `Choisissez encore ${remaining} créneau${remaining > 1 ? "x" : ""}.`
    : !mode ? "Choisissez votre mode de participation." : taken.length ? "Remplacez le créneau qui vient d’être pris." : "";

  return <>
    <div className="page-heading"><div><p className="page-kicker">VOTRE PROCHAIN LIVE</p><h1>Réserver un live</h1><p className="page-description">Choisissez votre format, votre façon de participer, puis un créneau libre. Du lundi au samedi, de 9 h à 19 h, heure de Lomé.</p></div></div>
    <div className={styles.layout}>
      <div className={styles.steps}>
        <fieldset className={`panel ${styles.step}`}>
          <legend className={styles.legend}><span>1</span> Votre forfait</legend>
          <div className={styles.offers}>{state.packages.map((item) => <label key={item.id} className={styles.choice}>
            <input type="radio" name="offer" checked={item.id === offer.id} onChange={() => chooseOffer(item.id)} />
            <span className={styles.choiceBody}><strong>{item.name}</strong><small>{item.sessionCount} séance{plural(item.sessionCount)} de {item.durationHours} h</small><em>{formatPrice(item.price)} FCFA</em></span>
          </label>)}</div>
        </fieldset>

        <fieldset className={`panel ${styles.step}`}>
          <legend className={styles.legend}><span>2</span> Votre participation</legend>
          <div className={styles.modes}>{modes.map(({ value, label, detail, Icon }) => <label key={value} className={styles.choice}>
            <input type="radio" name="mode" checked={mode === value} onChange={() => { setMode(value); setError(""); }} />
            <span className={styles.choiceBody}><Icon size={19} aria-hidden="true" /><strong>{label}</strong><small>{detail}</small></span>
          </label>)}</div>
        </fieldset>

        <section className={`panel ${styles.step}`} aria-labelledby="slot-title">
          <h2 id="slot-title" className={styles.legend}><span>3</span> {offer.sessionCount > 1 ? `Vos ${offer.sessionCount} créneaux` : "Votre créneau"}</h2>
          <div className={styles.calendarLayout}>
            <div>
              <div className={styles.monthBar}>
                <Button variant="secondary" size="icon" aria-label="Mois précédent" disabled={month <= today.slice(0, 7)} onClick={() => setMonth(moveMonth(month, -1))}><ChevronLeft size={18} aria-hidden="true" /></Button>
                <h3 aria-live="polite">{monthLabel(month)}</h3>
                <Button variant="secondary" size="icon" aria-label="Mois suivant" disabled={month >= lastMonth} onClick={() => setMonth(moveMonth(month, 1))}><ChevronRight size={18} aria-hidden="true" /></Button>
              </div>
              <div className={styles.weekdays} aria-hidden="true">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
              <div className={styles.days}>{monthGridDays(month).map((day) => {
                const count = slotsFor(day).length;
                const chosen = sessions.some((session) => session.date === day);
                const outside = day.slice(0, 7) !== month;
                return <button key={day} type="button" disabled={count === 0 && !chosen} aria-pressed={day === activeDay} aria-label={`${formatDate(day)}, ${count} créneau${count > 1 ? "x" : ""} libre${plural(count)}`} onClick={() => { setActiveDay(day); if (outside) setMonth(day.slice(0, 7)); }} className={[styles.day, outside ? styles.outside : "", day === activeDay ? styles.activeDay : "", chosen ? styles.chosenDay : ""].join(" ")}>{Number(day.slice(-2))}</button>;
              })}</div>
            </div>
            <div className={styles.slots}>
              <h3>{activeDay ? formatDate(activeDay) : "Choisissez une date"}</h3>
              {activeDay ? activeSlots.length > 0
                ? <div className={styles.slotGrid}>{activeSlots.map((hour) => <button key={hour} type="button" disabled={offer.sessionCount > 1 && remaining === 0} onClick={() => addSlot(hour)}>{hourLabel(hour)} – {hourLabel(hour + durationHours)}</button>)}</div>
                : <p className={styles.slotHint}>Plus aucun créneau libre ce jour-là.</p>
                : <p className={styles.slotHint}>Les dates disponibles sont en clair dans le calendrier.</p>}
              {offer.sessionCount > 1 && remaining === 0 && <p className={styles.slotHint}>Tous vos créneaux sont choisis. Retirez-en un pour le modifier.</p>}
            </div>
          </div>
        </section>
      </div>

      <aside className={`panel ${styles.summary}`} aria-label="Récapitulatif de la réservation">
        <p className="page-kicker">Récapitulatif</p>
        <h2>{offer.name}</h2>
        <p className={styles.price}>{formatPrice(offer.price)} <small>FCFA</small></p>
        <p className={styles.summaryLine}>{modes.find((item) => item.value === mode)?.label ?? "Participation à choisir"}</p>
        <h3 className={styles.summaryTitle}>Créneaux · {sessions.length}/{offer.sessionCount}</h3>
        {ordered.length > 0 ? <ul className={styles.selected}>{ordered.map((session) => {
          const conflict = taken.includes(session);
          return <li key={`${session.date}-${session.startHour}`} className={conflict ? styles.conflict : ""}><span>{formatDate(session.date)}<br /><strong>{hourLabel(session.startHour)} – {hourLabel(session.startHour + session.durationHours)}</strong>{conflict && <small>Ce créneau vient d’être pris.</small>}</span><button type="button" aria-label={`Retirer le créneau du ${formatDate(session.date)} à ${hourLabel(session.startHour)}`} onClick={() => setSessions(sessions.filter((item) => item !== session))}><X size={16} aria-hidden="true" /></button></li>;
        })}</ul> : <p className={styles.slotHint}>Aucun créneau choisi.</p>}
        {error && <p role="alert" className="notice notice-error">{error}</p>}
        <Button ref={paymentButton} className={styles.submit} disabled={!ready || submitting} onClick={() => setPaymentOpen(true)}>Continuer vers le paiement<ArrowRight size={17} aria-hidden="true" /></Button>
        <p className="form-hint" role="status">{missing || "Il ne reste qu’à choisir votre moyen de paiement."}</p>
      </aside>
      <PaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} offerName={offer.name} amount={formatPrice(offer.price)} pending={submitting} chosen={chosenMethod} onChoose={submit} returnFocusRef={paymentButton} />
    </div>
  </>;
}
