# Océan Média TV

Application React / TypeScript et API Node.js / Express 5, PostgreSQL (Neon), Prisma ORM 7. Les contenus éditoriaux et la configuration du site proviennent de PostgreSQL.

## Démarrer

Node.js 24.7 ou plus récent est requis pour le hachage Argon2id intégré. Dans le dossier du projet :

```powershell
npm.cmd ci
npm.cmd run db:generate
npm.cmd run dev
```

Le frontend est accessible sur http://127.0.0.1:5173 et l’API sur http://127.0.0.1:3001/api. Vite transmet les requêtes `/api` au serveur Express. `npm.cmd run dev` démarre les deux processus.

Le fichier `.env` local est déjà configuré pour la base fournie. Il est ignoré par Git. Sur un nouvel environnement, copier `.env.example` vers `.env`, renseigner `DATABASE_URL` et créer une `ADMIN_API_KEY` aléatoire d’au moins 32 caractères. Ces secrets ne doivent jamais être préfixés par `VITE_`.

## Base de données

```powershell
npm.cmd run db:migrate
npm.cmd run db:seed
```

Les migrations ont été appliquées sur Neon et les contenus existants ont été importés. L’import est additif et idempotent : il ne supprime rien et ne remplace pas les contenus déjà enregistrés. Les fichiers de `prisma/seed-content/` servent uniquement à cet import initial ; ils ne sont jamais importés par le frontend ni utilisés par l’API en fonctionnement. Modifier ensuite les contenus par l’API de gestion ou Prisma Studio.

```powershell
npm.cmd run db:studio
```

Le modèle conserve les catégories et leurs relations, les contenus, les réglages, les futures sessions de formation et un journal des écritures. Chaque type de contenu possède une validation Zod dédiée. Les corps détaillés et les résumés sont stockés séparément ; les listes ne sélectionnent que les résumés. Les index couvrent la rubrique, la catégorie, l’ordre de publication et la recherche textuelle avec `pg_trgm`.

## Chargement et pagination

| Rubrique | Maximum sur l’accueil | Par page d’exploration |
| --- | ---: | ---: |
| Regards de la Hero | 3 | — |
| Actualités | 4 | 9 |
| Océan TV | 4 | 9 |
| Opportunités | 3 | 9 |
| Formations | 6 | 9 |
| Événements | 3 | 9 |

L’accueil utilise `GET /api/home`, qui exécute une seule requête SQL bornée. Il ne récupère pas les corps d’articles ni les fiches complètes. Un changement de catégorie demande uniquement la sélection filtrée avec la même limite.

Les pages d’exploration utilisent une pagination SQL avec `LIMIT/OFFSET`, un ordre stable et un total calculé dans le même instantané PostgreSQL. Les filtres et recherches sont traités côté serveur. Les saisies sont temporisées de 300 ms, les requêtes obsolètes annulées et les requêtes simultanées identiques regroupées. Aucun catalogue local ni contenu de secours ne remplace le backend.

La navigation publique et administrative utilise React Router (`BrowserRouter`). Les liens internes changent de route sans recharger le document ; le navbar et le footer restent montés entre les pages publiques. Les routes d’articles, les accès directs, le rafraîchissement et les adresses introuvables sont gérés explicitement. L’historique restaure le défilement et les liens d’ancrage gardent un focus accessible.

Les paramètres `page`, `category` et `q` sont conservés dans l’URL et gérés par React Router. Les filtres ramènent à la première page. Le retour/précédent du navigateur restaure également les filtres et la page du catalogue. Le changement de page conserve une navigation clavier accessible et replace le focus sur le catalogue. Les états de chargement, d’erreur, de contenu absent et le bouton Réessayer sont prévus.

Les articles complets, les fiches Opportunités, Événements et Formations sont chargés à la demande. Le lecteur YouTube n’est créé qu’après une action explicite et reste sans autoplay.

## API publique

Les ressources sont `articles`, `videos`, `opportunities`, `trainings`, `events` et `hero`.

