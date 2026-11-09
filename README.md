# OCD Live

Plateforme de l’agence OCD à Lomé : les entreprises créent un compte, choisissent un forfait de promotion TikTok Live, leur mode de participation (à l’agence ou à distance en co-host) et un créneau libre. Le gérant est alerté à chaque réservation et pilote l’activité depuis son espace.

Stack : Next.js (App Router, Server Actions), PostgreSQL sur Neon, Drizzle ORM, Playwright.

## Démarrer

```powershell
npm.cmd install
Copy-Item .env.example .env.local   # puis renseigner DATABASE_URL
npm.cmd run db:migrate
npm.cmd run db:seed:catalog
npm.cmd run dev
```

Ouvrir `http://localhost:3000`.

## Scripts base de données

| Commande | Rôle |
| --- | --- |
| `npm run db:generate` | Génère une migration après un changement de `lib/db/schema.ts` |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:seed:catalog` | Ajoute les forfaits initiaux, sans écraser l’existant |
| `npm run db:create-admin` | Crée un compte administrateur (variables `ADMIN_*`, voir le script) |
| `npm run db:seed:dev` | **Efface** la base et charge des données fictives. Exige `OCD_ALLOW_DB_RESET=true` |

## Vérifier

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npx.cmd playwright test
```

**Les tests Playwright effacent la base pointée par `DATABASE_URL`** : ils refusent de démarrer sans `OCD_ALLOW_DB_RESET=true`, à ne définir que sur une base de développement. Ils utilisent Google Chrome installé localement.

## Architecture

| Emplacement | Rôle |
| --- | --- |
| `lib/db` | Schéma et connexion Neon |
| `lib/auth` | Mots de passe (scrypt), sessions en base, contrôle d’accès |
| `lib/data` | Lectures : catalogue public mis en cache, données d’un espace |
| `lib/booking-rules.ts` | Règles de créneaux, partagées par le navigateur et le serveur |
| `features/*/actions.ts` | Server Actions ; chacune vérifie elle-même session et droits |
| `components/workspace` | Contrôle d’accès, navigation et tableau des réservations |
| `drizzle/` | Migrations |

Les données d’un client ne contiennent que ses propres lignes. Les chevauchements de créneaux sont refusés par une contrainte d’exclusion PostgreSQL, y compris en cas de requêtes simultanées.

## Déployer sur Vercel

1. Créer une branche Neon de production, distincte de celle de développement.
2. Y exécuter `db:migrate`, `db:seed:catalog` et `db:create-admin`.
3. Définir `DATABASE_URL` dans Vercel (nécessaire aussi au build, qui précharge le catalogue) et, pour l’alerte e-mail, `RESEND_API_KEY`, `MANAGER_ALERT_EMAIL` et `ALERT_FROM_EMAIL`.
4. Ne jamais définir `OCD_ALLOW_DB_RESET` en production.

## Limites actuelles

Pas de paiement en ligne ni d’intégration TikTok. Pas de réinitialisation de mot de passe, qui demande un service d’envoi d’e-mails. L’alerte WhatsApp n’est pas implémentée. Les six tarifs sont provisoires. La photographie de l’accueil est une illustration générée par IA, pas une cliente réelle.
