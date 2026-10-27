import { expect, test, type Page } from '@playwright/test'
import type { HomeData, SiteData, NewsArticle, ArticleSummary } from '../shared/content'

let site: SiteData
let home: HomeData
let sourceArticle: NewsArticle
let articles: ArticleSummary[]
test.beforeAll(async ({ request }) => {
  const [s, h] = await Promise.all([request.get('/api/site'), request.get('/api/home')])
  expect(s.ok()).toBe(true); expect(h.ok()).toBe(true)
  site = await s.json(); home = await h.json()
  const article = await request.get('/api/articles/' + home.articles.items[0].id)
  expect(article.ok()).toBe(true)
  sourceArticle = await article.json()
  articles = Array.from({ length: 20 }, (_, index) => ({
    ...home.articles.items[0], id: 'route-article-' + index, href: '/actualites/route-article-' + index,
    title: 'Article de navigation ' + index, category: site.categories.articles[index % Math.min(2, site.categories.articles.length)].id,
  }))
})
async function mockContent(page: Page) {
  await page.route('**/api/site', route => route.fulfill({ json: site }))
  await page.route('**/api/home', route => route.fulfill({ json: { ...home, articles: { ...home.articles, items: articles.slice(0, 4) } } }))
  await page.route('**/api/articles?*', route => {
    const search = new URL(route.request().url()).searchParams
    const pageNumber = Number(search.get('page') || 1)
    const limit = Number(search.get('limit') || 9)
    const result = articles.filter(item => (!search.get('category') || item.category === search.get('category')) && (!search.get('q') || item.title.toLowerCase().includes(search.get('q')!.toLowerCase())) && item.id !== search.get('exclude'))
    return route.fulfill({ json: { items: result.slice((pageNumber - 1) * limit, pageNumber * limit), pagination: { page: pageNumber, limit, total: result.length, totalPages: Math.ceil(result.length / limit) } } })
  })
  await page.route('**/api/articles/route-article-*', route => {
    const id = new URL(route.request().url()).pathname.split('/').pop()
    const summary = articles.find(item => item.id === id)!
    return route.fulfill({ json: { ...sourceArticle, ...summary } })
  })
}
async function rememberDocument(page: Page) {
  await page.evaluate(() => { (window as unknown as { routerMarker: string }).routerMarker = 'same-document'; document.querySelector('.site-header')?.setAttribute('data-router-marker', 'persistent') })
}
async function expectSameDocument(page: Page) {
  expect(await page.evaluate(() => (window as unknown as { routerMarker: string }).routerMarker)).toBe('same-document')
  await expect(page.locator('.site-header')).toHaveAttribute('data-router-marker', 'persistent')
}

