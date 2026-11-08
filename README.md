# OCD Live

Site public de démonstration de l’agence OCD à Lomé : présentation des promotions TikTok Live, participation en présentiel ou à distance et catalogue des forfaits. Seule la **phase 1** est implémentée.

## Démarrer

```powershell
npm.cmd install
npm.cmd run dev
```

Ouvrir `http://localhost:3000`. Les pages disponibles sont `/` et `/forfaits`. « Comment ça marche » et « Contact » pointent vers `/#comment-ca-marche` et `/#contact` ; ces sections n’ont pas de route distincte.

## Vérifier

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
npx.cmd playwright test
```

Playwright utilise Google Chrome installé localement (`channel: "chrome"`) et démarre le serveur de développement si nécessaire. Les tests couvrent les deux pages à 375, 768 et 1440 px, la navigation mobile, le clavier, les fenêtres d’information et les forfaits. Ils ne remplacent pas un audit complet d’accessibilité.

## Périmètre

Les boutons de connexion et de réservation ouvrent une explication de l’aperçu. Aucun compte, réservation, paiement ou donnée `localStorage` n’est créé. Les six tarifs sont provisoires. La photographie est une illustration générée par IA, pas une cliente réelle.

Le logo officiel est `public/images/Orange OCD Live Logo.png`. La palette et les polices suivent la charte fournie. Voir [les choix de la phase 1](docs/phase-1.md), les [polices et licences](public/fonts/README.md) et les offres dans `lib/packages.ts`.

## Préparer Vercel

1. Pousser ce dépôt dans le service Git de votre choix.
2. Importer le dépôt dans Vercel et conserver le préréglage **Next.js**.
3. Utiliser `npm run build` comme commande de compilation ; conserver le répertoire de sortie par défaut.
4. Déployer après vérification des pages et des tarifs.

Aucune variable d’environnement, clé API ou base de données n’est nécessaire à cette phase. Aucun déploiement n’est effectué par cette livraison. Les phases 2 à 6 attendent la validation du commanditaire.
