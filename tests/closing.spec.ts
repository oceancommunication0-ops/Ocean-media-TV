import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.goto('/') })

test('les sections À propos et Initiatives & portraits sont entièrement retirées', async ({ page }) => {
  await expect(page.locator('#ocean-communication')).toHaveCount(0)
  await expect(page.locator('#partenaires')).toHaveCount(0)
  await expect(page.locator('#portraits')).toHaveCount(0)
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Océan Communication', exact: true })).toHaveCount(0)
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Collaborations & partenaires', exact: true })).toHaveCount(0)
  await expect(page.getByRole('contentinfo').getByRole('link', { name: /portraits/i })).toHaveCount(0)
})

test('le footer rejoint chaque rubrique et le haut de page avec le focus', async ({ page }) => {
  const footer = page.getByRole('contentinfo')
  for (const [label, id] of [['Actualités', 'actualites'], ['Océan TV', 'ocean-tv'], ['Opportunités', 'opportunites'], ['Formations', 'formations'], ['Événements', 'evenements']]) {
    await footer.getByRole('navigation', { name: 'Rubriques du pied de page' }).getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect(page.locator(`#${id}`)).toBeFocused()
  }
  await footer.getByRole('link', { name: 'Retour en haut' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('main')).toBeFocused()
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
})

test('les contacts et réseaux du footer disposent de destinations et de retours réels', async ({ page }) => {
  const footer = page.getByRole('contentinfo')
  await expect(footer.getByRole('link', { name: '+243 97 248 60 33' })).toHaveAttribute('href', 'tel:+243972486033')
  await expect(footer.getByRole('link', { name: /Échanger sur WhatsApp/ })).toHaveAttribute('href', 'https://wa.me/243972486033')
  await footer.getByRole('button', { name: 'TikTok — lien officiel à venir' }).click()
  await expect(footer.getByRole('status')).toContainText('Le lien officiel TikTok sera bientôt disponible.')
  await footer.getByRole('button', { name: 'Fermer la notification' }).click()
  await expect(footer.getByRole('status')).toBeEmpty()
})

test('le lien et la fenêtre Informations & crédits sont retirés', async ({ page }) => {
  await expect(page.getByRole('contentinfo')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Informations & crédits' })).toHaveCount(0)
  await expect(page.locator('.footer-info-dialog')).toHaveCount(0)
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`la fin de page reste lisible et utilisable à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
  })
}
