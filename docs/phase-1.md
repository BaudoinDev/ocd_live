# Phase 1 — Identité visuelle et site public

## Livré

L’accueil `/` présente le service OCD Live, ses avantages, les étapes, les deux modes de participation, une sélection de forfaits, l’agence, la FAQ et le contact. `/forfaits` présente les six offres et leurs détails. Le header et le footer sont partagés, avec un menu mobile et une navigation clavier.

Les liens `/#comment-ca-marche` et `/#contact` ciblent des sections de l’accueil. Les routes `/comment-ca-marche` et `/contact` ne sont pas créées dans cette phase. Les coordonnées de contact attendent leur validation ; aucune adresse ou numéro n’est inventé.

Les FAQ sont dépliables. Le choix présentiel/distance actualise une explication. Les boutons de compte et de réservation ouvrent une fenêtre d’information, sans enregistrer de demande. La fermeture par Échap et le retour du focus sont prévus.

## Charte

Source de vérité : `OCD Live – Palette et typographie.html`, fourni avec le brief. Les valeurs suivantes sont conservées dans `app/globals.css` :

| Token           | Valeur    | Usage                       |
| --------------- | --------- | --------------------------- |
| `--brand`       | `#E05A00` | Orange de marque            |
| `--brand-dark`  | `#C24D00` | Actions et accents lisibles |
| `--brand-light` | `#FFF1E6` | Fonds pêche                 |
| `--ink`         | `#111111` | Texte et titres             |
| `--muted`       | `#5B6068` | Texte secondaire            |
| `--bg`          | `#FFFFFF` | Fond principal              |
| `--sand`        | `#FAF8F5` | Surface sable               |
| `--line`        | `#E8E4DE` | Séparateurs                 |
| `--dark`        | `#1A1A1A` | Surface sombre              |
| `--ok`          | `#16A34A` | Succès                      |
| `--warn`        | `#F59E0B` | Attention                   |
| `--err`         | `#DC2626` | Erreur                      |
| `--info`        | `#2563EB` | Information et focus        |
| `--remote`      | `#0F766E` | Participation à distance    |

L’orange profond `#C24D00`, déjà présent dans la charte, porte les boutons principaux et les petits textes orange pour améliorer le contraste. Le thème clair est un choix volontaire conforme à la palette de base. Le sélecteur de thème du document de charte est un outil de démonstration ; un basculement sombre n’est pas requis pour la phase 1.

Outfit est utilisé pour les titres, prix et boutons, principalement en **600 et 800**. DM Sans est utilisé pour le texte courant en **400, 500 et 700**. Les fichiers variables officiels sont auto-hébergés dans `public/fonts` et chargés par `next/font/local` : aucune requête Google Fonts à l’affichage. Les licences SIL Open Font License 1.1 et les sources sont conservées à côté des fichiers.

Le logo officiel `public/images/ocd-logo.png` conserve ses proportions et ses couleurs ; il est recadré sur fond transparent. `public/images/live-studio.webp` est une image générée par IA et indiquée comme illustrative dans l’accueil. Elle ne représente pas une cliente ni une séance réelle. Aucun résultat commercial ou témoignage fictif n’est présenté comme authentique.

## Architecture

| Emplacement                      | Rôle                                                   |
| -------------------------------- | ------------------------------------------------------ |
| `app/(public)/layout.tsx`        | Structure publique partagée, lien d’évitement          |
| `app/(public)/page.tsx`          | Accueil                                                |
| `app/(public)/forfaits/page.tsx` | Catalogue                                              |
| `components/layout`              | Logo, header et footer                                 |
| `components/ui`                  | Fondations shadcn/ui avec primitives Radix             |
| `components/marketing`           | Forfaits, FAQ, participation et fenêtres d’information |
| `lib/packages.ts`                | Catalogue typé centralisé                              |
| `app/globals.css`                | Tokens et styles communs                               |
| `tests/public-site.spec.ts`      | Contrôles navigateur ciblés                            |

Next.js App Router, TypeScript, React, Tailwind CSS et CSS Modules composent l’interface. Les icônes proviennent de Lucide React. Les composants interactifs sont isolés côté client.

## Hypothèses commerciales

| Forfait            | Séances      | Prix provisoire |
| ------------------ | ------------ | --------------- |
| Découverte         | 1 × 1 heure  | 15 000 FCFA     |
| Boost — recommandé | 1 × 3 heures | 25 000 FCFA     |
| Business           | 1 × 5 heures | 40 000 FCFA     |
| Semaine Starter    | 3 × 1 heure  | 60 000 FCFA     |
| Semaine Pro        | 5 × 1 heure  | 90 000 FCFA     |
| Mensuel Premium    | 12 × 1 heure | 200 000 FCFA    |

Ces montants sont des hypothèses de démonstration à confirmer par l’agence ; ils ne constituent pas des tarifs validés. Modifier le catalogue dans `lib/packages.ts` met à jour les deux pages.

## Limites et suite

Cette livraison ne crée ni authentification, formulaire d’inscription, calendrier, réservation, dashboard, paiement, base de données, intégration TikTok ou stockage `localStorage`. Aucun service externe avec clé API n’est nécessaire. Les phases **2 à 6** restent soumises à validation avant développement.

Les commandes de développement, lint, TypeScript, build et tests Chrome, ainsi que la préparation Vercel, sont documentées dans le [README](../README.md). Les tests ciblent les interactions et le responsive ; ils ne garantissent pas à eux seuls une conformité d’accessibilité complète. Aucun déploiement n’a été effectué.
