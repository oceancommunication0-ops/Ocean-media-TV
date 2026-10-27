import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/formations')
})

test('la page présente les six domaines et active uniquement Formations', async ({ page }) => {
  await expect(page).toHaveTitle('Formations | Océan Média TV')
  await expect(page.getByRole('heading', { level: 1, name: 'Des compétences pour prendre sa place.' })).toBeVisible()
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  await expect(navigation.getByRole('link', { name: 'Formations', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(navigation.getByRole('link', { name: 'Accueil', exact: true })).not.toHaveAttribute('aria-current')
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(page.locator('.training-card')).toHaveCount(6)
  await expect(page.getByText(/Les sessions, dates et modalités d’inscription seront publiées/)).toBeVisible()
})

test('la recherche et les filtres fonctionnent réellement', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Rechercher une formation' })
  await search.fill('écrire')
  await expect(page.locator('.training-card')).toHaveCount(1)
  await expect(page.locator('.training-card')).toContainText('Techniques de rédaction')
  await search.fill('')
  await page.getByRole('button', { name: 'Leadership & gestion', exact: true }).click()
  await expect(page.locator('.training-card')).toHaveCount(2)
  await expect(page.locator('.training-card').first()).toContainText('Leadership')
  await expect(page.locator('.training-card').last()).toContainText('Management')
})

test('une formation ouvre une fiche détaillée accessible avec un contact WhatsApp contextualisé', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Découvrir la formation Art oratoire', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Art oratoire' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Ce que vous pourrez développer')
  await expect(dialog).toContainText('Pour qui ?')
  await expect(dialog).toContainText('L’approche')
  const whatsapp = dialog.getByRole('link', { name: /Nous contacter sur WhatsApp/ })
  await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/243972486033\?text=/)
  const href = await whatsapp.getAttribute('href')
  expect(decodeURIComponent(href ?? '')).toContain('Art oratoire')
  await expect(whatsapp).toHaveAttribute('target', '_blank')
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
})

test('le bouton de l’accueil conduit au catalogue complet', async ({ page }) => {
  await page.goto('/#formations')
  const section = page.locator('#formations')
  const link = section.getByRole('link', { name: 'Explorer toutes les formations', exact: true })
  await expect(link).toHaveAttribute('href', '/formations')
  await link.click()
  await expect(page).toHaveURL(/\/formations$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Des compétences pour prendre sa place.' })).toBeVisible()
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`la page et la fiche restent sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    await page.getByRole('button', { name: 'Découvrir la formation Leadership', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Leadership' })
    await expect(dialog).toBeVisible()
    expect(await dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0)
    await expect(dialog.getByRole('button', { name: 'Fermer la fiche de formation' })).toBeInViewport()
  })
}
