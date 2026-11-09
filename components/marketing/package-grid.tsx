"use client";

import { ArrowRight, Check, Clock3, Radio, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice, type PromotionPackage } from "@/lib/packages";
import styles from "./package-grid.module.css";

function PackageDetails({ offer }: { offer: PromotionPackage }) {
  return (
    <DialogContent>
      <DialogHeader>
        <span className={styles.dialogEyebrow}>Votre prochain live</span>
        <DialogTitle>Le forfait {offer.name}</DialogTitle>
        <DialogDescription>
          {offer.sessionCount} {offer.sessionCount > 1 ? "séances" : "séance"}{" "}
          de {offer.durationHours}{" "}
          {offer.durationHours > 1 ? "heures" : "heure"}, en présentiel à Lomé
          ou à distance.
        </DialogDescription>
      </DialogHeader>
      <div className={styles.dialogPrice}>
        {formatPrice(offer.price)} <span>FCFA</span>
      </div>
      <p className={styles.dialogNote}>
        Tarif provisoire, confirmé par l’équipe OCD avec votre réservation.
      </p>
      <div className={styles.bookingNotice}>
        <Radio size={21} aria-hidden="true" />
        <p>
          <strong>Préparons votre prise de parole.</strong>Choisissez votre mode de participation et un créneau libre : il vous suffit d’un compte OCD Live.
        </p>
      </div>
      <Link className="button button-primary" href={`/dashboard/reserver?forfait=${encodeURIComponent(offer.id)}`}> Réserver ce forfait{" "}
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </DialogContent>
  );
}

export function PackageGrid({ offers: catalog, compact = false }: { offers: readonly PromotionPackage[]; compact?: boolean }) {
  const offers = compact ? catalog.slice(0, 3) : catalog;

  return (
    <div className={styles.grid}>
      {offers.map((offer) => (
        <article
          key={offer.id}
          className={`${styles.card} ${offer.recommended ? styles.recommended : ""}`}
        >
          <div className={styles.cardTop}>
            <span className={styles.cadence}>
              {offer.sessionCount > 1
                ? "Live après live"
                : "Une séance, votre moment"}
            </span>
            {offer.recommended && (
              <span className={styles.badge}>
                <Sparkles size={12} aria-hidden="true" /> Recommandé
              </span>
            )}
          </div>
          <h3>{offer.name}</h3>
          <p className={styles.description}>{offer.description}</p>
          <p className={styles.price}>
            {formatPrice(offer.price)} <span>FCFA</span>
          </p>
          <p className={styles.priceNote}>Tarif provisoire</p>
          <div className={styles.sessionInfo}>
            <span>
              <Clock3 size={15} aria-hidden="true" />
              {offer.durationHours} h{" "}
              {offer.sessionCount > 1 ? "/ séance" : "de live"}
            </span>
            <span>
              <Radio size={15} aria-hidden="true" />
              {offer.sessionCount}{" "}
              {offer.sessionCount > 1 ? "séances" : "séance"}
            </span>
          </div>
          <ul className={styles.features}>
            {offer.features.map((feature) => (
              <li key={feature}>
                <Check size={17} aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {compact ? (
            <Link
              href="/forfaits"
              aria-label={`Découvrir le forfait ${offer.name}`}
              className={`${styles.cardButton} ${offer.recommended ? styles.primaryButton : ""}`}
            >
              Découvrir ce forfait <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label={`Choisir le forfait ${offer.name}`}
                  className={`${styles.cardButton} ${offer.recommended ? styles.primaryButton : ""}`}
                >
                  Choisir ce forfait <ArrowRight size={17} aria-hidden="true" />
                </button>
              </DialogTrigger>
              <PackageDetails offer={offer} />
            </Dialog>
          )}
        </article>
      ))}
    </div>
  );
}
