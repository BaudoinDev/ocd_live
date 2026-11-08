"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock3 } from "lucide-react";
import { useDemo } from "@/components/demo/demo-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/packages";
import styles from "@/features/client/client.module.css";

export default function ClientPackages() {
  const { state } = useDemo();
  return <>
    <div className="page-heading"><div><p className="page-kicker">UNE AMBITION, UN FORMAT</p><h1>Nos forfaits</h1><p className="page-description">Un premier live ou une présence régulière : choisissez le rythme de votre marque.</p></div></div>
    <div className={styles.packages}>{state.packages.map((pack) => <article key={pack.id} className={`${styles.package} ${pack.recommended ? styles.recommended : ""}`}>
      {pack.recommended && <span className={styles.packageBadge}>Le plus populaire</span>}
      <h2>{pack.name}</h2><p className={styles.packageDescription}>{pack.description}</p><p className={styles.price}>{formatPrice(pack.price)} <small>FCFA</small></p><p className={styles.duration}><Clock3 size={15} aria-hidden="true" />{pack.sessionCount} séance{pack.sessionCount > 1 ? "s" : ""} de {pack.durationHours} h</p><ul className={styles.features}>{pack.features.map((feature) => <li key={feature}><Check size={14} aria-hidden="true" /><span>{feature}</span></li>)}</ul><Button asChild variant={pack.recommended ? "default" : "secondary"}><Link href={`/dashboard/reserver?forfait=${encodeURIComponent(pack.id)}`}>Choisir ce forfait<ArrowRight size={16} aria-hidden="true" /></Link></Button>
    </article>)}</div>
    <p className={styles.footnote}>Tarifs de démonstration en FCFA, modifiables dans l’espace administrateur de ce navigateur. Aucun paiement n’est effectué.</p>
  </>;
}
