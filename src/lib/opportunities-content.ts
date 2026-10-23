export const opportunityCategories = [
  { id: 'emploi', label: 'Emploi', description: 'Construire sa carrière', icon: 'briefcase' },
  { id: 'formations', label: 'Formations', description: 'Développer ses compétences', icon: 'graduation' },
  { id: 'entrepreneuriat', label: 'Entrepreneuriat', description: 'Faire grandir son projet', icon: 'rocket' },
  { id: 'financements', label: 'Financements', description: 'Donner vie à ses ambitions', icon: 'landmark' },
  { id: 'rencontres', label: 'Rencontres', description: 'Élargir son réseau', icon: 'users' },
  { id: 'innovation', label: 'Innovation', description: 'Imaginer les solutions de demain', icon: 'lightbulb' },
] as const

export type OpportunityCategoryId = (typeof opportunityCategories)[number]['id']

export interface Opportunity {
  id: string
  category: OpportunityCategoryId
  title: string
  description: string
  format: string
  location: string
  mode: string
  audience: string
  href: string
  deadline?: string
}

// Annonces de présentation autorisées pour cette étape. Aucune organisation
// recruteuse, offre ouverte ou échéance réelle n’est présumée.
// Remplacer ces entrées par les annonces validées lors de la connexion éditoriale.
export const opportunities: Opportunity[] = [
  {
    id: 'communication-digitale', category: 'emploi',
    title: 'Chargé·e de communication digitale',
    description: 'Mettre sa créativité au service de campagnes, de contenus et de projets qui ont du sens.',
    format: 'CDD', location: 'Kinshasa', mode: 'Présentiel', audience: 'Jeunes diplômés',
    href: '/opportunites/communication-digitale',
  },
  {
    id: 'parole-leadership', category: 'formations',
    title: 'Prise de parole & leadership',
    description: 'Apprendre à défendre ses idées, gagner en assurance et mieux communiquer avec les autres.',
    format: 'Atelier', location: 'RDC', mode: 'En ligne', audience: 'Tous niveaux',
    href: '/opportunites/parole-leadership',
  },
  {
    id: 'appui-projet', category: 'financements',
    title: 'Un coup de pouce pour votre projet',
    description: 'Structurer une initiative à impact et préparer un dossier pour mobiliser les bons appuis.',
    format: 'Appel à projets', location: 'RDC', mode: 'Accompagnement', audience: 'Porteurs de projets',
    href: '/opportunites/appui-projet',
  },
  {
    id: 'premier-projet', category: 'entrepreneuriat',
    title: 'Passer de l’idée au premier projet',
    description: 'Tester son concept, construire son modèle et avancer aux côtés d’autres jeunes entrepreneurs.',
    format: 'Incubation', location: 'Kinshasa', mode: 'Hybride', audience: 'Jeunes entrepreneurs',
    href: '/opportunites/premier-projet',
  },
  {
    id: 'rencontre-professionnelle', category: 'rencontres',
    title: 'Échanger, rencontrer, avancer',
    description: 'Croiser les expériences et créer des liens avec des professionnels et des porteurs d’initiatives.',
    format: 'Rencontre professionnelle', location: 'Kinshasa', mode: 'Présentiel', audience: 'Étudiants et jeunes actifs',
    href: '/opportunites/rencontre-professionnelle',
  },
  {
    id: 'solutions-demain', category: 'innovation',
    title: 'Imaginer des solutions pour demain',
    description: 'Explorer un besoin concret et transformer une idée utile en solution à expérimenter.',
    format: 'Programme d’innovation', location: 'RDC', mode: 'En équipe', audience: 'Créatifs et porteurs d’idées',
    href: '/opportunites/solutions-demain',
  },
]
