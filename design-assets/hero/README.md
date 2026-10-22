# Illustrations de la Hero

Deux images créées avec l'outil intégré `image_gen` pour illustrer la mission d'OCÉAN MÉDIA TV. Les scènes sont fictives : elles ne représentent ni des événements organisés par Océan, ni de vrais membres de son équipe. Les personnes et les lieux sont illustratifs.

Les PNG originaux sont conservés ici, hors du répertoire public. Les fichiers WebP utilisés par le site se trouvent dans `public/images/`.

## Prompts

- **hero-voices.png** : photographie éditoriale naturelle d'une jeune créative noire congolaise, cheveux courts naturels, chemise terracotta et appareil photo, sur une terrasse urbaine africaine avec un collègue en arrière-plan. Ciel bleu, architecture contemporaine et palmiers, lumière chaude d'après-midi, palette bleu océan et terracotta. Scène fictive, sans texte, logo ni filigrane.
- **hero-skills.png** : photographie documentaire de trois jeunes adultes noirs africains échangeant autour d'un ordinateur portable et d'un carnet dans un studio créatif lumineux. Expressions spontanées, lumière naturelle, touches teal, bois et plantes. Scène fictive, sans texte, logo ni filigrane.

## Réencoder les images

Depuis la racine du projet :

```sh
node scripts/optimize-hero-images.mjs
```

Le script utilise le canvas Chromium via Playwright pour redimensionner et encoder en WebP à une qualité de `0.86`, sans serveur ni accès réseau. Sous Windows, il utilise Microsoft Edge ; un autre exécutable peut être choisi avec `HERO_BROWSER_EXECUTABLE`. Il conserve les sources.

| Fichier | Dimensions | Taille |
| --- | --- | ---: |
| `hero-voices.png` (source) | 1536 × 1024 | 2 265 644 octets |
| `hero-voices.webp` | 1536 × 1024 | 167 384 octets |
| `hero-voices-1280.webp` | 1280 × 853 | 119 772 octets |
| `hero-voices-768.webp` | 768 × 512 | 64 300 octets |
| `hero-skills.png` (source) | 1536 × 1024 | 2 319 516 octets |
| `hero-skills.webp` | 1536 × 1024 | 193 862 octets |
| `hero-skills-1280.webp` | 1280 × 853 | 140 184 octets |
| `hero-skills-768.webp` | 768 × 512 | 72 946 octets |

Les tailles peuvent légèrement varier selon la version du navigateur utilisée pour réencoder.
