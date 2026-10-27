export const opportunityCategories = [
  { id: 'emploi', label: 'Emploi', description: 'Construire sa carrière', icon: 'briefcase' },
  { id: 'formations', label: 'Formations', description: 'Développer ses compétences', icon: 'graduation' },
  { id: 'entrepreneuriat', label: 'Entrepreneuriat', description: 'Faire grandir son projet', icon: 'rocket' },
  { id: 'financements', label: 'Financements', description: 'Donner vie à ses ambitions', icon: 'landmark' },
  { id: 'rencontres', label: 'Rencontres', description: 'Élargir son réseau', icon: 'users' },
  { id: 'innovation', label: 'Innovation', description: 'Imaginer les solutions de demain', icon: 'lightbulb' },
] as const

export type OpportunityCategoryId = (typeof opportunityCategories)[number]['id']

export interface OpportunityStep {
  title: string
  description: string
}

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
  organization: string
  publishedAt: string
  deadline?: string
  featured?: boolean
  reference: string
  overview: string[]
  benefits: string[]
  eligibility: string[]
  documents: string[]
  steps: OpportunityStep[]
}

const standardSteps: OpportunityStep[] = [
  { title: 'Vérifier son profil', description: 'Relire les critères et confirmer que son parcours correspond à l’opportunité.' },
  { title: 'Préparer son dossier', description: 'Réunir les informations et documents demandés dans un format clair.' },
  { title: 'Soumettre sa candidature', description: 'Utiliser le canal officiel qui accompagnera l’annonce validée.' },
]

