import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../app.js'
import { prisma } from '../db.js'
import { config } from '../config.js'
import { isArticleDocument } from '../../shared/article-document.js'
import { readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { mediaDirectory } from '../media.js'

const api = request(app)
const authorization = 'Bearer ' + config.ADMIN_API_KEY
after(async () => { await prisma.$disconnect() })

test('le document riche refuse les blocs exécutables, liens dangereux et structures excessives', () => {
  const document = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Un article', marks: [{ type: 'bold' }] }] }] }
  assert.equal(isArticleDocument(document), true)
  assert.equal(isArticleDocument({ type: 'doc', content: [{ type: 'script', text: 'alert(1)' }] }), false)
  assert.equal(isArticleDocument({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Lien', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] }] }), false)
  assert.equal(isArticleDocument({ type: 'doc', content: [{ type: 'image', attrs: { src: 'data:text/html;base64,test', alt: 'Image' } }] }), false)
})

test('article riche : brouillon, publication automatique, date immuable et réaffectation des catégories', { timeout: 90000 }, async () => {
  const id = 'rich-test-' + Date.now()
  const source = id + '-source'
  const target = id + '-target'
  const article = { id, category: source, title: 'Article riche de test', excerpt: 'Résumé du contenu.', image: '/images/news-enterprise.webp', imageAlt: 'Atelier', imagePosition: '50% 50%', author: 'La rédaction', format: 'Reportage', href: '/actualites/' + id, contentVersion: 2, content: { type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Un titre' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'Un récit journalistique ', marks: [{ type: 'bold' }] }, { type: 'text', text: 'avec un lien.', marks: [{ type: 'link', attrs: { href: 'https://example.org' } }] }] }] } }
  try {
    await api.post('/api/admin/categories/articles').set('Authorization', authorization).send({ id: source, label: 'Catégorie test source' }).expect(201)
    await api.post('/api/admin/categories/articles').set('Authorization', authorization).send({ id: target, label: 'Catégorie test destination' }).expect(201)
    const draft = await api.post('/api/admin/content/articles').set('Authorization', authorization).send({ data: { ...article, publishedAt: '1900-01-01' }, published: false }).expect(201)
    assert.equal(draft.body.data.publishedAt, null)
    assert.equal(draft.body.data.readingTime, undefined)
    await api.get('/api/articles/' + id).expect(404)
    await api.patch('/api/admin/content/articles/' + id + '/publication').set('Authorization', authorization).send({ published: true }).expect(200)
    const published = await api.get('/api/articles/' + id).expect(200)
    assert.ok(Math.abs(Date.now() - Date.parse(published.body.publishedAt)) < 60000)
    assert.deepEqual(published.body.content, article.content)
    await api.put('/api/admin/content/articles/' + id).set('Authorization', authorization).send({ data: { ...article, title: 'Article modifié', publishedAt: '1900-01-01' }, published: true }).expect(200)
    const modified = await api.get('/api/articles/' + id).expect(200)
    assert.equal(modified.body.publishedAt, published.body.publishedAt)
    await api.put('/api/admin/categories/articles').set('Authorization', authorization).send({ id: source, label: 'Catégorie renommée' }).expect(200)
    const renamed = await api.get('/api/articles/' + id).expect(200)
    assert.equal(renamed.body.categoryLabel, 'Catégorie renommée')
    await api.delete('/api/admin/categories/articles/' + source).set('Authorization', authorization).expect(409)
    await api.delete('/api/admin/categories/articles/' + source).query({ replacement: target }).set('Authorization', authorization).expect(204)
    const moved = await api.get('/api/articles/' + id).expect(200)
    assert.equal(moved.body.category, target)
    assert.equal(moved.body.publishedAt, published.body.publishedAt)
    assert.deepEqual(moved.body.content, article.content)
    const list = await api.get('/api/articles').query({ category: target }).expect(200)
    assert.ok(list.body.items.some((item: { id: string }) => item.id === id))
    assert.equal(list.body.items[0].content, undefined)
  } finally {
    await prisma.contentEntry.deleteMany({ where: { resource: 'articles', slug: id } })
    await prisma.category.deleteMany({ where: { resource: 'articles', key: { in: [source, target] } } })
  }
})

test('le téléversement refuse les fichiers non image et les requêtes non authentifiées', async () => {
  await api.post('/api/admin/media').set('Content-Type', 'image/png').send(Buffer.from('test')).expect(401)
  await api.post('/api/admin/media').set('Authorization', authorization).set('Content-Type', 'image/png').send(Buffer.from('<script>not an image</script>')).expect(400)
})

test('une image importée est réencodée et servie au lecteur', async () => {
  const source = await readFile('public/images/news-learning.webp')
  const response = await api.post('/api/admin/media').set('Authorization', authorization).set('Content-Type', 'image/webp').send(source).expect(201)
  assert.match(response.body.src, /^\/images\/uploads\/[a-f0-9-]+\.webp$/)
  const filename = path.join(mediaDirectory, path.basename(response.body.src))
  try {
    const image = await api.get(response.body.src).expect(200)
    assert.match(image.headers['content-type'], /image\/webp/)
  } finally { await unlink(filename) }
})
