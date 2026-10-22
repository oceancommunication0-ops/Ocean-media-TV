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
  isDemo: boolean
  publishedAt?: string
  paragraphs: string[]
}

// Exemples expressément demandés pour la présentation. Remplacer par les
// publications validées du média, leur date réelle et leurs photographies.
export const newsArticles: NewsArticle[] = [
  {
    id: 'entreprendre-ici', category: 'Entrepreneuriat',
    title: 'Entreprendre ici, penser plus loin.',
    excerpt: 'De l’idée au premier pas : donner forme à ses ambitions, avec les ressources et les talents qui nous entourent.',
    image: '/images/news-enterprise.webp', imageFamily: 'news',
    imageAlt: 'Deux jeunes adultes examinent un objet artisanal dans un atelier lumineux — illustration.',
    imagePosition: '50% 36%', format: 'Décryptage', isDemo: true,
    paragraphs: [
      'Une idée prend de la valeur lorsqu’elle répond à un besoin concret. Avant de chercher à tout construire, il peut être utile d’observer son environnement, d’écouter les personnes concernées et de formuler simplement le problème que l’on souhaite résoudre.',
      'Un premier croquis, une conversation ou une petite série d’essais peuvent aider à préciser un projet. Ces étapes permettent de confronter ses intuitions au réel, de recueillir des retours et de comprendre ce qu’il reste à apprendre.',
      'S’entourer compte aussi. Partager une expérience, rencontrer un autre porteur de projet ou identifier un lieu de formation peut ouvrir des pistes. L’ambition éditoriale d’Océan Média TV est de rendre ces idées et ces ressources plus visibles pour la jeunesse congolaise.',
      'Ce texte illustre le format de décryptage envisagé pour le média. Il ne relate pas un événement réel et les personnes représentées dans le visuel sont fictives.',
    ],
  },
  {
    id: 'prendre-la-parole', category: 'Formation',
    title: 'Prendre la parole, prendre sa place.',
    excerpt: 'Présenter une idée, partager une conviction : la confiance se construit aussi dans la pratique.',
    image: '/images/news-learning.webp', imageFamily: 'news',
    imageAlt: 'Un jeune intervenant échange avec un groupe dans un espace de formation — illustration.',
    imagePosition: '50% 38%', format: 'Éclairage', isDemo: true,
    paragraphs: [
      'Prendre la parole ne se résume pas à parler plus fort. Il s’agit d’abord de savoir ce que l’on souhaite transmettre et à qui l’on s’adresse. Une idée principale, quelques exemples et une conclusion claire constituent un point de départ accessible.',
      'S’exercer devant un petit groupe permet d’apprivoiser son rythme et de recevoir un retour bienveillant. Écouter les questions, reformuler et laisser de la place aux autres font aussi partie de la communication.',
      'La prise de parole et le leadership figurent parmi les domaines de formation évoqués par Océan Communication. Ce sujet de démonstration donne un aperçu de la manière dont le média pourrait rendre ces compétences plus concrètes et plus accessibles.',
    ],
  },
  {
    id: 'generation-initiatives', category: 'Initiatives',
    title: 'Une génération qui crée ses propres perspectives.',
    excerpt: 'Créativité, engagement, envie d’agir : mettre en lumière les énergies qui font avancer la jeunesse.',
    image: '/images/hero-voices.webp', imageFamily: 'hero',
    imageAlt: 'Une jeune créatrice avec son appareil photo sur une terrasse — illustration.',
    imagePosition: '54% 12%', format: 'Regard', isDemo: true,
    paragraphs: [
      'Une initiative peut commencer à petite échelle : un projet créatif, une idée partagée ou une réponse à un besoin de proximité. Ce qui compte, c’est le mouvement qu’elle engage et les personnes qu’elle rassemble.',
      'Raconter ces démarches, c’est s’intéresser autant aux questions qu’aux réussites. Qu’est-ce qui a donné envie de commencer ? Quelles ressources ont été utiles ? Qu’a-t-on appris en chemin ? Ces questions peuvent rendre un parcours inspirant sans le présenter comme une recette universelle.',
      'Océan Média TV souhaite donner de l’écho aux projets utiles et aux talents de la jeunesse congolaise. Cet exemple présente une intention éditoriale ; il ne constitue pas le portrait d’une personne réelle.',
    ],
  },
  {
    id: 'reperer-opportunites', category: 'Opportunités',
    title: 'Repérer les opportunités qui font avancer.',
    excerpt: 'Formation, emploi, accompagnement : les bons réflexes pour explorer les pistes adaptées à son parcours.',
    image: '/images/hero-skills.webp', imageFamily: 'hero',
    imageAlt: 'De jeunes adultes comparent leurs idées autour d’un ordinateur — illustration.',
    imagePosition: '50% 28%', format: 'Repères', isDemo: true,
    paragraphs: [
      'Une opportunité devient utile lorsqu’elle correspond à un objectif et à une situation. Préciser ce que l’on souhaite apprendre, le temps dont on dispose et les conditions que l’on peut remplir aide à orienter sa recherche.',
      'Avant de candidater, prendre le temps de lire les critères, de vérifier la source et de préparer les pièces demandées facilite la démarche. Conserver les informations essentielles au même endroit permet aussi de suivre ses recherches plus sereinement.',
      'Rapprocher les jeunes des opportunités proposées par les institutions, les entreprises et les organisations fait partie de la mission d’Océan Média TV. Cet article de démonstration ne présente aucune offre ouverte ni aucun appel à candidatures.',
    ],
  },
  {
    id: 'apprendre-ensemble', category: 'Formation',
    title: 'Apprendre ensemble pour aller plus loin.',
    excerpt: 'L’échange de savoirs comme point de départ pour progresser et enrichir son regard.',
    image: '/images/hero-skills.webp', imageFamily: 'hero',
    imageAlt: 'Un groupe échange autour d’un ordinateur et d’un carnet — illustration.',
    imagePosition: '50% 25%', format: 'Éclairage', isDemo: true,
    paragraphs: [
      'Apprendre avec d’autres offre l’occasion d’expliquer ce que l’on comprend et de découvrir des approches différentes. Une question posée au bon moment peut aider tout un groupe à avancer.',
      'Un objectif partagé, des temps d’échange et une place donnée à chacun créent des conditions propices à cette expérience. Il ne s’agit pas de progresser tous au même rythme, mais de rendre les savoirs plus faciles à partager.',
      'Cette proposition éditoriale s’inscrit dans l’engagement d’Océan Communication pour la formation et l’accompagnement de la jeunesse. Le texte et son visuel sont des exemples de présentation.',
    ],
  },
  {
    id: 'du-croquis-au-projet', category: 'Entrepreneuriat',
    title: 'Du premier croquis au projet concret.',
    excerpt: 'Observer, essayer, ajuster : explorer les étapes qui donnent une direction à une idée.',
    image: '/images/news-enterprise.webp', imageFamily: 'news',
    imageAlt: 'Un moment de création et d’échange dans un atelier — illustration.',
    imagePosition: '60% 45%', format: 'Décryptage', isDemo: true,
    paragraphs: [
      'Mettre une idée sur le papier permet de la rendre plus facile à discuter. Un schéma, une liste de besoins ou une première maquette peuvent faire apparaître les questions qui restent ouvertes.',
      'L’étape suivante consiste à choisir une action réalisable, puis à observer ce qu’elle apporte. Les échanges avec les personnes concernées aident à ajuster le projet et à distinguer ce qui est essentiel de ce qui peut attendre.',
      'Ce contenu de démonstration illustre un angle possible autour de l’entrepreneuriat et de l’innovation. Il pourra être remplacé par un article documenté de la rédaction d’Océan Média TV.',
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
  return Math.max(1, Math.ceil(article.paragraphs.join(' ').split(/\s+/).length / 200))
}
