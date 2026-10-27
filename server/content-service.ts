import { prisma } from './db.js'
import { Prisma } from './generated/prisma/client.js'
import { contentSchemas, type resources } from './validation.js'
import type { Resource } from '../shared/content.js'
import { articleText, type ArticleDocument } from '../shared/article-document.js'
export function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').replace(/\s+/g, ' ').trim() }
export function prepareContent(resource: Resource, input: unknown) {
  const data = contentSchemas[resource].parse(input) as Record<string, unknown> & { id: string; title: string }
  if (resource === 'articles') data.href = '/actualites/' + data.id
  if (resource === 'opportunities') data.href = '/opportunites/' + data.id
  const summary = { ...data }
  for (const key of ['content', 'overview', 'benefits', 'eligibility', 'documents', 'steps', 'longDescription', 'objectives', 'approach', 'audience']) {
    if (key === 'audience' && resource === 'opportunities') continue
    delete summary[key]
  }
  const categoryKey = resource === 'hero' ? undefined : String(data.family ?? data.category)
  return {
    slug: data.id, title: data.title,
    categoryId: categoryKey ? resource + ':' + categoryKey : null,
    summary: summary as Prisma.InputJsonValue,
    data: data as Prisma.InputJsonValue,
    searchText: normalize(['title', 'excerpt', 'description', 'category', 'family', 'format', 'organization', 'location', 'audience', 'channel', 'tagline'].map(key => typeof data[key] === 'string' ? data[key] : '').join(' ') + (resource === 'articles' ? ' ' + articleText(data.content as ArticleDocument) : '')),
    publishedAt: typeof data.publishedAt === 'string' ? new Date(data.publishedAt) : new Date(),
  }
}
export interface ListOptions { page: number; limit: number; category?: string; q?: string; exclude?: string; admin?: boolean; status?: 'all' | 'published' | 'draft' }
export async function listContent(resource: Resource, options: ListOptions) {
  const clauses = [Prisma.sql`"resource" = ${resource}::"Resource"`]
  if (!options.admin) clauses.push(Prisma.sql`"published" = true AND "publishedAt" <= NOW()`)
  if (options.admin && options.status === 'published') clauses.push(Prisma.sql`"published" = true`)
  if (options.admin && options.status === 'draft') clauses.push(Prisma.sql`"published" = false`)
  if (options.category) clauses.push(Prisma.sql`"categoryId" = ${resource + ':' + options.category}`)
  if (options.exclude) clauses.push(Prisma.sql`"slug" <> ${options.exclude}`)
  for (const word of normalize(options.q ?? '').split(' ').filter(Boolean)) {
    const pattern = '%' + word.replace(/[\\%_]/g, '\\$&') + '%'
    clauses.push(Prisma.sql`"searchText" LIKE ${pattern}`)
  }
  const summary = resource === 'hero' ? Prisma.sql`"summary"` : Prisma.sql`"summary" || jsonb_build_object('categoryLabel', (SELECT "label" FROM "Category" WHERE "id" = matches."categoryId"))`
  const projection = options.admin
    ? Prisma.sql`jsonb_build_object('slug', "slug", 'summary', ${summary}, 'published', "published", 'sortOrder', "sortOrder", 'featured', "featured", 'updatedAt', "updatedAt")`
    : summary
  // One round trip and one PostgreSQL snapshot for both count and page.
  // Values are bound parameters; column names and ordering are fixed.
  const [result] = await prisma.$queryRaw<{ total: number; items: Prisma.JsonValue[] }[]>(Prisma.sql`
    WITH matches AS NOT MATERIALIZED (
      SELECT * FROM "ContentEntry" WHERE ${Prisma.join(clauses, ' AND ')}
    )
    SELECT (SELECT COUNT(*)::int FROM matches) AS total,
      COALESCE((SELECT jsonb_agg(page.item) FROM (
        SELECT ${projection} AS item FROM matches
        ORDER BY CASE WHEN "featured" THEN 0 ELSE 1 END, "sortOrder" ASC, "publishedAt" DESC, "id" ASC
        LIMIT ${options.limit} OFFSET ${(options.page - 1) * options.limit}
      ) AS page), '[]'::jsonb) AS items
  `)
  return { items: result.items, pagination: {
    page: options.page, limit: options.limit, total: result.total,
    totalPages: Math.ceil(result.total / options.limit),
  } }
}
export async function getContent(resource: Resource, slug: string) {
  const entry = await prisma.contentEntry.findUnique({ where: { resource_slug: { resource, slug } }, select: { data: true, published: true, publishedAt: true, category: { select: { label: true } } } })
  if (!entry?.published || entry.publishedAt > new Date()) return null
  return resource === 'hero' ? entry.data : { ...(entry.data as object), categoryLabel: entry.category?.label }
}
export async function getSite() {
  const [site] = await prisma.$queryRaw<{ data: Prisma.JsonValue; categories: { resource: Resource; key: string; label: string; metadata: Record<string, unknown> }[] }[]>(Prisma.sql`
    SELECT settings."data",
      COALESCE((SELECT jsonb_agg(to_jsonb(category) ORDER BY category."sortOrder", category."key") FROM "Category" category), '[]'::jsonb) AS categories
    FROM "SiteSettings" settings WHERE settings."id" = 'main'
  `)
  if (!site) return null
  const grouped = Object.fromEntries((['articles', 'videos', 'opportunities', 'trainings', 'events', 'hero'] as typeof resources[number][]).map(resource => [resource, site.categories.filter(category => category.resource === resource).map(category => ({ id: category.key, label: category.label, ...category.metadata }))]))
  return { ...(site.data as object), categories: grouped }
}
export const HOME_LIMITS = { articles: 4, videos: 4, opportunities: 3, trainings: 6, events: 3, hero: 3 } as const
export async function getHome() {
  const limits = Prisma.join(Object.entries(HOME_LIMITS).map(([resource, take]) => Prisma.sql`(${resource}::"Resource", ${take}::int)`))
  // A single bounded SQL query for the entire homepage; no article body is loaded.
  const rows = await prisma.$queryRaw<{ resource: Resource; take: number; total: number; items: Prisma.JsonValue[] }[]>(Prisma.sql`
    SELECT limits.resource, limits.take,
      (SELECT COUNT(*)::int FROM "ContentEntry" e WHERE e."resource" = limits.resource AND e."published" AND e."publishedAt" <= NOW()) AS total,
      COALESCE((SELECT jsonb_agg(page.summary) FROM (
        SELECT CASE WHEN e."resource" = 'hero' THEN e."summary" ELSE e."summary" || jsonb_build_object('categoryLabel', (SELECT "label" FROM "Category" WHERE "id" = e."categoryId")) END AS summary FROM "ContentEntry" e
        WHERE e."resource" = limits.resource AND e."published" AND e."publishedAt" <= NOW()
        ORDER BY CASE WHEN e."featured" THEN 0 ELSE 1 END, e."sortOrder" ASC, e."publishedAt" DESC, e."id" ASC LIMIT limits.take
      ) AS page), '[]'::jsonb) AS items
    FROM (VALUES ${limits}) AS limits(resource, take)
  `)
  return Object.fromEntries(rows.map(row => [row.resource, { items: row.items, pagination: { page: 1, limit: row.take, total: row.total, totalPages: Math.ceil(row.total / row.take) } }]))
}

