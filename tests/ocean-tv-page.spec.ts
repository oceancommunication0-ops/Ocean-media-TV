import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://www.youtube-nocookie.com/embed/**', async route => {
    await route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="fr"><title>Lecteur de test</title><body><button>Lire la vidéo de test</button></body></html>',
    })
  })
  await page.goto('/ocean-tv')
})

test('la page présente une une cinématographique et jusqu’à neuf vidéos par page', async ({ page }) => {
  await expect(page).toHaveTitle('Océan TV | Océan Média TV')
  await expect(page.getByRole('heading', { level: 1, name: /Des images pour voir plus loin/i })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: /Tous les regards/i })).toBeVisible()
  await expect(page.locator('.otv-catalogue-card')).toHaveCount(8)
  await expect(page.locator('.otv-results-line [role="status"]')).toHaveText('8 vidéos')
  await expect(page.locator('iframe')).toHaveCount(0)
  for (const image of await page.locator('.otv-catalogue-card img').all()) {
    await expect(image).toHaveAttribute('alt', /\S/)
    expect(await image.getAttribute('src')).toMatch(/^\/images\/tv-/)
  }
})

test('le lecteur YouTube est chargé seulement après une action explicite', async ({ page }) => {
  const embedRequests: string[] = []
  await page.unroute('https://www.youtube-nocookie.com/embed/**')
  await page.route('https://www.youtube-nocookie.com/embed/**', async route => {
    embedRequests.push(route.request().url())
    await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Lecteur</title>' })
  })
  await page.reload()
  expect(embedRequests).toEqual([])
  const trigger = page.getByRole('button', { name: 'Regarder la vidéo', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog')
  const iframe = dialog.locator('iframe')
  await expect(dialog).toBeVisible()
  await expect(iframe).toHaveCount(1)
  await expect(iframe).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?rel=0&playsinline=1$/)
  expect(await iframe.getAttribute('allow')).not.toMatch(/autoplay/)
  await expect.poll(() => embedRequests.length).toBe(1)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('les filtres et la recherche explorent réellement le catalogue', async ({ page }) => {
  const cards = page.locator('.otv-catalogue-card')
  await page.getByRole('button', { name: 'Reportages', exact: true }).click()
  await expect(cards).toHaveCount(3)
  await expect(page.locator('.otv-results-line [role="status"]')).toHaveText('3 vidéos')
  await expect(page.getByRole('button', { name: 'Reportages', exact: true })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('searchbox', { name: 'Rechercher une vidéo' }).fill('Tesla')
  await expect(cards).toHaveCount(1)
  await expect(page.locator('.otv-results-line [role="status"]')).toHaveText('1 vidéo')

  await page.getByRole('button', { name: 'Toutes', exact: true }).click()
  await expect(cards).toHaveCount(2)
  await page.getByRole('button', { name: 'Effacer la recherche' }).click()
  await expect(cards).toHaveCount(8)
})

test('un état vide permet de rétablir toutes les vidéos', async ({ page }) => {
  await page.getByRole('searchbox', { name: 'Rechercher une vidéo' }).fill('aucun résultat possible')
  await expect(page.getByRole('heading', { name: 'Aucune vidéo ne correspond.' })).toBeVisible()
  await expect(page.locator('.otv-results-line [role="status"]')).toHaveText('0 vidéo')
  await page.getByRole('button', { name: 'Voir toutes les vidéos' }).click()
  await expect(page.locator('.otv-catalogue-card')).toHaveCount(8)
})

test('Océan TV est actif dans le Header et les autres rubriques retrouvent leur destination', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const tv = navigation.getByRole('link', { name: 'Océan TV', exact: true })
  await expect(tv).toHaveAttribute('href', '/ocean-tv')
  await expect(tv).toHaveAttribute('aria-current', 'page')
  await expect(navigation.getByRole('link', { name: 'Actualités', exact: true })).toHaveAttribute('href', '/actualites')
  await expect(navigation.getByRole('link', { name: 'Formations', exact: true })).toHaveAttribute('href', '/formations')
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`la vidéothèque reste lisible sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await expect(page.getByRole('heading', { level: 1, name: /Des images pour voir plus loin/i })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    await page.locator('.otv-catalogue').scrollIntoViewIfNeeded()
    await expect(page.locator('.otv-catalogue-card').first()).toBeVisible()
    const card = await page.locator('.otv-catalogue-card').first().boundingBox()
    expect(card?.width).toBeGreaterThanOrEqual(width < 360 ? 270 : 280)
  })
}

test.describe('réduction des mouvements', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })

  test('la lecture reste disponible au clavier', async ({ page }) => {
    const trigger = page.locator('.otv-catalogue-card').first().getByRole('button')
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  })
})
