# Photographies d’illustration — Actualités

Deux scènes fictives générées avec l’outil intégré `image_gen` d’OpenAI le 22 octobre 2026. Elles accompagnent uniquement les contenus de démonstration clairement signalés : elles ne documentent aucun événement réel, aucune personne identifiée ni aucune activité attestée d’Océan Média TV.

## Sources et formats

Les originaux PNG (`news-enterprise.png`, `news-learning.png`) mesurent 1536 × 1024 pixels. Les WebP sont générés localement, sans réseau, par `node scripts/optimize-news-images.mjs`, qualité 0,86. Le script utilise Playwright et Microsoft Edge sur Windows ; `NEWS_BROWSER_EXECUTABLE` permet de choisir un autre navigateur compatible.

| Fichier public | Dimensions | Poids |
| --- | --- | --- |
| `/images/news-enterprise.webp` | 1536 × 1024 | 196 922 octets |
| `/images/news-enterprise-1024.webp` | 1024 × 683 | 112 040 octets |
| `/images/news-enterprise-640.webp` | 640 × 427 | 59 256 octets |
| `/images/news-learning.webp` | 1536 × 1024 | 174 316 octets |
| `/images/news-learning-1024.webp` | 1024 × 683 | 98 596 octets |
| `/images/news-learning-640.webp` | 640 × 427 | 50 508 octets |

## Prompts finaux

### news-enterprise

Use case: photorealistic-natural. Asset type: fictional editorial illustration for a premium Congolese youth media website article card. Produce a landscape 3:2 photograph, ideally 1536x1024. A young Black African woman entrepreneur wearing a cream linen shirt, checking a small beautifully handmade ceramic product together with a young Black male colleague in an olive overshirt, inside a warm sunlit local creative workshop in a modern Kinshasa-inspired urban creative setting. Wooden table with a few pottery pieces in foreground, open space and softly blurred shelves behind. Natural candid gestures, engaging focused expressions, medium-wide documentary photography, main faces in the upper-middle of frame, stylish magazine composition with natural nuanced skin and material textures, warm orange and subtle teal touches, sunlight from left. Photorealistic fictional illustrative scene with subjects aged 25-30. No text, no logos, no watermark, no branding, no graphic overlays.

### news-learning

Use case: photorealistic-natural. Asset type: fictional editorial illustration for a premium Congolese youth media website article card. Produce a landscape 3:2 photograph, ideally 1536x1024. A young Black African man aged 28 speaking naturally and gesturing to a small attentive group of four young adult Black African women and men, in a bright modern community training space in Kinshasa-inspired setting. Three-quarter/profile shot of speaker, attendees at wooden tables with plain notebooks, engaging discussion. Faces upper-middle frame, warm daylight through tall side windows, cream walls and muted ocean blue chairs with terracotta details. Natural documentary magazine photography, medium-wide, thoughtful framing, realistic nuanced faces and subtle textures, educational and quietly optimistic atmosphere. Fictional illustrative scene. No text on walls or notebooks, no logos, no watermark, no branding, no graphic overlays.

## Contrôle visuel

Les deux images ont été inspectées : scènes conformes, aucun texte ou logo visible, visages et sujets lisibles à l’échelle des cartes. Les fichiers originaux sont conservés pour permettre de nouvelles exportations.
