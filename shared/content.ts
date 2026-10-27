export type Resource = 'articles' | 'videos' | 'opportunities' | 'trainings' | 'events' | 'hero'
export interface Category {
  id: string; label: string; description?: string
  icon?: 'briefcase' | 'graduation' | 'rocket' | 'landmark' | 'users' | 'lightbulb'
}
import type { ArticleDocument } from './article-document.js'
export interface NewsArticle {
  id: string; category: string; categoryLabel?: string; title: string; excerpt: string
  image: string; imageFamily?: 'news' | 'hero'; imageSrcSet?: string
  imageAlt: string; imagePosition: string; format: string; author: string
  publishedAt?: string | null; href: string
  content: ArticleDocument; contentVersion: 2
}
export interface VideoItem {
  id: string; youtubeId: string | null; category: string; categoryLabel?: string; title: string; description: string
  thumbnail: string; thumbnailAlt: string; thumbnailSrcSet?: string
  durationSeconds?: number; publishedAt?: string; channel?: string
}
export interface Opportunity {
  id: string; category: string; categoryLabel?: string; title: string; description: string; format: string
  location: string; mode: string; audience: string; href: string; organization: string
  publishedAt: string; deadline?: string; featured?: boolean; reference: string
  overview: string[]; benefits: string[]; eligibility: string[]; documents: string[]
  steps: { title: string; description: string }[]
}
export interface TrainingDomain {
  id: string; title: string; icon: 'microphone' | 'users' | 'briefcase' | 'pen' | 'lightbulb' | 'graduation'
  family: string; categoryLabel?: string; tagline: string; description: string; longDescription: string
  objectives: string[]; audience: string; approach: string
}
export interface TrainingSession {
  id: string; title: string; domainIds: string[]; status: 'draft' | 'scheduled' | 'cancelled'
  startsAt: string; endsAt?: string; timezone: string
  format: 'Présentiel' | 'En ligne' | 'Hybride'; location?: string; registrationUrl?: string
}
export interface MediaEvent {
  id: string; category: string; categoryLabel?: string; title: string; description: string
  image: { src: string; alt: string; position?: string; srcSet?: string }
  schedule?: { kind: 'date' | 'datetime'; start: string; end?: string; timeZone: string }
  location?: string; online?: boolean; organizer?: string; registrationUrl?: string; featured?: boolean
  overview?: string[]; benefits?: string[]
}
export interface HeroStory {
  id: string; tab: string; category: string; title: string; introduction: string
  image: string; alt: string; position: string; imageSrcSet?: string
}
export interface ResourceMap {
  articles: NewsArticle; videos: VideoItem; opportunities: Opportunity
  trainings: TrainingDomain; events: MediaEvent; hero: HeroStory
}
export type ArticleSummary = Omit<NewsArticle, 'content'>
export type OpportunitySummary = Omit<Opportunity, 'overview' | 'benefits' | 'eligibility' | 'documents' | 'steps'>
export type TrainingSummary = Omit<TrainingDomain, 'longDescription' | 'objectives' | 'audience' | 'approach'>
export interface SummaryMap {
  articles: ArticleSummary; videos: VideoItem; opportunities: OpportunitySummary
  trainings: TrainingSummary; events: MediaEvent; hero: HeroStory
}
export interface PaginationMeta { page: number; limit: number; total: number; totalPages: number }
export interface PageResult<T> { items: T[]; pagination: PaginationMeta }
export interface NavigationItem { label: string; href: string; available: boolean }
export type SocialNetwork = 'Facebook' | 'YouTube' | 'TikTok'
export interface ContactInformation {
  phone: string; phoneHref: string; whatsappHref: string; address: string; email?: string | null
}
export interface ContactSettings {
  contact: ContactInformation
  socialLinks: Record<SocialNetwork, string | null>
}
export interface ContactSettingsInput {
  contact: { phone: string; whatsappNumber: string; address: string; email: string | null }
  socialLinks: Record<SocialNetwork, string | null>
}
export interface SiteData {
  navigation: NavigationItem[]
  contact: ContactInformation
  socialLinks: Record<SocialNetwork, string | null>
  credits: { name: string; id: string }[]
  categories: Record<Resource, Category[]>
  trainingImage: {
    src: string; srcSet?: string; alt: string
    homeEyebrow: string; homeCaption: string
    pageEyebrow: string; pageCaption: string
  }
}
export type HomeData = { [K in Resource]: PageResult<SummaryMap[K]> }

