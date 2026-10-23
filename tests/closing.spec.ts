import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.goto('/') })

test('trois récits éditoriaux préparent leurs pages sans lecteur en fenêtre', async ({ page }) => {
  const section = page.locator('#portraits')
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Ils inspirent le changement.')
  await expect(section.getByRole('article')).toHaveCount(3)
  await expect(section).toContainText('Récits de présentation')
  for (const article of await section.getByRole('article').all()) {
    const link = article.getByRole('link')
    await expect(link).toHaveAttribute('href', /^\/portraits\//)
    await link.click()
    await expect(section.getByRole('status')).toContainText('La page de ce récit sera bientôt disponible.')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page).toHaveURL('/')
    await section.getByRole('button', { name: 'Fermer la notification' }).click()
  }
})

test('la section À propos et ses liens ont été retirés de l’accueil', async ({ page }) => {
  await expect(page.locator('#ocean-communication')).toHaveCount(0)
  await expect(page.locator('#partenaires')).toHaveCount(0)
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Océan Communication', exact: true })).toHaveCount(0)
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Collaborations & partenaires', exact: true })).toHaveCount(0)
})

test('le footer rejoint chaque rubrique et le haut de page avec le focus', async ({ page }) => {
  const footer = page.getByRole('contentinfo')
  for (const [label, id] of [['Actualités', 'actualites'], ['Océan TV', 'ocean-tv'], ['Opportunités', 'opportunites'], ['Formations', 'formations'], ['Événements', 'evenements'], ['Initiatives & portraits', 'portraits']]) {
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
  await footer.getByRole('button', { name: 'Instagram — lien officiel à venir' }).click()
  await expect(footer.getByRole('status')).toContainText('Le lien officiel Instagram sera bientôt disponible.')
  await footer.getByRole('button', { name: 'Fermer la notification' }).click()
  await expect(footer.getByRole('status')).toBeEmpty()
})

test('informations et crédits : dialogue accessible, scroll bloqué, Échap et restitution du focus', async ({ page }) => {
  const trigger = page.getByRole('contentinfo').getByRole('button', { name: 'Informations & crédits' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Informations & crédits' })
  await expect(dialog).toBeVisible()
  await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
  await expect(dialog.getByRole('link', { name: /Kindel Media/ })).toHaveAttribute('href', 'https://www.pexels.com/photo/7688363/')
  await expect(dialog).toContainText('Le lecteur YouTube est chargé uniquement')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`la fin de page reste lisible et utilisable à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const section of [page.locator('#portraits')]) {
      for (const img of await section.getByRole('img').all()) {
        await img.scrollIntoViewIfNeeded()
        await expect(img).toHaveAttribute('loading', 'lazy')
        await expect.poll(() => img.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true)
      }
    }
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
    await page.getByRole('contentinfo').getByRole('button', { name: 'Informations & crédits' }).click()
    const dialog = page.getByRole('dialog')
    expect(await dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0)
    await expect(dialog.getByRole('button', { name: 'Fermer les informations' })).toBeInViewport()
    await page.keyboard.press('Escape')
  })
}

test('les photographies respectent la réduction des mouvements et les récits restent utilisables au clavier', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const section = page.locator('#portraits')
  const link = section.getByRole('link').first()
  await link.focus()
  await page.keyboard.press('Enter')
  await expect(section.getByRole('status')).toContainText('sera bientôt disponible')
  await link.hover()
  expect(await link.locator('img').evaluate(img => getComputedStyle(img).transform)).toBe('none')
})
