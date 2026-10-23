import { expect, test, type Page } from '@playwright/test'

const tv = (page: Page) => page.getByRole('region', { name: 'Océan TV', exact: true })

async function expectTvAnchor(page: Page) {
  await expect(page).toHaveURL(/#ocean-tv$/)
  await expect(tv(page)).toBeInViewport()
  await expect.poll(async () => {
    const top = await tv(page).evaluate(element => element.getBoundingClientRect().top)
    const headerBottom = await page.locator('header').evaluate(element => element.getBoundingClientRect().bottom)
    return top >= headerBottom - 1
  }).toBe(true)
  await expect(page.locator('.notification')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  await page.route('https://www.youtube-nocookie.com/embed/**', async route => {
    await route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="fr"><title>Lecteur de test</title><body><button>Lire la vidéo de test</button></body></html>',
    })
  })
  await page.goto('/')
})

test('Océan TV suit les Actualités et présente sept vidéos sans lecteur chargé', async ({ page }) => {
  const section = tv(page)
  await section.scrollIntoViewIfNeeded()
  await expect(section).toHaveAttribute('id', 'ocean-tv')
  await expect(section).toHaveAttribute('aria-labelledby', 'tv-title')
  await expect(section.getByRole('heading', { level: 2, name: 'Océan TV', exact: true })).toBeVisible()
  await expect(page.locator('main > section')).toHaveCount(7)
  expect(await page.locator('main > section').nth(2).getAttribute('id')).toBe('ocean-tv')
  await expect(section.getByRole('article')).toHaveCount(7)
  await expect(section.getByRole('button')).toHaveCount(7)
  await expect(page.locator('iframe')).toHaveCount(0)
  for (const image of await section.getByRole('img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect(image).toHaveAttribute('alt', /\S/)
    expect(await image.getAttribute('src')).toMatch(/^\/images\//)
    await expect.poll(() => image.evaluate(element => {
      const image = element as HTMLImageElement
      return image.complete && image.naturalWidth > 0
    })).toBe(true)
  }
})

test('la sélection d’une vidéo à venir conserve le focus, bloque le scroll et ferme avec Échap', async ({ page }) => {
  await page.route('**/src/lib/tv-content.ts', async route => {
    const response = await route.fetch()
    const source = await response.text()
    const fixtureSource = source.replace(/youtubeId:\s*["'][^"']+["']/, 'youtubeId: null')
    expect(fixtureSource).not.toBe(source)
    await route.fulfill({ response, body: fixtureSource })
  })
  await page.reload()
  const section = tv(page)
  const trigger = section.getByRole('button').first()
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(/vidéo à venir/i)
  await expect(dialog.locator('iframe')).toHaveCount(0)
  await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
  await page.keyboard.press('Tab')
  await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Shift+Tab')
  await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
})

test('la navigation active Océan TV puis Actualités et Accueil selon la section', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const link = navigation.getByRole('link', { name: 'Océan TV', exact: true })
  const news = navigation.getByRole('link', { name: 'Actualités', exact: true })
  const home = navigation.getByRole('link', { name: 'Accueil', exact: true })
  await expect(link).toHaveAttribute('href', '#ocean-tv')
  await link.click()
  await expectTvAnchor(page)
  await expect(link).toHaveAttribute('aria-current', 'page')
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1)
  await news.click()
  await expect(news).toHaveAttribute('aria-current', 'page')
  await expect(link).not.toHaveAttribute('aria-current')
  await home.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
  await expect(home).toHaveAttribute('aria-current', 'page')
})

test('la recherche ouvre Océan TV sans conserver le dialogue de recherche', async ({ page }) => {
  await page.getByRole('button', { name: 'Ouvrir la recherche', exact: true }).click()
  const search = page.getByRole('dialog', { name: 'Que recherchez-vous ?' })
  await search.getByRole('searchbox').fill('ocean tv')
  await search.getByRole('link', { name: 'Océan TV', exact: true }).click()
  await expect(search).toHaveCount(0)
  await expectTvAnchor(page)
  await expect(page.getByRole('navigation', { name: 'Navigation principale', exact: true }).getByRole('link', { name: 'Océan TV', exact: true })).toHaveAttribute('aria-current', 'page')
})

test.describe('Océan TV sur mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('le menu mène à Océan TV, ferme et conserve la rubrique active', async ({ page }) => {
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    let menu = page.getByRole('dialog', { name: 'Menu principal' })
    await menu.getByRole('link', { name: /Océan TV/ }).click()
    await expect(menu).toHaveCount(0)
    await expectTvAnchor(page)
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    menu = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(menu.getByRole('link', { name: /Océan TV/ })).toHaveAttribute('aria-current', 'page')
    await page.keyboard.press('Escape')
  })
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`les vidéos restent lisibles et actionnables sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const section = tv(page)
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('heading', { level: 2, name: 'Océan TV', exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    for (const article of await section.getByRole('article').all()) {
      const thumbnail = article.getByRole('img')
      await thumbnail.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
      const bounds = await thumbnail.boundingBox()
      expect(bounds?.width).toBeGreaterThanOrEqual(44)
      expect(bounds?.height).toBeGreaterThanOrEqual(44)
      await expect.poll(() => article.getByRole('button').evaluate(button => {
        const image = button.closest('article')!.querySelector('img')!
        const bounds = image.getBoundingClientRect()
        const target = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
        return target === button || button.contains(target)
      })).toBe(true)
    }
    await section.getByRole('button').last().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  })
}

test.describe('Océan TV et réduction des mouvements', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

  test('une vidéo s’ouvre au clavier sans animation imposée', async ({ page }) => {
    const trigger = tv(page).getByRole('button').first()
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('iframe')).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

for (const width of [390, 1440]) {
  test(`une source YouTube renseignée est chargée uniquement après clic à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const embedRequests: string[] = []
    await page.route('https://www.youtube-nocookie.com/embed/**', async route => {
      embedRequests.push(route.request().url())
      await route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html lang="fr"><title>Lecteur de test</title><body><button>Lire la vidéo de test</button></body></html>',
      })
    })
    await page.reload()
    const section = tv(page)
    await section.scrollIntoViewIfNeeded()
    await expect(page.locator('iframe')).toHaveCount(0)
    expect(embedRequests).toEqual([])

    const trigger = section.getByRole('button').first()
    await trigger.click()
    const dialog = page.getByRole('dialog')
    const iframe = dialog.locator('iframe')
    await expect(iframe).toHaveCount(1)
    await expect(iframe).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?rel=0&playsinline=1$/)
    await expect(iframe).toHaveAttribute('title', /\S/)
    await expect(iframe).toHaveAttribute('allowfullscreen', '')
    expect(await iframe.getAttribute('allow')).not.toMatch(/autoplay/)
    await expect.poll(() => embedRequests.length).toBe(1)
    const bounds = await iframe.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.width / bounds!.height).toBeCloseTo(16 / 9, 1)
    await expect(dialog.getByText(/vidéo à venir/i)).toHaveCount(0)
    await dialog.getByRole('button', { name: 'Fermer la vidéo', exact: true }).click()
    await expect(page.locator('iframe')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
}
