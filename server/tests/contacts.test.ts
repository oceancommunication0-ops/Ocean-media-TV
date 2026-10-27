import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../app.js'
import { prisma } from '../db.js'
import { config } from '../config.js'
import { contactSettingsSchema } from '../validation.js'
import type { ContactSettings } from '../../shared/content.js'

const api = request(app)
const authorization = 'Bearer ' + config.ADMIN_API_KEY
after(async () => { await prisma.$disconnect() })

test('les coordonnées normalisent les liens et valident les numéros et réseaux', () => {
  const input = {
    contact: { phone: '+243 97 248 60 33', whatsappNumber: '+243 (97) 248-60-33', address: 'Kinshasa, RDC', email: 'CONTACT@example.org' },
    socialLinks: { Facebook: null, YouTube: 'https://www.youtube.com/@ocean', TikTok: 'https://www.tiktok.com/@ocean' },
  }
  const output = contactSettingsSchema.parse(input)
  assert.equal(output.contact.phoneHref, 'tel:+243972486033')
  assert.equal(output.contact.whatsappHref, 'https://wa.me/243972486033')
  assert.equal(output.contact.email, 'contact@example.org')
  assert.equal(contactSettingsSchema.safeParse({ ...input, contact: { ...input.contact, phone: '123' } }).success, false)
  assert.equal(contactSettingsSchema.safeParse({ ...input, socialLinks: { ...input.socialLinks, TikTok: 'javascript:alert(1)' } }).success, false)
  assert.equal(contactSettingsSchema.safeParse({ ...input, socialLinks: { ...input.socialLinks, Instagram: 'https://instagram.com/test' } }).success, false)
  assert.equal(contactSettingsSchema.safeParse({ ...input, socialLinks: { ...input.socialLinks, TikTok: null } }).success, true)
})

test('la configuration contact est protégée et partagée avec le site public', { timeout: 60_000 }, async () => {
  await api.get('/api/admin/contacts').expect(401)
  await api.put('/api/admin/contacts').send({}).expect(401)
  const before = await prisma.siteSettings.findUniqueOrThrow({ where: { id: 'main' }, select: { data: true } })
  const settings = await api.get('/api/admin/contacts').set('Authorization', authorization).expect(200)
  const original = settings.body as ContactSettings
  assert.ok('TikTok' in original.socialLinks)
  assert.ok(!('Instagram' in original.socialLinks))
  const input = {
    contact: { phone: original.contact.phone, whatsappNumber: '+' + original.contact.whatsappHref.split('/').pop(), address: original.contact.address, email: original.contact.email ?? null },
    socialLinks: original.socialLinks,
  }
  // Re-save the existing real values: no demonstration contact is published by this test.
  const saved = await api.put('/api/admin/contacts').set('Authorization', authorization).send(input).expect(200)
  const publicSite = await api.get('/api/site').expect(200)
  assert.match(publicSite.headers['cache-control'], /no-store/)
  assert.deepEqual(publicSite.body.contact, saved.body.contact)
  assert.deepEqual(publicSite.body.socialLinks, saved.body.socialLinks)
  const afterSave = await prisma.siteSettings.findUniqueOrThrow({ where: { id: 'main' }, select: { data: true } })
  const beforeData = before.data as Record<string, unknown>
  const afterData = afterSave.data as Record<string, unknown>
  for (const key of Object.keys(beforeData).filter(key => !['contact', 'socialLinks'].includes(key))) assert.deepEqual(afterData[key], beforeData[key])
  await api.put('/api/admin/contacts').set('Authorization', authorization).send({ ...input, socialLinks: { ...input.socialLinks, TikTok: 'http://invalid.test' } }).expect(400)
  const unchanged = await api.get('/api/admin/contacts').set('Authorization', authorization).expect(200)
  assert.deepEqual(unchanged.body, saved.body)
})
