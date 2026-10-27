import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Encode the supplied photograph at its native ratio, without cropping or upscaling.
// Run from any directory: node scripts/optimize-training-image.mjs
const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const source = path.join(projectRoot, 'design-assets', 'training', 'training-community.jpg')
const outputs = []

for (const width of [1080, 800, 480]) {
  const suffix = width === 1080 ? '' : `-${width}`
  const filename = `training-community${suffix}.webp`
  const result = await sharp(source).rotate().resize({ width, withoutEnlargement: true })
    .webp({ quality: 84 }).toFile(path.join(projectRoot, 'public', 'images', filename))
  outputs.push({ filename, width: result.width, height: result.height, bytes: result.size })
}

console.table(outputs)
