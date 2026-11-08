import Link from "next/link";
import { ArrowLeft, CalendarDays, Radio, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import styles from "./auth.module.css";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>
    <aside className={styles.side} aria-label="Bienvenue chez OCD Live">
      <Logo />
      <div className={styles.sideBody}>
        <p className={styles.sideLabel}><Radio size={16} aria-hidden="true" /> Votre marque mérite d’être vue</p>
        <h2>Le prochain live.<br /><em>Votre prochain élan.</em></h2>
        <p className={styles.sideCopy}>Un espace pour préparer vos prises de parole et donner de la visibilité à votre entreprise.</p>
        <div className={styles.sideSteps}>
          <div className={styles.sideStep}><span className={styles.stepIcon}><Sparkles size={20} aria-hidden="true" /></span><span>Le forfait qui correspond à votre ambition</span></div>
          <div className={styles.sideStep}><span className={styles.stepIcon}><CalendarDays size={20} aria-hidden="true" /></span><span>Vos séances, à votre rythme</span></div>
          <div className={styles.sideStep}><span className={styles.stepIcon}><Radio size={20} aria-hidden="true" /></span><span>À Lomé ou à distance via TikTok</span></div>
        </div>
      </div>
      <p className={styles.sideFoot}>OCD Live · Les marques prennent la parole.</p>
    </aside>
    <main className={styles.main} id="contenu-principal">
      <div className={styles.topbar}><Link href="/" className={styles.textLink}><ArrowLeft size={14} aria-hidden="true" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />Retour au site</Link></div>
      {children}
    </main>
  </div>;
}
