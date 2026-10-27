export const trainingFamilies = [
  { id: 'communication', label: 'Communication' },
  { id: 'leadership-gestion', label: 'Leadership & gestion' },
  { id: 'projet', label: 'Projet & entrepreneuriat' },
  { id: 'carriere', label: 'Parcours professionnel' },
] as const

export type TrainingFamilyId = (typeof trainingFamilies)[number]['id']

export const trainingDomains = [
  {
    id: 'art-oratoire', title: 'Art oratoire', icon: 'microphone', family: 'communication',
    tagline: 'Prendre la parole avec clarté, présence et conviction.',
    description: 'Maîtriser la prise de parole en public et développer son aisance à communiquer.',
    longDescription: 'Un parcours pour mieux structurer ses idées, habiter sa voix et créer une relation forte avec son auditoire, dans un cadre professionnel comme lors d’une présentation de projet.',
    objectives: ['Construire un message clair et mémorable', 'Travailler la voix, la posture et la présence', 'Gérer le trac et répondre avec assurance'],
    audience: 'Jeunes professionnels, étudiants, porteurs de projet et toute personne amenée à s’exprimer en public.',
    approach: 'Exercices de prise de parole, mises en situation, retours individualisés et progression par la pratique.',
  },
  {
    id: 'leadership', title: 'Leadership', icon: 'users', family: 'leadership-gestion',
    tagline: 'Mobiliser une équipe et faire grandir une vision commune.',
    description: 'Renforcer sa confiance, son esprit d’initiative et ses capacités de leadership.',
    longDescription: 'Cette thématique aide à mieux comprendre sa manière d’influencer, de décider et de collaborer pour porter une vision avec responsabilité et entraîner les autres dans l’action.',
    objectives: ['Identifier son style de leadership', 'Développer l’écoute et la confiance', 'Transformer une intention en dynamique collective'],
    audience: 'Jeunes leaders, responsables associatifs, chefs de projet, entrepreneurs et futurs managers.',
    approach: 'Études de situations, exercices collaboratifs et outils concrets de communication et de décision.',
  },
  {
    id: 'management', title: 'Management', icon: 'briefcase', family: 'leadership-gestion',
    tagline: 'Organiser les priorités et coordonner l’action avec méthode.',
    description: 'Développer des compétences en organisation, gestion et coordination.',
    longDescription: 'Un domaine pensé pour acquérir les repères essentiels de l’organisation du travail, du suivi d’objectifs et de la coordination d’une équipe ou d’un projet.',
    objectives: ['Clarifier les rôles et les responsabilités', 'Planifier les objectifs et suivre leur avancement', 'Installer des méthodes de travail efficaces'],
    audience: 'Responsables d’équipe, coordinateurs, porteurs de projet et professionnels en évolution.',
    approach: 'Outils de planification, cas pratiques, tableaux de pilotage et scénarios de coordination.',
  },
  {
    id: 'redaction', title: 'Techniques de rédaction', icon: 'pen', family: 'communication',
    tagline: 'Écrire avec précision pour mieux transmettre ses idées.',
    description: 'Améliorer sa communication écrite et la présentation de ses idées.',
    longDescription: 'Cette thématique développe une écriture claire, structurée et adaptée au destinataire, qu’il s’agisse d’un document professionnel, d’un projet ou d’un contenu destiné au public.',
    objectives: ['Structurer une idée avant de rédiger', 'Rendre un texte plus clair et plus convaincant', 'Adapter le ton, le format et le niveau de langage'],
    audience: 'Étudiants, communicants, membres d’associations, professionnels et porteurs de projet.',
    approach: 'Ateliers d’écriture, réécriture guidée, méthodes de structuration et analyse de textes.',
  },
  {
    id: 'entrepreneuriat', title: 'Entrepreneuriat', icon: 'lightbulb', family: 'projet',
    tagline: 'Donner une structure solide à une idée porteuse de valeur.',
    description: 'Acquérir des bases utiles pour structurer et développer un projet.',
    longDescription: 'Un parcours d’exploration pour passer de l’idée à un projet mieux défini, comprendre son environnement et poser les premières décisions utiles à son développement.',
    objectives: ['Clarifier le problème et la proposition de valeur', 'Identifier les bénéficiaires et les ressources utiles', 'Construire une feuille de route réaliste'],
    audience: 'Porteurs d’idées, jeunes entrepreneurs, associations et profils souhaitant lancer une initiative.',
    approach: 'Canevas de projet, exercices de validation, retours collectifs et mise en perspective opérationnelle.',
  },
  {
    id: 'competences-professionnelles', title: 'Compétences professionnelles', icon: 'graduation', family: 'carriere',
    tagline: 'Renforcer les aptitudes qui rendent un parcours plus solide.',
    description: 'Développer des aptitudes utiles à son parcours professionnel.',
    longDescription: 'Cette thématique rassemble les savoir-être et les méthodes qui facilitent l’intégration, la collaboration et l’évolution dans un environnement professionnel exigeant.',
    objectives: ['Mieux communiquer dans un cadre professionnel', 'Développer autonomie, fiabilité et sens des priorités', 'Présenter son profil et valoriser ses acquis'],
    audience: 'Étudiants, jeunes diplômés, personnes en insertion ou en transition professionnelle.',
    approach: 'Autoévaluation, simulations professionnelles, outils de préparation et exercices en groupe.',
  },
] as const satisfies ReadonlyArray<{
  id: string
  title: string
  icon: 'microphone' | 'users' | 'briefcase' | 'pen' | 'lightbulb' | 'graduation'
  family: TrainingFamilyId
  tagline: string
  description: string
  longDescription: string
  objectives: readonly string[]
  audience: string
  approach: string
}>

export type TrainingDomain = (typeof trainingDomains)[number]
export type TrainingDomainId = TrainingDomain['id']

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
