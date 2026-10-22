import { chromium } from '@playwright/test'
import { access, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Re-encode the original illustrations locally; no server or network is used.
// Run from any directory: node scripts/optimize-news-images.mjs
const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const imageDirectory = path.join(projectRoot, 'public', 'images')
const sourceDirectory = path.join(projectRoot, 'design-assets', 'news')
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const quality = 0.86
let executablePath = process.env.NEWS_BROWSER_EXECUTABLE

if (!executablePath && process.platform === 'win32') {
  await access(edgePath, constants.X_OK)
  executablePath = edgePath
}

const browser = await chromium.launch({ headless: true, executablePath })

try {
  const page = await browser.newPage()
  const outputs = []

  for (const name of ['news-enterprise', 'news-learning']) {
    const source = await readFile(path.join(sourceDirectory, `${name}.png`))
    const dataUrl = `data:image/png;base64,${source.toString('base64')}`

    for (const targetWidth of [1536, 1024, 640]) {
      const encoded = await page.evaluate(async ({ dataUrl, targetWidth, quality }) => {
        const sourceImage = new Image()
        sourceImage.src = dataUrl
        await sourceImage.decode()

        const width = Math.min(targetWidth, sourceImage.naturalWidth)
        const height = Math.round(width * sourceImage.naturalHeight / sourceImage.naturalWidth)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d', { alpha: false })
        if (!context) throw new Error('Canvas 2D is unavailable.')
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        context.drawImage(sourceImage, 0, 0, width, height)

        const output = canvas.toDataURL('image/webp', quality)
        if (!output.startsWith('data:image/webp;base64,')) {
          throw new Error('The browser does not support WebP encoding.')
        }

        return { width, height, base64: output.split(',')[1] }
      }, { dataUrl, targetWidth, quality })

      const suffix = targetWidth === 1536 ? '' : `-${targetWidth}`
      const filename = `${name}${suffix}.webp`
      const bytes = Buffer.from(encoded.base64, 'base64')
      await writeFile(path.join(imageDirectory, filename), bytes)
      outputs.push({ filename, width: encoded.width, height: encoded.height, bytes: bytes.length })
    }
  }

  console.table(outputs)
} finally {
  await browser.close()
}
