import { expect, test, type Page } from '@playwright/test'

const heading = 'Développez les compétences qui font la différence.'
const training = (page: Page) => page.getByRole('region', { name: heading, exact: true })

const topics = [
  ['Art oratoire', 'Maîtriser la prise de parole en public et développer son aisance à communiquer.'],
  ['Leadership', 'Renforcer sa confiance, son esprit d’initiative et ses capacités de leadership.'],
  ['Management', 'Développer des compétences en organisation, gestion et coordination.'],
  ['Techniques de rédaction', 'Améliorer sa communication écrite et la présentation de ses idées.'],
  ['Entrepreneuriat', 'Acquérir des bases utiles pour structurer et développer un projet.'],
  ['Compétences professionnelles', 'Développer des aptitudes utiles à son parcours professionnel.'],
]

async function expectTrainingAnchor(page: Page) {
  await expect(page).toHaveURL(/#formations$/)
  await expect(training(page)).toBeInViewport()
  await expect.poll(async () => {
    const top = await training(page).evaluate(element => element.getBoundingClientRect().top)
    const headerBottom = await page.locator('header').evaluate(element => element.getBoundingClientRect().bottom)
    return top >= headerBottom - 1
  }).toBe(true)
  await expect(training(page)).toBeFocused()
  await expect(page.locator('.notification')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('Formations suit Opportunités et présente des domaines sans inventer de sessions ouvertes', async ({ page }) => {
  const section = training(page)
  await section.scrollIntoViewIfNeeded()
  await expect(section).toHaveAttribute('id', 'formations')
  await expect(section).toHaveAttribute('aria-labelledby', 'training-title')
  await expect(section.getByRole('heading', { level: 2, name: heading, exact: true })).toBeVisible()
  expect(await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id))).toEqual(['', 'actualites', 'ocean-tv', 'opportunites', 'formations', 'evenements'])
  await expect(section).toContainText('Des connaissances et des compétences pour transformer vos ambitions en actions concrètes.')
  await expect(section.getByRole('article')).toHaveCount(6)
  for (const [title, description] of topics) {
    const article = section.getByRole('article').filter({ has: page.getByRole('heading', { level: 3, name: title, exact: true }) })
    await expect(article).toHaveCount(1)
    await expect(article).toContainText(description)
    await expect(article.locator('a, button, input')).toHaveCount(0)
  }
  await expect(section.locator('time, form')).toHaveCount(0)
  await expect(section.getByText(/inscriptions ouvertes|réserver|s’inscrire/i)).toHaveCount(0)
  await expect(section.getByRole('heading', { name: 'Apprendre pour mieux entreprendre.', exact: true })).toBeVisible()
  await expect(section).toContainText('Océan Communication encourage le développement des compétences personnelles et professionnelles afin d’aider les jeunes à concrétiser leurs ambitions.')
})

test('la photographie est locale, chargée à la demande et créditée', async ({ page }) => {
  const section = training(page)
  const photo = section.getByRole('img')
  await photo.scrollIntoViewIfNeeded()
  await expect(photo).toHaveCount(1)
  await expect(photo).toHaveAttribute('src', '/images/training-workshop.webp')
  await expect(photo).toHaveAttribute('loading', 'lazy')
  await expect(photo).toHaveAttribute('alt', /\S/)
  await expect(photo).toHaveAttribute('srcset', /training-workshop-480\.webp.*training-workshop-800\.webp/)
  await expect.poll(() => photo.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true)
  await expect(section.getByRole('link', { name: /Pexels/i })).toHaveAttribute('href', /^https:\/\/(www\.)?pexels\.com\//)
})

test('la navigation active Formations, suit le défilement et retrouve Opportunités', async ({ page }) => {
  const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
  const link = navigation.getByRole('link', { name: 'Formations', exact: true })
  await expect(link).toHaveAttribute('href', '#formations')
  await link.click()
  await expectTrainingAnchor(page)
  await expect(link).toHaveAttribute('aria-current', 'page')
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1)
  const opportunities = navigation.getByRole('link', { name: 'Opportunités', exact: true })
  await opportunities.click()
  await expect(opportunities).toHaveAttribute('aria-current', 'page')
  await expect(link).not.toHaveAttribute('aria-current')
  await page.evaluate(() => document.getElementById('formations')?.scrollIntoView({ block: 'start', behavior: 'instant' }))
  await expect(link).toHaveAttribute('aria-current', 'page')
})

test('la recherche mène à Formations en fermant le dialogue et en déplaçant le focus', async ({ page }) => {
  await page.getByRole('button', { name: 'Ouvrir la recherche', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Que recherchez-vous ?' })
  await dialog.getByRole('searchbox').fill('formation')
  await dialog.getByRole('link', { name: 'Formations', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expectTrainingAnchor(page)
})

test.describe('Formations sur mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('le menu se ferme, libère le scroll et garde la rubrique active', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Ouvrir le menu', exact: true })
    await trigger.click()
    let menu = page.getByRole('dialog', { name: 'Menu principal' })
    await menu.getByRole('link', { name: /Formations/ }).click()
    await expect(menu).toHaveCount(0)
    await expectTrainingAnchor(page)
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
    await trigger.click()
    menu = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(menu.getByRole('link', { name: /Formations/ })).toHaveAttribute('aria-current', 'page')
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  })
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`la photo et les six domaines restent lisibles sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const section = training(page)
    await section.scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0)
    const photo = await section.getByRole('img').boundingBox()
    expect(photo?.width).toBeGreaterThan(200)
    expect(photo?.height).toBeGreaterThan(200)
    for (const article of await section.getByRole('article').all()) {
      const bounds = await article.boundingBox()
      expect(bounds?.width).toBeGreaterThan(200)
      await expect(article.getByRole('heading', { level: 3 })).toBeVisible()
      expect(await article.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0)
    }
  })
}

test.describe('Formations et réduction des mouvements', () => {
  test.use({ reducedMotion: 'reduce' })

  test('la navigation au clavier reste utilisable et le survol réduit les mouvements', async ({ page }) => {
    const navigation = page.getByRole('navigation', { name: 'Navigation principale', exact: true })
    const link = navigation.getByRole('link', { name: 'Formations', exact: true })
    await link.focus()
    await page.keyboard.press('Enter')
    await expectTrainingAnchor(page)
    const article = training(page).getByRole('article').first()
    await article.hover()
    const maximumTransition = await article.evaluate(element => Math.max(...getComputedStyle(element).transitionDuration.split(',').map(value => {
      const trimmed = value.trim()
      return Number.parseFloat(trimmed) * (trimmed.endsWith('ms') ? 1 : 1000)
    })))
    expect(maximumTransition).toBeLessThanOrEqual(0.01)
    expect(await article.evaluate(element => getComputedStyle(element).transform)).toBe('none')
  })
})
