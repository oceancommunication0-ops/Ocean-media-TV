# Photographies de la section Événements & Agenda

Ces six photographies de stock sont utilisées comme illustrations des événements de présentation. Elles ne documentent pas des activités d’Océan Communication et ne suggèrent aucune affiliation ou approbation des personnes photographiées.

Sources et licence vérifiées le 23 octobre 2026 sur les pages officielles Pexels. Les originaux JPEG sont conservés dans ce dossier. Les images diffusées sont des WebP locaux, sans requête vers Pexels depuis le site.

## Sources

| Fichier source | Auteur | Page officielle | Dimensions originales |
| --- | --- | --- | --- |
| `events-conference.jpg` | Mikhail Nilov | [Photo of a Woman Talking while Holding a Black Microphone](https://www.pexels.com/photo/photo-of-a-woman-talking-while-holding-a-black-microphone-8872459/) | 6016 × 4016 |
| `events-workshop.jpg` | RDNE Stock project | [A Young Man Raising his Hand at a Business Conference](https://www.pexels.com/photo/a-young-man-raising-his-hand-at-a-business-conference-7648052/) | 5704 × 3803 |
| `events-networking.jpg` | Pavel Danilyuk | [People Wearing Long Sleeves Standing in a Conference Room](https://www.pexels.com/photo/people-wearing-long-sleeves-standing-in-a-conference-room-8761650/) | 5332 × 3559 |
| `events-enterprise.jpg` | Christina Morillo | [People on Conference Room](https://www.pexels.com/photo/people-on-conference-room-1181427/) | 6016 × 4016 |
| `events-seminar.jpg` | Wiseboy Wissebo | [Diverse Audience Engaged at Conference Event](https://www.pexels.com/photo/diverse-audience-engaged-at-conference-event-38111334/) | 7008 × 4672 |
| `events-dialogue.jpg` | Werner Pfennig | [Man in Black Suit Standing in Front of Black Laptop Computer](https://www.pexels.com/photo/man-in-black-suit-standing-in-front-of-black-laptop-computer-6949931/) | 6618 × 4412 |

Les téléchargements officiels suivent `https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?cs=srgb&fm=jpg`, où les identifiants, dans l’ordre du tableau, sont `8872459`, `7648052`, `8761650`, `1181427`, `38111334`, `6949931`.

## Licence

[Pexels License](https://www.pexels.com/license/) : usage gratuit sur un site web et redimensionnement autorisés; attribution appréciée mais non obligatoire. Ne pas présenter les personnes comme approuvant Océan Communication ou comme des intervenants confirmés des événements fictifs. La mention commune de présentation de l’agenda et les crédits documentés accompagnent cet usage d’illustration.

## Diffusion et reproduction

Exécuter `node scripts/optimize-events-images.mjs` pour produire les variantes dans `public/images/` :

- `events-{slug}.webp` : 1200 px de large.
- `events-{slug}-800.webp` : 800 px de large.
- `events-{slug}-480.webp` : 480 px de large.

Le script utilise Canvas dans Chromium, conserve le ratio et le cadre originaux et encode en WebP à une qualité de 0,83. Le fichier `events-enterprise` est naturellement en noir et blanc; aucune recoloration n’a été appliquée. Les recadrages de présentation sont gérés en CSS.

## Textes alternatifs et cadrages conseillés

| Slug | Texte alternatif | Position CSS |
| --- | --- | --- |
| `conference` | Une intervenante en tailleur lavande prend la parole, un microphone à la main. | `35% 40%` |
| `workshop` | Un jeune participant lève la main pendant une présentation en salle. | `50% 40%` |
| `networking` | Des professionnels portant des badges échangent debout pendant une rencontre. | `30% 40%` |
| `enterprise` | Des participantes échangent autour d’une table équipée d’ordinateurs, en noir et blanc. | `50% 45%` |
| `seminar` | Des participants écoutent une conférence dans une salle. | `60% 45%` |
| `dialogue` | Un intervenant au pupitre s’adresse aux participants réunis autour d’une table. | `50% 60%` |

Les six photographies ont été inspectées visuellement avant intégration. Les cadrages évitent de présenter les images comme des photographies prises à Kinshasa ou lors d’un événement réel d’Océan.
