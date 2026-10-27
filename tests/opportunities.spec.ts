import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.goto('/') })

test('l’accueil affiche au maximum trois opportunités et un filtre simple', async ({ page }) => {
  const section = page.locator('#opportunites')
  await section.scrollIntoViewIfNeeded()
  await expect(section.getByRole('article')).toHaveCount(3)
  const filters = section.getByRole('group', { name: 'Filtrer les opportunités de l’accueil' })
  await expect(filters.getByRole('button', { name: 'Toutes', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(section).not.toContainText('Le bon point de départ')
  await expect(section).not.toContainText('Ces annonces de présentation')
  await expect(section.getByRole('link', { name: 'Explorer toutes les opportunités' })).toHaveAttribute('href', '/opportunites')
})

test('une opportunité ouvre une fenêtre accessible avec contact WhatsApp', async ({ page }) => {
  const trigger = page.locator('#opportunites').getByRole('button', { name: 'Chargé·e de communication digitale' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Chargé·e de communication digitale' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Ce que l’opportunité propose')
  await expect(dialog.getByRole('link', { name: /Demander plus de détails sur WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/243972486033\?text=/)
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('la navbar et la recherche ouvrent le portail dédié', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  await expect(nav.getByRole('link', { name: 'Opportunités' })).toHaveAttribute('href', '/opportunites')
  await page.getByRole('button', { name: 'Ouvrir la recherche' }).click()
  const dialog = page.getByRole('dialog', { name: 'Que recherchez-vous ?' })
  await dialog.getByRole('searchbox').fill('opportunites')
  await dialog.getByRole('link', { name: 'Opportunités' }).click()
  await expect(page).toHaveURL('/opportunites')
  await expect(page.getByRole('heading', { level: 1, name: /Des opportunités pour passer à l’action/i })).toBeVisible()
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`opportunités reste sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.locator('#opportunites').scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  })
}
