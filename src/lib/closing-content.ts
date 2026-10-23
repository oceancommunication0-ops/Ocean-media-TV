export interface InspiringStory {
  id: string
  category: 'Portrait' | 'Initiative' | 'Parcours'
  title: string
  excerpt: string
  image: string
  alt: string
  position?: string
}

// Editorial presentation stories: no invented identity, quotation or endorsement.
// Replace with validated reporting and photographs when publishing real portraits.
export const inspiringStories: readonly InspiringStory[] = [
  {
    id: 'creer-et-transmettre', category: 'Portrait',
    title: 'Créer, c’est déjà faire bouger les lignes.',
    excerpt: 'Trouver sa voix, cultiver son talent et donner aux autres l’envie d’oser. Regard sur cette énergie créative qui ouvre de nouvelles perspectives.',
    image: 'portrait-voices', alt: 'Une femme travaille dans un espace créatif — photographie d’illustration.', position: '50% 35%',
  },
  {
    id: 'numerique-et-autonomie', category: 'Initiative',
    title: 'Le numérique, une porte ouverte sur demain.',
    excerpt: 'Apprendre, expérimenter, partager : les compétences numériques dessinent de nouvelles voies vers l’autonomie.',
    image: 'portrait-digital', alt: 'Un jeune homme utilise un ordinateur — photographie d’illustration.', position: '50% 35%',
  },
  {
    id: 'entreprendre-avec-son-talent', category: 'Parcours',
    title: 'Donner forme à ses idées. Et du sens à son avenir.',
    excerpt: 'De la passion au projet, chaque savoir-faire peut devenir le point de départ d’une aventure entrepreneuriale.',
    image: 'portrait-enterprise', alt: 'Une couturière souriante, un mètre ruban autour du cou, en noir et blanc — photographie d’illustration.', position: '50% 0%',
  },
]
