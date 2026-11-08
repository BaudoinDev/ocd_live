import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  CalendarDays,
  Check,
  Heart,
  MapPin,
  MessageCircle,
  MonitorPlay,
  MoveUpRight,
  PackageOpen,
  Play,
  Radio,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureNotice } from "@/components/marketing/feature-notice";
import { PackageGrid } from "@/components/marketing/package-grid";
import { Participation } from "@/components/marketing/participation";
import { Faq } from "@/components/marketing/faq";
import styles from "./home.module.css";

const benefits = [
  {
    icon: Video,
    title: "Montrez, plutôt que raconter.",
    text: "Un produit en action, un détail qui fait la différence, votre savoir-faire. Donnez à votre offre la place qu’une simple photo ne lui donne pas.",
  },
  {
    icon: MessageCircle,
    title: "Créez une vraie conversation.",
    text: "Répondez aux questions, expliquez votre démarche et échangez en direct avec les personnes qui découvrent votre activité.",
  },
  {
    icon: Users,
    title: "Faites-vous accompagner.",
    text: "OCD organise la séance et vous aide à mettre votre offre en avant. Vous vous concentrez sur ce que vous connaissez le mieux : votre business.",
  },
];
const steps = [
  {
    icon: PackageOpen,
    title: "Trouvez votre format.",
    text: "Une première découverte ou une présence régulière : choisissez le forfait adapté à vos objectifs.",
  },
  {
    icon: CalendarDays,
    title: "Préparez votre rendez-vous.",
    text: "Choisissez votre mode de participation et préparez vos produits. Le parcours de réservation en ligne arrive bientôt.",
  },
  {
    icon: Radio,
    title: "À vous de passer en live.",
    text: "À l’agence ou à distance, présentez votre activité avec OCD et échangez avec l’audience en direct.",
  },
];

