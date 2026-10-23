export const trainingDomains = [
  {
    id: 'art-oratoire', title: 'Art oratoire', icon: 'microphone',
    description: 'Maîtriser la prise de parole en public et développer son aisance à communiquer.',
  },
  {
    id: 'leadership', title: 'Leadership', icon: 'users',
    description: 'Renforcer sa confiance, son esprit d’initiative et ses capacités de leadership.',
  },
  {
    id: 'management', title: 'Management', icon: 'briefcase',
    description: 'Développer des compétences en organisation, gestion et coordination.',
  },
  {
    id: 'redaction', title: 'Techniques de rédaction', icon: 'pen',
    description: 'Améliorer sa communication écrite et la présentation de ses idées.',
  },
  {
    id: 'entrepreneuriat', title: 'Entrepreneuriat', icon: 'lightbulb',
    description: 'Acquérir des bases utiles pour structurer et développer un projet.',
  },
  {
    id: 'competences-professionnelles', title: 'Compétences professionnelles', icon: 'graduation',
    description: 'Développer des aptitudes utiles à son parcours professionnel.',
  },
] as const

export type TrainingDomainId = (typeof trainingDomains)[number]['id']

// Les domaines ci-dessus sont permanents. Les sessions seront alimentées
// séparément, uniquement après validation d’une programmation réelle.
export interface TrainingSession {
  id: string
  title: string
  domainIds: TrainingDomainId[]
  status: 'draft' | 'scheduled' | 'cancelled'
  startsAt: string
  endsAt?: string
  timezone: string
  format: 'Présentiel' | 'En ligne' | 'Hybride'
  location?: string
  registrationUrl?: string
}

export const trainingSessions: readonly TrainingSession[] = []
