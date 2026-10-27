import { expect, test } from '@playwright/test'
import type { ContactSettings, ContactSettingsInput } from '../shared/content'

for (const width of [1440, 390]) test(`les coordonnées enregistrées sont utilisées par les contacts et réseaux publics à ${width}px`, async ({ page, request }) => {
  await page.setViewportSize({ width, height: 950 })
  const [siteResponse, homeResponse] = await Promise.all([request.get('/api/site'), request.get('/api/home')])
  expect(siteResponse.ok()).toBe(true)
  expect(homeResponse.ok()).toBe(true)
  const site = await siteResponse.json()
  const home = await homeResponse.json()
  let settings: ContactSettings = { contact: site.contact, socialLinks: site.socialLinks }
  const count = { total: 0, published: 0, drafts: 0 }
  await page.route('**/api/admin/auth/me', route => route.fulfill({ json: { user: { id: 'admin-test', username: 'admin', displayName: 'Administrateur', email: 'admin@example.test', active: true }, csrfToken: 'contacts-csrf' } }))
  await page.route('**/api/admin/overview', route => route.fulfill({ json: { resources: { articles: count, videos: count, opportunities: count, trainings: count, events: count, hero: count } } }))
  await page.route('**/api/admin/contacts', async route => {
    if (route.request().method() === 'PUT') {
      expect(route.request().headers()['x-csrf-token']).toBe('contacts-csrf')
      const input = route.request().postDataJSON() as ContactSettingsInput
      settings = { contact: { phone: input.contact.phone, phoneHref: 'tel:+' + input.contact.phone.replace(/\D/g, ''), whatsappHref: 'https://wa.me/' + input.contact.whatsappNumber.replace(/\D/g, ''), address: input.contact.address, email: input.contact.email }, socialLinks: input.socialLinks }
    }
    await route.fulfill({ json: settings })
  })
  await page.route('**/api/site', route => route.fulfill({ json: { ...site, ...settings } }))
  await page.route('**/api/home', route => route.fulfill({ json: home }))
  await page.goto('/admin')
  if (width < 800) await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
  await page.getByRole('navigation', { name: 'Navigation de l’administration', exact: true }).filter({ visible: true }).getByRole('link', { name: 'Contacts & réseaux sociaux', exact: true }).click()
  await expect(page).toHaveURL('/admin/contacts')
  await expect(page.getByRole('heading', { name: 'Contacts & réseaux sociaux', exact: true })).toBeVisible()
  await page.getByLabel('Téléphone', { exact: true }).fill('+243 81 234 56 78')
  await page.getByLabel('Numéro WhatsApp', { exact: true }).fill('+243 82 345 67 89')
  await page.getByLabel('Email', { exact: true }).fill('bonjour@example.test')
  await page.getByLabel('Adresse', { exact: true }).fill('Avenue des Jeunes, Kinshasa')
  await page.getByLabel('Facebook', { exact: true }).fill('https://www.facebook.com/ocean-test')
  await page.getByLabel('YouTube', { exact: true }).fill('https://www.youtube.com/@ocean-test')
  await page.getByLabel('TikTok', { exact: true }).fill('https://www.tiktok.com/@ocean-test')
  await expect(page.getByLabel('Instagram', { exact: true })).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  if (width === 1440) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.screenshot({ path: 'test-results/admin-contacts-desktop.png', fullPage: true })
  }
  await page.getByRole('button', { name: 'Enregistrer les coordonnées', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Coordonnées et réseaux enregistrés')
  await page.reload()
  await expect(page.getByLabel('TikTok', { exact: true })).toHaveValue('https://www.tiktok.com/@ocean-test')
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await expect(footer.getByRole('link', { name: '+243 81 234 56 78', exact: true })).toHaveAttribute('href', 'tel:+243812345678')
  await expect(footer.getByRole('link', { name: /Échanger sur WhatsApp/ })).toHaveAttribute('href', 'https://wa.me/243823456789')
  await expect(footer.getByRole('link', { name: 'bonjour@example.test', exact: true })).toHaveAttribute('href', 'mailto:bonjour@example.test')
  await expect(footer.getByRole('link', { name: 'TikTok — nouvel onglet', exact: true })).toHaveAttribute('href', 'https://www.tiktok.com/@ocean-test')
  await expect(page.getByRole('link', { name: /Instagram/ })).toHaveCount(0)
  if (width < 1280) {
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    await page.getByRole('button', { name: 'Parlons de vos projets', exact: true }).click()
  } else await page.getByRole('button', { name: 'Contact', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('link', { name: /Appelez-nous/ })).toHaveAttribute('href', 'tel:+243812345678')
  await expect(dialog.getByRole('link', { name: /Discuter sur WhatsApp/ })).toHaveAttribute('href', 'https://wa.me/243823456789')
  await expect(dialog.getByRole('link', { name: /Par email/ })).toHaveAttribute('href', 'mailto:bonjour@example.test')
  await expect(dialog).toContainText('Avenue des Jeunes, Kinshasa')
})