| Méthode | Route | Résultat |
| --- | --- | --- |
| GET | /api/health | État du processus |
| GET | /api/ready | Vérification PostgreSQL |
| GET | /api/site | Navigation, coordonnées, réseaux, catégories, crédits et image de formation |
| GET | /api/home | Sélections d’accueil limitées |
| GET | /api/:resource | Liste paginée de contenus publiés |
| GET | /api/:resource/:slug | Fiche complète publiée ou 404 |
| GET | /api/training-sessions | Sessions confirmées paginées |

Exemple : `/api/opportunities?page=2&limit=9&category=emploi&q=communication`.

Paramètres : `page` entier de 1 à 100000, `limit` entier de 1 à 24 (6 par défaut), `category` identifiant de catégorie, `q` recherche de 160 caractères maximum, `exclude` identifiant à exclure (recommandations). Une page hors catalogue retourne une liste vide et les métadonnées correctes.

```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 9, "total": 0, "totalPages": 0 }
}
```

Les publications retirées, les brouillons et les contenus dont la date de publication est future restent invisibles dans les routes publiques.

## API de gestion

L’interface `/admin` utilise une authentification nominative avec nom d’utilisateur ou email et mot de passe. Le mot de passe est dérivé avec Argon2id et un sel unique ; il n’est jamais stocké en clair. La session est portée par un cookie opaque `HttpOnly`, `SameSite=Strict`, limité à 12 heures, tandis que les écritures sont protégées par un jeton CSRF.

L’accès à `/admin` affiche directement un formulaire limité à deux champs : identifiant/email et mot de passe. Les comptes sont créés depuis le module Administrateurs. Tous les administrateurs disposent des mêmes droits ; la migration `202610270001_equal_administrators` supprime les anciens rôles en conservant les comptes et sessions. La clé technique `ADMIN_API_KEY` reste acceptée comme Bearer pour les scripts d’exploitation et les tests, mais ne doit jamais être intégrée au frontend ou à une variable `VITE_`.

La vue d’ensemble du dashboard commence directement par « Vos espaces éditoriaux », avec une navigation vers Actualités, Océan TV, Opportunités, Formations, Événements et Accueil. La configuration propose « Contacts & réseaux sociaux » et « Administrateurs » ; les catégories utiles se gèrent au plus près de chaque workflow éditorial. Le module Administrateurs permet à chaque administrateur d’ajouter, modifier, désactiver, réactiver, réinitialiser le mot de passe et supprimer des comptes. Il empêche la suppression de son propre compte et celle du dernier administrateur actif.

Le module Actualités utilise un éditeur riche Tiptap : titres, styles, polices, couleurs, listes, tâches, citations, liens, images importées ou distantes, vidéos YouTube et tableaux modifiables. Il propose annuler/rétablir, agrandissement, prévisualisation et avertissement avant de perdre des modifications non enregistrées. Les documents sont conservés dans PostgreSQL sous forme de blocs JSON validés (`contentVersion: 2`), puis affichés par des composants React sans HTML arbitraire. La migration `202610250002_rich_articles` convertit les articles existants sans supprimer leurs contenus ni changer leurs adresses.

La date de première publication est définie par le serveur, conservée lors des modifications et ignorée si elle est fournie par un client. Les brouillons n’ont pas de date de publication. Le temps de lecture a été retiré des données, des formulaires et des pages publiques. La gestion des catégories permet ajout, renommage et suppression ; une catégorie utilisée exige la réaffectation de ses articles vers une autre rubrique. Les listes gardent la recherche serveur et la pagination de neuf éléments.

Le module Contacts & réseaux sociaux (`/admin/contacts`) permet à tous les administrateurs de modifier téléphone, numéro WhatsApp, adresse, email facultatif et liens Facebook, YouTube et TikTok. Les liens d’appel et WhatsApp sont générés automatiquement. Une sauvegarde partielle et transactionnelle conserve la navigation, les catégories, les images et les autres réglages du site. Les valeurs sont partagées par le navbar, le footer et les boutons de contact des rubriques. La migration `202610270002_contact_social_tiktok` remplace Instagram par TikTok sans convertir les anciennes URL Instagram en faux liens TikTok.

Le module Océan TV gère le catalogue paginé, la recherche, les catégories et statuts, les références YouTube, les miniatures importées ou générées, la chaîne, la durée, la publication, la priorité et la vidéo principale. Le module Accueil gère les regards de la Hero : texte, image, cadrage, aperçu, ordre, brouillon/publication et suppression. Les trois premiers regards publiés alimentent la page d’accueil.

