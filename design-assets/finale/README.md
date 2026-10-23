# Photographies — portraits et Océan Communication

Ces quatre photographies de stock illustrent les rubriques de la page d’accueil. Elles ne représentent pas des personnes, bénéficiaires, membres, partenaires ou activités identifiés d’Océan Communication. Aucun nom, parcours personnel, lieu congolais ou résultat réel ne doit être attribué aux personnes photographiées. Les portraits de présentation ne constituent pas des biographies vérifiées.

Sources primaires et licence Pexels consultées le 23 octobre 2026. Licence : <https://www.pexels.com/license/>. Les photographies peuvent être utilisées et adaptées gratuitement sur le site ; l’attribution est facultative, mais conservée dans ce dossier et proposée dans l’interface. Aucun soutien de la marque par les modèles ou photographes n’est implicite. Les originaux sont conservés uniquement comme sources du projet, pas comme un catalogue de redistribution.

| Fichier source | Auteur | Page source | Dimensions originales | Texte alternatif conseillé |
| --- | --- | --- | --- | --- |
| `portrait-voices.jpg` | Kindel Media | [A Woman Working at an Office, 7688363](https://www.pexels.com/photo/a-woman-working-at-an-office-7688363/) | 3888 × 5184 | Une jeune femme prend des notes à une table de travail dans un espace professionnel lumineux. |
| `portrait-digital.jpg` | Andres Ayrton | [Serious black man working on laptop in workspace, 6578395](https://www.pexels.com/photo/serious-black-man-working-on-laptop-in-workspace-6578395/) | 6000 × 4000 | Un jeune homme travaille sur un ordinateur portable, concentré devant son écran. |
| `portrait-enterprise.jpg` | Evans Cudjoe | [Black and White Photo of a Woman with Measuring Tape, 6977922](https://www.pexels.com/photo/black-and-white-photo-of-a-woman-with-measuring-tape-6977922/) | 2095 × 3247 | Portrait en noir et blanc d’une couturière souriante, un mètre ruban autour du cou. |
| `communication-team.jpg` | PICHA Stock | [Office Team Having a Meeting, 3869649](https://www.pexels.com/photo/office-team-having-a-meeting-3869649/) | 5472 × 3648 | Des femmes échangent autour d’une table pendant une réunion professionnelle. |

Les sources sont téléchargées depuis `https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg`. Les cadrages originaux sont préservés dans les fichiers et peuvent être adaptés au conteneur par `object-fit: cover`. La photographie de la couturière est déjà en noir et blanc dans sa source. Aucun filtre de transformation d’identité n’est appliqué.

## Fichiers livrés

Les fichiers WebP se trouvent dans `public/images`. Le nom sans suffixe correspond à 1200 pixels de largeur ; `-800` et `-480` proposent les variantes responsives. Les hauteurs sont calculées selon le ratio d’origine, sans agrandissement.

| Nom | 1200 px | 800 px | 480 px |
| --- | --- | --- | --- |
| `portrait-voices` | 1200 × 1600, 217 582 octets | 800 × 1067, 96 610 octets | 480 × 640, 40 764 octets |
| `portrait-digital` | 1200 × 800, 53 894 octets | 800 × 533, 31 158 octets | 480 × 320, 15 690 octets |
| `portrait-enterprise` | 1200 × 1860, 188 884 octets | 800 × 1240, 101 510 octets | 480 × 744, 45 922 octets |
| `communication-team` | 1200 × 800, 55 208 octets | 800 × 533, 35 314 octets | 480 × 320, 19 534 octets |

## Reproduction

Depuis la racine du projet : `node scripts/optimize-finale-images.mjs`.

Le script utilise le navigateur Edge installé sous Windows (ou Chromium sur les autres plateformes) et le Canvas natif pour produire du WebP de qualité 0,83. La variable d’environnement facultative `FINALE_BROWSER_EXECUTABLE` permet de choisir un autre exécutable compatible. Il fonctionne exclusivement avec les quatre originaux locaux et ne requiert pas de connexion réseau.

Les quatre variantes de 800 pixels ont été inspectées visuellement : sujet net, absence de défaut d’encodage, cadrage original conservé. Pour les bandes très horizontales, privilégier un positionnement vertical vers 35 % sur le portrait de la couturière afin de préserver son visage.
