import { expect, test, type Page } from '@playwright/test'

const firstTitle = 'Entreprendre ici, penser plus loin.'
const formationTitle = 'Prendre la parole, prendre sa place.'
const news = (page: Page) => page.getByRole('region', { name: 'Actualités', exact: true })
const filters = (page: Page) => news(page).getByRole('group', { name: 'Filtrer les actualités', exact: true })

async function expectNewsAnchor(page: Page) {
  await expect(page).toHaveURL(/#actualites$/)
  await expect(news(page)).toBeInViewport()
  await expect.poll(async () => {
    const sectionTop = await news(page).evaluate(element => element.getBoundingClientRect().top)
    const headerBottom = await page.locator('header').evaluate(element => element.getBoundingClientRect().bottom)
    return sectionTop >= headerBottom - 1
  }).toBe(true)
  await expect(page.locator('.notification')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('Actualités suit la Hero et présente quatre publications finalisées', async ({ page }) => {
  const section = news(page)
  await section.scrollIntoViewIfNeeded()
  await expect(section).toHaveAttribute('id', 'actualites')
  await expect(section).toHaveAttribute('aria-labelledby', 'news-title')
  await expect(section.getByRole('heading', { level: 2, name: 'Actualités', exact: true })).toBeVisible()
  await expect(page.locator('main > section')).toHaveCount(5)
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

test('Voir toutes les actualités prépare la future page sans ajouter de cartes', async ({ page }) => {
  const section = news(page)
  const allNews = section.getByRole('link', { name: 'Voir toutes les actualités', exact: true })
  await expect(allNews).toHaveAttribute('href', '/actualites')
  await allNews.click()
  await expect(section.getByRole('article')).toHaveCount(4)
  await expect(page).toHaveURL('/')
  await expect(section.getByRole('status')).toContainText('La page de toutes les actualités sera bientôt disponible.')
})

test('un article prépare sa future URL sans ouvrir de fenêtre de lecture', async ({ page }) => {
  const section = news(page)
  const article = section.getByRole('link', { name: firstTitle, exact: true })
  await article.click()
  await expect(page).toHaveURL('/')
  await expect(section.getByRole('status')).toContainText(firstTitle)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
})

test('la navigation active Actualités dans sa section puis réactive Accueil en haut', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const home = navigation.getByRole('link', { name: 'Accueil', exact: true })
  const link = navigation.getByRole('link', { name: 'Actualités', exact: true })
  await expect(link).toHaveAttribute('href', '#actualites')
  await link.click()
  await expectNewsAnchor(page)
  await expect(link).toHaveAttribute('aria-current', 'page')
  await expect(link).toHaveClass(/is-active/)
  await expect(home).not.toHaveAttribute('aria-current')
  await home.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
  await expect(home).toHaveAttribute('aria-current', 'page')
  await expect(link).not.toHaveAttribute('aria-current')
})

test('la recherche mène à Actualités et ferme le dialogue', async ({ page }) => {
  await page.getByRole('button', { name: 'Ouvrir la recherche', exact: true }).click()
  const search = page.getByRole('dialog', { name: 'Que recherchez-vous ?' })
  await search.getByRole('searchbox').fill('actualites')
  await search.getByRole('link', { name: 'Actualités', exact: true }).click()
  await expect(search).toHaveCount(0)
  await expectNewsAnchor(page)
  await expect(page.getByRole('navigation', { name: 'Navigation principale', exact: true }).getByRole('link', { name: 'Actualités', exact: true })).toHaveAttribute('aria-current', 'page')
})

test.describe('Actualités sur mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('le menu mène à Actualités, se ferme et reflète ensuite la section active', async ({ page }) => {
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    let menu = page.getByRole('dialog', { name: 'Menu principal' })
    await menu.getByRole('link', { name: /Actualités/ }).click()
    await expect(menu).toHaveCount(0)
    await expectNewsAnchor(page)
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    menu = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(menu.getByRole('link', { name: /Actualités/ })).toHaveAttribute('aria-current', 'page')
    await page.keyboard.press('Escape')
  })
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
    await expect(news(page).getByRole('status')).toContainText(formationTitle)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
