# Océan Média TV

Fondations React, TypeScript, Tailwind CSS, Header responsive, Hero éditoriale, Actualités et espace Océan TV. La page d’accueil contient ces trois sections ; les prochaines sections restent à développer.

## Démarrer sous Windows

```powershell
npm.cmd install
npm.cmd run dev
```

Créer la version de production avec `npm.cmd run build`, puis la consulter avec `npm.cmd run preview`.

## Structure

- `src/App.tsx` : assemblage du Header et des trois sections, avec un `<main>` sémantique.
- `src/components/` : Header, navigation et interactions associées.
- `src/components/Hero.tsx` et `hero.css` : composition éditoriale, sélection des regards et fenêtres de lecture.
- `src/lib/hero-content.ts` : trois regards éditoriaux, textes et références des images.
- `src/components/NewsSection.tsx` et `news.css` : sélection d’articles, filtres thématiques et liens préparés pour les futures pages éditoriales.
- `src/lib/news-content.ts` : exemples d’articles, catégories et métadonnées à remplacer par les publications validées.
- `src/components/OceanTvSection.tsx` et `ocean-tv.css` : composition audiovisuelle et lecteur YouTube chargé au clic.
- `src/lib/tv-content.ts` : sélection des vidéos et métadonnées indépendantes de la présentation.
- `src/lib/` : configuration commune des rubriques et des coordonnées.
- `src/index.css` : identité visuelle, styles responsive et accessibilité.
- `public/` : fichiers statiques et logo.
- `design-assets/hero/` : sources et provenance des illustrations de la Hero.
- `tests/` : vérifications de navigation et d’accessibilité.

## Comportements

Les rubriques futures affichent une notification sans charger de page inexistante. La recherche porte uniquement sur les rubriques de navigation. Le menu mobile se ferme après sélection et avec Échap, gère le focus et bloque le défilement de la page. Les animations respectent la préférence de réduction des mouvements.

Le contact utilise le numéro `+243 97 248 60 33`, fourni dans le document de présentation. L’adresse email n’y étant pas renseignée, elle n’est pas inventée. Les URL Facebook, YouTube et Instagram restent nulles dans la configuration jusqu’à la réception des liens officiels.

La Hero propose trois regards sur la jeunesse, les compétences et l’entrepreneuriat. Les onglets fonctionnent avec les flèches du clavier, Début et Fin ; ils ne défilent pas automatiquement. « Lire notre regard » ouvre le texte correspondant. « L’esprit Océan » présente la mission du média. Ces fenêtres gèrent le focus, Échap et le blocage du défilement.

Les textes de la Hero sont fondés sur le document de présentation fourni, sans actualités, dates ni statistiques inventées. Ses photographies sont des illustrations générées pour le projet et ne représentent pas des membres réels de l’équipe ou des événements du média. Elles sont proposées en WebP à trois résolutions avec `srcset` et préchargement du premier visuel.

## Actualités

Les six contenus éditoriaux générés représentent le rendu final attendu : rubrique, format, auteur, date, temps de lecture, extrait et photographie. Quatre publications sont affichées sur l’accueil ; les filtres présentent les contenus associés sans rechargement.

L’entrée Actualités du Header et de la recherche mène à `#actualites`, avec fermeture du menu, déplacement du focus et état actif lié à la section visible. Les cartes pointent vers leurs futures URL `/actualites/<article>` et le bouton final vers `/actualites`. Tant que ces pages ne sont pas développées, une notification discrète évite de charger une route inexistante. Aucun lecteur en fenêtre n’est utilisé.

Pour intégrer les publications validées, remplacer les entrées de `newsArticles` dans `src/lib/news-content.ts`, renseigner `publishedAt` au format ISO et remplacer les visuels par les photographies autorisées. Les textes et métadonnées restent indépendants de la présentation. Les originaux des nouveaux visuels et leurs indications de provenance sont dans `design-assets/news/` ; `node scripts/optimize-news-images.mjs` recrée leurs variantes WebP.

## Océan TV

La section `#ocean-tv` présente une vidéo principale, trois vidéos secondaires puis trois contenus additionnels. Le Header et la recherche y mènent, avec un état actif lié au défilement. Les sept premières vidéos fournies par l’utilisateur composent la sélection ; leurs titres et chaînes ont été récupérés via YouTube oEmbed, et leurs véritables miniatures sont servies localement en WebP. La provenance figure dans `design-assets/tv/README.md`.

Le clic sur une carte ouvre le lecteur dans un dialogue accessible en 16:9. L’iframe `youtube-nocookie.com` n’existe qu’après ce clic, sans paramètre ni permission d’autoplay ; aucune API ou connexion YouTube n’est chargée à l’ouverture de la page. Le plein écran et un lien vers YouTube sont disponibles. Fermer le lecteur arrête son chargement et rend le focus à la carte ; Échap et le blocage du scroll sont gérés par Radix Dialog. Les animations suivent la préférence de réduction des mouvements.

Les champs `durationSeconds` et `publishedAt` sont optionnels et ne s’affichent que lorsqu’ils sont renseignés. Ils restent absents de la sélection actuelle car oEmbed ne les fournit pas. `videoItems` et son type `VideoItem` forment le point d’entrée pour un futur flux YouTube : le futur service pourra fournir cette même structure et trier ses publications, sans réécrire les cartes. Aucune clé d’API n’est exposée dans le frontend. Le chargement automatique des dernières vidéos sera connecté à cette étape ultérieure.

Références d’intégration : [paramètres du lecteur YouTube](https://developers.google.com/youtube/player_parameters) et [mode de confidentialité avancé](https://support.google.com/youtube/answer/171780).

## Vérifier le projet

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
```

Les tests Playwright utilisent Microsoft Edge installé sous Windows. Ils couvrent le Header, la Hero, les Actualités et Océan TV : filtres, fenêtres, navigation active, chargement différé de l’iframe, clavier, réduction des mouvements et débordements aux différentes largeurs. Les requêtes au lecteur YouTube sont simulées dans les tests pour vérifier le frontend sans dépendre du réseau du fournisseur.
