import { expect, test, type Page } from '@playwright/test'
import { isArticleDocument } from '../shared/article-document'

const owner = { id: 'admin-owner', username: 'benji', email: 'benji@ocean.test', displayName: 'Benji Tembwa', active: true, lastLoginAt: '2026-10-25T10:20:00.000Z', createdAt: '2026-10-24T10:00:00.000Z', updatedAt: '2026-10-25T10:20:00.000Z' }
const overview = { generatedAt: '2026-10-25T10:30:00.000Z', resources: { articles: { total: 12, published: 10, drafts: 2 }, videos: { total: 8, published: 8, drafts: 0 }, opportunities: { total: 9, published: 7, drafts: 2 }, trainings: { total: 6, published: 6, drafts: 0 }, events: { total: 6, published: 5, drafts: 1 }, hero: { total: 3, published: 3, drafts: 0 } }, trainingSessions: { total: 2, published: 1, drafts: 1 }, administrators: { total: 2, active: 2, owners: 1 }, recentActivity: [{ id: 'activity-1', action: 'update', resource: 'articles', target: 'article-test', createdAt: '2026-10-25T09:00:00.000Z' }] }

async function mockAuthentication(page: Page) {
  await page.route('**/api/admin/auth/me', route => route.fulfill({ status: 401, json: { error: { message: 'Authentification requise.' } } }))
  await page.route('**/api/admin/auth/login', route => route.fulfill({ json: { user: owner, csrfToken: 'csrf-test-token' } }))
  await page.route('**/api/admin/overview', route => route.fulfill({ json: overview }))
}
async function openDashboard(page: Page) {
  await mockAuthentication(page); await page.goto('/admin')
  await page.getByLabel('Nom d’utilisateur ou email').fill('benji')
  await page.getByLabel('Mot de passe', { exact: true }).fill('Phrase-de-passe-4821!')
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Vos espaces éditoriaux', exact: true })).toBeVisible()
}

test('la connexion utilise un nom utilisateur ou email et reste séparée du site public', async ({ page }) => {
  await mockAuthentication(page); await page.goto('/admin')
  await expect(page.getByRole('heading', { level: 1, name: 'Heureux de vous revoir.', exact: true })).toBeVisible()
  await expect(page.getByLabel('Nom d’utilisateur ou email')).toBeVisible()
  await expect(page.getByLabel('Mot de passe', { exact: true })).toHaveAttribute('type', 'password')
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toHaveCount(0)
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
})

test('la connexion affiche directement deux champs et aucune configuration initiale', async ({ page }) => {
  await mockAuthentication(page); await page.goto('/admin')
  await expect(page.locator('form input')).toHaveCount(2)
  await expect(page.getByLabel('Nom d’utilisateur ou email')).toBeVisible()
  await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible()
  await expect(page.getByText('Première configuration', { exact: false })).toHaveCount(0)
  await expect(page.getByText('Clé d’initialisation', { exact: false })).toHaveCount(0)
})

