# Océan Média TV

Page d’accueil complète d’Océan Média TV : Header, Hero éditoriale, Actualités, Océan TV, Opportunités, Formations, Événements & Agenda, Initiatives et portraits, puis Footer. Réalisée avec React, TypeScript, Tailwind CSS, Framer Motion et Lucide.

## Démarrer sous Windows

```powershell
npm.cmd install
npm.cmd run dev
```

Créer la version de production avec `npm.cmd run build`, puis la consulter avec `npm.cmd run preview`.

## Structure

- `src/App.tsx` : assemblage du Header, des sept sections du `<main>` et du Footer.
- `src/components/` : Header, navigation et interactions associées.
- `src/components/Hero.tsx` et `hero.css` : composition éditoriale et sélection des regards.
- `src/lib/hero-content.ts` : trois regards éditoriaux, textes et références des images.
- `src/components/NewsSection.tsx` et `news.css` : sélection d’articles, filtres thématiques et liens préparés pour les futures pages éditoriales.
- `src/lib/news-content.ts` : exemples d’articles, catégories et métadonnées à remplacer par les publications validées.
- `src/components/ArticlePage.tsx` et `article-page.css` : gabarit complet de lecture, progression, partage, impression, synthèse et recommandations.
- `src/lib/article-content.ts` : titres de sections, citations, points essentiels et visuels complémentaires de chaque article.
- `src/components/OceanTvSection.tsx` et `ocean-tv.css` : composition audiovisuelle et lecteur YouTube chargé au clic.
- `src/lib/tv-content.ts` : sélection des vidéos et métadonnées indépendantes de la présentation.
- `src/components/OpportunitiesSection.tsx` et `opportunities.css` : catégories interactives et sélection d’annonces.
- `src/lib/opportunities-content.ts` : catégories et annonces de présentation, indépendantes de l’affichage.
- `src/components/TrainingSection.tsx` et `training.css` : photographie, six domaines de formation et bloc éditorial.
- `src/lib/training-content.ts` : domaines permanents et modèle séparé des futures sessions programmées.
- `src/components/EventsSection.tsx`, `EventCard.tsx` et `events.css` : agenda filtrable, composant `FeaturedEvent` et cartes réutilisables.
- `src/lib/events-content.ts` : catégories centralisées et événements de présentation ; `event-dates.ts` : validation, affichage français et classement temporel.
- `src/components/PortraitsSection.tsx`, `Footer.tsx` et `closing.css` : fin éditoriale de l’accueil.
- `src/lib/closing-content.ts` : récits de présentation utilisés par la rubrique des portraits.
- `src/lib/home-navigation.ts` : navigation interne du footer avec gestion du focus et de la réduction des mouvements.
- `src/lib/` : configuration commune des rubriques et des coordonnées.
- `src/index.css` : identité visuelle, styles responsive et accessibilité.
- `public/` : fichiers statiques et logo.
- `design-assets/hero/` : sources et provenance des illustrations de la Hero.
- `tests/` : vérifications de navigation et d’accessibilité.

## Comportements

Les rubriques futures affichent une notification sans charger de page inexistante. La recherche porte uniquement sur les rubriques de navigation. Le menu mobile se ferme après sélection et avec Échap, gère le focus et bloque le défilement de la page. Les animations respectent la préférence de réduction des mouvements.

Le contact utilise le numéro `+243 97 248 60 33`, fourni dans le document de présentation. L’adresse email n’y étant pas renseignée, elle n’est pas inventée. Les URL Facebook, YouTube et Instagram restent nulles dans la configuration jusqu’à la réception des liens officiels.

La Hero propose trois regards sur la jeunesse, les compétences et l’entrepreneuriat. Les onglets fonctionnent avec les flèches du clavier, Début et Fin ; ils ne défilent pas automatiquement. Chaque photographie affiche directement un titre et une courte description, sans fenêtre de lecture.

Les textes de la Hero sont fondés sur le document de présentation fourni, sans actualités, dates ni statistiques inventées. Ses photographies sont des illustrations générées pour le projet et ne représentent pas des membres réels de l’équipe ou des événements du média. Elles sont proposées en WebP à trois résolutions avec `srcset` et préchargement du premier visuel.

## Actualités

Les six contenus éditoriaux générés représentent le rendu final attendu : rubrique, format, auteur, date, temps de lecture, extrait et photographie. Quatre publications sont affichées sur l’accueil ; les filtres présentent les contenus associés sans rechargement.

L’entrée Actualités du Header et de la recherche mène à `#actualites`, avec fermeture du menu, déplacement du focus et état actif lié à la section visible. Les six cartes ouvrent désormais leur page `/actualites/<article>`. Le bouton final vers `/actualites` reste en attente de la future page d’index et affiche une notification discrète. Aucun lecteur en fenêtre n’est utilisé.

