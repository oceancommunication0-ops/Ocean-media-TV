import { expect, test } from '@playwright/test'

const firstTitle = 'Entreprendre ici, penser plus loin.'

test.beforeEach(async ({ page }) => {
  await page.goto('/actualites')
})

test('la page Actualités commence directement par toutes les publications', async ({ page }) => {
  await expect(page).toHaveTitle('Actualités | Océan Média TV')
  const main = page.getByRole('main', { name: 'Page des actualités', exact: true })
  await expect(main.getByRole('heading', { level: 1, name: /Actualités.*Idées & perspectives/ })).toBeVisible()
  await expect(main.locator('.news-index-spotlight, .news-index-card-lead, .news-index-card-side')).toHaveCount(0)
  await expect(main.locator('.news-index-card-grid')).toHaveCount(6)
  await expect(main.getByRole('article')).toHaveCount(6)
  await expect(main.getByRole('link', { name: firstTitle, exact: true })).toHaveAttribute('href', '/actualites/entreprendre-ici')
  await expect(page.getByRole('contentinfo')).toBeVisible()
})

test('la recherche filtre les titres, extraits et catégories sans accents', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Rechercher dans les actualités', exact: true })
  await search.fill('conviction')
  await expect(page.locator('.news-index-results').getByRole('article')).toHaveCount(1)
  await expect(page.locator('.news-index-results')).toContainText('Prendre la parole, prendre sa place.')
  await expect(page.locator('.news-index-toolbar').getByRole('status')).toHaveText('1 résultat')
  await page.getByRole('button', { name: 'Effacer la recherche', exact: true }).click()
  await expect(search).toHaveValue('')
  await expect(page.locator('.news-index-results').getByRole('article')).toHaveCount(6)
})

test('les catégories se combinent avec la recherche et l’état vide se réinitialise', async ({ page }) => {
  const filters = page.getByRole('group', { name: 'Filtrer toutes les actualités', exact: true })
  const formation = filters.getByRole('button', { name: 'Formation', exact: true })
  await formation.click()
  await expect(formation).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.news-index-results').getByRole('article')).toHaveCount(2)
  await page.getByRole('searchbox').fill('introuvable')
  await expect(page.getByRole('heading', { name: 'Aucune publication ne correspond.', exact: true })).toBeVisible()
  await expect(page.locator('.news-index-toolbar').getByRole('status')).toHaveText('0 résultat')
  await page.getByRole('button', { name: 'Réinitialiser les filtres', exact: true }).click()
  await expect(filters.getByRole('button', { name: 'Tout voir', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.news-index-results').getByRole('article')).toHaveCount(6)
})

test('les cartes ouvrent les pages complètes de lecture', async ({ page }) => {
  await page.getByRole('link', { name: firstTitle, exact: true }).click()
  await expect(page).toHaveURL('/actualites/entreprendre-ici')
  await expect(page.getByRole('heading', { level: 1, name: firstTitle, exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Retour aux actualités', exact: true })).toHaveAttribute('href', '/actualites')
})

test('Actualités reste actif dans le Header et les autres rubriques retournent à l’accueil', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const current = navigation.getByRole('link', { name: 'Actualités', exact: true })
  await expect(current).toHaveAttribute('href', '/actualites')
  await expect(current).toHaveAttribute('aria-current', 'page')
  const training = navigation.getByRole('link', { name: 'Formations', exact: true })
  await expect(training).toHaveAttribute('href', '/formations')
  await training.click()
  await expect(page).toHaveURL(/\/formations$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Des compétences pour prendre sa place.', exact: true })).toBeVisible()
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`la page Actualités reste lisible et sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    await page.getByRole('heading', { name: 'Toutes les actualités.', exact: true }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('searchbox')).toBeVisible()
    for (const button of await page.getByRole('group', { name: 'Filtrer toutes les actualités' }).getByRole('button').all()) {
      const box = await button.boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
    }
  })
}

test.describe('Actualités avec mouvements réduits', () => {
  test.use({ reducedMotion: 'reduce' })

  test('les filtres restent utilisables au clavier sans animation imposée', async ({ page }) => {
    const initiatives = page.getByRole('button', { name: 'Initiatives', exact: true })
    await initiatives.focus()
    await page.keyboard.press('Space')
    await expect(initiatives).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.news-index-results').getByRole('article')).toHaveCount(1)
    expect(await page.locator('.news-index-results').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
  })
})
