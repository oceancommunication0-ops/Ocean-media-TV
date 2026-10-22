import { expect, test } from '@playwright/test'

const heroTitle = 'L’info qui ouvre les horizons.'
const features = [
  { tab: 'S’informer', title: 'Faire entendre les voix de demain.' },
  { tab: 'Se former', title: 'Les compétences ouvrent des portes.' },
  { tab: 'S’inspirer', title: 'Des idées qui deviennent possibles.' },
] as const

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('la Hero présente son identité et des images locales chargées', async ({ page }) => {
  const hero = page.getByRole('region', { name: heroTitle, exact: true })
  await expect(hero).toBeVisible()
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText(heroTitle)
  await expect(hero.getByRole('button', { name: 'Explorer nos regards', exact: true })).toBeVisible()
  await expect(hero.getByRole('button', { name: 'L’esprit Océan', exact: true })).toBeVisible()

  const images = hero.getByRole('img')
  expect(await images.count()).toBeGreaterThan(0)
  for (const image of await images.all()) {
    await expect(image).toHaveAttribute('alt', /\S/)
    await expect.poll(() => image.evaluate(element => {
      const image = element as HTMLImageElement
      return image.complete && image.naturalWidth > 0
    })).toBe(true)
    expect(await image.getAttribute('src')).toMatch(/^\/images\//)
  }
})

test('les regards se sélectionnent au clavier avec un seul tab actif', async ({ page }) => {
  const hero = page.getByRole('region', { name: heroTitle, exact: true })
  const tabs = hero.getByRole('tab')
  await expect(tabs).toHaveCount(3)
  const first = hero.getByRole('tab', { name: features[0].tab, exact: true })
  await first.focus()

  for (let index = 0; index < features.length; index += 1) {
    const feature = features[index]
    const selected = hero.getByRole('tab', { name: feature.tab, exact: true })
    await expect(selected).toBeFocused()
    await expect(selected).toHaveAttribute('aria-selected', 'true')
    await expect(selected).toHaveAttribute('tabindex', '0')
    await expect(hero.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1)
    await expect(hero.locator('[role="tab"][tabindex="0"]')).toHaveCount(1)
    const panel = hero.getByRole('tabpanel')
    await expect(panel).toHaveCount(1)
    await expect(panel.getByRole('heading', { name: feature.title, exact: true })).toBeVisible()
    await expect(selected).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!)
    await expect(panel).toHaveAttribute('aria-labelledby', (await selected.getAttribute('id'))!)
    if (index < features.length - 1) await page.keyboard.press('ArrowRight')
  }

  await page.keyboard.press('ArrowRight')
  await expect(first).toBeFocused()
  await page.keyboard.press('End')
  await expect(hero.getByRole('tab', { name: features[2].tab, exact: true })).toBeFocused()
  await page.keyboard.press('Home')
  await expect(first).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(hero.getByRole('tab', { name: features[2].tab, exact: true })).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(hero.getByRole('tabpanel')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(hero.getByRole('button', { name: 'Lire notre regard', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect.poll(() => hero.evaluate(element => element.contains(document.activeElement))).toBe(false)
})

test('Explorer nos regards ramène au premier regard et lui donne le focus', async ({ page }) => {
  const hero = page.getByRole('region', { name: heroTitle, exact: true })
  await hero.getByRole('tab', { name: features[2].tab, exact: true }).click()
  await hero.getByRole('button', { name: 'Explorer nos regards', exact: true }).click()
  const first = hero.getByRole('tab', { name: features[0].tab, exact: true })
  await expect(first).toHaveAttribute('aria-selected', 'true')
  await expect(first).toBeFocused()
  await expect(first).toBeInViewport()
})

test('chaque regard ouvre son contenu et restitue le focus après Échap', async ({ page }) => {
  const hero = page.getByRole('region', { name: heroTitle, exact: true })
  for (const feature of features) {
    await hero.getByRole('tab', { name: feature.tab, exact: true }).click()
    const trigger = hero.getByRole('button', { name: 'Lire notre regard', exact: true })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: feature.title, exact: true })
    await expect(dialog).toBeVisible()
    await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Tab')
    await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  }
})

test.describe('Hero mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('la mission se lit dans un dialogue accessible et ferme sans perdre le focus', async ({ page }) => {
    const hero = page.getByRole('region', { name: heroTitle, exact: true })
    const trigger = hero.getByRole('button', { name: 'L’esprit Océan', exact: true })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Informer. Former. Inspirer.', exact: true })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Océan Communication')
    await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
  })
})

for (const width of [320, 390, 768, 1024, 1280, 1440]) {
  test(`les trois regards restent lisibles sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const hero = page.getByRole('region', { name: heroTitle, exact: true })
    await expect(hero.getByRole('heading', { level: 1 })).toBeVisible()
    for (const feature of features) {
      await hero.getByRole('tab', { name: feature.tab, exact: true }).click()
      await expect(hero.getByRole('heading', { name: feature.title, exact: true })).toBeVisible()
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    }
  })
}

test.describe('Hero et réduction des mouvements', () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

  test('aucun regard ne défile automatiquement et la sélection reste fonctionnelle', async ({ page }) => {
    await page.clock.install()
    const hero = page.getByRole('region', { name: heroTitle, exact: true })
    const first = hero.getByRole('tab', { name: features[0].tab, exact: true })
    await expect(first).toHaveAttribute('aria-selected', 'true')
    await page.clock.fastForward(60_000)
    await expect(first).toHaveAttribute('aria-selected', 'true')
    await expect(hero.getByRole('heading', { name: features[0].title, exact: true })).toBeVisible()

    const second = hero.getByRole('tab', { name: features[1].tab, exact: true })
    await second.click()
    await expect(second).toHaveAttribute('aria-selected', 'true')
    await page.clock.fastForward(60_000)
    await expect(second).toHaveAttribute('aria-selected', 'true')
    await expect(hero.getByRole('heading', { name: features[1].title, exact: true })).toBeVisible()
  })
})
