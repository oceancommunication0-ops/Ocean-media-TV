export const newsCategories = ['Tout voir', 'Entrepreneuriat', 'Formation', 'Initiatives', 'Opportunités'] as const
export type NewsCategory = (typeof newsCategories)[number]

export interface NewsArticle {
  id: string
  category: Exclude<NewsCategory, 'Tout voir'>
  title: string
  excerpt: string
  image: string
  imageFamily: 'news' | 'hero'
  imageAlt: string
  imagePosition: string
  format: string
  author: string
  publishedAt: string
  readingTime: number
  href: string
  paragraphs: string[]
}

// Contenus éditoriaux générés pour représenter le rendu final de la rubrique.
// Ils pourront être remplacés entrée par entrée par les publications du média.
export const newsArticles: NewsArticle[] = [
  {
    id: 'entreprendre-ici', category: 'Entrepreneuriat',
    title: 'Entreprendre ici, penser plus loin.',
    excerpt: 'De l’idée au premier pas : donner forme à ses ambitions, avec les ressources et les talents qui nous entourent.',
    image: '/images/news-enterprise.webp', imageFamily: 'news',
    imageAlt: 'Deux jeunes adultes examinent un objet artisanal dans un atelier lumineux — illustration.',
    imagePosition: '50% 36%', format: 'Décryptage', author: 'La rédaction',
    publishedAt: '2026-10-22', readingTime: 4, href: '/actualites/entreprendre-ici',
    paragraphs: [
      'Une idée prend de la valeur lorsqu’elle répond à un besoin concret. Avant de chercher à tout construire, il peut être utile d’observer son environnement, d’écouter les personnes concernées et de formuler simplement le problème que l’on souhaite résoudre.',
      'Un premier croquis, une conversation ou une petite série d’essais peuvent aider à préciser un projet. Ces étapes permettent de confronter ses intuitions au réel, de recueillir des retours et de comprendre ce qu’il reste à apprendre.',
      'S’entourer compte aussi. Partager une expérience, rencontrer un autre porteur de projet ou identifier un lieu de formation peut ouvrir des pistes. L’ambition éditoriale d’Océan Média TV est de rendre ces idées et ces ressources plus visibles pour la jeunesse congolaise.',
      'Entreprendre ici, c’est enfin apprendre à avancer avec méthode : clarifier son intention, tester une première réponse et transformer chaque retour en décision utile pour la suite.',
    ],
  },
  {
    id: 'prendre-la-parole', category: 'Formation',
    title: 'Prendre la parole, prendre sa place.',
    excerpt: 'Présenter une idée, partager une conviction : la confiance se construit aussi dans la pratique.',
    image: '/images/news-learning.webp', imageFamily: 'news',
    imageAlt: 'Un jeune intervenant échange avec un groupe dans un espace de formation — illustration.',
    imagePosition: '50% 38%', format: 'Éclairage', author: 'La rédaction',
    publishedAt: '2026-10-21', readingTime: 3, href: '/actualites/prendre-la-parole',
    paragraphs: [
      'Prendre la parole ne se résume pas à parler plus fort. Il s’agit d’abord de savoir ce que l’on souhaite transmettre et à qui l’on s’adresse. Une idée principale, quelques exemples et une conclusion claire constituent un point de départ accessible.',
      'S’exercer devant un petit groupe permet d’apprivoiser son rythme et de recevoir un retour bienveillant. Écouter les questions, reformuler et laisser de la place aux autres font aussi partie de la communication.',
      'La prise de parole et le leadership font partie des compétences qui permettent de mieux défendre un projet, d’animer une équipe et de créer des liens durables autour d’une vision.',
    ],
  },
  {
    id: 'generation-initiatives', category: 'Initiatives',
    title: 'Une génération qui crée ses propres perspectives.',
    excerpt: 'Créativité, engagement, envie d’agir : mettre en lumière les énergies qui font avancer la jeunesse.',
    image: '/images/hero-voices.webp', imageFamily: 'hero',
    imageAlt: 'Une jeune créatrice avec son appareil photo sur une terrasse — illustration.',
    imagePosition: '54% 12%', format: 'Regard', author: 'La rédaction',
    publishedAt: '2026-10-20', readingTime: 5, href: '/actualites/generation-initiatives',
    paragraphs: [
      'Une initiative peut commencer à petite échelle : un projet créatif, une idée partagée ou une réponse à un besoin de proximité. Ce qui compte, c’est le mouvement qu’elle engage et les personnes qu’elle rassemble.',
      'Raconter ces démarches, c’est s’intéresser autant aux questions qu’aux réussites. Qu’est-ce qui a donné envie de commencer ? Quelles ressources ont été utiles ? Qu’a-t-on appris en chemin ? Ces questions peuvent rendre un parcours inspirant sans le présenter comme une recette universelle.',
      'Donner de l’écho aux projets utiles et aux talents de la jeunesse permet de rendre visibles des parcours qui ouvrent de nouvelles perspectives et donnent envie d’agir.',
    ],
  },
  {
    id: 'reperer-opportunites', category: 'Opportunités',
    title: 'Repérer les opportunités qui font avancer.',
    excerpt: 'Formation, emploi, accompagnement : les bons réflexes pour explorer les pistes adaptées à son parcours.',
    image: '/images/hero-skills.webp', imageFamily: 'hero',
    imageAlt: 'De jeunes adultes comparent leurs idées autour d’un ordinateur — illustration.',
    imagePosition: '50% 28%', format: 'Repères', author: 'La rédaction',
    publishedAt: '2026-10-18', readingTime: 3, href: '/actualites/reperer-opportunites',
    paragraphs: [
      'Une opportunité devient utile lorsqu’elle correspond à un objectif et à une situation. Préciser ce que l’on souhaite apprendre, le temps dont on dispose et les conditions que l’on peut remplir aide à orienter sa recherche.',
      'Avant de candidater, prendre le temps de lire les critères, de vérifier la source et de préparer les pièces demandées facilite la démarche. Conserver les informations essentielles au même endroit permet aussi de suivre ses recherches plus sereinement.',
      'Développer ces réflexes aide à distinguer les pistes sérieuses, à préparer une candidature solide et à mieux relier chaque opportunité à son propre projet.',
    ],
  },
  {
    id: 'apprendre-ensemble', category: 'Formation',
    title: 'Apprendre ensemble pour aller plus loin.',
    excerpt: 'L’échange de savoirs comme point de départ pour progresser et enrichir son regard.',
    image: '/images/hero-skills.webp', imageFamily: 'hero',
    imageAlt: 'Un groupe échange autour d’un ordinateur et d’un carnet — illustration.',
    imagePosition: '50% 25%', format: 'Éclairage', author: 'La rédaction',
    publishedAt: '2026-10-16', readingTime: 4, href: '/actualites/apprendre-ensemble',
    paragraphs: [
      'Apprendre avec d’autres offre l’occasion d’expliquer ce que l’on comprend et de découvrir des approches différentes. Une question posée au bon moment peut aider tout un groupe à avancer.',
      'Un objectif partagé, des temps d’échange et une place donnée à chacun créent des conditions propices à cette expérience. Il ne s’agit pas de progresser tous au même rythme, mais de rendre les savoirs plus faciles à partager.',
      'Le partage des connaissances crée ainsi un espace où chacun peut contribuer, progresser et donner à d’autres l’envie de continuer à apprendre.',
    ],
  },
  {
    id: 'du-croquis-au-projet', category: 'Entrepreneuriat',
    title: 'Du premier croquis au projet concret.',
    excerpt: 'Observer, essayer, ajuster : explorer les étapes qui donnent une direction à une idée.',
    image: '/images/news-enterprise.webp', imageFamily: 'news',
    imageAlt: 'Un moment de création et d’échange dans un atelier — illustration.',
    imagePosition: '60% 45%', format: 'Décryptage', author: 'La rédaction',
    publishedAt: '2026-10-14', readingTime: 4, href: '/actualites/du-croquis-au-projet',
    paragraphs: [
      'Mettre une idée sur le papier permet de la rendre plus facile à discuter. Un schéma, une liste de besoins ou une première maquette peuvent faire apparaître les questions qui restent ouvertes.',
      'L’étape suivante consiste à choisir une action réalisable, puis à observer ce qu’elle apporte. Les échanges avec les personnes concernées aident à ajuster le projet et à distinguer ce qui est essentiel de ce qui peut attendre.',
      'Un projet devient plus concret à mesure que ses choix sont expliqués, vérifiés et transformés en étapes simples que l’équipe peut réellement mettre en œuvre.',
    ],
  },
]

export function newsImageSources(article: NewsArticle) {
  const base = article.image.replace(/\.webp$/, '')
  return article.imageFamily === 'news'
    ? `${base}-640.webp 640w, ${base}-1024.webp 1024w, ${base}.webp 1536w`
    : `${base}-768.webp 768w, ${base}-1280.webp 1280w, ${base}.webp 1536w`
}

export function readingMinutes(article: NewsArticle) {
  return article.readingTime
}
