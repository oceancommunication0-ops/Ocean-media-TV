import express, { type ErrorRequestHandler, type RequestHandler } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { rateLimit } from 'express-rate-limit'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { ZodError, z } from 'zod'
import { prisma } from './db.js'
import { config } from './config.js'
import { mediaUploadParser, serveImage, uploadImage } from './media.js'
import { Prisma } from './generated/prisma/client.js'
import { getContent, getHome, getSite, listContent, normalize, prepareContent } from './content-service.js'
import { adminListQuerySchema, categorySchema, contactSettingsSchema, listQuerySchema, resourceSchema, sessionSchema, siteSchema, slugSchema, writeSchema } from './validation.js'
import {
  adminCreateSchema, adminUpdateSchema, authenticateAdmin, clearSessionCookie, consumeInvalidLoginPassword,
  createAdminSession, getAdminAuth, hashAdminPassword, hashCsrf, loginSchema, newCsrfToken,
  normalizeAdminIdentifier, publicAdminUser, requireAdminCsrf,
  verifyAdminPassword,
} from './admin-auth.js'

export const app = express()
app.disable('x-powered-by')
app.set('query parser', 'simple')
if (config.TRUST_PROXY === '1') app.set('trust proxy', 1)
app.use((req, res, next) => {
  const requestId = randomUUID()
  res.setHeader('X-Request-Id', requestId)
  res.locals.requestId = requestId
  next()
})
app.use(helmet({ contentSecurityPolicy: { directives: {
  defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'], frameSrc: ['https://www.youtube-nocookie.com'],
  connectSrc: ["'self'", ...config.CORS_ORIGIN.split(',').map(value => value.trim())],
  upgradeInsecureRequests: config.NODE_ENV === 'production' ? [] : null,
} } }))
const origins = config.CORS_ORIGIN.split(',').map(origin => origin.trim())
app.use(cors({ origin: (origin, callback) => callback(null, !origin || origins.includes(origin)), credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'] }))
app.use(compression())
app.use(express.json({ limit: '1mb', type: 'application/json' }))
app.use('/api', rateLimit({ windowMs: 60_000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Trop de requêtes. Réessayez dans un instant.' } } }))
const noCache: RequestHandler = (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next() }
function notFound(res: express.Response) { return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ce contenu est introuvable.' } }) }
const adminLimiter = rateLimit({ windowMs: 60_000, limit: 40, standardHeaders: 'draft-8', legacyHeaders: false })
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Trop de tentatives. Réessayez dans quelques minutes.' } } })

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.get('/api/ready', noCache, async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ status: 'ready' })
})
app.get('/api/site', noCache, async (_req, res) => {
  const site = await getSite()
  if (!site) { res.status(503).json({ error: { code: 'NOT_CONFIGURED', message: 'Le site est en cours de configuration.' } }); return }
  res.json(site)
})
app.get('/api/home', async (_req, res) => { res.json(await getHome()) })
app.get('/api/training-sessions', async (req, res) => {
  const options = listQuerySchema.parse(req.query)
  const where = { published: true, data: { path: ['status'], equals: 'scheduled' } }
  const [total, items] = await prisma.$transaction([
    prisma.trainingSession.count({ where }),
    prisma.trainingSession.findMany({ where, take: options.limit, skip: (options.page - 1) * options.limit, orderBy: [{ startsAt: 'asc' }, { id: 'asc' }], select: { data: true } }),
  ])
  res.json({ items: items.map(item => item.data), pagination: { page: options.page, limit: options.limit, total, totalPages: Math.ceil(total / options.limit) } })
})

app.post('/api/admin/auth/login', noCache, loginLimiter, async (req, res) => {
  const input = loginSchema.parse(req.body)
  const identifier = normalizeAdminIdentifier(input.identifier)
  const user = await prisma.adminUser.findFirst({ where: { OR: [{ username: identifier }, { email: identifier }] } })
  if (!user) { await consumeInvalidLoginPassword(input.password); res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifiant ou mot de passe incorrect.' } }); return }
  const locked = Boolean(user.lockedUntil && user.lockedUntil > new Date())
  const valid = await verifyAdminPassword(input.password, user.passwordHash)
  if (!valid || !user.active || locked) {
    if (!locked && user.active) {
      const attempts = user.lockedUntil && user.lockedUntil <= new Date() ? 1 : user.failedLoginAttempts + 1
      await prisma.adminUser.update({ where: { id: user.id }, data: { failedLoginAttempts: attempts, lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60_000) : null } })
    }
    res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifiant ou mot de passe incorrect.' } }); return
  }
  const authenticated = await prisma.adminUser.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } })
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lte: new Date() } } })
  const csrfToken = await createAdminSession(req, res, user.id)
  await prisma.auditLog.create({ data: { action: 'admin-login', resource: 'administrators', target: user.username } })
  res.json({ user: publicAdminUser(authenticated), csrfToken })
})

