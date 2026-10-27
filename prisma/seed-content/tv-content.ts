export const videoCategories = ['Reportages', 'Interviews', 'Émissions', 'Conférences et débats', 'Formations', 'Portraits inspirants'] as const
export type VideoCategory = (typeof videoCategories)[number]

export interface VideoItem {
  id: string
  youtubeId: string | null
  category: VideoCategory
  title: string
  description: string
  thumbnail: string
  thumbnailAlt: string
  thumbnailSrcSet?: string
  durationSeconds?: number
  publishedAt?: string
  channel?: string
}

// Sélection éditoriale indépendante de l’affichage. Les futures données YouTube
// pourront remplacer cette liste sans modifier les cartes ni le lecteur.
export const videoItems: VideoItem[] = [
  { id: 'aBU7JsDsF0Y', youtubeId: 'aBU7JsDsF0Y', category: 'Émissions', title: 'Fusion Tesla et SpaceX : Elon Musk veut créer un monstre à 3 500 milliards', description: 'Un décryptage des ambitions industrielles d’Elon Musk, proposé par RTL. Notre sélection pour regarder l’actualité sous un autre angle.', channel: 'RTL', thumbnail: '/images/tv-aBU7JsDsF0Y.webp', thumbnailAlt: 'Miniature RTL du sujet sur Tesla, SpaceX et Elon Musk.', thumbnailSrcSet: '/images/tv-aBU7JsDsF0Y-480.webp 480w, /images/tv-aBU7JsDsF0Y-960.webp 960w, /images/tv-aBU7JsDsF0Y.webp 1280w' },
  { id: 'C6iXeFHqRHg', youtubeId: 'C6iXeFHqRHg', category: 'Reportages', title: 'Why Elon Musk wants to merge Tesla and SpaceX | DW News', description: 'Le regard de DW News sur les projets de rapprochement entre Tesla et SpaceX.', channel: 'DW News', thumbnail: '/images/tv-C6iXeFHqRHg.webp', thumbnailAlt: 'Miniature DW News sur Tesla et SpaceX.' },
  { id: '8cZfOpKIKZs', youtubeId: '8cZfOpKIKZs', category: 'Reportages', title: 'My First House At 18 (Tour Of My 260M House)', description: 'Une visite en images proposée par Ademola Joshua.', channel: 'Ademola Joshua', thumbnail: '/images/tv-8cZfOpKIKZs.webp', thumbnailAlt: 'Miniature de la visite de maison d’Ademola Joshua.' },
  { id: 'JwN6ZCg-dZ4', youtubeId: 'JwN6ZCg-dZ4', category: 'Portraits inspirants', title: 'I Recorded Myself Speaking English Every Day for 700 Days', description: 'João Sales raconte son expérience de pratique quotidienne de l’anglais.', channel: 'João Sales', thumbnail: '/images/tv-JwN6ZCg-dZ4.webp', thumbnailAlt: 'Miniature de João Sales sur sa pratique de l’anglais.' },
  { id: 'lgewV5cuH9U', youtubeId: 'lgewV5cuH9U', category: 'Formations', title: '50 English Phrasal Verbs', description: 'Une séance d’apprentissage de l’anglais avec Orshi English.', channel: 'Orshi English', thumbnail: '/images/tv-lgewV5cuH9U.webp', thumbnailAlt: 'Miniature du cours d’anglais d’Orshi English.' },
  { id: 'vFgWXF3iHlo', youtubeId: 'vFgWXF3iHlo', category: 'Reportages', title: 'French Authorities Brace for Weekend Protests', description: 'Un reportage de Bloomberg Television, dans notre sélection vidéo.', channel: 'Bloomberg Television', thumbnail: '/images/tv-vFgWXF3iHlo.webp', thumbnailAlt: 'Miniature du reportage de Bloomberg Television sur les manifestations en France.' },
  { id: 'Oqndd84ydYw', youtubeId: 'Oqndd84ydYw', category: 'Interviews', title: 'Reporter Confronts Vance Over Whether Musk Should Face Probe for Ukraine Slowdown', description: 'Une séquence de questions et réponses proposée par le New York Post.', channel: 'New York Post', thumbnail: '/images/tv-Oqndd84ydYw.webp', thumbnailAlt: 'Miniature de l’échange avec Vance publié par le New York Post.' },
  { id: '5vr7WdYF3uw', youtubeId: '5vr7WdYF3uw', category: 'Émissions', title: "Trump's campaign blitz heads south as backlash grows over Ramaswamy ad, economy", description: 'Un point d’actualité politique et économique proposé par CBS Texas.', channel: 'CBS Texas', thumbnail: '/images/tv-5vr7WdYF3uw.webp', thumbnailAlt: 'Miniature du sujet politique et économique de CBS Texas.' },
]

export function youtubeEmbedUrl(id: string | null) {
  return id && /^[A-Za-z0-9_-]{11}$/.test(id)
    ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`
    : null
}

export function formatVideoDuration(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) return null
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remainder = String(total % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`
}
