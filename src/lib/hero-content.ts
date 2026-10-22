export const heroStories = [
  {
    id: 'informer',
    tab: 'S’informer',
    category: 'PAROLES & INITIATIVES',
    title: 'Faire entendre les voix de demain.',
    introduction: 'La jeunesse a des choses à dire. Et des lignes à faire bouger.',
    image: '/images/hero-voices.webp',
    alt: 'Une jeune créatrice avec son appareil photo sur une terrasse urbaine — illustration éditoriale.',
    position: '54% 42%',
    dialogPosition: '54% 0%',
    paragraphs: [
      'Derrière chaque initiative, il y a une idée, un parcours et une voix qui mérite d’être entendue. Océan Média TV veut mettre en lumière les jeunes qui s’engagent et les projets qui font avancer leur communauté.',
      'À travers des portraits, des interviews et des reportages, notre ambition est de raconter ces parcours avec clarté, de partager leurs enseignements et de rapprocher les jeunes des opportunités qui les concernent.',
    ],
    tags: ['Portraits', 'Interviews', 'Reportages'],
  },
  {
    id: 'former',
    tab: 'Se former',
    category: 'COMPÉTENCES & AVENIR',
    title: 'Les compétences ouvrent des portes.',
    introduction: 'Apprendre aujourd’hui. Se donner de nouvelles perspectives demain.',
    image: '/images/hero-skills.webp',
    alt: 'De jeunes adultes échangent autour d’un ordinateur dans un espace de travail — illustration éditoriale.',
    position: '50% 45%',
    dialogPosition: '50% 20%',
    paragraphs: [
      'Trouver sa voie commence souvent par une information utile, un nouveau savoir ou la bonne rencontre. Océan Média TV souhaite rendre les ressources de formation et les opportunités professionnelles plus accessibles à la jeunesse congolaise.',
      'Prise de parole, leadership, rédaction, numérique : nous nous intéressons aux compétences qui aident à gagner en confiance, à construire son parcours et à transformer ses ambitions en actions.',
    ],
    tags: ['Formation', 'Emploi', 'Leadership'],
  },
  {
    id: 'inspirer',
    tab: 'S’inspirer',
    category: 'IDÉES & ENTREPRENEURIAT',
    title: 'Des idées qui deviennent possibles.',
    introduction: 'Valoriser l’audace. Partager les clés pour passer à l’action.',
    image: '/images/hero-voices.webp',
    alt: 'Une jeune créatrice tournée vers de nouvelles perspectives — illustration éditoriale.',
    position: '65% 48%',
    dialogPosition: '65% 0%',
    paragraphs: [
      'La jeunesse congolaise porte des idées, des talents et une envie d’entreprendre. Notre rôle est de donner de la visibilité à cette énergie et de faire circuler les informations qui peuvent l’accompagner.',
      'Entrepreneuriat, innovation, développement personnel : Océan Média TV veut créer des passerelles entre les jeunes, les institutions, les entreprises et les organisations qui proposent des opportunités utiles.',
    ],
    tags: ['Entrepreneuriat', 'Innovation', 'Opportunités'],
  },
] as const

export type HeroStory = (typeof heroStories)[number]
