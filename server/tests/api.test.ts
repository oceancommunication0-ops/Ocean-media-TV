import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../app.js'
import { prisma } from '../db.js'
import { config } from '../config.js'
import { HOME_LIMITS } from '../content-service.js'
import { contentSchemas } from '../validation.js'
const api = request(app)
after(async () => { await prisma.$disconnect() })
test('health et disponibilité PostgreSQL', async () => {
  await api.get('/api/health').expect(200)
  await api.get('/api/ready').expect(200)
})
test('accueil : limites SQL et résumés sans corps d’articles', async () => {
  const { body } = await api.get('/api/home').expect(200)
  for (const [resource, limit] of Object.entries(HOME_LIMITS)) {
    assert.ok(body[resource].items.length <= limit)
    assert.equal(body[resource].pagination.limit, limit)
  }
  assert.ok(body.articles.items.length > 0)
  assert.equal(body.articles.items[0].paragraphs, undefined)
  assert.equal(body.articles.items[0].profile, undefined)
  assert.equal(body.articles.items[0].content, undefined)
  assert.equal(body.articles.items[0].readingTime, undefined)
  assert.equal(body.opportunities.items[0].overview, undefined)
  assert.equal(body.trainings.items[0].objectives, undefined)
})
test('pagination déterministe : pages distinctes, total stable, page vide', async () => {
  const first = await api.get('/api/opportunities?page=1&limit=2').expect(200)
  const second = await api.get('/api/opportunities?page=2&limit=2').expect(200)
  assert.equal(first.body.items.length, 2)
  assert.equal(second.body.items.length, 2)
  assert.equal(first.body.pagination.total, second.body.pagination.total)
  assert.ok(!first.body.items.some((item: { id: string }) => second.body.items.some((other: { id: string }) => other.id === item.id)))
  const empty = await api.get('/api/opportunities?page=10000&limit=2').expect(200)
  assert.deepEqual(empty.body.items, [])
})
test('recherche accentuée, catégorie et recherche combinées côté serveur', async () => {
  const found = await api.get('/api/articles').query({ q: 'ensemble', category: 'Formation', limit: 2 }).expect(200)
  assert.ok(found.body.items.length > 0)
  assert.ok(found.body.items.every((item: { category: string }) => item.category === 'Formation'))
  const accents = await api.get('/api/trainings').query({ q: 'redaction' }).expect(200)
  assert.ok(accents.body.items.some((item: { id: string }) => item.id === 'redaction'))
  const empty = await api.get('/api/articles').query({ q: 'inexistant-zzzz-99999' }).expect(200)
  assert.equal(empty.body.pagination.total, 0)
})
test('détail : contenu complet à la demande et 404 explicite', async () => {
  const catalogue = await api.get('/api/articles?limit=1').expect(200)
  const article = await api.get('/api/articles/' + catalogue.body.items[0].id).expect(200)
  assert.equal(article.body.contentVersion, 2)
  assert.ok(article.body.content.content.length > 0)
  const opportunity = await api.get('/api/opportunities/communication-digitale').expect(200)
  assert.ok(opportunity.body.overview.length > 0)
  await api.get('/api/articles/introuvable-zzzz').expect(404)
  await api.get('/api/resource-invalide').expect(404)
})
test('validation des bornes et injection : aucune requête libre', async () => {
  for (const query of ['limit=5000', 'page=0', 'page=abc', 'limit=1.5', 'q=' + 'x'.repeat(161), 'admin=true', 'category[x]=a']) {
    await api.get('/api/articles?' + query).expect(400)
  }
  const result = await api.get('/api/articles').query({ q: "'; DROP TABLE anything; --" }).expect(200)
  assert.equal(result.body.items.length, 0)
})
test('routes de gestion : authentification obligatoire', async () => {
  await api.get('/api/admin/overview').expect(401)
  await api.get('/api/admin/content/articles').expect(401)
  await api.post('/api/admin/content/articles').send({}).expect(401)
  await api.put('/api/admin/site').set('Authorization', 'Bearer incorrect').send({}).expect(401)
})
test('tableau de bord : statistiques réelles et activité récente', async () => {
  assert.ok(config.ADMIN_API_KEY)
  const response = await api.get('/api/admin/overview').set('Authorization', 'Bearer ' + config.ADMIN_API_KEY).expect(200)
  assert.match(response.body.generatedAt, /^\d{4}-\d{2}-\d{2}T/)
  for (const resource of ['articles', 'videos', 'opportunities', 'trainings', 'events', 'hero']) {
    assert.equal(typeof response.body.resources[resource].total, 'number')
    assert.equal(response.body.resources[resource].total, response.body.resources[resource].published + response.body.resources[resource].drafts)
  }
  assert.ok(Array.isArray(response.body.recentActivity))
  assert.ok(response.body.recentActivity.length <= 8)
  assert.equal(typeof response.body.administrators.active, 'number')
})
test('rédaction : filtrage serveur fiable des publications et brouillons', async () => {
  assert.ok(config.ADMIN_API_KEY)
  const token = 'Bearer ' + config.ADMIN_API_KEY
  const all = await api.get('/api/admin/content/articles').query({ page: 1, limit: 24, status: 'all' }).set('Authorization', token).expect(200)
  const published = await api.get('/api/admin/content/articles').query({ page: 1, limit: 24, status: 'published' }).set('Authorization', token).expect(200)
  const drafts = await api.get('/api/admin/content/articles').query({ page: 1, limit: 24, status: 'draft' }).set('Authorization', token).expect(200)
  assert.equal(all.body.pagination.total, published.body.pagination.total + drafts.body.pagination.total)
  assert.ok(published.body.items.every((item: { published: boolean }) => item.published))
  assert.ok(drafts.body.items.every((item: { published: boolean }) => !item.published))
  await api.get('/api/admin/content/articles').query({ status: 'inconnu' }).set('Authorization', token).expect(400)
})
test('authentification administrateur : compte, cookie de session, CSRF et révocation', { timeout: 60_000 }, async () => {
  assert.ok(config.ADMIN_API_KEY)
  const token = 'Bearer ' + config.ADMIN_API_KEY
  const suffix = Date.now().toString(36)
  const username = 'integration.' + suffix
  const password = 'Phrase-temporaire-4821!'
  let id = ''
  try {
    const created = await api.post('/api/admin/users').set('Authorization', token).send({ username, email: `${username}@example.test`, displayName: 'Compte Integration', password }).expect(201)
    id = created.body.user.id
    assert.equal(created.body.user.passwordHash, undefined)
    const agent = request.agent(app)
    const login = await agent.post('/api/admin/auth/login').send({ identifier: username, password }).expect(200)
    assert.equal(login.body.user.username, username)
    assert.equal(login.body.user.role, undefined)
    assert.ok(login.body.csrfToken)
    assert.match(login.headers['set-cookie']?.[0] ?? '', /HttpOnly/i)
    const me = await agent.get('/api/admin/auth/me').expect(200)
    const listed = await agent.get('/api/admin/users').expect(200)
    assert.ok(listed.body.items.every((item: Record<string, unknown>) => !('role' in item)))
    await agent.patch('/api/admin/users/' + id).set('X-CSRF-Token', me.body.csrfToken).send({ active: false }).expect(400)
    await agent.delete('/api/admin/users/' + id).set('X-CSRF-Token', me.body.csrfToken).expect(400)
    let secondId = ''
    try {
      const second = await agent.post('/api/admin/users').set('X-CSRF-Token', me.body.csrfToken).send({ username: username + '.second', email: username + '.second@example.test', displayName: 'Autre administrateur', password }).expect(201)
      secondId = second.body.user.id
      await agent.patch('/api/admin/users/' + secondId).set('X-CSRF-Token', me.body.csrfToken).send({ displayName: 'Administrateur modifié' }).expect(200)
      await agent.delete('/api/admin/users/' + secondId).set('X-CSRF-Token', me.body.csrfToken).expect(204)
      secondId = ''
    } finally {
      if (secondId) await prisma.adminUser.deleteMany({ where: { id: secondId } })
    }
    await agent.post('/api/admin/auth/logout').expect(403)
    await agent.post('/api/admin/auth/logout').set('X-CSRF-Token', me.body.csrfToken).expect(204)
    await agent.get('/api/admin/auth/me').expect(401)
  } finally {
    if (id) await api.delete('/api/admin/users/' + id).set('Authorization', token).expect(204)
  }
})
test('publication : brouillon invisible, validation, publication, modification, retrait et suppression', { timeout: 60_000 }, async () => {
  assert.ok(config.ADMIN_API_KEY)
  const token = 'Bearer ' + config.ADMIN_API_KEY
  const id = 'integration-' + Date.now()
  const data = { id, title: 'Vidéo temporaire de test', description: 'Vérification de la publication via l’API.', category: 'Reportages', youtubeId: null, thumbnail: '/images/tv-aBU7JsDsF0Y.webp', thumbnailAlt: 'Vignette du test' }
  try {
    await api.post('/api/admin/content/videos').set('Authorization', token).send({ data, published: false }).expect(201)
    await api.get('/api/videos/' + id).expect(404)
    await api.get('/api/admin/content/videos/' + id).set('Authorization', token).expect(200)
    await api.patch('/api/admin/content/videos/' + id + '/publication').set('Authorization', token).send({ published: true }).expect(200)
    await api.get('/api/videos/' + id).expect(200)
    const bad = { ...data, youtubeId: 'not-an-id' }
    await api.put('/api/admin/content/videos/' + id).set('Authorization', token).send({ data: bad }).expect(400)
    await api.put('/api/admin/content/videos/' + id).set('Authorization', token).send({ data: { ...data, title: 'Titre mis à jour' }, published: true }).expect(200)
    const updated = await api.get('/api/videos/' + id).expect(200)
    assert.equal(updated.body.title, 'Titre mis à jour')
    await api.patch('/api/admin/content/videos/' + id + '/publication').set('Authorization', token).send({ published: false }).expect(200)
    await api.get('/api/videos/' + id).expect(404)
    await api.delete('/api/admin/content/videos/' + id).set('Authorization', token).expect(204)
    await api.get('/api/admin/content/videos/' + id).set('Authorization', token).expect(404)
  } finally {
    await prisma.contentEntry.deleteMany({ where: { resource: 'videos', slug: id } })
  }
})
test('dates : refus des calendriers invalides et des fins inversées', () => {
  const event = { id: 'test-dates', title: 'Test', category: 'ateliers', description: 'Calendrier', image: { src: '/images/events-workshop.webp', alt: 'Atelier' } }
  assert.equal(contentSchemas.events.safeParse({ ...event, schedule: { kind: 'date', start: '2026-02-30', timeZone: 'Africa/Kinshasa' } }).success, false)
  assert.equal(contentSchemas.events.safeParse({ ...event, schedule: { kind: 'date', start: '2026-11-20', end: '2026-11-19', timeZone: 'Africa/Kinshasa' } }).success, false)
})

