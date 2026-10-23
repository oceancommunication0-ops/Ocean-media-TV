import { chromium } from '@playwright/test'
import { access, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Resize licensed presentation photographs locally without altering source framing.
// Run: node scripts/optimize-finale-images.mjs
const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const slugs = ['portrait-voices', 'portrait-digital', 'portrait-enterprise', 'communication-team']
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
let executablePath = process.env.FINALE_BROWSER_EXECUTABLE

if (!executablePath && process.platform === 'win32') {
  await access(edgePath, constants.X_OK)
  executablePath = edgePath
}

const browser = await chromium.launch({ headless: true, executablePath })
try {
  const page = await browser.newPage()
  const outputs = []
  for (const slug of slugs) {
    const source = await readFile(path.join(projectRoot, 'design-assets', 'finale', `${slug}.jpg`))
    const dataUrl = `data:image/jpeg;base64,${source.toString('base64')}`
    for (const targetWidth of [1200, 800, 480]) {
      const encoded = await page.evaluate(async ({ dataUrl, targetWidth }) => {
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
        const output = canvas.toDataURL('image/webp', 0.83)
        if (!output.startsWith('data:image/webp;base64,')) throw new Error('WebP encoding is unavailable.')
        return { width, height, sourceWidth: sourceImage.naturalWidth, sourceHeight: sourceImage.naturalHeight, base64: output.split(',')[1] }
      }, { dataUrl, targetWidth })
      const suffix = targetWidth === 1200 ? '' : `-${targetWidth}`
      const filename = `${slug}${suffix}.webp`
      const bytes = Buffer.from(encoded.base64, 'base64')
      await writeFile(path.join(projectRoot, 'public', 'images', filename), bytes)
      outputs.push({ filename, width: encoded.width, height: encoded.height, sourceWidth: encoded.sourceWidth, sourceHeight: encoded.sourceHeight, bytes: bytes.length })
    }
  }
  console.table(outputs)
} finally {
  await browser.close()
}
