# Océan Média TV

Fondations React, TypeScript, Tailwind CSS, Header responsive, Hero éditoriale et section Actualités d’Océan Média TV. La page d’accueil contient le Header, la Hero puis les Actualités ; les prochaines sections restent à développer.

## Démarrer sous Windows

```powershell
npm.cmd install
npm.cmd run dev
```

Créer la version de production avec `npm.cmd run build`, puis la consulter avec `npm.cmd run preview`.

## Structure

- `src/App.tsx` : assemblage du Header, de la Hero et des Actualités, avec un `<main>` sémantique.
- `src/components/` : Header, navigation et interactions associées.
- `src/components/Hero.tsx` et `hero.css` : composition éditoriale, sélection des regards et fenêtres de lecture.
- `src/lib/hero-content.ts` : trois regards éditoriaux, textes et références des images.
- `src/components/NewsSection.tsx` et `news.css` : sélection d’articles, filtres thématiques, chargement supplémentaire et lecteur accessible.
- `src/lib/news-content.ts` : exemples d’articles, catégories et métadonnées à remplacer par les publications validées.
- `src/lib/` : configuration commune des rubriques et des coordonnées.
- `src/index.css` : identité visuelle, styles responsive et accessibilité.
- `public/` : fichiers statiques et logo.
- `design-assets/hero/` : sources et provenance des illustrations de la Hero.
- `tests/` : vérifications de navigation et d’accessibilité.

## Comportements

Les rubriques futures affichent une notification sans charger de page inexistante. La recherche porte uniquement sur les rubriques de navigation. Le menu mobile se ferme après sélection et avec Échap, gère le focus et bloque le défilement de la page. Les animations respectent la préférence de réduction des mouvements.

Le contact utilise le numéro `+243 97 248 60 33`, fourni dans le document de présentation. L’adresse email n’y étant pas renseignée, elle n’est pas inventée. Les URL Facebook, YouTube et Instagram restent nulles dans la configuration jusqu’à la réception des liens officiels.

La Hero propose trois regards sur la jeunesse, les compétences et l’entrepreneuriat. Les onglets fonctionnent avec les flèches du clavier, Début et Fin ; ils ne défilent pas automatiquement. « Lire notre regard » ouvre le texte correspondant. « L’esprit Océan » présente la mission du média. Ces fenêtres gèrent le focus, Échap et le blocage du défilement.

Les textes sont fondés sur le document de présentation fourni, sans actualités, dates ni statistiques inventées. Les photographies sont des illustrations générées pour le projet, et ne représentent pas des membres réels de l’équipe ou des événements du média. Elles sont proposées en WebP à trois résolutions avec `srcset` et préchargement du premier visuel.

## Actualités

Les six articles sont des **exemples de démonstration**, comme demandé, avec un signalement visible dans la section et dans le lecteur. Ils ne relatent pas d’événements réels et ne portent aucune date de publication fictive. Quatre exemples sont affichés initialement ; « Afficher plus d’articles » révèle les deux suivants. Les filtres fonctionnent sans rechargement et annoncent le nombre de résultats aux lecteurs d’écran.

L’entrée Actualités du Header et de la recherche mène désormais à `#actualites`, avec fermeture du menu et déplacement du focus. Le lecteur d’article prend en charge Échap, le focus clavier et le verrouillage du défilement.

Pour intégrer de vraies publications, remplacer les entrées de `newsArticles` dans `src/lib/news-content.ts`, renseigner la date réelle `publishedAt` au format ISO, passer `isDemo` à `false` et remplacer les visuels illustratifs par les photographies autorisées. Les textes et métadonnées restent indépendants de la présentation. Les originaux des nouveaux visuels et leurs indications de provenance sont dans `design-assets/news/` ; `node scripts/optimize-news-images.mjs` recrée leurs variantes WebP.

## Vérifier le projet

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
```

Les tests Playwright utilisent Microsoft Edge installé sous Windows. Ils couvrent les interactions du Header, de la Hero et des Actualités, les filtres, les fenêtres, le clavier, la réduction des mouvements et les débordements aux différentes largeurs.
