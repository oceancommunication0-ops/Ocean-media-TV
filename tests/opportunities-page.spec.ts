import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.goto('/opportunites') })

test('le portail affiche les opportunités paginées sans éléments supprimés', async ({ page }) => {
  await expect(page).toHaveTitle('Opportunités | Océan Média TV')
  await expect(page.locator('.op-index-card')).toHaveCount(9)
  await expect(page.locator('.op-index-featured, .op-index-stats, .op-index-controls, .op-index-guide, .op-index-presentation-note')).toHaveCount(0)
  await expect(page.getByLabel('Mode')).toHaveCount(0)
  await expect(page.getByLabel('Trier')).toHaveCount(0)
})

test('recherche et catégories filtrent le portail', async ({ page }) => {
  const cards = page.locator('.op-index-card')
  await page.getByRole('button', { name: 'Emploi', exact: true }).click()
  await expect(cards).toHaveCount(2)
  await page.getByRole('searchbox', { name: 'Rechercher une opportunité' }).fill('communication')
  await expect(cards).toHaveCount(1)
  await page.getByRole('button', { name: 'Effacer la recherche' }).click()
  await page.getByRole('button', { name: 'Toutes', exact: true }).click()
  await expect(cards).toHaveCount(9)
})

test('les cartes ouvrent une fenêtre au lieu d’une page de détail', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Chargé·e de communication digitale' })
  await trigger.click()
  await expect(page).toHaveURL('/opportunites')
  const dialog = page.getByRole('dialog', { name: 'Chargé·e de communication digitale' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('target', '_blank')
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('une ancienne URL de détail revient au portail', async ({ page }) => {
  await page.goto('/opportunites/communication-digitale')
  await expect(page).toHaveURL('/opportunites')
  await expect(page.locator('.op-index-card')).toHaveCount(9)
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`le portail reste lisible à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    await page.locator('.op-index-card').first().getByRole('button').click()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  })
}
