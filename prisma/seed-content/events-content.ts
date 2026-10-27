import type { EventSchedule } from '../../src/lib/event-dates'

export const eventCategories = [
  { id: 'conferences', label: 'Conférences' },
  { id: 'ateliers', label: 'Ateliers' },
  { id: 'seminaires', label: 'Séminaires' },
  { id: 'rencontres', label: 'Rencontres professionnelles' },
  { id: 'entrepreneuriat', label: 'Entrepreneuriat' },
  { id: 'institutionnels', label: 'Événements institutionnels' },
] as const

export type EventCategoryId = typeof eventCategories[number]['id']

export interface MediaEvent {
  id: string
  category: EventCategoryId
  title: string
  description: string
  image: { src: string; alt: string; position?: string }
  schedule?: EventSchedule
  location?: string
  online?: boolean
  organizer?: string
  registrationUrl?: string
  featured?: boolean
}

// Presentation content approved by the user. Dates are fixed editorial fixtures,
// never shifted automatically to imply a permanently upcoming real programme.
// Replace these entries with validated events before opening registrations.
export const mediaEvents: readonly MediaEvent[] = [
  {
    id: 'jeunesse-et-possibles', category: 'conferences', featured: true,
    title: 'Jeunesse & avenir : ouvrir le champ des possibles.',
    description: 'Une journée de conversations, d’idées et de partage pour imaginer les parcours de demain et faire grandir ses ambitions.',
    image: { src: 'events-conference', alt: 'Une intervenante en tailleur lavande prend la parole, un microphone à la main.', position: '35% 40%' },
    schedule: { kind: 'datetime', start: '2026-11-14T09:00:00+01:00', end: '2026-11-14T17:00:00+01:00', timeZone: 'Africa/Kinshasa' },
    location: 'Kinshasa',
  },
  {
    id: 'prendre-la-parole', category: 'ateliers',
    title: 'Prendre la parole. Faire entendre ses idées.',
    description: 'Un atelier pratique pour gagner en assurance et donner de la force à ses messages.',
    image: { src: 'events-workshop', alt: 'Un jeune participant lève la main pendant une présentation en salle.', position: '50% 40%' },
    schedule: { kind: 'datetime', start: '2026-11-21T10:00:00+01:00', end: '2026-11-21T13:00:00+01:00', timeZone: 'Africa/Kinshasa' },
    location: 'Kinshasa',
  },
  {
    id: 'connexions-professionnelles', category: 'rencontres',
    title: 'De nouvelles rencontres, de nouvelles perspectives.',
    description: 'Croiser les expériences, échanger et tisser des liens autour de projets communs.',
    image: { src: 'events-networking', alt: 'Des professionnels portant des badges échangent debout pendant une rencontre.', position: '30% 40%' },
    schedule: { kind: 'datetime', start: '2026-11-28T15:00:00+01:00', end: '2026-11-28T18:00:00+01:00', timeZone: 'Africa/Kinshasa' },
    location: 'Kinshasa',
  },
  {
    id: 'idee-au-projet', category: 'entrepreneuriat',
    title: 'De l’idée au projet : passer à l’action.',
    description: 'Deux jours pour questionner son idée, structurer son projet et identifier ses premiers leviers.',
    image: { src: 'events-enterprise', alt: 'Des participantes échangent autour d’une table équipée d’ordinateurs, en noir et blanc.', position: '50% 45%' },
    schedule: { kind: 'date', start: '2026-10-09', end: '2026-10-10', timeZone: 'Africa/Kinshasa' },
    location: 'Kinshasa',
  },
  {
    id: 'leadership-collectif', category: 'seminaires',
    title: 'Le leadership se construit ensemble.',
    description: 'Un temps d’échange sur la confiance, l’initiative et la dynamique de groupe.',
    image: { src: 'events-seminar', alt: 'Des participants écoutent une conférence dans une salle.', position: '60% 45%' },
    schedule: { kind: 'datetime', start: '2026-10-03T14:00:00+01:00', end: '2026-10-03T16:00:00+01:00', timeZone: 'Africa/Kinshasa' },
    online: true,
  },
  {
    id: 'dialogue-jeunesse', category: 'institutionnels',
    title: 'Faire dialoguer la jeunesse et les acteurs du changement.',
    description: 'Un rendez-vous pour rapprocher les initiatives, les institutions et les aspirations des jeunes.',
    image: { src: 'events-dialogue', alt: 'Un intervenant au pupitre s’adresse aux participants réunis autour d’une table.', position: '50% 60%' },
  },
]

export const fullAgendaHref = '/evenements'
