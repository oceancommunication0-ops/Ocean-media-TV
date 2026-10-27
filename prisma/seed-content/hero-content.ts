export const heroStories = [
  {
    id: 'informer',
    tab: 'S’informer',
    category: 'PAROLES & INITIATIVES',
    title: 'Faire entendre les voix de demain.',
    introduction: 'Des portraits et des initiatives qui donnent toute leur place aux voix de la jeunesse.',
    image: '/images/hero-voices.webp',
    alt: 'Une jeune créatrice avec son appareil photo sur une terrasse urbaine — illustration éditoriale.',
    position: '54% 42%',
  },
  {
    id: 'former',
    tab: 'Se former',
    category: 'COMPÉTENCES & AVENIR',
    title: 'Les compétences ouvrent des portes.',
    introduction: 'Des savoirs concrets pour développer ses compétences et élargir ses perspectives.',
    image: '/images/hero-skills.webp',
    alt: 'De jeunes adultes échangent autour d’un ordinateur dans un espace de travail — illustration éditoriale.',
    position: '50% 45%',
  },
  {
    id: 'inspirer',
    tab: 'S’inspirer',
    category: 'IDÉES & ENTREPRENEURIAT',
    title: 'Des idées qui deviennent possibles.',
    introduction: 'Des idées, des parcours et des opportunités pour encourager le passage à l’action.',
    image: '/images/hero-voices.webp',
    alt: 'Une jeune créatrice tournée vers de nouvelles perspectives — illustration éditoriale.',
    position: '65% 48%',
  },
] as const

export type HeroStory = (typeof heroStories)[number]
