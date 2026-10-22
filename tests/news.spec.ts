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

test('Actualités suit la Hero, signale les exemples et charge ses photographies locales', async ({ page }) => {
  const section = news(page)
  await section.scrollIntoViewIfNeeded()
  await expect(section).toHaveAttribute('id', 'actualites')
  await expect(section).toHaveAttribute('aria-labelledby', 'news-title')
  await expect(section.getByRole('heading', { level: 2, name: 'Actualités', exact: true })).toBeVisible()
  await expect(page.locator('main > section')).toHaveCount(2)
  expect(await page.locator('main > section').nth(1).getAttribute('id')).toBe('actualites')
  await expect(section.getByText('Contenus de démonstration', { exact: true })).toBeVisible()
  await expect(section.getByRole('article')).toHaveCount(4)
  await expect(section.getByRole('button', { name: firstTitle, exact: true })).toBeVisible()

  for (const article of await section.getByRole('article').all()) {
    const image = article.getByRole('img')
    await image.scrollIntoViewIfNeeded()
    await expect(image).toHaveAttribute('alt', /\S/)
    expect(await image.getAttribute('src')).toMatch(/^\/images\//)
    await expect.poll(() => image.evaluate(element => {
      const image = element as HTMLImageElement
      return image.complete && image.naturalWidth > 0
    })).toBe(true)
  }
})

test('les filtres actualisent les résultats et exposent leur état aux technologies d’assistance', async ({ page }) => {
  const section = news(page)
  for (const [category, count] of [
    ['Entrepreneuriat', 2], ['Formation', 2], ['Initiatives', 1], ['Opportunités', 1],
  ] as const) {
    const filter = filters(page).getByRole('button', { name: category, exact: true })
    await filter.click()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(filters(page).locator('[aria-pressed="true"]')).toHaveCount(1)
    await expect(section.getByRole('article')).toHaveCount(count)
    for (const article of await section.getByRole('article').all()) {
      await expect(article).toContainText(category)
    }
    await expect(section.getByRole('button', { name: 'Afficher plus d’articles', exact: true })).toHaveCount(0)
  }
  await filters(page).getByRole('button', { name: 'Tout voir', exact: true }).click()
  await expect(section.getByRole('article')).toHaveCount(4)
})

test('Afficher plus révèle tous les articles et un changement de filtre réinitialise la liste', async ({ page }) => {
  const section = news(page)
  const loadMore = section.getByRole('button', { name: 'Afficher plus d’articles', exact: true })
  await loadMore.click()
  await expect(section.getByRole('article')).toHaveCount(6)
  await expect(section.getByRole('button', { name: 'Apprendre ensemble pour aller plus loin.', exact: true })).toBeVisible()
  await expect(section.getByRole('button', { name: 'Du premier croquis au projet concret.', exact: true })).toBeVisible()
  await expect(loadMore).toHaveCount(0)
  await filters(page).getByRole('button', { name: 'Formation', exact: true }).click()
  await expect(section.getByRole('article')).toHaveCount(2)
  await filters(page).getByRole('button', { name: 'Tout voir', exact: true }).click()
  await expect(section.getByRole('article')).toHaveCount(4)
  await expect(loadMore).toBeVisible()
})

test('lecture au clavier : contenu complet, focus contenu, scroll bloqué et retour au déclencheur', async ({ page }) => {
  const trigger = news(page).getByRole('button', { name: firstTitle, exact: true })
  await trigger.scrollIntoViewIfNeeded()
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: firstTitle, exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Article de démonstration', { exact: true })).toBeVisible()
  expect((await dialog.innerText()).length).toBeGreaterThan(450)
  await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press('Tab')
    await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Shift+Tab')
  await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
  const initialScroll = await page.evaluate(() => window.scrollY)
  await page.mouse.move(5, 420)
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(initialScroll)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')

  const secondTrigger = news(page).getByRole('button', { name: formationTitle, exact: true })
  await secondTrigger.click()
  const secondDialog = page.getByRole('dialog', { name: formationTitle, exact: true })
  await expect(secondDialog).toBeVisible()
  await secondDialog.getByRole('button', { name: /Fermer/ }).click()
  await expect(secondDialog).toHaveCount(0)
  await expect(secondTrigger).toBeFocused()
})

test('la navigation principale mène à la section sans masquer le titre sous le Header', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const link = navigation.getByRole('link', { name: 'Actualités', exact: true })
  await expect(link).toHaveAttribute('href', '#actualites')
  await link.click()
  await expectNewsAnchor(page)
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1)
})

test('la recherche mène à Actualités et ferme le dialogue', async ({ page }) => {
  await page.getByRole('button', { name: 'Ouvrir la recherche', exact: true }).click()
  const search = page.getByRole('dialog', { name: 'Que recherchez-vous ?' })
  await search.getByRole('searchbox').fill('actualites')
  await search.getByRole('link', { name: 'Actualités', exact: true }).click()
  await expect(search).toHaveCount(0)
  await expectNewsAnchor(page)
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
})

test.describe('Actualités sur mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('le menu navigue vers Actualités, se ferme et libère le scroll', async ({ page }) => {
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    const menu = page.getByRole('dialog', { name: 'Menu principal' })
    await menu.getByRole('link', { name: /Actualités/ }).click()
    await expect(menu).toHaveCount(0)
    await expectNewsAnchor(page)
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
    const filter = filters(page).getByRole('button', { name: 'Formation', exact: true })
    await filter.click()
    const trigger = news(page).getByRole('button', { name: formationTitle, exact: true })
    await trigger.click()
    const reader = page.getByRole('dialog', { name: formationTitle, exact: true })
    await expect(reader).toBeVisible()
    await reader.getByRole('button', { name: /Fermer/ }).click()
    await expect(reader).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
  })
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`Actualités et sa lecture restent accessibles sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await news(page).scrollIntoViewIfNeeded()
    await expect(news(page).getByRole('heading', { name: 'Actualités', exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    for (const filter of await filters(page).getByRole('button').all()) {
      const bounds = await filter.boundingBox()
      expect(bounds?.height).toBeGreaterThanOrEqual(40)
    }
    await news(page).getByRole('button', { name: firstTitle, exact: true }).click()
    const dialog = page.getByRole('dialog', { name: firstTitle, exact: true })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Fermer/ })).toBeInViewport()
    await expect.poll(() => dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  })
}

test.describe('Actualités et réduction des mouvements', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

  test('les filtres et la lecture fonctionnent au clavier avec les mouvements réduits', async ({ page }) => {
    expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
    const filter = filters(page).getByRole('button', { name: 'Formation', exact: true })
    await filter.focus()
    await page.keyboard.press('Space')
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(news(page).getByRole('article')).toHaveCount(2)
    const trigger = news(page).getByRole('button', { name: formationTitle, exact: true })
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: formationTitle, exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})