test('formations : programmation d’une session et protection du domaine utilisé', { timeout: 60_000 }, async () => {
  assert.ok(config.ADMIN_API_KEY)
  const token = 'Bearer ' + config.ADMIN_API_KEY
  const suffix = Date.now().toString(36)
  const id = 'formation-integration-' + suffix
  const sessionId = 'session-integration-' + suffix
  const category = await prisma.category.findFirstOrThrow({ where: { resource: 'trainings' }, select: { key: true } })
  const data = {
    id, title: 'Formation temporaire', icon: 'graduation', family: category.key,
    tagline: 'Une formation de validation.', description: 'Un domaine créé uniquement pour le test automatisé.',
    longDescription: 'Cette fiche vérifie la programmation et la protection des domaines liés à une session.',
    objectives: ['Valider le workflow'], audience: 'Équipe de test', approach: 'Mise en situation.',
  }
  try {
    await api.post('/api/admin/content/trainings').set('Authorization', token).send({ data, published: false, sortOrder: 999 }).expect(201)
    const session = { id: sessionId, title: 'Session temporaire', domainIds: [id], status: 'scheduled', startsAt: '2026-11-20T09:00:00+01:00', timezone: 'Africa/Kinshasa', format: 'Présentiel', location: 'Kinshasa' }
    await api.put('/api/admin/training-sessions/' + sessionId).set('Authorization', token).send(session).expect(200)
    const listed = await api.get('/api/admin/training-sessions?page=1&limit=24').set('Authorization', token).expect(200)
    assert.ok(listed.body.items.some((item: { data: { id: string } }) => item.data.id === sessionId))
    const protectedDelete = await api.delete('/api/admin/content/trainings/' + id).set('Authorization', token).expect(409)
    assert.equal(protectedDelete.body.error.code, 'TRAINING_SESSION_CONFLICT')
    await api.delete('/api/admin/training-sessions/' + sessionId).set('Authorization', token).expect(204)
    await api.delete('/api/admin/content/trainings/' + id).set('Authorization', token).expect(204)
  } finally {
    await prisma.trainingSession.deleteMany({ where: { id: sessionId } })
    await prisma.contentEntry.deleteMany({ where: { resource: 'trainings', slug: id } })
  }
})

