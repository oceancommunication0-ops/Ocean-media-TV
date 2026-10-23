import { chromium } from '@playwright/test'
import { access, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Encode the official, user-selected YouTube thumbnails locally.
// Run: node scripts/optimize-tv-images.mjs
const root = fileURLToPath(new URL('../', import.meta.url))
const sourceDirectory = path.join(root, 'design-assets', 'tv')
const imageDirectory = path.join(root, 'public', 'images')
const ids = ['aBU7JsDsF0Y', 'C6iXeFHqRHg', '8cZfOpKIKZs', 'JwN6ZCg-dZ4', 'lgewV5cuH9U', 'vFgWXF3iHlo', 'Oqndd84ydYw', '5vr7WdYF3uw']
const quality = 0.86
let executablePath = process.env.TV_BROWSER_EXECUTABLE
if (!executablePath && process.platform === 'win32') {
  const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  await access(edgePath, constants.X_OK)
  executablePath = edgePath
}

const browser = await chromium.launch({ headless: true, executablePath })
try {
  const page = await browser.newPage()
  const outputs = []
  for (const id of ids) {
    const source = await readFile(path.join(sourceDirectory, `tv-${id}.jpg`))
    const dataUrl = `data:image/jpeg;base64,${source.toString('base64')}`
    for (const targetWidth of [0, ...(id === ids[0] ? [960] : []), 480]) {
      const encoded = await page.evaluate(async ({ dataUrl, targetWidth, quality }) => {
        const image = new Image()
        image.src = dataUrl
        await image.decode()
        const width = targetWidth ? Math.min(targetWidth, image.naturalWidth) : image.naturalWidth
        const height = Math.round(width * image.naturalHeight / image.naturalWidth)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d', { alpha: false })
        if (!context) throw new Error('Canvas 2D is unavailable.')
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        context.drawImage(image, 0, 0, width, height)
        const output = canvas.toDataURL('image/webp', quality)
        if (!output.startsWith('data:image/webp;base64,')) throw new Error('WebP encoding unavailable.')
        return { width, height, base64: output.split(',')[1] }
      }, { dataUrl, targetWidth, quality })
      const filename = `tv-${id}${targetWidth ? `-${targetWidth}` : ''}.webp`
      const bytes = Buffer.from(encoded.base64, 'base64')
      await writeFile(path.join(imageDirectory, filename), bytes)
      outputs.push({ filename, width: encoded.width, height: encoded.height, bytes: bytes.length })
    }
  }
  console.table(outputs)
} finally {
  await browser.close()
}
