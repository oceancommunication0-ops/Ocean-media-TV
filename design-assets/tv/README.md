# Miniatures Océan TV

Miniatures officielles des huit vidéos YouTube fournies par l’utilisateur pour la section Océan TV. Les sept premières composent la sélection initiale ; la huitième est disponible en réserve. Les photographies générées pendant l’exploration artistique ne sont pas intégrées à la section.

Les images sources sont les miniatures `maxresdefault.jpg` de `https://i.ytimg.com/vi/<id>/maxresdefault.jpg`, récupérées le 23 octobre 2026. Les titres et auteurs ont été vérifiés avec l’API publique YouTube oEmbed. Les vidéos et leurs visuels restent attribués à leurs créateurs respectifs ; ces contenus tiers ne sont pas présentés comme des productions originales d’Océan Média TV.

| Identifiant | Titre vérifié | Chaîne |
| --- | --- | --- |
| [aBU7JsDsF0Y](https://www.youtube.com/watch?v=aBU7JsDsF0Y) | Fusion Tesla et SpaceX : Elon Musk veut créer un monstre à 3 500 milliards | RTL |
| [C6iXeFHqRHg](https://www.youtube.com/watch?v=C6iXeFHqRHg) | Why Elon Musk wants to merge Tesla and SpaceX \| DW News | DW News |
| [8cZfOpKIKZs](https://www.youtube.com/watch?v=8cZfOpKIKZs) | My First House At 18 (Tour Of My 260M House) | Ademola Joshua |
| [JwN6ZCg-dZ4](https://www.youtube.com/watch?v=JwN6ZCg-dZ4) | I Recorded Myself Speaking English Every Day for 700 Days | João Sales |
| [lgewV5cuH9U](https://www.youtube.com/watch?v=lgewV5cuH9U) | 50 English Phrasal Verbs | Orshi English |
| [vFgWXF3iHlo](https://www.youtube.com/watch?v=vFgWXF3iHlo) | French Authorities Brace for Weekend Protests | Bloomberg Television |
| [Oqndd84ydYw](https://www.youtube.com/watch?v=Oqndd84ydYw) | Reporter Confronts Vance Over Whether Musk Should Face Probe for Ukraine Slowdown | New York Post |
| [5vr7WdYF3uw](https://www.youtube.com/watch?v=5vr7WdYF3uw) | Trump's campaign blitz heads south as backlash grows over Ramaswamy ad, economy | CBS TEXAS |

## Fichiers et reproduction

- Sources JPEG : `design-assets/tv/tv-<id>.jpg`.
- Variantes WebP : `public/images/tv-<id>.webp` et `tv-<id>-480.webp`.
- Une variante `tv-aBU7JsDsF0Y-960.webp` est également fournie pour la vidéo principale.
- Les ratios originaux sont conservés sans agrandissement. Encodage WebP qualité 0,86 via le canevas local de Microsoft Edge.
- `node scripts/fetch-tv-assets.mjs` actualise les JPEG et écrit les données oEmbed dans `.sites-runtime/qa-tv/metadata.json` (nécessite le réseau).
- `node scripts/optimize-tv-images.mjs` recrée les WebP à partir des JPEG locaux (sans réseau).

oEmbed ne fournit ni durée ni date de publication : aucune durée ou date n’a été inventée.
