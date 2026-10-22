import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('desktop : identité, navigation active et Hero seule dans la zone principale', async ({ page }, testInfo) => {
  await expect(page).toHaveTitle(/Océan Média TV/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.locator('.signature')).toHaveText('INFORMER • FORMER • INSPIRER')

  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  await expect(navigation).toBeVisible()
  await expect(navigation.getByRole('link')).toHaveCount(7)
  await expect(navigation.getByRole('link', { name: 'Accueil', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Ouvrir le menu', exact: true })).toBeHidden()

  const main = page.getByRole('main', { name: 'Contenu principal' })
  await expect(main).toHaveAttribute('id', 'main-content')
  await expect(main).toHaveAttribute('tabindex', '-1')
  const hero = main.getByRole('region', { name: 'L’info qui ouvre les horizons.', exact: true })
  await expect(hero).toHaveAttribute('aria-labelledby', 'hero-title')
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('L’info qui ouvre les horizons.')
  await expect(main.locator(':scope > section')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('desktop.png'), fullPage: true })
})

test('les futures rubriques donnent un retour sans naviguer', async ({ page }) => {
  const initialUrl = page.url()
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  await navigation.getByRole('link', { name: 'Actualités', exact: true }).click()

  await expect(page.locator('.notification-region')).toContainText('La rubrique « Actualités » sera bientôt disponible.')
  await expect(page).toHaveURL(initialUrl)
  await expect(navigation.getByRole('link', { name: 'Accueil', exact: true })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Fermer la notification', exact: true }).click()
  await expect(page.locator('.notification')).toHaveCount(0)
})

test('recherche : filtre sans accents, aucun résultat, Échap et retour du focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Ouvrir la recherche', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Que recherchez-vous ?' })
  const input = dialog.getByRole('searchbox', { name: 'Rechercher une rubrique' })
  await expect(input).toBeFocused()
  await expect(dialog.locator('.search-results').getByRole('link')).toHaveCount(7)

  await input.fill('  EVENEMENTS  ')
  await expect(dialog.locator('.search-results').getByRole('link')).toHaveCount(1)
  await expect(dialog.locator('.search-results').getByRole('link', { name: /Événements/ })).toBeVisible()

  await input.fill('aérospatial introuvable')
  await expect(dialog.locator('.search-results').getByRole('link')).toHaveCount(0)
  await expect(dialog.locator('.empty-search')).toContainText('Aucune rubrique ne correspond')

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('la sélection d’une rubrique dans la recherche ferme le dialogue', async ({ page }) => {
  const initialUrl = page.url()
  await page.getByRole('button', { name: 'Ouvrir la recherche', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Que recherchez-vous ?' })
  await dialog.getByRole('searchbox').fill('formation')
  await dialog.getByRole('link', { name: /Formations/ }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('.notification-region')).toContainText('Formations')
  await expect(page).toHaveURL(initialUrl)
})

test('le contact fournit les coordonnées réelles du document', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Contact', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Entrons en contact.' })
  await expect(dialog.getByRole('link', { name: /Appelez-nous/ })).toHaveAttribute('href', 'tel:+243972486033')
  const whatsapp = dialog.getByRole('link', { name: /Discuter sur WhatsApp/ })
  await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/243972486033')
  await expect(whatsapp).toHaveAttribute('target', '_blank')
  await expect(whatsapp).toHaveAttribute('rel', /noopener/)
  await expect(dialog).toContainText('+243 97 248 60 33')
  await page.getByRole('button', { name: 'Fermer le contact', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('les réseaux sans profil officiel restent honnêtes et interactifs', async ({ page }) => {
  await page.getByRole('button', { name: 'Facebook — lien officiel à venir', exact: true }).click()
  await expect(page.locator('.notification-region')).toContainText('Le lien officiel Facebook sera bientôt disponible.')
  await expect(page).toHaveURL('/')
})

test('le header reste collé au défilement et acquiert son ombre', async ({ page }) => {
  // La hauteur ajoutée existe uniquement pendant ce test pour garantir le défilement.
  await page.locator('main').evaluate(element => { element.style.minHeight = '220vh' })
  await page.evaluate(() => window.scrollTo(0, 450))
  await expect(page.locator('header')).toHaveClass(/is-scrolled/)
  expect(await page.locator('header').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(0)
  await expect.poll(() => page.locator('header').evaluate(element => getComputedStyle(element).boxShadow)).not.toBe('none')
  await expect(page.getByRole('main').getByRole('region', { name: 'L’info qui ouvre les horizons.', exact: true })).toBeVisible()
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('menu accessible : focus contenu, boucle clavier, Échap et retour au déclencheur', async ({ page }, testInfo) => {
    const trigger = page.getByRole('button', { name: 'Ouvrir le menu', exact: true })
    await expect(page.getByRole('navigation', { name: 'Navigation principale', exact: true })).toBeHidden()
    await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ouvrir le menu', exact: true, includeHidden: true })).toHaveAttribute('aria-expanded', 'true')
    await expect(dialog.getByRole('navigation', { name: 'Navigation mobile' }).getByRole('link')).toHaveCount(7)
    await page.screenshot({ path: testInfo.outputPath('mobile-menu.png'), fullPage: true })

    const first = dialog.getByRole('link', { name: 'Océan Média TV — Accueil', exact: true })
    const last = dialog.getByRole('button', { name: 'Instagram — lien officiel à venir', exact: true })
    await first.focus()
    await page.keyboard.press('Shift+Tab')
    await expect(last).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(first).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('le menu se ferme automatiquement après une sélection', async ({ page }) => {
    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Menu principal' })
    await dialog.getByRole('link', { name: /Formations/ }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.locator('.notification-region')).toContainText('Formations')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('button', { name: 'Ouvrir le menu', exact: true })).toBeFocused()
  })

  test('le contact depuis le menu reçoit le focus puis le rend au hamburger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Ouvrir le menu', exact: true })
    await trigger.click()
    await page.getByRole('dialog', { name: 'Menu principal' }).getByRole('button', { name: 'Parlons de vos projets' }).click()
    const contactDialog = page.getByRole('dialog', { name: 'Entrons en contact.' })
    await expect(contactDialog).toBeVisible()
    await expect.poll(() => contactDialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Tab')
    await expect.poll(() => contactDialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(contactDialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('les réseaux depuis le menu ferment le menu et annoncent leur disponibilité', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Ouvrir le menu', exact: true })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Menu principal' })
    await dialog.getByRole('button', { name: 'YouTube — lien officiel à venir', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.locator('.notification-region')).toContainText('Le lien officiel YouTube sera bientôt disponible.')
    await expect(trigger).toBeFocused()
  })

  test('le menu bloque le scroll et conserve la position à sa fermeture', async ({ page }) => {
    await page.locator('main').evaluate(element => { element.style.minHeight = '250vh' })
    await page.evaluate(() => window.scrollTo(0, 400))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400)

    await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Menu principal' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
    await page.mouse.move(5, 420)
    await page.mouse.wheel(0, 500)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400)
  })
})

for (const width of [320, 375, 768, 1279, 1280, 1440, 1920]) {
  test(`aucun débordement horizontal à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    if (width < 1280) {
      await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click()
      await expect(page.getByRole('dialog', { name: 'Menu principal' })).toBeVisible()
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    } else {
      await expect(page.getByRole('navigation', { name: 'Navigation principale', exact: true })).toBeVisible()
    }
  })
}

test.describe('réduction des mouvements', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

  test('les interactions restent fonctionnelles avec des transitions réduites', async ({ page }) => {
    expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
    const duration = await page.locator('header').evaluate(element => {
      const value = getComputedStyle(element).transitionDuration.split(',')[0].trim()
      return Number.parseFloat(value) * (value.endsWith('ms') ? 1 : 1000)
    })
    expect(duration).toBeLessThanOrEqual(0.01)
    const trigger = page.getByRole('button', { name: 'Ouvrir le menu', exact: true })
    await trigger.click()
    await expect(page.getByRole('dialog', { name: 'Menu principal' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await page.getByRole('button', { name: 'Ouvrir la recherche', exact: true }).click()
    await expect(page.getByRole('searchbox')).toBeFocused()
  })
})
