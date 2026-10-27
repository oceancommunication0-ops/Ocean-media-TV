import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-10-23T12:00:00Z')); await page.goto('/') })

test('l’accueil affiche trois événements et un filtre par catégorie', async ({ page }) => {
  const section = page.locator('#evenements')
  await section.scrollIntoViewIfNeeded()
  await expect(section.getByRole('article')).toHaveCount(3)
  await expect(section.getByRole('group', { name: 'Filtrer les événements par catégorie' })).toBeVisible()
  await expect(section.getByRole('button', { name: 'À venir' })).toHaveCount(0)
  await expect(section).not.toContainText('Des idées qui se partagent')
  await expect(section).not.toContainText('Événements et dates de présentation')
})

test('les catégories fonctionnent et une carte ouvre sa fenêtre détaillée', async ({ page }) => {
  const section = page.locator('#evenements')
  await section.getByRole('button', { name: 'Ateliers', exact: true }).click()
  await expect(section.getByRole('article')).toHaveCount(1)
  const trigger = section.getByRole('button', { name: 'En savoir plus' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: /Prendre la parole/ })
  await expect(dialog).toContainText('Pourquoi participer ?')
  await expect(dialog.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/243972486033\?text=/)
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('navbar et bouton ouvrent la page Événements', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Événements' })).toHaveAttribute('href', '/evenements')
  await page.locator('#evenements').getByRole('link', { name: 'Explorer tous les événements' }).click()
  await expect(page).toHaveURL('/evenements')
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`événements reste sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.locator('#evenements').scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  })
}
