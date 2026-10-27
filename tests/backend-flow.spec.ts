import { expect, test } from '@playwright/test'

test('l’accueil montre le logo et les trois traits avant le navbar et le contenu', async ({ page, request }) => {
  const [site, home] = await Promise.all([request.get('/api/site'), request.get('/api/home')])
  expect(site.ok()).toBe(true)
  expect(home.ok()).toBe(true)
  const [siteData, homeData] = await Promise.all([site.json(), home.json()])
  let release: () => void = () => undefined
  const ready = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/site', route => route.fulfill({ json: siteData }))
  await page.route('**/api/home', async route => { await ready; await route.fulfill({ json: homeData }) })
  await page.goto('/')
  await expect(page.locator('.brand-loader')).toBeVisible()
  await expect(page.locator('.brand-loader-lines > span')).toHaveCount(3)
  await expect(page.getByRole('navigation', { name: 'Navigation principale', exact: true })).toHaveCount(0)
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
  release()
  await expect(page.getByRole('navigation', { name: 'Navigation principale', exact: true })).toBeVisible()
  await expect(page.locator('#actualites article')).toHaveCount(4)
  await expect(page.locator('.brand-loader')).toHaveCount(0)
})

test('l’accueil charge un seul lot borné puis filtre côté API', async ({ page }) => {
  const calls: string[] = []
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) calls.push(new URL(request.url()).pathname + new URL(request.url()).search) })
  await page.goto('/')
  await expect(page.locator('#actualites article')).toHaveCount(4)
  await expect(page.locator('#ocean-tv article')).toHaveCount(4)
  await expect(page.locator('#opportunites article')).toHaveCount(3)
  await expect(page.locator('#formations article')).toHaveCount(6)
  await expect(page.locator('#evenements article')).toHaveCount(3)
  expect(calls.filter(path => path === '/api/home')).toHaveLength(1)
  expect(calls.filter(path => path.startsWith('/api/articles?'))).toHaveLength(0)
  expect(calls.filter(path => path.startsWith('/api/opportunities/'))).toHaveLength(0)
  const response = page.waitForResponse(response => response.url().includes('/api/opportunities?') && response.url().includes('category=emploi'))
  await page.locator('#opportunites').getByRole('button', { name: 'Emploi', exact: true }).click()
  const payload = await (await response).json()
  expect(payload.pagination.limit).toBe(3)
  await expect(page.locator('#opportunites article')).toHaveCount(2)
})

test('le portail demande neuf opportunités par page et réinitialise la page lors du filtrage', async ({ page }) => {
  const catalogueRequest = page.waitForRequest(request => request.url().includes('/api/opportunities?'))
  await page.goto('/opportunites')
  expect(new URL((await catalogueRequest).url()).searchParams.get('limit')).toBe('9')
  await expect(page.locator('.op-index-card')).toHaveCount(9)
  await expect(page.getByRole('navigation', { name: 'Pagination', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Emploi', exact: true }).click()
  await expect(page.locator('.op-index-card')).toHaveCount(2)
  await expect(page).toHaveURL(/category=emploi/)
  expect(new URL(page.url()).searchParams.has('page')).toBe(false)
  await expect(page.getByRole('navigation', { name: 'Pagination', exact: true })).toHaveCount(0)
})

test('la vidéothèque demande jusqu’à neuf vidéos par page', async ({ page }) => {
  const catalogueRequest = page.waitForRequest(request => {
    const url = new URL(request.url())
    return url.pathname === '/api/videos' && url.searchParams.get('limit') === '9'
  })
  await page.goto('/ocean-tv')
  expect(new URL((await catalogueRequest).url()).searchParams.get('limit')).toBe('9')
  await expect(page.locator('.otv-catalogue-card')).toHaveCount(8)
  await expect(page.getByRole('navigation', { name: 'Pagination', exact: true })).toHaveCount(0)
})

test('les détails d’une opportunité sont demandés uniquement à l’ouverture', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => { if (request.url().includes('/api/opportunities/')) requests.push(request.url()) })
  await page.goto('/opportunites')
  const trigger = page.getByRole('button', { name: 'Chargé·e de communication digitale', exact: true })
  await expect(trigger).toBeVisible()
  expect(requests).toHaveLength(0)
  await trigger.click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Profil recherché' })).toBeVisible()
  expect(requests).toHaveLength(1)
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('une indisponibilité API propose de réessayer sans contenu local', async ({ page }) => {
  await page.route('**/api/home', route => route.fulfill({ status: 503, json: { error: { message: 'Le service est momentanément indisponible.' } } }))
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('momentanément indisponible')
  await expect(page.locator('#actualites article')).toHaveCount(0)
  await page.unroute('**/api/home')
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click()
  await expect(page.locator('#actualites article')).toHaveCount(4)
})

test('un article inconnu affiche une page introuvable', async ({ page }) => {
  await page.goto('/actualites/article-inexistant-99999')
  await expect(page.getByRole('heading', { level: 1, name: 'Article introuvable' })).toBeVisible()
  await expect(page.locator('.ocean-hero')).toHaveCount(0)
})

