import { z } from 'zod'
import { isArticleDocument, type ArticleDocument } from '../shared/article-document.js'
export const resources = ['articles', 'videos', 'opportunities', 'trainings', 'events', 'hero'] as const
export const resourceSchema = z.enum(resources)
const text = z.string().trim().min(1).max(500)
const paragraph = z.string().trim().min(1).max(20_000)
const paragraphs = z.array(paragraph).max(100)
export const slugSchema = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}$/)
const asset = z.string().max(2000).refine(value => /^\/images\/[\w./%-]+$/.test(value) || /^https:\/\/[^\s]+$/.test(value), 'URL de média invalide')
const externalUrl = z.url({ protocol: /^https$/ }).max(2000)
const date = z.iso.date()
const timestamp = z.iso.datetime({ offset: true })
const position = z.string().max(100)
const common = { id: slugSchema, title: text }
const category = text
export const contentSchemas = {
  articles: z.strictObject({ ...common, category, excerpt: paragraph, image: asset, imageFamily: z.enum(['news', 'hero']).optional(), imageSrcSet: z.string().max(4000).optional(), imageAlt: text, imagePosition: position, format: text, author: text, publishedAt: z.iso.datetime({ offset: true }).nullable().optional(), href: z.string().regex(/^\/actualites\/[a-zA-Z0-9_-]+$/), contentVersion: z.literal(2), content: z.custom<ArticleDocument>(isArticleDocument, 'Le contenu de l’article est vide ou contient un bloc non pris en charge.') }),
  videos: z.strictObject({ ...common, category, description: paragraph, youtubeId: z.string().regex(/^[\w-]{11}$/).nullable(), thumbnail: asset, thumbnailAlt: text, thumbnailSrcSet: z.string().max(4000).optional(), durationSeconds: z.number().int().positive().max(86400).optional(), publishedAt: date.optional(), channel: text.optional() }),
  opportunities: z.strictObject({ ...common, category, description: paragraph, format: text, location: text, mode: text, audience: paragraph, href: z.string().regex(/^\/opportunites\/[a-zA-Z0-9_-]+$/), organization: text, publishedAt: date, deadline: date.optional(), featured: z.boolean().optional(), reference: text, overview: paragraphs, benefits: z.array(text).max(50), eligibility: z.array(text).max(50), documents: z.array(text).max(50), steps: z.array(z.strictObject({ title: text, description: paragraph })).max(30) }),
  trainings: z.strictObject({ ...common, family: category, icon: z.enum(['microphone', 'users', 'briefcase', 'pen', 'lightbulb', 'graduation']), tagline: paragraph, description: paragraph, longDescription: paragraph, objectives: z.array(text).max(50), audience: paragraph, approach: paragraph }),
  events: z.strictObject({ ...common, category, description: paragraph, image: z.strictObject({ src: asset, srcSet: z.string().max(4000).optional(), alt: text, position: position.optional() }), schedule: z.strictObject({ kind: z.enum(['date', 'datetime']), start: z.string(), end: z.string().optional(), timeZone: text }).superRefine((value, context) => {
    const validator = value.kind === 'date' ? date : timestamp
    if (!validator.safeParse(value.start).success || (value.end && !validator.safeParse(value.end).success)) context.addIssue({ code: 'custom', message: 'Dates invalides' })
    if (value.end && Date.parse(value.end) < Date.parse(value.start)) context.addIssue({ code: 'custom', message: 'Fin antérieure au début' })
    try { new Intl.DateTimeFormat('fr', { timeZone: value.timeZone }).format() } catch { context.addIssue({ code: 'custom', message: 'Fuseau horaire invalide' }) }
  }).optional(), location: text.optional(), online: z.boolean().optional(), organizer: text.optional(), registrationUrl: externalUrl.optional(), featured: z.boolean().optional(), overview: paragraphs.optional(), benefits: z.array(text).max(50).optional() }),
  hero: z.strictObject({ ...common, category, tab: text, introduction: paragraph, image: asset, imageSrcSet: z.string().max(4000).optional(), alt: text, position }),
}
export const listQuerySchema = z.strictObject({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(6),
  category: z.string().trim().max(160).optional(),
  q: z.string().trim().max(160).optional(),
  exclude: slugSchema.optional(),
})
export const adminListQuerySchema = listQuerySchema.extend({
  status: z.enum(['all', 'published', 'draft']).default('all'),
})
export const writeSchema = z.strictObject({
  data: z.record(z.string(), z.unknown()),
  published: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(1_000_000).default(0),
  featured: z.boolean().default(false),
})
export const categorySchema = z.strictObject({
  id: text, label: text, description: z.string().max(1000).optional(),
  icon: z.enum(['briefcase', 'graduation', 'rocket', 'landmark', 'users', 'lightbulb']).optional(),
  sortOrder: z.number().int().min(0).default(0),
})
export const socialLinksSchema = z.strictObject({ Facebook: externalUrl.nullable(), YouTube: externalUrl.nullable(), TikTok: externalUrl.nullable() })
const contactEmail = z.email().trim().toLowerCase().max(254).nullable().optional()
const internationalPhone = z.string().trim().min(1).max(50)
  .regex(/^\+?[\d\s().-]+$/, 'Saisissez un numéro de téléphone avec son indicatif international.')
  .refine(value => /^[1-9]\d{7,14}$/.test(value.replace(/[^\d]/g, '')), 'Utilisez 8 à 15 chiffres, avec l’indicatif international.')
export const contactSettingsSchema = z.strictObject({
  contact: z.strictObject({ phone: internationalPhone, whatsappNumber: internationalPhone, address: paragraph, email: contactEmail }),
  socialLinks: socialLinksSchema,
}).transform(({ contact, socialLinks }) => ({
  contact: { phone: contact.phone, phoneHref: 'tel:+' + contact.phone.replace(/[^\d]/g, ''), whatsappHref: 'https://wa.me/' + contact.whatsappNumber.replace(/[^\d]/g, ''), address: contact.address, email: contact.email ?? null },
  socialLinks,
}))
export const siteSchema = z.strictObject({
  navigation: z.array(z.strictObject({ label: text, href: z.enum(['/', '#actualites', '#ocean-tv', '#opportunites', '#formations', '#evenements']), available: z.boolean() })).min(1).max(6),
  contact: z.strictObject({ phone: text, phoneHref: z.string().regex(/^tel:\+[0-9]+$/), whatsappHref: z.string().regex(/^https:\/\/wa\.me\/[0-9]+$/), address: paragraph, email: contactEmail }),
  socialLinks: socialLinksSchema,
  credits: z.array(z.strictObject({ name: text, id: z.string().regex(/^\d+$/) })).max(100),
  trainingImage: z.strictObject({
    src: asset, srcSet: z.string().max(4000).optional(), alt: text,
    homeEyebrow: text, homeCaption: text, pageEyebrow: text, pageCaption: text,
  }),
})
export const sessionSchema = z.strictObject({ id: slugSchema, title: text, domainIds: z.array(slugSchema).min(1).max(20), status: z.enum(['draft', 'scheduled', 'cancelled']), startsAt: timestamp, endsAt: timestamp.optional(), timezone: text, format: z.enum(['Présentiel', 'En ligne', 'Hybride']), location: text.optional(), registrationUrl: externalUrl.optional() }).refine(value => !value.endsAt || Date.parse(value.endsAt) >= Date.parse(value.startsAt), 'Dates inversées')