Les modules Opportunités, Formations et Événements disposent également de workflows complets. Opportunités gère les annonces, organismes, modalités, échéances, critères, pièces et étapes de candidature. Formations gère les domaines de compétences. La programmation de sessions a été retirée de l’interface ; les anciennes données de programmation sont conservées. Événements gère les photographies, catégories, calendriers avec fuseau `Africa/Kinshasa`, lieux, formats en ligne, organisateurs et contenus de détail. Toutes les listes utilisent la recherche serveur, les statuts et une pagination de neuf éléments.

Lors du premier accès direct à la route publique `/` uniquement, le logo et les trois lignes de chargement s’affichent sur fond gris très clair avant tout autre élément, jusqu’à la disponibilité de `/api/site` et `/api/home`. Ces requêtes sont réutilisées pour l’affichage ; le navbar n’est pas monté pendant ce chargement. Les autres routes publiques utilisent des skeletons dès le document initial et pendant les requêtes. Les navigations ultérieures conservent la structure du site et utilisent les skeletons pour le contenu attendu. Le chargement sombre de l’administration est conservé.

| Méthode | Route | Action |
| --- | --- | --- |
| POST | /api/admin/auth/login | Ouvrir une session avec identifiant/email et mot de passe |
| GET | /api/admin/auth/me | Lire la session et renouveler le jeton CSRF |
| POST | /api/admin/auth/logout | Fermer la session |
| GET | /api/admin/overview | Statistiques du dashboard et activité récente |
| GET | /api/admin/users | Lister les administrateurs (tous les administrateurs) |
| POST | /api/admin/users | Ajouter un administrateur (tous les administrateurs) |
| PATCH | /api/admin/users/:id | Modifier statut, identité ou mot de passe |
| DELETE | /api/admin/users/:id | Supprimer un administrateur avec garde-fous |
| GET | /api/admin/content/:resource | Liste paginée avec état de publication |
| GET | /api/admin/content/:resource/:slug | Contenu complet, y compris brouillon |
| POST | /api/admin/content/:resource | Créer un contenu |
| PUT | /api/admin/content/:resource/:slug | Remplacer un contenu |
| PATCH | /api/admin/content/:resource/:slug/publication | Publier ou retirer |
| DELETE | /api/admin/content/:resource/:slug | Supprimer le contenu |
| GET | /api/admin/categories/:resource | Catégories et nombre de contenus liés |
| POST | /api/admin/categories/:resource | Ajouter une catégorie |
| PUT | /api/admin/categories/:resource | Créer ou mettre à jour une catégorie |
| DELETE | /api/admin/categories/:resource/:key | Supprimer une catégorie inutilisée |
| POST | /api/admin/media | Importer une image pour le contenu ou la couverture |
| GET | /api/admin/contacts | Lire les coordonnées et réseaux sociaux |
| PUT | /api/admin/contacts | Mettre à jour uniquement les contacts et réseaux |
| PUT | /api/admin/site | Mettre à jour les réglages |
| GET | /api/admin/training-sessions | Sessions, y compris brouillons |
| PUT | /api/admin/training-sessions/:id | Créer ou remplacer une session |
| DELETE | /api/admin/training-sessions/:id | Supprimer une session |

Création ou remplacement :

```json
{
  "published": false,
  "sortOrder": 0,
  "featured": false,
  "data": {
    "id": "mon-reportage",
    "title": "Un reportage",
    "category": "Reportages",
    "description": "Présentation de la vidéo.",
    "youtubeId": "aBU7JsDsF0Y",
    "thumbnail": "/images/tv-aBU7JsDsF0Y.webp",
    "thumbnailAlt": "Description de la miniature"
  }
}
```

Le schéma complet des données attendues est dans `server/validation.ts`, et les contrats de réponse dans `shared/content.ts`. `PUT` remplace le document complet ; le champ `id` doit correspondre au slug de l’URL. La catégorie doit exister dans la rubrique concernée. Pour la publication seule : `{ "published": true }`.

