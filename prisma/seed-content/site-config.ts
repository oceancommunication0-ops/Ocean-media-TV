export const navigation = [
  { label: 'Accueil', href: '/', available: true },
  { label: 'Actualités', href: '#actualites', available: true },
  { label: 'Océan TV', href: '#ocean-tv', available: true },
  { label: 'Opportunités', href: '#opportunites', available: true },
  { label: 'Formations', href: '#formations', available: true },
  { label: 'Événements', href: '#evenements', available: true },
] as const

export type NavigationItem = (typeof navigation)[number]
export type SocialNetwork = 'Facebook' | 'YouTube' | 'TikTok'

// Le document de présentation ne renseigne pas encore les profils officiels.
export const socialLinks: Record<SocialNetwork, string | null> = {
  Facebook: null,
  YouTube: null,
  TikTok: null,
}

export const contact = {
  phone: '+243 97 248 60 33',
  phoneHref: 'tel:+243972486033',
  whatsappHref: 'https://wa.me/243972486033',
  address: 'Route N1, référence : arrêt Libulu',
}