export default function Home() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className={styles.heroEyebrow}>
              <span /> LE LIVE AU SERVICE DE VOTRE ACTIVITÉ
            </span>
            <h1 id="hero-title">
              Votre business
              <br />
              mérite d’être
              <br />
              <span className={styles.heroAccent}>
                vu.
                <svg viewBox="0 0 185 18" fill="none" aria-hidden="true">
                  <path
                    d="M4 12C44 1 106 1 178 7M25 16c43-7 92-9 137-6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <MoveUpRight className={styles.heroArrow} aria-hidden="true" />
            </h1>
            <p className={styles.heroDescription}>
              Vos produits. Votre savoir-faire. Votre histoire.
              <br />
              Faites-les découvrir grâce aux promotions{" "}
              <strong>TikTok Live</strong> d’OCD, à Lomé ou depuis chez vous.
            </p>
            <div className={styles.heroActions}>
              <FeatureNotice>
                Réserver une promotion{" "}
                <ArrowUpRight size={18} aria-hidden="true" />
              </FeatureNotice>
              <Link href="/forfaits" className={styles.heroSecondary}>
                Voir les forfaits <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.modeBadges}>
              <span>
                <MapPin size={14} aria-hidden="true" /> Présentiel à Lomé
              </span>
              <span>
                <MonitorPlay size={15} aria-hidden="true" /> À distance, en
                co-host
              </span>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCircle} aria-hidden="true" />
            <div className={styles.orbitLine} aria-hidden="true" />
            <div className={styles.floatingTop}>
              <span className={styles.iconTile}>
                <Sparkles size={21} aria-hidden="true" />
              </span>
              <div>
                Votre prochaine opportunité ?
                <strong>Elle commence en live.</strong>
              </div>
              <ArrowUpRight size={20} aria-hidden="true" />
            </div>
            <figure className={styles.liveFrame}>
              <Image
                src="/images/live-studio.webp"
                alt="Illustration d’une entrepreneuse présentant un produit de soin pendant une séance promotionnelle."
                fill
                sizes="(max-width: 700px) 78vw, (max-width: 1000px) 40vw, 360px"
                preload
                className={styles.liveImage}
              />
              <div className={styles.liveTop}>
                <span>
                  <Radio size={13} aria-hidden="true" /> LIVE
                </span>
                <span>OCD Live</span>
              </div>
              <div className={styles.liveCaption}>
                <span>VOTRE SAVOIR-FAIRE, EN DIRECT.</span>
                <p>
                  Une histoire à partager.
                  <br />
                  Un business à découvrir.
                </p>
                <div>
                  <span>
                    <Video size={13} aria-hidden="true" /> Promotion en live
                  </span>
                  <Heart size={18} aria-hidden="true" />
                </div>
              </div>
              <figcaption className={styles.imageCaption}>
                Aperçu illustratif · Image générée
              </figcaption>
            </figure>
            <div className={styles.floatingBottom}>
              <span className={styles.smallCheck}>
                <Check size={18} aria-hidden="true" />
              </span>
              <div>
                Votre business<strong>au premier plan.</strong>
              </div>
              <span className={styles.miniWave} aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className={styles.visualNote}>
              <span />
              <span>
                Des échanges réels.
                <br />
                De nouvelles possibilités.
              </span>
            </div>
          </div>
        </div>
        <div className={`container ${styles.heroFoot}`}>
          <a href="#pourquoi" aria-label="Découvrir les avantages d’OCD Live">
            <ArrowDown size={15} aria-hidden="true" /> FAITES PLACE AUX
            OPPORTUNITÉS
          </a>
          <span>Une agence à Lomé. Une vitrine qui va plus loin.</span>
        </div>
      </section>

      <div className={styles.audienceStrip}>
        <div className={`container ${styles.audienceInner}`}>
          <p>
            Vous avez un business.
            <br />
            <strong>Le live a une place pour vous.</strong>
          </p>
          <div>
            {[
              "Entrepreneurs",
              "Commerçants",
              "Artisans",
              "Marques",
              "Prestataires",
            ].map((label) => (
              <span key={label}>
                <span aria-hidden="true">
                  <Asterisk size={18} strokeWidth={1.5} />
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section
        id="pourquoi"
        className={styles.benefits}
        aria-labelledby="benefits-title"
      >
        <div className={`container ${styles.benefitsGrid}`}>
          <div className={styles.sectionIntro}>
            <span className="eyebrow">PLUS QU’UNE SIMPLE PUBLICATION</span>
            <h2 id="benefits-title">
              Votre activité prend
              <br />
              une autre dimension<span className={styles.orangeDot}>.</span>
            </h2>
            <p>
              Il y a ce que vous faites. Et il y a la façon dont le monde le
              découvre. Le live fait le lien entre les deux.
            </p>
            <a className="text-link" href="#comment-ca-marche">
              Découvrir le concept{" "}
              <span className={styles.playCircle}>
                <Play size={11} fill="currentColor" aria-hidden="true" />
              </span>
            </a>
            <div className={styles.editorialNote}>
              <span>OCD</span>
              <p>
                <strong>Les Opportunités C’est Dehors.</strong>
                <br />
                On vous aide à aller à leur rencontre.
              </p>
            </div>
          </div>
          <div className={styles.benefitRows}>
            {benefits.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className={styles.benefitRow}>
                <span className={styles.benefitIcon}>
                  <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <span className={styles.rowNumber}>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="comment-ca-marche"
        className={styles.process}
        aria-labelledby="process-title"
      >
        <div className="container">
          <div className={styles.centerIntro}>
            <span className="eyebrow">DE VOTRE IDÉE AU DIRECT</span>
            <h2 id="process-title">
              Vous avez l’offre.
              <br />
              On lui donne la parole.
            </h2>
            <p>Un parcours simple pour faire découvrir ce que vous faites.</p>
          </div>
          <div className={styles.steps}>
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article key={title}>
                <div className={styles.stepTop}>
                  <span>0{index + 1}</span>
                  <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
                  {index < 2 && (
                    <ArrowRight
                      className={styles.stepArrow}
                      size={20}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className={styles.processCta}>
            <FeatureNotice variant="dark">
              Préparer mon premier live{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </FeatureNotice>
            <span>La réservation en ligne sera bientôt disponible.</span>
          </div>
        </div>
      </section>

      <Participation />

      <section className={styles.pricing} aria-labelledby="pricing-title">
        <div className="container">
          <div className={styles.pricingHeading}>
            <div>
              <span className="eyebrow">À CHAQUE AMBITION, SON FORMAT</span>
              <h2 id="pricing-title">
                Un premier live.
                <br />
                Ou le début d’une habitude.
              </h2>
            </div>
            <Link href="/forfaits" className="text-link">
              Voir les 6 forfaits <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.pricingIntro}>
            Choisissez le temps qu’il vous faut pour raconter votre activité.
          </p>
          <PackageGrid compact />
          <p className={styles.priceNote}>
            Tarifs provisoires de démonstration, à confirmer par l’agence. Aucun
            paiement sur ce site.
          </p>
        </div>
      </section>

      <section className={styles.about} aria-labelledby="about-title">
        <div className={`container ${styles.aboutGrid}`}>
          <div className={styles.aboutMark} aria-hidden="true">
            <span>
              LES
              <br />
              OPPORTUNITÉS,
              <br />
              C’EST <em>DEHORS.</em>
            </span>
            <ArrowUpRight size={60} strokeWidth={1.2} />
            <div>
              <MapPin size={14} /> LOMÉ, TOGO
            </div>
          </div>
          <div>
            <span className="eyebrow">UNE ÉQUIPE, UN TERRAIN COMMUN</span>
            <h2 id="about-title">
              Derrière chaque business,
              <br />
              il y a une histoire.
            </h2>
            <p>
              OCD est une agence de marketing digital et de promotion
              commerciale basée à Lomé. Notre idée est simple : donner aux
              entreprises un espace pour se présenter, montrer leurs produits et
              créer le contact.
            </p>
            <p>
              Avec OCD Live, nous faisons du direct un rendez-vous entre votre
              activité et celles et ceux qui pourraient la découvrir.
            </p>
            <a href="#contact" className="text-link">
              Faisons connaissance <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={`container ${styles.faqGrid}`}>
          <div>
            <span className="eyebrow">ON VOUS RÉPOND</span>
            <h2 id="faq-title">
              Avant de passer
              <br />
              en direct.
            </h2>
            <p>Les réponses aux questions que vous vous posez peut-être.</p>
            <span className={styles.faqNote}>
              <MessageCircle size={17} aria-hidden="true" /> Parlons de votre
              prochaine opportunité.
            </span>
          </div>
          <Faq />
        </div>
      </section>

      <section
        id="contact"
        className={styles.contact}
        aria-labelledby="contact-title"
      >
        <div className={`container ${styles.contactInner}`}>
          <div className={styles.contactDecor} aria-hidden="true">
            <ArrowUpRight size={160} strokeWidth={0.7} />
          </div>
          <div>
            <span className="eyebrow">ET SI ON VOUS DÉCOUVRAIT ?</span>
            <h2 id="contact-title">
              Votre prochain client
              <br />
              ne vous connaît pas encore.
            </h2>
            <p>Commençons par lui montrer ce que vous faites.</p>
            <div className={styles.contactActions}>
              <Button asChild>
                <Link href="/forfaits">
                  Trouver mon forfait{" "}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </Button>
              <span>
                <MapPin size={16} aria-hidden="true" /> Agence OCD à Lomé ·
                Participation à distance possible
              </span>
            </div>
            <p className={styles.contactNote}>
              L’agence et ses offres vous sont présentées dans cet aperçu. Les
              coordonnées de contact et la réservation seront ajoutées après
              validation.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