Les liens médias acceptent les chemins `/images/…` ou des URL HTTPS. Le téléversement authentifié accepte JPEG, PNG, WebP et AVIF jusqu’à 8 Mo. Sharp vérifie et réencode les fichiers en WebP, supprime leurs métadonnées et borne leurs dimensions. Les fichiers sont servis sous `/images/uploads/` depuis `storage/media` ou le répertoire `MEDIA_DIRECTORY`. En production, monter ce répertoire sur un stockage persistant et le sauvegarder. Les fichiers existants restent servis dans `public/` ; les URL de médias externes restent utilisables. Pour supprimer une catégorie utilisée : `DELETE /api/admin/categories/articles/:id?replacement=:autreId`.

Les erreurs structurées utilisent les codes HTTP 400 (validation), 401 (authentification), 404, 409 (conflit), 413 (contenu trop volumineux), 429 (limitation) et 503 (indisponibilité). Les écritures et leurs traces d’audit sont transactionnelles. Les détails de connexion et les piles d’erreur ne sont pas renvoyés au navigateur.

## Production

```powershell
npm.cmd ci
npm.cmd run db:migrate
npm.cmd run build
$env:NODE_ENV = 'production'
npm.cmd start
```

Express sert alors le frontend compilé et l’API sur le même serveur. Configurer `HOST=0.0.0.0` si l’hébergeur l’exige, `PORT`, les origines autorisées dans `CORS_ORIGIN` et `TRUST_PROXY=1` uniquement derrière un proxy de confiance. Le proxy de production doit terminer HTTPS.

Avec un frontend hébergé séparément, définir `VITE_API_URL=https://api.example.com/api` au build et autoriser son origine dans `CORS_ORIGIN`. Installer aussi les dépendances de développement pendant le build pour générer Prisma et compiler TypeScript. `dist-server/`, `dist/`, `server/generated/` et `.env` sont ignorés par Git.

Protection : Helmet/CSP, CORS explicite, corps JSON bornés, limitations de débit distinctes, requêtes SQL paramétrées, validation des dates et URL, clé d’administration vérifiée en temps constant. Le pool PostgreSQL est limité à cinq connexions et les requêtes ont un délai maximal. Aucun secret serveur n’est exposé avec les variables frontend.

## Vérification

```powershell
npm.cmd run check
npm.cmd run test:api
npm.cmd run test:e2e
npm.cmd run build
```

Les tests API utilisent la base configurée ; le test de publication crée un document temporaire isolé, puis le supprime. Les tests Playwright utilisent Microsoft Edge sous Windows, démarrent Vite et Express, et vérifient les pages connectées au backend, la pagination, les filtres, les fiches, le clavier, la réduction des mouvements et le responsive. Les vidéos YouTube sont simulées pendant les tests.

Après le build, `npm.cmd run test:production` démarre temporairement le serveur compilé sur le port 3002, vérifie les routes et l’API, puis confirme qu’aucun secret n’est présent dans les fichiers JavaScript du navigateur.

## Organisation

- `server/app.ts` : API publique, gestion authentifiée et traitement des erreurs.
- `server/content-service.ts` : lecture PostgreSQL, résumés, pagination, recherche et sélection d’accueil.
- `server/validation.ts` : schémas de validation par ressource.
- `server/db.ts`, `server/config.ts` : Prisma, pool et environnement.
- `prisma/schema.prisma`, `prisma/migrations/` : schéma et migrations versionnées.
- `shared/content.ts` : contrats TypeScript communs.
- `src/lib/api.tsx` : accès API et contextes des données du site et de l’accueil.
- `src/components/Pagination.tsx` : navigation paginée.
- `src/lib/*-content.ts` : types et fonctions de présentation uniquement, sans listes éditoriales.
- `public/`, `design-assets/` : logo, médias optimisés et provenance des photographies.
Les formulaires éditoriaux génèrent automatiquement les identifiants uniques et conservent les identifiants existants lors des modifications. Les références d’opportunités et les descriptions de miniatures vidéo sont automatiques. Le cadrage initial des nouvelles images est `50% 40%` ; les cadrages déjà enregistrés sont conservés. Les champs retirés de l’interface conservent leurs métadonnées existantes lors d’une modification.
#   O c e a n - m e d i a - T V  
 