export type PromotionPackage = {
  id: string;
  name: string;
  price: number;
  durationHours: number;
  sessionCount: number;
  description: string;
  features: readonly string[];
  cadence: string;
  recommended?: boolean;
};

/** Commercial assumptions for the presentation; these are not confirmed rates. */
export const packages: readonly PromotionPackage[] = [
  {
    id: "decouverte",
    name: "Découverte",
    price: 15_000,
    durationHours: 1,
    sessionCount: 1,
    description: "Un premier live pour faire découvrir votre activité.",
    features: [
      "Présentation de vos produits ou services",
      "Échanges en direct avec l’audience",
      "Présentiel à Lomé ou à distance",
    ],
    cadence: "Une première prise de parole",
  },
  {
    id: "boost",
    name: "Boost",
    price: 25_000,
    durationHours: 3,
    sessionCount: 1,
    description: "Prenez le temps de montrer ce qui vous rend unique.",
    features: [
      "Plus de temps pour vos démonstrations",
      "Échanges en direct avec l’audience",
      "Présentiel à Lomé ou à distance",
    ],
    cadence: "Pour aller plus loin",
    recommended: true,
  },
  {
    id: "business",
    name: "Business",
    price: 40_000,
    durationHours: 5,
    sessionCount: 1,
    description: "Un format long pour présenter toute votre offre.",
    features: [
      "Une présentation approfondie de l’offre",
      "Du temps pour répondre aux questions",
      "Présentiel à Lomé ou à distance",
    ],
    cadence: "Votre offre, en grand format",
  },
  {
    id: "semaine-starter",
    name: "Semaine Starter",
    price: 60_000,
    durationHours: 1,
    sessionCount: 3,
    description: "Trois rendez-vous pour commencer à créer le lien.",
    features: [
      "3 lives d’une heure sur la semaine",
      "Des produits à présenter à chaque séance",
      "Présentiel à Lomé ou à distance",
    ],
    cadence: "Un rythme de 3 lives par semaine",
  },
  {
    id: "semaine-pro",
    name: "Semaine Pro",
    price: 90_000,
    durationHours: 1,
    sessionCount: 5,
    description: "Une présence régulière pour faire vivre votre marque.",
    features: [
      "5 lives d’une heure sur la semaine",
      "Des rendez-vous réguliers avec l’audience",
      "Présentiel à Lomé ou à distance",
    ],
    cadence: "Un rythme de 5 lives par semaine",
  },
  {
    id: "mensuel-premium",
    name: "Mensuel Premium",
    price: 200_000,
    durationHours: 1,
    sessionCount: 12,
    description: "Installez votre activité dans la durée, live après live.",
    features: [
      "12 lives d’une heure sur le mois",
      "Une présence répartie sur plusieurs semaines",
      "Présentiel à Lomé ou à distance",
    ],
    cadence: "Votre visibilité sur un mois",
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
    price,
  );
}