Chaque page Article utilise un en-tête éditorial grand format, un chapô, les informations de publication, une photographie d’ouverture, une lecture structurée, une citation, un second visuel, un encadré « À retenir », des actions de copie, WhatsApp et impression, une signature de la rédaction et trois recommandations. Une barre indique la progression de lecture. Le Header marque Actualités comme rubrique active et les liens vers l’accueil restaurent l’ancre et le focus. Les images complémentaires et les recommandations sont chargées progressivement.

Pour intégrer les publications validées, remplacer les entrées de `newsArticles` dans `src/lib/news-content.ts`, renseigner `publishedAt` au format ISO et remplacer les visuels par les photographies autorisées. Les textes et métadonnées restent indépendants de la présentation. Les originaux des nouveaux visuels et leurs indications de provenance sont dans `design-assets/news/` ; `node scripts/optimize-news-images.mjs` recrée leurs variantes WebP.

## Océan TV

La section `#ocean-tv` présente une vidéo principale, trois vidéos secondaires puis trois contenus additionnels. Le Header et la recherche y mènent, avec un état actif lié au défilement. Les sept premières vidéos fournies par l’utilisateur composent la sélection ; leurs titres et chaînes ont été récupérés via YouTube oEmbed, et leurs véritables miniatures sont servies localement en WebP. La provenance figure dans `design-assets/tv/README.md`.

Le clic sur une carte ouvre le lecteur dans un dialogue accessible en 16:9. L’iframe `youtube-nocookie.com` n’existe qu’après ce clic, sans paramètre ni permission d’autoplay ; aucune API ou connexion YouTube n’est chargée à l’ouverture de la page. Le plein écran et un lien vers YouTube sont disponibles. Fermer le lecteur arrête son chargement et rend le focus à la carte ; Échap et le blocage du scroll sont gérés par Radix Dialog. Les animations suivent la préférence de réduction des mouvements.

Les champs `durationSeconds` et `publishedAt` sont optionnels et ne s’affichent que lorsqu’ils sont renseignés. Ils restent absents de la sélection actuelle car oEmbed ne les fournit pas. `videoItems` et son type `VideoItem` forment le point d’entrée pour un futur flux YouTube : le futur service pourra fournir cette même structure et trier ses publications, sans réécrire les cartes. Aucune clé d’API n’est exposée dans le frontend. Le chargement automatique des dernières vidéos sera connecté à cette étape ultérieure.

