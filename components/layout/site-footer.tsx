import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Logo } from "./logo";
import styles from "./public-shell.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <Logo footer />
            <p>
              Les opportunités, c’est dehors.
              <br />
              Et votre prochaine audience est ici.
            </p>
            <span>
              <MapPin size={14} aria-hidden="true" /> Lomé, Togo
            </span>
          </div>
          <div className={styles.footerLinks}>
            <h2>Découvrez OCD Live</h2>
            <Link href="/">
              Accueil <ArrowUpRight size={14} />
            </Link>
            <Link href="/#comment-ca-marche">
              Comment ça marche <ArrowUpRight size={14} />
            </Link>
            <Link href="/forfaits">
              Nos forfaits <ArrowUpRight size={14} />
            </Link>
            <Link href="/#contact">
              Nous rencontrer <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className={styles.footerStatement}>
            <span className="eyebrow">
              VOTRE ACTIVITÉ A QUELQUE CHOSE À DIRE.
            </span>
            <p>
              Donnons-lui
              <br />
              le <em>premier rôle.</em>
            </p>
            <Link href="/forfaits" className={styles.footerCta}>
              Trouver mon forfait <ArrowUpRight size={19} />
            </Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© OCD Live · Les Opportunités C’est Dehors</span>
          <span>Prototype de démonstration · Tarifs indicatifs</span>
          <span>Fait pour les entrepreneurs.</span>
        </div>
      </div>
    </footer>
  );
}
