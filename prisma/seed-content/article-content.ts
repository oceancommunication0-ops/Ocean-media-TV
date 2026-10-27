export interface ArticleProfile {
  sectionTitles: readonly string[]
  pullQuote: string
  keyPoints: readonly string[]
  inlineImage: {
    src: string
    srcSet: string
    alt: string
    caption: string
    position?: string
  }
}

export const articleProfiles: Record<string, ArticleProfile> = {
  'entreprendre-ici': {
    sectionTitles: ['Tester avant de vouloir grandir', 'La force des bonnes rencontres', 'Avancer avec méthode'],
    pullQuote: 'Une idée gagne en force lorsqu’elle rencontre le réel, écoute ses usages et accepte d’évoluer.',
    keyPoints: ['Partir d’un besoin clairement identifié.', 'Tester une réponse simple et écouter les retours.', 'Transformer chaque apprentissage en prochaine étape.'],
    inlineImage: {
      src: '/images/portrait-enterprise.webp',
      srcSet: '/images/portrait-enterprise-480.webp 480w, /images/portrait-enterprise-800.webp 800w, /images/portrait-enterprise.webp 1200w',
      alt: 'Une entrepreneure travaille dans son atelier de couture — photographie d’illustration.',
      caption: 'Les savoir-faire de proximité peuvent devenir le point de départ d’un projet durable. Photographie d’illustration.',
      position: '50% 20%',
    },
  },
  'prendre-la-parole': {
    sectionTitles: ['S’exercer pour gagner en assurance', 'Une compétence qui ouvre le dialogue'],
    pullQuote: 'Une parole claire ne cherche pas à impressionner : elle crée un lien et donne une direction.',
    keyPoints: ['Identifier une idée principale.', 'S’appuyer sur des exemples concrets.', 'Écouter les questions pour mieux reformuler.'],
    inlineImage: {
      src: '/images/training-workshop.webp',
      srcSet: '/images/training-workshop-480.webp 480w, /images/training-workshop-800.webp 800w, /images/training-workshop.webp 1200w',
      alt: 'Une participante prend la parole pendant un atelier professionnel — photographie d’illustration.',
      caption: 'La pratique régulière transforme progressivement l’appréhension en assurance. Photographie d’illustration.',
    },
  },
  'generation-initiatives': {
    sectionTitles: ['Raconter aussi les apprentissages', 'Donner de l’écho aux énergies utiles'],
    pullQuote: 'Ce qui inspire dans un parcours, ce n’est pas seulement le résultat : c’est le chemin rendu visible.',
    keyPoints: ['Observer les initiatives à leur juste échelle.', 'Partager les étapes autant que les réussites.', 'Relier les talents aux ressources utiles.'],
    inlineImage: {
      src: '/images/portrait-voices.webp',
      srcSet: '/images/portrait-voices-480.webp 480w, /images/portrait-voices-800.webp 800w, /images/portrait-voices.webp 1200w',
      alt: 'Une jeune créatrice prépare un projet visuel — photographie d’illustration.',
      caption: 'Créer, documenter et transmettre : trois façons de faire circuler une initiative. Photographie d’illustration.',
    },
  },
  'reperer-opportunites': {
    sectionTitles: ['Vérifier avant de candidater', 'Relier chaque piste à son projet'],
    pullQuote: 'La bonne opportunité n’est pas seulement disponible : elle correspond à une direction que l’on a choisie.',
    keyPoints: ['Clarifier son objectif et ses contraintes.', 'Vérifier la source et les critères.', 'Préparer ses documents avant l’échéance.'],
    inlineImage: {
      src: '/images/hero-skills.webp',
      srcSet: '/images/hero-skills-768.webp 768w, /images/hero-skills-1280.webp 1280w, /images/hero-skills.webp 1536w',
      alt: 'De jeunes adultes consultent ensemble des ressources numériques — illustration éditoriale.',
      caption: 'Comparer les critères et organiser ses démarches aide à choisir des pistes adaptées. Illustration éditoriale.',
    },
  },
  'apprendre-ensemble': {
    sectionTitles: ['Créer les conditions de l’échange', 'Faire circuler les connaissances'],
    pullQuote: 'Expliquer ce que l’on vient d’apprendre est souvent une autre manière de mieux le comprendre.',
    keyPoints: ['Partager un objectif clair.', 'Donner une place à chaque participant.', 'Transformer les questions en ressources communes.'],
    inlineImage: {
      src: '/images/training-workshop.webp',
      srcSet: '/images/training-workshop-480.webp 480w, /images/training-workshop-800.webp 800w, /images/training-workshop.webp 1200w',
      alt: 'Un groupe participe à une activité de formation — photographie d’illustration.',
      caption: 'L’apprentissage collectif enrichit les méthodes et les points de vue. Photographie d’illustration.',
    },
  },
  'du-croquis-au-projet': {
    sectionTitles: ['Choisir une première action', 'Transformer les choix en étapes'],
    pullQuote: 'Le premier dessin d’une idée n’a pas besoin d’être parfait : il doit surtout permettre d’en parler.',
    keyPoints: ['Rendre l’idée visible sur le papier.', 'Choisir une action réalisable.', 'Ajuster le projet à partir des usages.'],
    inlineImage: {
      src: '/images/portrait-enterprise.webp',
      srcSet: '/images/portrait-enterprise-480.webp 480w, /images/portrait-enterprise-800.webp 800w, /images/portrait-enterprise.webp 1200w',
      alt: 'Une professionnelle développe son savoir-faire dans un atelier — photographie d’illustration.',
      caption: 'Une idée devient concrète à travers des gestes, des essais et des décisions partagées. Photographie d’illustration.',
    },
  },
}
