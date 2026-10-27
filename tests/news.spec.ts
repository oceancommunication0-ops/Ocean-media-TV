import { expect, test, type Page } from '@playwright/test'

const firstTitle = 'Entreprendre ici, penser plus loin.'
const formationTitle = 'Prendre la parole, prendre sa place.'
const news = (page: Page) => page.getByRole('region', { name: 'Actualités', exact: true })
const filters = (page: Page) => news(page).getByRole('group', { name: 'Filtrer les actualités', exact: true })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('Actualités suit la Hero et présente quatre publications finalisées', async ({ page }) => {
  const section = news(page)
  await section.scrollIntoViewIfNeeded()
  await expect(section).toHaveAttribute('id', 'actualites')
  await expect(section).toHaveAttribute('aria-labelledby', 'news-title')
  await expect(section.getByRole('heading', { level: 2, name: 'Actualités', exact: true })).toBeVisible()
  await expect(page.locator('main > section')).toHaveCount(6)
  expect(await page.locator('main > section').nth(1).getAttribute('id')).toBe('actualites')
  await expect(section.getByText(/Exemple éditorial|Contenus de démonstration|Article de démonstration/i)).toHaveCount(0)
  await expect(section.getByRole('article')).toHaveCount(4)
  await expect(section.getByRole('link', { name: firstTitle, exact: true })).toHaveAttribute('href', '/actualites/entreprendre-ici')
  await expect(section.getByText('La rédaction', { exact: true }).first()).toBeVisible()
  await expect(section.getByText('22 oct. 2026', { exact: true })).toBeVisible()

  for (const article of await section.getByRole('article').all()) {
    const image = article.getByRole('img')
    await image.scrollIntoViewIfNeeded()
    await expect(image).toHaveAttribute('alt', /\S/)
    expect(await image.getAttribute('src')).toMatch(/^\/images\//)
    await expect(article.getByRole('link')).toHaveAttribute('href', /^\/actualites\//)
    await expect.poll(() => image.evaluate(element => {
      const image = element as HTMLImageElement
      return image.complete && image.naturalWidth > 0
    })).toBe(true)
  }
})

test('les filtres actualisent les cartes et exposent leur état', async ({ page }) => {
  const section = news(page)
  for (const [category, count] of [
    ['Entrepreneuriat', 2], ['Formation', 2], ['Initiatives', 1], ['Opportunités', 1],
  ] as const) {
    const filter = filters(page).getByRole('button', { name: category, exact: true })
    await filter.click()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(filters(page).locator('[aria-pressed="true"]')).toHaveCount(1)
    await expect(section.getByRole('article')).toHaveCount(count)
    for (const article of await section.getByRole('article').all()) await expect(article).toContainText(category)
  }
  await filters(page).getByRole('button', { name: 'Tout voir', exact: true }).click()
  await expect(section.getByRole('article')).toHaveCount(4)
})

test('Voir toutes les actualités ouvre la page éditoriale dédiée', async ({ page }) => {
  const section = news(page)
  const allNews = section.getByRole('link', { name: 'Voir toutes les actualités', exact: true })
  await expect(allNews).toHaveAttribute('href', '/actualites')
  await allNews.click()
  await expect(page).toHaveURL('/actualites')
  await expect(page.getByRole('main', { name: 'Page des actualités', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: /Actualités.*Idées & perspectives/ })).toBeVisible()
})

test('un article ouvre sa page complète de lecture', async ({ page }) => {
  const section = news(page)
  const article = section.getByRole('link', { name: firstTitle, exact: true })
  await article.click()
  await expect(page).toHaveURL('/actualites/entreprendre-ici')
  await expect(page.getByRole('main', { name: `Article : ${firstTitle}` })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: firstTitle, exact: true })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('la navigation ouvre directement la page Actualités et active la rubrique', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const link = navigation.getByRole('link', { name: 'Actualités', exact: true })
  await expect(link).toHaveAttribute('href', '/actualites')
  await link.click()
  await expect(page).toHaveURL('/actualites')
  const pageNavigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  await expect(pageNavigation.getByRole('link', { name: 'Actualités', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(pageNavigation.getByRole('link', { name: 'Accueil', exact: true })).not.toHaveAttribute('aria-current')
})

test('la recherche mène à Actualités et ferme le dialogue', async ({ page }) => {
  await page.getByRole('button', { name: 'Ouvrir la recherche', exact: true }).click()
  const search = page.getByRole('dialog', { name: 'Que recherchez-vous ?' })
  await search.getByRole('searchbox').fill('actualites')
  await search.getByRole('link', { name: 'Actualités', exact: true }).click()
  await expect(search).toHaveCount(0)
  await expect(page).toHaveURL('/actualites')
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  await expect(navigation.getByRole('link', { name: 'Actualités', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(navigation.getByRole('link', { name: 'Accueil', exact: true })).not.toHaveAttribute('aria-current')
})

test.describe('Actualités sur mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('le menu mène à la page Actualités et active sa rubrique', async ({ page }) => {
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    let menu = page.getByRole('dialog', { name: 'Menu principal' })
    await menu.getByRole('link', { name: /Actualités/ }).click()
    await expect(menu).toHaveCount(0)
    await expect(page).toHaveURL('/actualites')
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    menu = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(menu.getByRole('link', { name: /Actualités/ })).toHaveAttribute('aria-current', 'page')
    await expect(menu.getByRole('navigation', { name: 'Navigation mobile' }).getByRole('link', { name: /Accueil/ })).not.toHaveAttribute('aria-current')
    await page.keyboard.press('Escape')
  })
})

test('une seule actualité secondaire conserve son format compact en haut de colonne', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const section = news(page)
  await section.getByRole('button', { name: 'Formation', exact: true }).click()
  const secondary = section.locator('.news-secondary-list .news-card')
  await expect(secondary).toHaveCount(1)
  const cardBox = await secondary.boundingBox()
  const columnBox = await section.locator('.news-secondary-list').boundingBox()
  expect(cardBox).not.toBeNull()
  expect(columnBox).not.toBeNull()
  expect(cardBox!.height).toBeLessThan(220)
  expect(cardBox!.y).toBeCloseTo(columnBox!.y, 0)
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`les cartes Actualités restent lisibles sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await news(page).scrollIntoViewIfNeeded()
    await expect(news(page).getByRole('heading', { name: 'Actualités', exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    for (const filter of await filters(page).getByRole('button').all()) {
      const bounds = await filter.boundingBox()
      expect(bounds?.height).toBeGreaterThanOrEqual(40)
    }
    await expect(news(page).getByRole('link', { name: firstTitle, exact: true })).toBeVisible()
    await expect(news(page).getByRole('link', { name: formationTitle, exact: true })).toBeVisible()
  })
}

test.describe('Actualités et réduction des mouvements', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

  test('les filtres et les liens restent fonctionnels au clavier', async ({ page }) => {
    expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
    const filter = filters(page).getByRole('button', { name: 'Formation', exact: true })
    await filter.focus()
    await page.keyboard.press('Space')
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(news(page).getByRole('article')).toHaveCount(2)
    const article = news(page).getByRole('link', { name: formationTitle, exact: true })
    await article.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/actualites/prendre-la-parole')
    await expect(page.getByRole('heading', { level: 1, name: formationTitle, exact: true })).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
