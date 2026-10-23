import { expect, test } from '@playwright/test'

const path = '/actualites/entreprendre-ici'
const title = 'Entreprendre ici, penser plus loin.'

test.beforeEach(async ({ page }) => {
  await page.goto(path)
})

test('la page compose une expérience journalistique complète et sémantique', async ({ page }) => {
  await expect(page).toHaveTitle(`${title} | Océan Média TV`)
  const main = page.getByRole('main', { name: `Article : ${title}` })
  await expect(main.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
  await expect(main.getByText('De l’idée au premier pas', { exact: false })).toBeVisible()
  await expect(main.getByText('La rédaction', { exact: true }).first()).toBeVisible()
  await expect(main.getByText('22 octobre 2026', { exact: true })).toBeVisible()
  await expect(main.getByText('4 min de lecture', { exact: true })).toBeVisible()
  await expect(main.getByRole('heading', { level: 2, name: 'Tester avant de vouloir grandir', exact: true })).toBeVisible()
  await expect(main.getByRole('heading', { level: 2, name: 'La force des bonnes rencontres', exact: true })).toBeVisible()
  await expect(main.getByRole('heading', { level: 2, name: 'Avancer avec méthode', exact: true })).toBeVisible()
  await expect(main.getByRole('heading', { level: 2, name: 'À retenir', exact: true })).toBeVisible()
  await expect(main.getByText('Une idée gagne en force lorsqu’elle rencontre le réel', { exact: false })).toBeVisible()
  await expect(main.getByRole('img')).toHaveCount(5)
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

test('le Header identifie Actualités et permet de revenir à la rubrique', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const newsLink = navigation.getByRole('link', { name: 'Actualités', exact: true })
  await expect(newsLink).toHaveAttribute('href', '/#actualites')
  await expect(newsLink).toHaveAttribute('aria-current', 'page')
  await newsLink.click()
  await expect(page).toHaveURL(/\/#actualites$/)
  await expect(page.getByRole('region', { name: 'Actualités', exact: true })).toBeInViewport()
})

test('la progression de lecture suit le défilement', async ({ page }) => {
  const bar = page.locator('.article-progress span')
  await expect(bar).toHaveAttribute('style', /scaleX\(0\)/)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect.poll(async () => await bar.getAttribute('style')).toMatch(/scaleX\((0\.9|1)/)
})

test('le partage copie le lien et l’impression reste disponible', async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => undefined } })
  })
  await page.getByRole('button', { name: 'Copier le lien de l’article', exact: true }).click()
  await expect(page.locator('.article-notice')).toContainText('Le lien de l’article a été copié.')
  await expect(page.getByRole('button', { name: 'Imprimer l’article', exact: true })).toBeVisible()
  const whatsapp = page.getByRole('link', { name: 'Partager l’article sur WhatsApp', exact: true })
  await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=/)
  await expect(whatsapp).toHaveAttribute('target', '_blank')
})

test('les recommandations mènent vers les autres articles complets', async ({ page }) => {
  const related = page.getByRole('region', { name: 'À découvrir ensuite.' })
  await expect(related.getByRole('article')).toHaveCount(3)
  await related.getByRole('link', { name: 'Prendre la parole, prendre sa place.', exact: true }).click()
  await expect(page).toHaveURL('/actualites/prendre-la-parole')
  await expect(page.getByRole('heading', { level: 1, name: 'Prendre la parole, prendre sa place.', exact: true })).toBeVisible()
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`la lecture reste fluide et sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    for (const control of await page.locator('.article-share').getByRole('button').all()) {
      const box = await control.boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(42)
    }
    await page.locator('.article-summary').scrollIntoViewIfNeeded()
    await expect(page.getByRole('heading', { level: 2, name: 'À retenir', exact: true })).toBeVisible()
  })
}

test('toutes les publications disposent de leur page de lecture', async ({ page }) => {
  for (const slug of ['entreprendre-ici', 'prendre-la-parole', 'generation-initiatives', 'reperer-opportunites', 'apprendre-ensemble', 'du-croquis-au-projet']) {
    await page.goto(`/actualites/${slug}`)
    await expect(page.locator('main.article-page h1')).toHaveCount(1)
    await expect(page.locator('.article-body')).toBeVisible()
    await expect(page.locator('.article-summary')).toBeVisible()
  }
})
