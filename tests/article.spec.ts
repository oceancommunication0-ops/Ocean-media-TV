import { expect, test } from '@playwright/test'

import type { ArticleSummary, NewsArticle } from '../shared/content'
let path: string
let title: string
let article: NewsArticle
let articles: ArticleSummary[]
test.beforeAll(async ({ request }) => {
  articles = (await (await request.get('/api/articles?limit=24')).json()).items
  const selected = articles.find(item => item.id === 'du-croquis-au-projet') ?? articles[0]
  article = await (await request.get('/api/articles/' + selected.id)).json()
  path = article.href
  title = article.title
})

test.beforeEach(async ({ page }) => {
  await page.goto(path)
})

test('la page compose une expérience journalistique complète et sémantique', async ({ page }) => {
  await expect(page).toHaveTitle(`${title} | Océan Média TV`)
  const main = page.getByRole('main', { name: `Article : ${title}` })
  await expect(main.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
  await expect(main.getByText(article.excerpt, { exact: true })).toBeVisible()
  await expect(main.getByText('La rédaction', { exact: true }).first()).toBeVisible()
  await expect(main.getByText(new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(article.publishedAt!)), { exact: true })).toBeVisible()
  await expect(main.getByText(/min de lecture/)).toHaveCount(0)
  for (const heading of article.content.content.filter(node => node.type === 'heading')) {
    await expect(main.getByRole('heading', { name: heading.content?.map(node => node.text ?? '').join(''), exact: true })).toBeVisible()
  }
  await expect(main.getByRole('heading', { level: 2, name: 'À retenir', exact: true })).toHaveCount(0)
  await expect(main.locator('.article-document blockquote')).toHaveCount(article.content.content.filter(node => node.type === 'blockquote').length)
  await expect(main.getByRole('img')).toHaveCount(1 + article.content.content.filter(node => node.type === 'image').length + Math.min(3, articles.length - 1))
  for (const image of await main.getByRole('img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect(image).toHaveAttribute('alt', /\S/)
    await expect.poll(() => image.evaluate(element => {
      const current = element as HTMLImageElement
      return current.complete && current.naturalWidth > 0
    })).toBe(true)
  }
  await expect(page.getByRole('contentinfo')).toBeVisible()
})

test('le Header identifie Actualités et mène à la page principale', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const newsLink = navigation.getByRole('link', { name: 'Actualités', exact: true })
  await expect(newsLink).toHaveAttribute('href', '/actualites')
  await expect(newsLink).toHaveAttribute('aria-current', 'page')
  await newsLink.click()
  await expect(page).toHaveURL('/actualites')
  await expect(page.getByRole('main', { name: 'Page des actualités', exact: true })).toBeVisible()
})

test('Retour aux actualités et Toutes les actualités mènent à la page principale', async ({ page }) => {
  const back = page.getByRole('link', { name: 'Retour aux actualités', exact: true })
  await expect(back).toHaveAttribute('href', '/actualites')
  await back.click()
  await expect(page).toHaveURL('/actualites')
  await expect(page.getByRole('main', { name: 'Page des actualités', exact: true })).toBeVisible()

  await page.goto(path)
  const allNews = page.getByRole('link', { name: 'Toutes les actualités', exact: true })
  await expect(allNews).toHaveAttribute('href', '/actualites')
  await allNews.click()
  await expect(page).toHaveURL('/actualites')
})

test('la progression de lecture suit le défilement', async ({ page }) => {
  const bar = page.locator('.article-progress span')
  await expect(bar).toHaveAttribute('style', /scaleX\(0\)/)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect.poll(async () => await bar.getAttribute('style')).toMatch(/scaleX\((0\.9|1)/)
})

test('le partage conserve uniquement WhatsApp', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Copier|Imprimer/ })).toHaveCount(0)
  const whatsapp = page.getByRole('link', { name: 'Partager l’article sur WhatsApp', exact: true })
  await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=/)
  await expect(whatsapp).toHaveAttribute('target', '_blank')
})

test('les recommandations mènent vers les autres articles complets', async ({ page }) => {
  const related = page.getByRole('region', { name: 'À découvrir ensuite.' })
  await expect(related.getByRole('article')).toHaveCount(3)
  const recommendation = articles.find(item => item.id !== article.id)!
  await related.getByRole('link', { name: recommendation.title, exact: true }).click()
  await expect(page).toHaveURL(recommendation.href)
  await expect(page.getByRole('heading', { level: 1, name: recommendation.title, exact: true })).toBeVisible()
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`la lecture reste fluide et sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    await expect(page.locator('.article-summary')).toHaveCount(0)
    await expect(page.locator('.article-hero-media figcaption')).toHaveCount(0)
  })
}

test('toutes les publications disposent de leur page de lecture', async ({ page }) => {
  for (const item of articles) {
    await page.goto(item.href)
    await expect(page.locator('main.article-page h1')).toHaveCount(1)
    await expect(page.locator('.article-body')).toBeVisible()
    await expect(page.locator('.article-summary')).toHaveCount(0)
  }
})
