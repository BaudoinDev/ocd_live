import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MapPin, Plus, Video } from "lucide-react";
import { PackageCatalog } from "@/components/marketing/package-catalog";
import styles from "./forfaits.module.css";

export const metadata: Metadata = {
  title: "Forfaits de promotion TikTok Live",
  description:
    "Découvrez les six forfaits OCD Live pour présenter vos produits et services sur TikTok Live, à Lomé ou à distance.",
};

const questions = [
  {
    question: "Quel forfait choisir pour un premier live ?",
    answer:
      "Découverte offre une heure pour présenter votre activité et faire connaissance avec l’audience. Si vous avez plusieurs produits à montrer ou souhaitez prendre le temps d’échanger, le forfait Boost propose une séance de trois heures.",
  },
  {
    question: "Puis-je participer depuis une autre ville ?",
    answer:
      "Oui. Tous les forfaits prévoient un mode à distance via la fonction co-host de TikTok Live. Vous pourrez aussi participer en présentiel, dans les locaux de l’agence OCD à Lomé. Les conditions techniques seront à vérifier avec l’équipe avant votre séance.",
  },
  {
    question: "Comment se déroulent les offres de plusieurs séances ?",
    answer:
      "Les offres Semaine Starter, Semaine Pro et Mensuel Premium comprennent respectivement 3, 5 et 12 lives d’une heure. Chaque séance dispose de son propre créneau, à planifier selon les disponibilités de l’agence.",
  },
  {
    question: "Ces tarifs sont-ils définitifs ?",
    answer:
      "Non. Les prix affichés sont provisoires. L’équipe OCD confirme le tarif et les modalités avec vous avant tout engagement.",
  },
  {
    question: "Puis-je réserver et payer sur ce site ?",
    answer:
      "Vous pouvez créer un compte et réserver votre créneau en ligne. Le paiement ne se fait pas sur ce site : l’équipe OCD vous recontacte pour confirmer votre réservation.",
  },
];

export default function PackagesPage() {
  return (
    <>
      <section className={styles.intro}>
        <div className="container">
          <span className="eyebrow">À chaque ambition, son live</span>
          <h1>
            Le bon format.
            <br />
            <span>Votre prochaine opportunité.</span>
          </h1>
          <p>
            Un premier live ou des rendez-vous réguliers : choisissez le temps
            de parole qui correspond à votre activité.
          </p>
          <div className={styles.modes}>
            <span>
              <MapPin size={14} aria-hidden="true" /> Présentiel à Lomé
            </span>
            <span>
              <Video size={14} aria-hidden="true" /> À distance en co-host
            </span>
          </div>
        </div>
      </section>

      <section
        className={styles.packages}
        aria-label="Les six forfaits de promotion"
      >
        <div className="container">
          <div className={styles.pricingHeader}>
            <p>Votre activité mérite d’être vue.</p>
            <span>Six formats. Deux façons de participer.</span>
          </div>
          <PackageCatalog />
          <p className={styles.disclaimer}>
            Tous les prix sont exprimés en FCFA. Tarifs provisoires, soumis à validation par l’agence OCD.
          </p>
        </div>
      </section>

      <section className={styles.included}>
        <div className={`container ${styles.includedInner}`}>
          <div>
            <span className="eyebrow">Dans chaque format</span>
            <h2>
              Votre offre au centre
              <br />
              de la conversation.
            </h2>
          </div>
          <ul>
            <li>
              <Check size={19} aria-hidden="true" />
              <span>Un temps dédié pour présenter votre activité</span>
            </li>
            <li>
              <Check size={19} aria-hidden="true" />
              <span>Des démonstrations de vos produits et services</span>
            </li>
            <li>
              <Check size={19} aria-hidden="true" />
              <span>Un échange direct avec les personnes connectées</span>
            </li>
            <li>
              <Check size={19} aria-hidden="true" />
              <span>
                Le choix entre l’agence à Lomé et le co-host à distance
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.faq}>
        <div className={`container ${styles.faqInner}`}>
          <div className={styles.faqHeading}>
            <span className="eyebrow">Tout simplement</span>
            <h2>
              Avant de vous
              <br />
              lancer en live.
            </h2>
            <p>Quelques réponses pour vous aider à choisir votre format.</p>
          </div>
          <div className={styles.questions}>
            {questions.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <Plus size={18} aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.contact}>
        <div className={`container ${styles.contactInner}`}>
          <div>
            <span className="eyebrow">Parlons de votre activité</span>
            <h2>Une question sur votre prochain live ?</h2>
            <p>Retrouvez les informations de l’agence et préparons la suite.</p>
          </div>
          <Link href="/#contact" className="button button-primary">
            Découvrir l’agence <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
