# Océan Média TV

Fondations React, TypeScript, Tailwind CSS, Header responsive et Hero éditoriale d’Océan Média TV. La page d’accueil contient uniquement le Header et la Hero ; les prochaines sections restent à développer.

## Démarrer sous Windows

```powershell
npm.cmd install
npm.cmd run dev
```

Créer la version de production avec `npm.cmd run build`, puis la consulter avec `npm.cmd run preview`.

## Structure

- `src/App.tsx` : assemblage du Header et de la Hero dans le `<main>` sémantique.
- `src/components/` : Header, navigation et interactions associées.
- `src/components/Hero.tsx` et `hero.css` : composition éditoriale, sélection des regards et fenêtres de lecture.
- `src/lib/hero-content.ts` : trois regards éditoriaux, textes et références des images.
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

## Vérifier le projet

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
```

Les tests Playwright utilisent Microsoft Edge installé sous Windows. Ils couvrent les interactions du Header et de la Hero, les fenêtres, le clavier, la réduction des mouvements et les débordements aux différentes largeurs.
