import { expect, test, type Page } from '@playwright/test'

const section = (page: Page) => page.getByRole('region', { name: 'Opportunités', exact: true })
const categories = (page: Page) => section(page).getByRole('group', { name: 'Explorer les catégories d’opportunités', exact: true })
const categoryNames = ['Emploi', 'Formations', 'Entrepreneuriat', 'Financements', 'Rencontres', 'Innovation']

async function expectAnchor(page: Page) {
  await expect(page).toHaveURL(/#opportunites$/)
  await expect(section(page)).toBeInViewport()
  await expect.poll(async () => {
    const top = await section(page).evaluate(element => element.getBoundingClientRect().top)
    const headerBottom = await page.locator('header').evaluate(element => element.getBoundingClientRect().bottom)
    return top >= headerBottom - 1
  }).toBe(true)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('Opportunités suit Océan TV et présente six catégories et trois annonces', async ({ page }) => {
  const opportunities = section(page)
  await opportunities.scrollIntoViewIfNeeded()
  await expect(opportunities).toHaveAttribute('id', 'opportunites')
  await expect(opportunities).toHaveAttribute('aria-labelledby', 'opportunities-title')
  await expect(opportunities.getByRole('heading', { level: 2, name: 'Opportunités', exact: true })).toBeVisible()
  await expect(page.locator('main > section')).toHaveCount(5)
  expect(await page.locator('main > section').nth(3).getAttribute('id')).toBe('opportunites')
  await expect(categories(page).getByRole('button')).toHaveCount(6)
  await expect(categories(page).locator('[aria-pressed="true"]')).toHaveCount(0)
  for (const name of categoryNames) await expect(categories(page).getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(opportunities.getByRole('article')).toHaveCount(3)
  await expect(opportunities.getByText(/annonces de présentation/i)).toBeVisible()
  for (const article of await opportunities.getByRole('article').all()) {
    await expect(article.getByRole('heading', { level: 4 })).toHaveText(/\S/)
    await expect(article.getByRole('link').first()).toHaveAttribute('href', /^\/opportunites\/[\w-]+$/)
    await expect(article.locator('time')).toHaveCount(0)
  }
})

test('chaque catégorie filtre les annonces et Tout voir rétablit la sélection', async ({ page }) => {
  for (const name of categoryNames) {
    const category = categories(page).getByRole('button', { name, exact: true })
    await category.click()
    await expect(category).toHaveAttribute('aria-pressed', 'true')
    await expect(categories(page).locator('[aria-pressed="true"]')).toHaveCount(1)
    await expect(section(page).getByRole('article')).toHaveCount(1)
  }
  await section(page).getByRole('button', { name: 'Tout voir', exact: true }).click()
  await expect(categories(page).locator('[aria-pressed="true"]')).toHaveCount(0)
  await expect(section(page).getByRole('article')).toHaveCount(3)
})

test('les annonces et Toutes les opportunités préparent leurs futures pages sans navigation', async ({ page }) => {
  const opportunities = section(page)
  const first = opportunities.getByRole('article').first().getByRole('link').first()
  await first.click()
  await expect(page).toHaveURL('/')
  await expect(opportunities.locator('.opportunities-notice')).toHaveText(/\S/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const all = opportunities.getByRole('link', { name: 'Toutes les opportunités', exact: true })
  await expect(all).toHaveAttribute('href', '/opportunites')
  await all.click()
  await expect(page).toHaveURL('/')
  await expect(opportunities.getByRole('article')).toHaveCount(3)
  await expect(opportunities.locator('.opportunities-notice')).toHaveText(/\S/)
})

test('la navigation active Opportunités dans sa section puis les rubriques précédentes', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const link = navigation.getByRole('link', { name: 'Opportunités', exact: true })
  await expect(link).toHaveAttribute('href', '#opportunites')
  await link.click()
  await expectAnchor(page)
  await expect(link).toHaveAttribute('aria-current', 'page')
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1)
  const tv = navigation.getByRole('link', { name: 'Océan TV', exact: true })
  await tv.click()
  await expect(tv).toHaveAttribute('aria-current', 'page')
  await expect(link).not.toHaveAttribute('aria-current')
  await navigation.getByRole('link', { name: 'Accueil', exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
  await expect(navigation.getByRole('link', { name: 'Accueil', exact: true })).toHaveAttribute('aria-current', 'page')
})

test('la recherche sans accents mène à Opportunités et ferme le dialogue', async ({ page }) => {
  await page.getByRole('button', { name: 'Ouvrir la recherche', exact: true }).click()
  const search = page.getByRole('dialog', { name: 'Que recherchez-vous ?' })
  await search.getByRole('searchbox').fill('opportunites')
  await search.getByRole('link', { name: 'Opportunités', exact: true }).click()
  await expect(search).toHaveCount(0)
  await expectAnchor(page)
  await expect(section(page)).toBeFocused()
})

test.describe('Opportunités sur mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('le menu mène à Opportunités et conserve la rubrique active', async ({ page }) => {
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    let menu = page.getByRole('dialog', { name: 'Menu principal' })
    await menu.getByRole('link', { name: /Opportunités/ }).click()
    await expect(menu).toHaveCount(0)
    await expectAnchor(page)
    await expect(section(page)).toBeFocused()
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    menu = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(menu.getByRole('link', { name: /Opportunités/ })).toHaveAttribute('aria-current', 'page')
    await page.keyboard.press('Escape')
  })
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`les catégories et annonces restent lisibles sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await section(page).scrollIntoViewIfNeeded()
    await expect(section(page).getByRole('heading', { level: 2, name: 'Opportunités', exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    for (const button of await categories(page).getByRole('button').all()) {
      const bounds = await button.boundingBox()
      expect(bounds?.height).toBeGreaterThanOrEqual(44)
      expect(bounds?.width).toBeGreaterThanOrEqual(44)
    }
    for (const article of await section(page).getByRole('article').all()) {
      const bounds = await article.boundingBox()
      expect(bounds?.width).toBeGreaterThan(250)
      await expect(article.getByRole('heading', { level: 4 })).toBeVisible()
    }
  })
}

test.describe('Opportunités et réduction des mouvements', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

  test('les filtres et futures annonces restent utilisables au clavier', async ({ page }) => {
    expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
    const filter = categories(page).getByRole('button', { name: 'Formations', exact: true })
    await filter.focus()
    await page.keyboard.press('Space')
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(filter).toBeFocused()
    await expect(section(page).getByRole('article')).toHaveCount(1)
    const link = section(page).getByRole('article').getByRole('link').first()
    await link.focus()
    await page.keyboard.press('Enter')
    await expect(link).toBeFocused()
    await expect(section(page).locator('.opportunities-notice')).toHaveText(/\S/)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page).toHaveURL('/')
  })
})