test('navbar, articles, retour et footer naviguent sans recréer le document ni l’en-tête', async ({ page }) => {
  await mockContent(page)
  let siteRequests = 0
  page.on('request', request => { if (new URL(request.url()).pathname === '/api/site') siteRequests++ })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.ocean-hero')).toBeVisible()
  await rememberDocument(page)
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  await navigation.getByRole('link', { name: 'Actualités', exact: true }).click()
  await expect(page).toHaveURL('/actualites')
  await expect(page.locator('.news-index-card')).toHaveCount(9)
  await expectSameDocument(page)
  await expect(navigation.getByRole('link', { name: 'Actualités', exact: true })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('link', { name: 'Article de navigation 0', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Article de navigation 0', exact: true })).toBeVisible()
  await page.locator('.related-grid').getByRole('link', { name: 'Article de navigation 1', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Article de navigation 1', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Retour aux actualités', exact: true }).click()
  await expect(page.locator('.news-index-card')).toHaveCount(9)
  await expectSameDocument(page)
  for (const [label, path] of [['Océan TV', '/ocean-tv'], ['Opportunités', '/opportunites'], ['Formations', '/formations'], ['Événements', '/evenements']]) {
    await navigation.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(path)
    await expect(navigation.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page')
    await expectSameDocument(page)
  }
  await page.getByRole('contentinfo').getByRole('link', { name: 'Actualités', exact: true }).click()
  await expect(page).toHaveURL('/actualites')
  await expectSameDocument(page)
  expect(siteRequests).toBe(1)
})

test('pagination, filtres et historique restaurent les résultats et le défilement', async ({ page }) => {
  await mockContent(page)
  await page.goto('/actualites')
  await expect(page.locator('.news-index-card')).toHaveCount(9)
  await rememberDocument(page)
  await page.getByRole('link', { name: 'Page suivante', exact: true }).click()
  await expect(page).toHaveURL('/actualites?page=2')
  await expect(page.locator('.news-index-card').first()).toContainText('Article de navigation 9')
  const filter = site.categories.articles[0]
  await page.getByRole('button', { name: filter.label, exact: true }).click()
  await expect(page).toHaveURL('/actualites?category=' + encodeURIComponent(filter.id))
  await expect(page.getByRole('button', { name: filter.label, exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.goBack()
  await expect(page).toHaveURL('/actualites?page=2')
  await expect(page.locator('.news-index-card').first()).toContainText('Article de navigation 9')
  await page.goForward()
  await expect(page.getByRole('button', { name: filter.label, exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page).not.toHaveURL(/page=/)
  const search = page.getByRole('searchbox', { name: 'Rechercher dans les actualités', exact: true })
  await search.fill('navigation 0')
  await expect(page.locator('.news-index-card')).toHaveCount(1)
  await search.fill('')
  await expect(page.locator('.news-index-card')).toHaveCount(9)
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }))
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700)
  // Programmatic click avoids scrolling the link into view before storing the history position.
  await page.locator('.news-index-card a').first().evaluate(element => (element as HTMLAnchorElement).click())
  await expect(page.locator('.article-body')).toBeVisible()
  await page.goBack()
  await expect(page.locator('.news-index-card')).toHaveCount(9)
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700)
  await expectSameDocument(page)
})

test('les skeletons restent limités au contenu pendant la navigation', async ({ page }) => {
  await mockContent(page)
  let release: () => void = () => undefined
  const waiting = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/articles?*', async route => { await waiting; await route.fulfill({ json: { items: articles.slice(0, 9), pagination: { page: 1, limit: 9, total: 20, totalPages: 3 } } }) })
  await page.goto('/')
  await expect(page.locator('.ocean-hero')).toBeVisible()
  await rememberDocument(page)
  await page.getByRole('navigation', { name: 'Navigation principale', exact: true }).getByRole('link', { name: 'Actualités', exact: true }).click()
  await expect(page.locator('.news-index-results')).toHaveCount(0)
  await expect(page.locator('.api-skeleton')).toBeVisible()
  await expect(page.locator('.site-header, .site-footer')).toHaveCount(2)
  await expect(page.locator('.brand-loader')).toHaveCount(0)
  await expectSameDocument(page)
  release()
  await expect(page.locator('.news-index-card')).toHaveCount(9)
})

test('mobile : recherche, menu et liens d’ancrage conservent le document', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockContent(page)
  await page.goto('/')
  await expect(page.locator('.ocean-hero')).toBeVisible()
  await rememberDocument(page)
  await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
  await page.getByRole('dialog').getByRole('link', { name: /Formations/ }).click()
  await expect(page).toHaveURL('/formations')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expectSameDocument(page)
  await page.getByRole('link', { name: 'Retour à l’accueil', exact: true }).click()
  await expect(page).toHaveURL('/#formations')
  await expect(page.locator('#formations')).toBeFocused()
  await expectSameDocument(page)
  await page.getByRole('button', { name: 'Ouvrir la recherche', exact: true }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Actualités', exact: true }).click()
  await expect(page).toHaveURL('/actualites')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expectSameDocument(page)
})

test('accès direct, rafraîchissement et adresse introuvable restent fonctionnels', async ({ page }) => {
  await mockContent(page)
  await page.goto('/actualites/route-article-3')
  await expect(page.getByRole('heading', { level: 1, name: 'Article de navigation 3', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Article de navigation 3', exact: true })).toBeVisible()
  await page.goto('/adresse-inconnue')
  await expect(page.getByRole('heading', { name: 'Page introuvable', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Retour à l’accueil', exact: true }).click()
  await expect(page.locator('.ocean-hero')).toBeVisible()
})

test('admin : historique et changement de module sans nouvelle authentification', async ({ page }) => {
  let authenticationRequests = 0
  await page.route('**/api/admin/auth/me', route => { authenticationRequests++; return route.fulfill({ json: { user: { id: 'admin', displayName: 'Administrateur', username: 'admin', email: 'admin@example.test', active: true }, csrfToken: 'router-csrf' } }) })
  const count = { total: 0, published: 0, drafts: 0 }
  await page.route('**/api/admin/overview', route => route.fulfill({ json: { resources: Object.fromEntries(['articles', 'videos', 'opportunities', 'trainings', 'events', 'hero'].map(id => [id, count])) } }))
  await page.route('**/api/admin/categories/*', route => route.fulfill({ json: { items: [] } }))
  await page.route('**/api/admin/content/*?*', route => route.fulfill({ json: { items: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 0 } } }))
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Vos espaces éditoriaux', exact: true })).toBeVisible()
  const initialAuthenticationRequests = authenticationRequests
  await page.evaluate(() => { (window as unknown as { routerMarker: string }).routerMarker = 'admin-document' })
  const navigation = page.getByRole('navigation', { name: 'Navigation de l’administration', exact: true })
  await navigation.getByRole('link', { name: 'Actualités', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Actualités', exact: true })).toBeVisible()
  await navigation.getByRole('link', { name: 'Océan TV', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Océan TV', exact: true })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL('/admin/actualites')
  await expect(page.getByRole('heading', { level: 1, name: 'Actualités', exact: true })).toBeVisible()
  expect(await page.evaluate(() => (window as unknown as { routerMarker: string }).routerMarker)).toBe('admin-document')
  expect(authenticationRequests).toBe(initialAuthenticationRequests)
})