Références d’intégration : [paramètres du lecteur YouTube](https://developers.google.com/youtube/player_parameters) et [mode de confidentialité avancé](https://support.google.com/youtube/answer/171780).

## Opportunités

La section `#opportunites` suit Océan TV. Ses six catégories sont fondées sur le document de présentation : emploi, formations, entrepreneuriat, financements, rencontres professionnelles et innovation. Les boutons filtrent la sélection sans rechargement ; « Tout voir » rétablit les trois annonces initiales. Le nombre de résultats et la catégorie sont annoncés aux lecteurs d’écran, les filtres conservent le focus et les animations respectent la réduction des mouvements.

Les six annonces sont des contenus de présentation autorisés par l’utilisateur, avec un signalement unique au bas de la section. Elles n’engagent aucune organisation réelle et aucune échéance n’est inventée. Pour intégrer les annonces validées, remplacer les entrées de `opportunities` dans `src/lib/opportunities-content.ts` ; `deadline` est optionnel et s’affiche uniquement lorsqu’une date valide est renseignée.

Les cartes préparent les futures URL `/opportunites/<annonce>`, tandis que « Toutes les opportunités » mène à `/opportunites`. Ces pages seront développées ultérieurement : les clics donnent pour le moment un retour discret sans charger de route inexistante. La navigation principale et la recherche mènent à la section ; l’état actif suit le défilement, y compris sur mobile.

## Formations

La section `#formations` suit Opportunités. Elle présente les six domaines d’intervention demandés, avec leurs descriptions : art oratoire, leadership, management, techniques de rédaction, entrepreneuriat et compétences professionnelles. Ces cartes sont informatives ; elles ne représentent ni des inscriptions ni des sessions ouvertes. Les interactions de survol restent discrètes et respectent la réduction des mouvements. Le Header et la recherche mènent à la section avec déplacement du focus et état actif lié au défilement.

La véritable photographie de prise de parole est une image d’illustration de Monstera Production, issue de Pexels ; elle ne représente pas une activité revendiquée d’Océan Communication. Le crédit et le lien de provenance sont visibles sous l’image. L’original et la licence sont documentés dans `design-assets/training/README.md`. Le script `node scripts/optimize-training-image.mjs` produit les variantes WebP de 480, 800 et 1200 pixels, servies avec `srcset`, dimensions explicites et chargement différé.

`trainingDomains` reste indépendant de `trainingSessions`. La collection des sessions est vide et le type `TrainingSession` prévoit les domaines associés, le statut, les dates, le fuseau horaire, le format, le lieu et un éventuel lien d’inscription. La future page pourra consommer cette collection après validation d’une programmation réelle, sans modifier les domaines permanents. Aucun calendrier, date ou prix n’est inventé pour cette étape.

## Événements & Agenda

La section `#evenements` suit Formations, avec navigation active depuis le Header et la recherche. Elle affiche au maximum six rendez-vous : un événement à la une, deux cartes secondaires et jusqu’à trois cartes complémentaires. Une sélection contenant un seul événement utilise une composition photographique horizontale sur desktop. Les filtres de période et de catégorie se combinent ; le nombre de résultats est annoncé sans déplacer le focus. Un état vide permet de rétablir tous les événements. Le mode initial « Tous » montre aussi les événements sans date connue.

Les six événements et leurs dates sont des contenus de présentation autorisés par l’utilisateur, signalés par une mention commune. Les dates sont fixes et ne sont jamais décalées automatiquement pour simuler un programme réel. Aucun organisateur ni lien d’inscription réel n’a été fourni : ils restent absents. `MediaEvent` prévoit ces champs optionnels, le lieu et le format en ligne. Seule une URL HTTPS renseignée permet d’afficher une inscription, masquée après la fin de l’événement. `fullAgendaHref` reste `null` : son emplacement affiche « Prochainement » jusqu’à l’implémentation de la page complète.

`EventSchedule` distingue les dates calendaires des instants avec décalage UTC explicite et fuseau IANA. Les dates impossibles, les intervalles inversés, les fuseaux inconnus et les heures sans décalage sont rejetés. Les dates sans heure sont affichées en français sans conversion vers le fuseau du visiteur. Leur date de fin est inclusive, évaluée dans le fuseau de l’événement. Une date future relève de « À venir » ; une fin connue et dépassée relève de « Passés ». Une heure de début dépassée sans fin fiable reste indéterminée. Un événement du jour sans horaires affiche « Aujourd’hui · horaires à préciser » ; une période de plusieurs jours sans heures affiche « Dates annoncées ». « En cours » exige des instants de début et de fin précis. Les états indéterminés restent uniquement dans « Tous ». L’état temporel est recalculé chaque minute et au retour sur l’onglet, sans compte à rebours.

Les six photographies Pexels sont des illustrations, et ne représentent pas des événements revendiqués par Océan. Sources, crédits et licence : `design-assets/events/README.md`. `node scripts/optimize-events-images.mjs` recrée les WebP locaux en 480, 800 et 1200 pixels. Les images utilisent `srcset`, des dimensions explicites et un chargement différé ; les transitions respectent la réduction des mouvements.

## Portraits et Footer

La section `#portraits` présente trois récits de démonstration dans une composition photographique de magazine. Les récits n’attribuent ni identité, ni témoignage, ni résultat réel aux personnes photographiées. Une seule mention indique leur statut de présentation. Les liens `/portraits/<id>` préparent les futures pages et affichent actuellement un retour discret sans charger de route absente ou de lecteur en fenêtre. Remplacer `inspiringStories` par les reportages et photographies validés lors de leur publication.

La rubrique « À propos » prépare une future page dédiée et affiche actuellement un retour discret sans charger de route inexistante. La rubrique de portraits n’active aucune rubrique sans lien correspondant dans le Header.

Le footer contient des liens fonctionnels vers les rubriques, le téléphone et WhatsApp existants, l’adresse fournie, les réseaux officiels en attente et un retour en haut qui restaure le focus sur le contenu principal. Il ne contient aucun formulaire sans service d’envoi. « Informations & crédits » ouvre un dialogue accessible avec les sources des photographies et une explication des contenus de présentation et des services externes ; il gère Échap, le focus et le blocage du défilement. Les métadonnées de partage et une favicon complètent les finitions.

Les nouvelles photographies de stock, distinctes des membres ou activités d’Océan, sont diffusées localement en WebP avec `srcset`, dimensions explicites et chargement différé. Sources et crédits : `design-assets/finale/README.md`. Reproduction : `node scripts/optimize-finale-images.mjs`.

## Vérifier le projet

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
```

Les tests Playwright utilisent Microsoft Edge installé sous Windows. Ils couvrent l’accueil complet et les pages de lecture : filtres, fenêtres, navigation active, progression de l’article, partage, chargement différé de l’iframe et des images, clavier, réduction des mouvements et débordements aux différentes largeurs. Ils vérifient aussi les liens du footer, les informations et crédits, les coordonnées et l’absence de liens vers la section retirée. Les requêtes au lecteur YouTube sont simulées dans les tests pour vérifier le frontend sans dépendre du réseau du fournisseur. Les tests de dates vérifient les limites de minuit, les changements d’heure, les périodes sur plusieurs jours et les données invalides ou absentes.
