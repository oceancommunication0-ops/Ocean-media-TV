import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-10-23T12:00:00Z')); await page.goto('/evenements') })

test('la page affiche l’agenda sans filtre temporel ni note de présentation', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Des rencontres qui font circuler les idées.' })).toBeVisible()
  await expect(page.locator('.agenda-event-grid article')).toHaveCount(6)
  const categoryFilters = page.getByRole('group', { name: 'Filtrer les événements par catégorie', exact: true })
  await expect(categoryFilters).toBeVisible()
  await expect(categoryFilters.getByRole('button', { name: 'À venir', exact: true })).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText('Les inscriptions seront affichées uniquement')
  await expect(page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Événements' })).toHaveAttribute('aria-current', 'page')
})

test('recherche et catégories filtrent réellement', async ({ page }) => {
  const cards = page.locator('.agenda-event-grid article')
  await page.getByRole('searchbox', { name: 'Rechercher un événement' }).fill('parole')
  await expect(cards).toHaveCount(1)
  await page.getByRole('button', { name: 'Effacer la recherche' }).click()
  await page.getByRole('button', { name: 'Ateliers', exact: true }).click()
  await expect(cards).toHaveCount(1)
})

test('une carte ouvre une fenêtre avec WhatsApp', async ({ page }) => {
  await page.locator('.agenda-event-grid article').first().getByRole('button', { name: 'En savoir plus' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('target', '_blank')
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`agenda reste sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  })
}
