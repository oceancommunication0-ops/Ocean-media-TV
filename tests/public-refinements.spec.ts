import { expect, test } from '@playwright/test'
import type { HomeData, SiteData } from '../shared/content'

let site: SiteData
let home: HomeData
test.beforeAll(async ({ request }) => {
  const [siteResponse, homeResponse] = await Promise.all([request.get('/api/site'), request.get('/api/home')])
  expect(siteResponse.ok()).toBe(true)
  expect(homeResponse.ok()).toBe(true)
  site = await siteResponse.json()
  home = await homeResponse.json()
})

test('le chargement avec logo est clair et réservé à l’accueil public', async ({ page }) => {
  let release: () => void = () => undefined
  let waiting = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/site', async route => { await waiting; await route.fulfill({ json: site }) })
  await page.route('**/api/home', route => route.fulfill({ json: home }))
  await page.goto('/')
  await expect(page.locator('.brand-loader-light')).toBeVisible()
  await expect(page.locator('.brand-loader')).toHaveCSS('background-color', 'rgb(248, 250, 251)')
  await expect(page.locator('header')).toHaveCount(0)
  release()
  await expect(page.locator('.ocean-hero')).toBeVisible()
  for (const path of ['/actualites', '/ocean-tv', '/opportunites', '/formations', '/evenements', '/actualites/' + home.articles.items[0].id]) {
    waiting = new Promise<void>(resolve => { release = resolve })
    await page.goto(path)
    await expect(page.locator('.api-page-skeleton')).toBeVisible()
    await expect(page.locator('.brand-loader, .initial-loader.is-branded')).toHaveCount(0)
    release()
    await expect(page.locator('.site-footer')).toBeAttached()
  }
})

for (const width of [320, 390, 768, 1024, 1440]) test(`les cartes secondaires gardent leur contenu et leurs dimensions à ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 })
  const template = home.articles.items[0]
  let count = 4
  const articles = Array.from({ length: 4 }, (_, index) => ({
    ...template, id: 'article-' + index, title: index ? 'Des initiatives concrètes pour transformer les ambitions de la jeunesse congolaise.' : template.title,
    excerpt: 'Des jeunes mettent leurs idées en commun, développent leurs compétences et construisent des projets utiles à leur communauté.',
  }))
  await page.route('**/api/site', route => route.fulfill({ json: site }))
  await page.route('**/api/home', route => route.fulfill({ json: { ...home, articles: { ...home.articles, items: articles.slice(0, count) } } }))
  let referenceHeight = 0
  for (count of [4, 2, 3]) {
    await page.goto('/')
    const cards = page.locator('.news-secondary-list .news-card-link')
    await expect(cards).toHaveCount(count - 1)
    await page.evaluate(() => document.fonts.ready.then(() => undefined))
    if (width < 900) {
      for (const card of await cards.all()) {
        await expect(card.locator('.news-excerpt')).toBeVisible()
        await expect(card.locator('.news-format')).toBeVisible()
        await expect(card.locator('.news-meta > span:first-child')).toBeVisible()
        await expect(card.locator('.news-meta time')).toBeVisible()
        expect(await card.locator('.news-card-cta').evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(0)
      }
    }
    if (width === 390 && count === 4) await cards.first().screenshot({ path: 'test-results/news-secondary-mobile.png' })
    if (width === 1440 && count === 4) await page.locator('.news-grid').screenshot({ path: 'test-results/news-secondary-layout.png' })
    const measurements = await cards.evaluateAll(elements => elements.map(element => {
      const card = element.getBoundingClientRect()
      const copy = element.querySelector('.news-card-copy')!
      const cta = element.querySelector('.news-card-cta')!.getBoundingClientRect()
      return { height: card.height, ctaInside: cta.bottom <= card.bottom + 1, noOverflow: copy.scrollHeight <= copy.clientHeight + 1 }
    }))
    for (const value of measurements) {
      expect(value.ctaInside).toBe(true)
      expect(value.noOverflow).toBe(true)
      if (!referenceHeight) referenceHeight = value.height
      expect(Math.abs(value.height - referenceHeight)).toBeLessThan(3)
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  }
})

test('les textes retirés et le bouton de la Hero correspondent au nouveau parcours', async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }))
  await page.route('**/api/home', route => route.fulfill({ json: home }))
  await page.goto('/')
  await expect(page.locator('.ocean-hero')).toBeVisible()
  await expect(page.locator('.hero-photo-label, .hero-photo-side-label')).toHaveCount(0)
  await page.getByRole('button', { name: 'Découvrir les actualités', exact: true }).click()
  await expect(page.locator('#actualites')).toBeFocused()
  await expect(page.locator('#news-title')).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Informations & crédits' })).toHaveCount(0)
  await expect(page.locator('.footer-info-dialog')).toHaveCount(0)
  await page.goto('/formations')
  await expect(page.locator('.trainings-hero')).toBeVisible()
  await expect(page.locator('.trainings-hero-facts, .trainings-program-note')).toHaveCount(0)
  await page.goto('/ocean-tv')
  await expect(page.locator('.otv-results-line')).toBeAttached()
  await expect(page.locator('.otv-results-line')).not.toContainText('UNE SÉLECTION POUR COMPRENDRE')
})