// Contenus de présentation autorisés pour représenter le portail final.
// Remplacer ces entrées par les annonces vérifiées lors de la connexion éditoriale.
export const opportunities: Opportunity[] = [
  {
    id: 'communication-digitale', category: 'emploi', featured: true,
    title: 'Chargé·e de communication digitale',
    description: 'Mettre sa créativité au service de campagnes, de contenus et de projets qui ont du sens.',
    format: 'CDD', location: 'Kinshasa', mode: 'Présentiel', audience: 'Jeunes diplômés',
    organization: 'Structure partenaire', publishedAt: '2026-10-20', deadline: '2027-01-18',
    reference: 'OMT-EMP-001', href: '/opportunites/communication-digitale',
    overview: [
      'Cette opportunité s’adresse à une personne curieuse, organisée et attentive aux usages numériques. Elle contribuera à concevoir des contenus utiles, à planifier leur diffusion et à suivre les échanges avec les communautés.',
      'Le poste permet de travailler au contact d’équipes éditoriales et de projets tournés vers la jeunesse, avec une place importante accordée à la créativité et à la qualité de l’information.',
    ],
    benefits: ['Une expérience au sein d’une équipe pluridisciplinaire', 'Un accompagnement à la prise de fonction', 'Des missions éditoriales et numériques variées'],
    eligibility: ['Formation en communication, journalisme, marketing ou domaine proche', 'Bonne capacité rédactionnelle en français', 'Maîtrise des usages courants des réseaux sociaux', 'Portfolio ou exemples de réalisations appréciés'],
    documents: ['Curriculum vitae', 'Courte lettre de motivation', 'Deux exemples de contenus ou lien vers un portfolio'],
    steps: standardSteps,
  },
  {
    id: 'parole-leadership', category: 'formations',
    title: 'Prise de parole & leadership',
    description: 'Apprendre à défendre ses idées, gagner en assurance et mieux communiquer avec les autres.',
    format: 'Atelier', location: 'RDC', mode: 'En ligne', audience: 'Tous niveaux',
    organization: 'Océan Communication', publishedAt: '2026-10-18', deadline: '2027-01-30',
    reference: 'OMT-FOR-002', href: '/opportunites/parole-leadership',
    overview: [
      'Ce parcours propose des exercices concrets pour structurer une intervention, clarifier son message et mieux gérer le trac. Les participants progresseront à travers des mises en situation et des retours guidés.',
      'La formation privilégie une approche pratique afin que chacun puisse adapter les techniques à son contexte académique, professionnel ou entrepreneurial.',
    ],
    benefits: ['Méthodes pour préparer une intervention', 'Exercices de posture, de voix et d’argumentation', 'Retours personnalisés sur sa progression'],
    eligibility: ['Être disponible pendant l’ensemble du parcours', 'Disposer d’une connexion permettant les échanges vidéo', 'Souhaiter progresser par la pratique'],
    documents: ['Brève présentation du parcours', 'Objectif personnel de progression'],
    steps: standardSteps,
  },
  {
    id: 'appui-projet', category: 'financements',
    title: 'Un coup de pouce pour votre projet',
    description: 'Structurer une initiative à impact et préparer un dossier pour mobiliser les bons appuis.',
    format: 'Appel à projets', location: 'RDC', mode: 'Accompagnement', audience: 'Porteurs de projets',
    organization: 'Programme partenaire', publishedAt: '2026-10-16', deadline: '2027-02-12',
    reference: 'OMT-FIN-003', href: '/opportunites/appui-projet',
    overview: [
      'L’appel accompagne des initiatives en phase de structuration qui répondent à un besoin clairement identifié. Le parcours aide les équipes à préciser leur proposition, leur budget et leurs premiers indicateurs d’impact.',
      'Les projets retenus bénéficient d’un cadre de travail pour consolider leur dossier avant une éventuelle mise en relation avec des partenaires.',
    ],
    benefits: ['Ateliers de structuration de projet', 'Relecture du budget et de la feuille de route', 'Présentation finale devant un comité de partenaires'],
    eligibility: ['Projet porté en République démocratique du Congo', 'Équipe composée d’au moins deux personnes', 'Première expérimentation ou preuve de concept disponible'],
    documents: ['Présentation synthétique du projet', 'Budget prévisionnel', 'Calendrier des prochaines étapes'],
    steps: standardSteps,
  },
  {
    id: 'premier-projet', category: 'entrepreneuriat',
    title: 'Passer de l’idée au premier projet',
    description: 'Tester son concept, construire son modèle et avancer aux côtés d’autres jeunes entrepreneurs.',
    format: 'Incubation', location: 'Kinshasa', mode: 'Hybride', audience: 'Jeunes entrepreneurs',
    organization: 'Océan Communication', publishedAt: '2026-10-14', deadline: '2027-02-05',
    reference: 'OMT-ENT-004', href: '/opportunites/premier-projet',
    overview: [
      'Ce programme d’initiation accompagne les premières étapes d’un projet : compréhension du besoin, formulation d’une solution, test auprès des futurs utilisateurs et organisation du travail.',
      'Chaque participant avance sur son propre projet tout en bénéficiant du regard du groupe et de rendez-vous méthodologiques.',
    ],
    benefits: ['Un parcours progressif orienté vers l’action', 'Des outils simples pour tester son idée', 'Une communauté de jeunes porteurs de projets'],
    eligibility: ['Avoir entre 18 et 35 ans', 'Porter une idée ou un projet en démarrage', 'Pouvoir participer aux temps collectifs à Kinshasa ou en ligne'],
    documents: ['Présentation de l’idée en une page', 'Courte biographie du porteur de projet'],
    steps: standardSteps,
  },
  {
    id: 'rencontre-professionnelle', category: 'rencontres',
    title: 'Échanger, rencontrer, avancer',
    description: 'Croiser les expériences et créer des liens avec des professionnels et des porteurs d’initiatives.',
    format: 'Rencontre professionnelle', location: 'Kinshasa', mode: 'Présentiel', audience: 'Étudiants et jeunes actifs',
    organization: 'Océan Communication', publishedAt: '2026-10-12', deadline: '2027-01-22',
    reference: 'OMT-REN-005', href: '/opportunites/rencontre-professionnelle',
    overview: [
      'Cette rencontre crée un espace de conversation directe entre jeunes talents, entrepreneurs et professionnels de différents secteurs. Elle combine échanges en petits groupes et temps de mise en relation.',
      'Les participants sont invités à venir avec une question, un projet ou un objectif professionnel précis afin de tirer le meilleur parti des échanges.',
    ],
    benefits: ['Rencontres thématiques en petits groupes', 'Conseils pour présenter son parcours', 'Mise en relation avec d’autres participants'],
    eligibility: ['Être étudiant, jeune diplômé, entrepreneur ou jeune actif', 'Être disponible à Kinshasa le jour de la rencontre', 'Accepter la charte de participation'],
    documents: ['Formulaire de présentation', 'Profil professionnel ou curriculum vitae facultatif'],
    steps: standardSteps,
  },
  {
    id: 'solutions-demain', category: 'innovation',
    title: 'Imaginer des solutions pour demain',
    description: 'Explorer un besoin concret et transformer une idée utile en solution à expérimenter.',
    format: 'Programme d’innovation', location: 'RDC', mode: 'En équipe', audience: 'Créatifs et porteurs d’idées',
    organization: 'Laboratoire partenaire', publishedAt: '2026-10-10', deadline: '2027-02-26',
    reference: 'OMT-INN-006', href: '/opportunites/solutions-demain',
    overview: [
      'Le programme réunit des profils complémentaires pour explorer des défis liés à la vie quotidienne, à l’éducation ou à l’accès à l’information. Les équipes passent de l’observation à un prototype testable.',
      'La démarche valorise les solutions simples, inclusives et adaptées au contexte local.',
    ],
    benefits: ['Sessions de créativité et de prototypage', 'Accès à des mentors techniques et métier', 'Présentation publique des solutions développées'],
    eligibility: ['Avoir une compétence ou une expérience à partager', 'Être prêt à travailler en équipe', 'Être disponible pendant toute la durée du sprint'],
    documents: ['Présentation du profil', 'Motivation et domaine d’intérêt', 'Lien vers une réalisation facultatif'],
    steps: standardSteps,
  },
  {
    id: 'assistant-programme-jeunesse', category: 'emploi',
    title: 'Assistant·e programme jeunesse',
    description: 'Contribuer à l’organisation d’activités qui rapprochent les jeunes des compétences et des opportunités.',
    format: 'Stage professionnel', location: 'Kinshasa', mode: 'Présentiel', audience: 'Jeunes diplômés',
    organization: 'Organisation partenaire', publishedAt: '2026-10-08', deadline: '2027-01-25',
    reference: 'OMT-EMP-007', href: '/opportunites/assistant-programme-jeunesse',
    overview: ['Le stage permet de participer à la préparation logistique, au suivi des participants et à la documentation d’activités destinées à la jeunesse.', 'La mission convient à un profil rigoureux qui souhaite découvrir la coordination de projets et le travail avec des partenaires.'],
    benefits: ['Immersion dans la coordination de programme', 'Encadrement par une équipe expérimentée', 'Missions progressives et retours réguliers'],
    eligibility: ['Diplôme récent en gestion, sciences sociales ou domaine proche', 'Bonne organisation et aisance relationnelle', 'Disponibilité à temps plein'],
    documents: ['Curriculum vitae', 'Lettre de motivation concise'],
    steps: standardSteps,
  },
  {
    id: 'bourse-competences-numeriques', category: 'financements',
    title: 'Bourse compétences numériques',
    description: 'Accéder à un parcours de spécialisation et financer une certification utile à son projet professionnel.',
    format: 'Bourse de formation', location: 'RDC', mode: 'En ligne', audience: 'Étudiants et jeunes actifs',
    organization: 'Fonds partenaire', publishedAt: '2026-10-06', deadline: '2027-03-04',
    reference: 'OMT-FIN-008', href: '/opportunites/bourse-competences-numeriques',
    overview: ['Cette bourse de présentation soutient un parcours court dans un domaine numérique choisi en fonction du projet professionnel du candidat.', 'Le dossier doit montrer le lien entre la compétence visée et une prochaine étape concrète du parcours.'],
    benefits: ['Prise en charge du parcours retenu', 'Suivi méthodologique pendant la formation', 'Préparation à la valorisation de la certification'],
    eligibility: ['Résider en République démocratique du Congo', 'Présenter un projet professionnel cohérent', 'S’engager à suivre la totalité du parcours'],
    documents: ['Curriculum vitae', 'Projet de formation', 'Justificatif du parcours sélectionné'],
    steps: standardSteps,
  },
  {
    id: 'atelier-ecriture-professionnelle', category: 'formations',
    title: 'Écrire avec clarté dans un contexte professionnel',
    description: 'Structurer ses idées et produire des courriels, notes et présentations plus convaincants.',
    format: 'Formation intensive', location: 'Kinshasa', mode: 'Hybride', audience: 'Étudiants et jeunes actifs',
    organization: 'Océan Communication', publishedAt: '2026-10-04', deadline: '2027-02-20',
    reference: 'OMT-FOR-009', href: '/opportunites/atelier-ecriture-professionnelle',
    overview: ['La formation part de situations professionnelles concrètes pour améliorer la structure, le ton et la précision des écrits.', 'Des exercices guidés permettent de repartir avec des méthodes réutilisables et plusieurs textes retravaillés.'],
    benefits: ['Méthodes de rédaction directement applicables', 'Corrections collectives et individuelles', 'Modèles pour organiser les écrits courants'],
    eligibility: ['Comprendre et écrire le français courant', 'Pouvoir participer aux exercices pratiques', 'Venir avec un exemple de texte à améliorer'],
    documents: ['Présentation courte du besoin', 'Exemple de texte facultatif'],
    steps: standardSteps,
  },
]

export const opportunityById = (id: string) => opportunities.find(opportunity => opportunity.id === id)

export function opportunityCategory(id: OpportunityCategoryId) {
  return opportunityCategories.find(category => category.id === id)!
}

export function formatOpportunityDate(value?: string) {
  if (!value || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) return null
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}