const admin = express.Router()
admin.use(adminLimiter, authenticateAdmin, requireAdminCsrf)
admin.post('/media', mediaUploadParser, uploadImage)
admin.get('/auth/me', async (_req, res) => {
  const auth = getAdminAuth(res)
  if (!auth?.user || !auth.sessionId) { res.json({ user: null, csrfToken: null, serviceAccount: true }); return }
  const csrfToken = newCsrfToken()
  await prisma.adminSession.update({ where: { id: auth.sessionId }, data: { csrfHash: hashCsrf(csrfToken), lastSeenAt: new Date() } })
  res.json({ user: publicAdminUser(auth.user), csrfToken })
})
admin.post('/auth/logout', async (_req, res) => {
  const auth = getAdminAuth(res)
  if (auth?.sessionId) await prisma.adminSession.delete({ where: { id: auth.sessionId } }).catch(() => undefined)
  clearSessionCookie(res)
  res.status(204).end()
})
admin.get('/users', async (_req, res) => {
  const users = await prisma.adminUser.findMany({ orderBy: [{ active: 'desc' }, { createdAt: 'asc' }], select: { id: true, username: true, email: true, displayName: true, active: true, lastLoginAt: true, createdAt: true, updatedAt: true } })
  res.json({ items: users })
})
admin.post('/users', async (req, res) => {
  const input = adminCreateSchema.parse(req.body)
  const passwordHash = await hashAdminPassword(input.password)
  const user = await prisma.$transaction(async tx => {
    const created = await tx.adminUser.create({ data: { username: input.username, email: input.email, displayName: input.displayName, passwordHash } })
    await tx.auditLog.create({ data: { action: 'admin-create', resource: 'administrators', target: created.username } })
    return created
  })
  res.status(201).json({ user: publicAdminUser(user) })
})
admin.patch('/users/:id', async (req, res) => {
  const id = z.string().cuid().parse(req.params.id)
  const input = adminUpdateSchema.parse(req.body)
  const auth = getAdminAuth(res)
  const target = await prisma.adminUser.findUnique({ where: { id } })
  if (!target) { notFound(res); return }
  if (auth?.user?.id === id && input.active === false) { res.status(400).json({ error: { code: 'SELF_PROTECTION', message: 'Vous ne pouvez pas désactiver votre propre compte.' } }); return }
  const passwordHash = input.password ? await hashAdminPassword(input.password) : undefined
  const user = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(1807481)`
    const latest = await tx.adminUser.findUniqueOrThrow({ where: { id } })
    if (latest.active && input.active === false && await tx.adminUser.count({ where: { active: true } }) <= 1) return null
    const updated = await tx.adminUser.update({ where: { id }, data: {
      username: input.username, email: input.email, displayName: input.displayName, active: input.active,
      ...(passwordHash ? { passwordHash, passwordChangedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null } : {}),
    } })
    if (input.active === false || passwordHash) await tx.adminSession.deleteMany({ where: { adminUserId: id } })
    await tx.auditLog.create({ data: { action: 'admin-update', resource: 'administrators', target: updated.username } })
    return updated
  })
  if (!user) { res.status(409).json({ error: { code: 'LAST_ADMIN', message: 'Le dernier administrateur actif doit être conservé.' } }); return }
  res.json({ user: publicAdminUser(user), sessionRevoked: Boolean(input.active === false || passwordHash) })
})
admin.delete('/users/:id', async (req, res) => {
  const id = z.string().cuid().parse(req.params.id)
  const auth = getAdminAuth(res)
  if (auth?.user?.id === id) { res.status(400).json({ error: { code: 'SELF_PROTECTION', message: 'Vous ne pouvez pas supprimer votre propre compte.' } }); return }
  const target = await prisma.adminUser.findUnique({ where: { id } })
  if (!target) { notFound(res); return }
  const deleted = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(1807481)`
    const latest = await tx.adminUser.findUniqueOrThrow({ where: { id } })
    if (latest.active && await tx.adminUser.count({ where: { active: true } }) <= 1) return false
    await tx.adminUser.delete({ where: { id } })
    await tx.auditLog.create({ data: { action: 'admin-delete', resource: 'administrators', target: target.username } })
    return true
  })
  if (!deleted) { res.status(409).json({ error: { code: 'LAST_ADMIN', message: 'Le dernier administrateur actif doit être conservé.' } }); return }
  res.status(204).end()
})
admin.get('/overview', async (_req, res) => {
  const [contentGroups, sessionGroups, adminUsers, recentActivity] = await Promise.all([
    prisma.$queryRaw<{ resource: string; published: boolean; total: number }[]>`SELECT "resource"::text AS resource, "published", COUNT(*)::int AS total FROM "ContentEntry" GROUP BY "resource", "published"`,
    prisma.$queryRaw<{ published: boolean; total: number }[]>`SELECT "published", COUNT(*)::int AS total FROM "TrainingSession" GROUP BY "published"`,
    prisma.$queryRaw<{ total: number; active: number }[]>`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE "active")::int AS active FROM "AdminUser"`,
    prisma.auditLog.findMany({ take: 8, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true, action: true, resource: true, target: true, createdAt: true } }),
  ])
  const resourceNames = ['articles', 'videos', 'opportunities', 'trainings', 'events', 'hero'] as const
  const resources = Object.fromEntries(resourceNames.map(resource => {
    const groups = contentGroups.filter(group => group.resource === resource)
    const published = groups.find(group => group.published)?.total ?? 0
    const drafts = groups.find(group => !group.published)?.total ?? 0
    return [resource, { total: published + drafts, published, drafts }]
  }))
  const sessionsPublished = sessionGroups.find(group => group.published)?.total ?? 0
  const sessionsDrafts = sessionGroups.find(group => !group.published)?.total ?? 0
  res.json({
    generatedAt: new Date().toISOString(),
    resources,
    trainingSessions: { total: sessionsPublished + sessionsDrafts, published: sessionsPublished, drafts: sessionsDrafts },
    administrators: adminUsers[0] ?? { total: 0, active: 0 },
    recentActivity,
  })
})
admin.get('/content/:resource', async (req, res) => {
  res.json(await listContent(resourceSchema.parse(req.params.resource), { ...adminListQuerySchema.parse(req.query), admin: true }))
})
admin.get('/content/:resource/:slug', async (req, res) => {
  const resource = resourceSchema.parse(req.params.resource)
  const slug = slugSchema.parse(req.params.slug)
  const entry = await prisma.contentEntry.findUnique({ where: { resource_slug: { resource, slug } }, select: { data: true, published: true, sortOrder: true, featured: true, updatedAt: true } })
  if (!entry) { notFound(res); return }
  res.json(entry)
})
admin.post('/content/:resource', async (req, res) => {
  const resource = resourceSchema.parse(req.params.resource)
  const input = writeSchema.parse(req.body)
  const articleDate = input.published ? new Date().toISOString() : null
  const prepared = prepareContent(resource, resource === 'articles' ? { ...input.data, publishedAt: articleDate } : input.data)
  await prisma.$transaction(async tx => {
    await tx.contentEntry.create({ data: { ...prepared, resource, published: input.published, sortOrder: input.sortOrder, featured: input.featured } })
    await tx.auditLog.create({ data: { action: 'create', resource, target: prepared.slug } })
  })
  res.status(201).json({ data: prepared.data })
})
admin.put('/content/:resource/:slug', async (req, res) => {
  const resource = resourceSchema.parse(req.params.resource)
  const slug = slugSchema.parse(req.params.slug)
  const input = writeSchema.parse(req.body)
  if (slug !== input.data.id) { res.status(400).json({ error: { code: 'SLUG_MISMATCH', message: 'L’identifiant ne peut pas être modifié.' } }); return }
  const data = await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT "id" FROM "ContentEntry" WHERE "resource" = ${resource}::"Resource" AND "slug" = ${slug} FOR UPDATE`
    const previous = await tx.contentEntry.findUniqueOrThrow({ where: { resource_slug: { resource, slug } } })
    const originalDate = (previous.data as Record<string, unknown>).publishedAt
    const publishedAt = typeof originalDate === 'string' ? originalDate : input.published ? new Date().toISOString() : null
    const prepared = prepareContent(resource, resource === 'articles' ? { ...input.data, publishedAt } : input.data)
    await tx.contentEntry.update({ where: { resource_slug: { resource, slug } }, data: { ...prepared, published: input.published, sortOrder: input.sortOrder, featured: input.featured } })
    await tx.auditLog.create({ data: { action: 'update', resource, target: slug } })
    return prepared.data
  })
  res.json({ data })
})
admin.patch('/content/:resource/:slug/publication', async (req, res) => {
  const resource = resourceSchema.parse(req.params.resource)
  const slug = slugSchema.parse(req.params.slug)
  const { published } = z.strictObject({ published: z.boolean() }).parse(req.body)
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT "id" FROM "ContentEntry" WHERE "resource" = ${resource}::"Resource" AND "slug" = ${slug} FOR UPDATE`
    const previous = await tx.contentEntry.findUniqueOrThrow({ where: { resource_slug: { resource, slug } } })
    const original = previous.data as Record<string, unknown>
    const publishedAt = typeof original.publishedAt === 'string' ? original.publishedAt : published ? new Date().toISOString() : null
    await tx.contentEntry.update({ where: { resource_slug: { resource, slug } }, data: { ...(resource === 'articles' ? prepareContent(resource, { ...original, publishedAt }) : {}), published } })
    await tx.auditLog.create({ data: { action: published ? 'publish' : 'unpublish', resource, target: slug } })
  })
  res.json({ published })
})
admin.delete('/content/:resource/:slug', async (req, res) => {
  const resource = resourceSchema.parse(req.params.resource)
  const slug = slugSchema.parse(req.params.slug)
  if (resource === 'trainings') {
    const sessions = await prisma.trainingSession.findMany({ select: { data: true } })
    const used = sessions.some(session => Array.isArray((session.data as Record<string, unknown>).domainIds) && ((session.data as Record<string, unknown>).domainIds as unknown[]).includes(slug))
    if (used) { res.status(409).json({ error: { code: 'TRAINING_SESSION_CONFLICT', message: 'Cette formation est encore utilisée par une session programmée. Modifiez ou supprimez d’abord cette session.' } }); return }
  }
  await prisma.$transaction(async tx => {
    await tx.contentEntry.delete({ where: { resource_slug: { resource, slug } } })
    await tx.auditLog.create({ data: { action: 'delete', resource, target: slug } })
  })
  res.status(204).end()
})
admin.get('/categories/:resource', async (req, res) => {
  const resource = resourceSchema.parse(req.params.resource)
  const items = await prisma.category.findMany({ where: { resource }, orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }], include: { _count: { select: { entries: true } } } })
  res.json({ items: items.map(item => ({ id: item.key, label: item.label, sortOrder: item.sortOrder, ...item.metadata as object, count: item._count.entries })) })
})
admin.post('/categories/:resource', async (req, res) => {
  const resource = resourceSchema.parse(req.params.resource)
  const input = categorySchema.parse(req.body)
  const { id, label, sortOrder, ...metadata } = input
  await prisma.$transaction(async tx => {
    await tx.category.create({ data: { id: resource + ':' + id, resource, key: id, label, sortOrder, metadata } })
    await tx.auditLog.create({ data: { action: 'category-upsert', resource, target: id } })
  })
  res.status(201).json(input)
})
admin.put('/categories/:resource', async (req, res) => {
  const resource = resourceSchema.parse(req.params.resource)
  const input = categorySchema.parse(req.body)
  const { id, label, sortOrder, ...metadata } = input
  await prisma.$transaction(async tx => {
    await tx.category.upsert({ where: { resource_key: { resource, key: id } }, create: { id: resource + ':' + id, resource, key: id, label, sortOrder, metadata }, update: { label, sortOrder, metadata } })
    if (resource !== 'hero') {
      const entries = await tx.contentEntry.findMany({ where: { resource, categoryId: resource + ':' + id }, select: { id: true, data: true } })
      for (const entry of entries) await tx.contentEntry.update({ where: { id: entry.id }, data: { searchText: prepareContent(resource, entry.data).searchText + ' ' + normalize(label) } })
    }
    await tx.auditLog.create({ data: { action: 'category-upsert', resource, target: id } })
  })
  res.json(input)
})
admin.delete('/categories/:resource/:key', async (req, res) => {
  const resource = resourceSchema.parse(req.params.resource)
  const key = z.string().min(1).max(160).parse(req.params.key)
  const { replacement } = z.strictObject({ replacement: z.string().min(1).max(160).optional() }).parse(req.query)
  if (replacement === key) { res.status(400).json({ error: { code: 'INVALID_REPLACEMENT', message: 'Choisissez une autre catégorie pour réaffecter les articles.' } }); return }
  if (replacement && !await prisma.category.findUnique({ where: { resource_key: { resource, key: replacement } } })) { res.status(400).json({ error: { code: 'INVALID_REPLACEMENT', message: 'La catégorie de destination est introuvable.' } }); return }
  await prisma.$transaction(async tx => {
    if (replacement) {
      const entries = await tx.contentEntry.findMany({ where: { resource, categoryId: resource + ':' + key }, select: { id: true, data: true } })
      for (const entry of entries) {
        const data = entry.data as Record<string, unknown>
        await tx.contentEntry.update({ where: { id: entry.id }, data: prepareContent(resource, { ...data, [resource === 'trainings' ? 'family' : 'category']: replacement }) })
      }
    }
    await tx.category.delete({ where: { resource_key: { resource, key } } })
    await tx.auditLog.create({ data: { action: 'category-delete', resource, target: key } })
  })
  res.status(204).end()
})
admin.get('/contacts', async (_req, res) => {
  const settings = await prisma.siteSettings.findUniqueOrThrow({ where: { id: 'main' }, select: { data: true } })
  const data = settings.data as Record<string, unknown>
  res.json({ contact: data.contact, socialLinks: data.socialLinks })
})
admin.put('/contacts', async (req, res) => {
  const input = contactSettingsSchema.parse(req.body)
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT "id" FROM "SiteSettings" WHERE "id" = 'main' FOR UPDATE`
    const previous = await tx.siteSettings.findUniqueOrThrow({ where: { id: 'main' }, select: { data: true } })
    const data = { ...previous.data as Record<string, Prisma.InputJsonValue>, ...input }
    await tx.siteSettings.update({ where: { id: 'main' }, data: { data } })
    await tx.auditLog.create({ data: { action: 'contacts-update', resource: 'site', target: 'main' } })
  })
  res.json(input)
})
admin.put('/site', async (req, res) => {
  const data = siteSchema.parse(req.body)
  await prisma.$transaction(async tx => {
    await tx.siteSettings.upsert({ where: { id: 'main' }, create: { id: 'main', data }, update: { data } })
    await tx.auditLog.create({ data: { action: 'settings-update', resource: 'site', target: 'main' } })
  })
  res.json(data)
})
admin.get('/training-sessions', async (req, res) => {
  const { page, limit } = listQuerySchema.parse(req.query)
  const [total, items] = await prisma.$transaction([
    prisma.trainingSession.count(),
    prisma.trainingSession.findMany({ take: limit, skip: (page - 1) * limit, orderBy: [{ startsAt: 'asc' }, { id: 'asc' }], select: { data: true, published: true } }),
  ])
  res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
})
admin.put('/training-sessions/:id', async (req, res) => {
  const id = slugSchema.parse(req.params.id)
  const data = sessionSchema.parse(req.body)
  if (data.id !== id) { res.status(400).json({ error: { code: 'SLUG_MISMATCH', message: 'Identifiant invalide.' } }); return }
  const count = await prisma.contentEntry.count({ where: { resource: 'trainings', slug: { in: data.domainIds } } })
  if (count !== new Set(data.domainIds).size) { res.status(400).json({ error: { code: 'INVALID_DOMAIN', message: 'Un domaine de formation est introuvable.' } }); return }
  await prisma.$transaction(async tx => {
    await tx.trainingSession.upsert({ where: { id }, create: { id, data, startsAt: new Date(data.startsAt), published: data.status === 'scheduled' }, update: { data, startsAt: new Date(data.startsAt), published: data.status === 'scheduled' } })
    await tx.auditLog.create({ data: { action: 'session-upsert', resource: 'training-sessions', target: id } })
  })
  res.json(data)
})
admin.delete('/training-sessions/:id', async (req, res) => {
  const id = slugSchema.parse(req.params.id)
  await prisma.$transaction(async tx => {
    await tx.trainingSession.delete({ where: { id } })
    await tx.auditLog.create({ data: { action: 'session-delete', resource: 'training-sessions', target: id } })
  })
  res.status(204).end()
})
app.use('/api/admin', admin)
app.get('/images/uploads/:filename', serveImage)
app.get('/api/:resource', async (req, res) => {
  const resource = resourceSchema.safeParse(req.params.resource)
  if (!resource.success) { notFound(res); return }
  res.json(await listContent(resource.data, listQuerySchema.parse(req.query)))
})
app.get('/api/:resource/:slug', async (req, res) => {
  const resource = resourceSchema.safeParse(req.params.resource)
  if (!resource.success) { notFound(res); return }
  const entry = await getContent(resource.data, slugSchema.parse(req.params.slug))
  if (!entry) { notFound(res); return }
  res.json(entry)
})
app.use('/api', (_req, res) => { notFound(res) })
const frontend = path.resolve('dist')
if (config.NODE_ENV === 'production' && existsSync(path.join(frontend, 'index.html'))) {
  app.use(express.static(frontend, { index: false, maxAge: '1h' }))
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(frontend, 'index.html')))
}
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Les données transmises sont invalides.', fields: error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) } }); return
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') { res.status(409).json({ error: { code: 'CONFLICT', message: 'Cet identifiant existe déjà.' } }); return }
    if (error.code === 'P2025') { notFound(res); return }
    if (error.code === 'P2003') { res.status(409).json({ error: { code: 'CATEGORY_CONFLICT', message: 'Vérifiez la catégorie : elle est absente ou encore utilisée.' } }); return }
  }
  if (error instanceof SyntaxError && 'body' in error) { res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Le document JSON est invalide.' } }); return }
  if (error?.type === 'entity.too.large') { res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Le contenu transmis est trop volumineux.' } }); return }
  console.error(JSON.stringify({ requestId: res.locals.requestId, error: error?.name ?? 'Error', code: error?.code ?? 'INTERNAL' }))
  res.status(503).json({ error: { code: 'UNAVAILABLE', message: 'Le service est momentanément indisponible.', requestId: res.locals.requestId } })
}
app.use(errorHandler)

