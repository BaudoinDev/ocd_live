import { Plus } from "lucide-react";
import styles from "./faq.module.css";

export const questions = [
  {
    question: "À qui s’adressent les lives OCD ?",
    answer:
      "Aux entrepreneurs, commerçants, artisans, prestataires et marques qui souhaitent présenter leur activité. Produits physiques ou services : le live permet de montrer ce que vous faites et de répondre aux questions en direct.",
  },
  {
    question: "Dois-je venir à Lomé pour participer ?",
    answer:
      "Vous avez le choix. Rejoignez l’équipe dans les locaux d’OCD à Lomé, ou participez à distance comme co-host du TikTok Live. Pour la participation à distance, prévoyez un compte TikTok compatible avec le co-host, une connexion stable et un environnement calme.",
  },
  {
    question: "Ai-je besoin d’une grande communauté sur TikTok ?",
    answer:
      "Non, la promotion est organisée sur le live d’OCD. Vous apportez vos produits, votre savoir-faire et votre histoire. Les conditions techniques de participation en co-host seront vérifiées avec vous avant une séance à distance.",
  },
  {
    question: "Comment choisir mon forfait ?",
    answer:
      "Commencez par une séance Découverte pour présenter l’essentiel. Boost et Business vous donnent davantage de temps pour vos démonstrations. Les forfaits semaine et mensuel permettent de répartir votre présence sur plusieurs séances.",
  },
  {
    question: "Peut-on déjà réserver et payer sur ce site ?",
    answer:
      "Ce site est un prototype de présentation. Vous pouvez explorer les offres, mais la réservation, les comptes clients et les paiements ne sont pas encore actifs. Les prix affichés sont des hypothèses de démonstration, à valider par l’agence.",
  },
  {
    question: "Le live garantit-il des ventes ?",
    answer:
      "Aucun nombre de vues, de contacts ou de ventes n’est garanti. Le live est un espace pour faire découvrir votre offre, montrer vos produits et échanger. Les résultats dépendent notamment de votre activité, de votre présentation et de l’audience présente.",
  },
];
export function Faq() {
  return (
    <div className={styles.list}>
      {questions.map((item, index) => (
        <details key={item.question} className={styles.item}>
          <summary>
            <span className={styles.number}>0{index + 1}</span>
            <span>{item.question}</span>
            <Plus size={19} aria-hidden="true" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
