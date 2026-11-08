"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  MapPin,
  MonitorPlay,
  Radio,
  Video,
} from "lucide-react";
import Link from "next/link";
import styles from "./participation.module.css";

const modes = {
  agency: {
    title: "Votre énergie. Notre studio.",
    description:
      "Venez avec vos produits et vos idées. Dans les locaux de l’agence, l’équipe OCD vous accompagne pour mettre votre activité en lumière.",
    benefits: [
      "Un échange direct avec notre équipe",
      "Vos produits présentés sur place",
      "Un cadre dédié à votre promotion",
    ],
    label: "Présentiel",
    location: "Agence OCD · Lomé, Togo",
  },
  remote: {
    title: "Votre boutique devient un plateau.",
    description:
      "Restez dans votre univers et rejoignez le TikTok Live d’OCD en co-host. Montrez vos produits depuis votre boutique, votre atelier ou votre bureau.",
    benefits: [
      "Participez depuis votre localisation",
      "Présentez votre propre environnement",
      "Connexion et éligibilité co-host à vérifier",
    ],
    label: "À distance",
    location: "TikTok Live · Mode co-host",
  },
};

export function Participation() {
  const [mode, setMode] = useState<"agency" | "remote">("agency");
  const selected = modes[mode];
  return (
    <section className={styles.section} aria-labelledby="modes-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.visual} aria-hidden="true">
          <div className={styles.visualTop}>
            <span className={styles.live}>
              <Radio size={14} /> OCD LIVE
            </span>
            <span>Votre business au premier plan</span>
          </div>
          <div className={styles.visualCenter}>
            <div
              className={`${styles.visualIcon} ${mode === "remote" ? styles.remoteIcon : ""}`}
            >
              {mode === "agency" ? (
                <MapPin size={61} strokeWidth={1.2} />
              ) : (
                <MonitorPlay size={61} strokeWidth={1.2} />
              )}
            </div>
            <p>
              {mode === "agency"
                ? "On se voit au studio ?"
                : "Vous êtes déjà au bon endroit."}
            </p>
            <span>{selected.location}</span>
          </div>
          <div className={styles.visualBottom}>
            <span>
              <Video size={16} /> {selected.label}
            </span>
            <span>
              À votre façon <ArrowUpRight size={15} />
            </span>
          </div>
          <div className={styles.orbit} />
          <div className={styles.orbitSmall} />
        </div>
        <div className={styles.content}>
          <span className="eyebrow">DEUX FAÇONS DE PASSER EN LIVE</span>
          <h2 id="modes-title">
            De près ou de loin.
            <br />
            Toujours au premier plan.
          </h2>
          <div
            className={styles.switch}
            role="group"
            aria-label="Mode de participation"
          >
            <button
              aria-pressed={mode === "agency"}
              aria-controls="participation-description"
              onClick={() => setMode("agency")}
            >
              <MapPin size={15} aria-hidden="true" /> À l’agence
            </button>
            <button
              aria-pressed={mode === "remote"}
              aria-controls="participation-description"
              onClick={() => setMode("remote")}
            >
              <MonitorPlay size={16} aria-hidden="true" /> À distance
            </button>
          </div>
          <div
            id="participation-description"
            className={styles.description}
            aria-live="polite"
          >
            <h3>{selected.title}</h3>
            <p>{selected.description}</p>
            <ul>
              {selected.benefits.map((item) => (
                <li key={item}>
                  <Check size={15} aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <Link className="text-link" href="/forfaits">
            Trouver le format qui me convient{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