test('la vue d’ensemble commence par les espaces éditoriaux et simplifie l’en-tête', async ({ page }) => {
  await openDashboard(page)
  await expect(page.getByRole('heading', { name: 'Vos espaces éditoriaux', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activité récente', exact: true })).toHaveCount(0)
  await expect(page.locator('.admin-topbar')).not.toContainText('API connectée')
  await expect(page.locator('.admin-main-metrics')).toHaveCount(0)
})

test('un administrateur peut ouvrir la gestion des administrateurs et ajouter un compte', async ({ page }) => {
  await mockAuthentication(page)
  await page.route('**/api/admin/users', async route => {
    if (route.request().method() === 'POST') { await route.fulfill({ status: 201, json: { user: { ...owner, id: 'new-user', username: 'editor' } } }); return }
    await route.fulfill({ json: { items: [owner] } })
  })
  await page.goto('/admin'); await page.getByLabel('Nom d’utilisateur ou email').fill('benji'); await page.getByLabel('Mot de passe', { exact: true }).fill('Phrase-de-passe-4821!'); await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await page.getByRole('navigation', { name: 'Navigation de l’administration', exact: true }).getByRole('link', { name: 'Administrateurs', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Administrateurs', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Ajouter un administrateur', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Ajouter un administrateur', exact: true })
  await dialog.getByLabel('Nom complet').fill('Nouvel Éditeur'); await dialog.getByLabel('Nom d’utilisateur').fill('editor'); await dialog.getByLabel('Adresse email').fill('editor@ocean.test'); await dialog.getByLabel('Mot de passe temporaire').fill('Phrase-editeur-4821!')
  const request = page.waitForRequest(req => req.url().endsWith('/api/admin/users') && req.method() === 'POST')
  await dialog.getByRole('button', { name: 'Ajouter l’administrateur', exact: true }).click()
  const created = await request
  expect(created.headers()['x-csrf-token']).toBe('csrf-test-token')
  expect(created.postDataJSON().role).toBeUndefined()
  await expect(dialog.getByLabel('Rôle', { exact: true })).toHaveCount(0)
  await expect(dialog).toHaveCount(0)
})

test('la rédaction charge les articles et applique les filtres depuis le backend', async ({ page }) => {
  await mockAuthentication(page)
  await page.route('**/api/site', route => route.fulfill({ json: { categories: { articles: [{ id: 'Formation', label: 'Formation' }] } } }))
  await page.route('**/api/admin/categories/articles', route => route.fulfill({ json: { items: [{ id: 'Formation', label: 'Formation', count: 1, sortOrder: 0 }] } }))
  await page.route('**/api/admin/content/articles?*', route => route.fulfill({ json: {
    items: [{ slug: 'prendre-la-parole', published: true, sortOrder: 0, updatedAt: '2026-10-25T10:20:00.000Z', summary: { id: 'prendre-la-parole', category: 'Formation', title: 'Prendre la parole, prendre sa place.', excerpt: 'Une introduction claire.', image: '/images/news-learning.webp', imageAlt: 'Formation', imagePosition: '50% 50%', format: 'Éclairage', author: 'La rédaction', publishedAt: '2026-10-21', readingTime: 3, href: '/actualites/prendre-la-parole' } }],
    pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
  } }))
  await page.goto('/admin'); await page.getByLabel('Nom d’utilisateur ou email').fill('benji'); await page.getByLabel('Mot de passe', { exact: true }).fill('Phrase-de-passe-4821!'); await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await page.getByRole('navigation', { name: 'Navigation de l’administration', exact: true }).getByRole('link', { name: 'Actualités', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Actualités', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Prendre la parole, prendre sa place.', exact: true })).toBeVisible()
  const request = page.waitForRequest(value => value.url().includes('/api/admin/content/articles?') && value.url().includes('status=draft'))
  await page.getByRole('button', { name: 'Brouillons', exact: true }).click()
  await request
})

for (const width of [1440, 390]) test(`la rédaction utilise un éditeur riche à ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 })
  await mockAuthentication(page)
  await page.route('**/api/admin/categories/articles', route => route.fulfill({ json: { items: [{ id: 'Formation', label: 'Formation', count: 0, sortOrder: 0 }] } }))
  await page.route('**/api/admin/content/articles?*', route => route.fulfill({ json: { items: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 0 } } }))
  await page.route('**/api/admin/content/articles', route => route.fulfill({ status: 201, json: { data: route.request().postDataJSON().data } }))
  await page.goto('/admin/actualites')
  await page.getByLabel('Nom d’utilisateur ou email').fill('benji')
  await page.getByLabel('Mot de passe', { exact: true }).fill('Phrase-de-passe-4821!')
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await page.getByRole('button', { name: 'Nouvel article', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Créer un article', exact: true })
  await dialog.getByRole('textbox', { name: 'Titre de l’article', exact: true }).fill('Une rédaction moderne')
  await dialog.getByRole('textbox', { name: 'Résumé de l’article', exact: true }).fill('Un article avec une vraie mise en forme.')
  await dialog.getByLabel('Source de l’image', { exact: true }).fill('/images/news-learning.webp')
  await dialog.getByLabel('Description de l’image', { exact: true }).fill('Un atelier de formation')
  const editor = dialog.getByRole('textbox', { name: 'Contenu de l’article', exact: true })
  await expect(editor).toBeVisible()
  await editor.fill('Une première idée importante.')
  await editor.press('ControlOrMeta+a')
  await dialog.getByRole('button', { name: 'Gras (Ctrl+B)', exact: true }).click()
  await expect(editor.locator('strong')).toHaveText('Une première idée importante.')
  await dialog.getByRole('button', { name: 'Insérer ou modifier un lien', exact: true }).click()
  const linkDialog = page.getByRole('dialog', { name: 'Insérer un lien', exact: true })
  await linkDialog.getByLabel('Adresse du lien').fill('https://example.org/ressource')
  await linkDialog.getByRole('button', { name: 'Insérer', exact: true }).click()
  await expect(editor.locator('a')).toHaveAttribute('href', 'https://example.org/ressource')
  await editor.press('ControlOrMeta+End')
  await editor.press('Enter')
  await dialog.getByRole('button', { name: 'Insérer un tableau', exact: true }).click()
  await expect(editor.locator('table')).toHaveCount(1)
  await dialog.getByRole('button', { name: '+ Colonne', exact: true }).click()
  await expect(editor.locator('table tr').first().locator('th')).toHaveCount(4)
  await dialog.getByRole('button', { name: 'Aperçu', exact: true }).click()
  await expect(dialog.locator('.article-editor-preview strong')).toHaveText('Une première idée importante.')
  await expect(dialog.locator('.article-editor-preview table')).toHaveCount(1)
  await dialog.getByRole('button', { name: 'Rédaction', exact: true }).click()
  await expect(dialog.getByLabel('Date de publication', { exact: true })).toHaveCount(0)
  await expect(dialog.getByLabel('Temps de lecture', { exact: true })).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  await page.screenshot({ path: `test-results/rich-editor-${width}.png` })
  const request = page.waitForRequest(value => value.method() === 'POST' && value.url().endsWith('/api/admin/content/articles'))
  await dialog.getByRole('button', { name: 'Enregistrer l’article', exact: true }).click()
  const payload = (await request).postDataJSON()
  expect(payload.data.contentVersion).toBe(2)
  expect(isArticleDocument(payload.data.content)).toBe(true)
  expect(payload.data.content.content[0].content[0].marks).toEqual(expect.arrayContaining([{ type: 'bold' }]))
  expect(payload.data.publishedAt).toBeUndefined()
  expect(payload.data.readingTime).toBeUndefined()
  expect(payload.data.id).toMatch(/^une-redaction-moderne-[a-f0-9]{8}$/)
  expect(payload.data.format).toBe('Article')
  expect(payload.data.imagePosition).toBe('50% 40%')
  await expect(dialog.getByLabel('Identifiant URL')).toHaveCount(0)
  await expect(dialog.getByLabel('Format éditorial')).toHaveCount(0)
  await expect(dialog.getByLabel('Cadrage')).toHaveCount(0)
  await expect(dialog).toHaveCount(0)
})

test('la rédaction peut ajouter et renommer une catégorie', async ({ page }) => {
  await mockAuthentication(page)
  let items = [{ id: 'Formation', label: 'Formation', count: 0, sortOrder: 0 }]
  await page.route('**/api/admin/categories/articles', async route => {
    const method = route.request().method()
    if (method === 'POST') { const value = route.request().postDataJSON(); items = [...items, { ...value, count: 0 }]; await route.fulfill({ status: 201, json: value }); return }
    if (method === 'PUT') { const value = route.request().postDataJSON(); items = items.map(item => item.id === value.id ? { ...item, ...value } : item); await route.fulfill({ json: value }); return }
    await route.fulfill({ json: { items } })
  })
  await page.route('**/api/admin/content/articles?*', route => route.fulfill({ json: { items: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 0 } } }))
  await page.goto('/admin/actualites'); await page.getByLabel('Nom d’utilisateur ou email').fill('benji'); await page.getByLabel('Mot de passe', { exact: true }).fill('Phrase-de-passe-4821!'); await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await page.getByRole('button', { name: 'Gérer les catégories', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Catégories des actualités', exact: true })
  await dialog.getByRole('button', { name: 'Ajouter une catégorie', exact: true }).click()
  await dialog.getByLabel('Nom de la catégorie').fill('Sciences')
  await dialog.getByRole('button', { name: 'Enregistrer la catégorie', exact: true }).click()
  await expect(dialog.getByText('Sciences', { exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: 'Modifier la catégorie Sciences', exact: true }).click()
  await dialog.getByLabel('Nom de la catégorie').fill('Sciences et idées')
  await dialog.getByRole('button', { name: 'Enregistrer la catégorie', exact: true }).click()
  await expect(dialog.getByText('Sciences et idées', { exact: true })).toBeVisible()
})

test.describe('administration mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('le menu mobile est accessible et sans débordement horizontal', async ({ page }) => {
    await openDashboard(page); await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Administration', exact: true }); await expect(dialog).toBeVisible(); await dialog.getByRole('link', { name: 'Événements', exact: true }).click()
    await expect(dialog).toHaveCount(0); await expect(page).toHaveURL('/admin/evenements'); await expect(page.getByRole('heading', { level: 1, name: 'Événements', exact: true })).toBeVisible(); await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  })
})
