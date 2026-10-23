import { chromium } from '@playwright/test'
import { access, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Resize and encode the licensed source photograph locally, without cropping it.
// Run from any directory: node scripts/optimize-training-image.mjs
const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const imageDirectory = path.join(projectRoot, 'public', 'images')
const sourcePath = path.join(projectRoot, 'design-assets', 'training', 'training-workshop.jpg')
const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const quality = 0.84
let executablePath = process.env.TRAINING_BROWSER_EXECUTABLE

if (!executablePath && process.platform === 'win32') {
  await access(edgePath, constants.X_OK)
  executablePath = edgePath
}

const browser = await chromium.launch({ headless: true, executablePath })

try {
  const page = await browser.newPage()
  const source = await readFile(sourcePath)
  const dataUrl = `data:image/jpeg;base64,${source.toString('base64')}`
  const outputs = []

  for (const targetWidth of [1200, 800, 480]) {
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

    const suffix = targetWidth === 1200 ? '' : `-${targetWidth}`
    const filename = `training-workshop${suffix}.webp`
    const bytes = Buffer.from(encoded.base64, 'base64')
    await writeFile(path.join(imageDirectory, filename), bytes)
    outputs.push({ filename, width: encoded.width, height: encoded.height, bytes: bytes.length })
  }

  console.table(outputs)
} finally {
  await browser.close()
}
