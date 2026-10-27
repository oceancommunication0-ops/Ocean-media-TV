import express from 'express'
import sharp, { type Metadata } from 'sharp'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'

export const mediaDirectory = path.resolve(process.env.MEDIA_DIRECTORY ?? 'storage/media')
export const mediaUploadParser = express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'], limit: '8mb' })
export const uploadImage: express.RequestHandler = async (req, res) => {
  if (!Buffer.isBuffer(req.body) || !req.body.length) { res.status(400).json({ error: { message: 'Choisissez une image JPEG, PNG, WebP ou AVIF (8 Mo maximum).' } }); return }
  let buffer: Buffer
  let metadata: Metadata
  try {
    const source = sharp(req.body, { limitInputPixels: 24_000_000, animated: false })
    metadata = await source.metadata()
    if (!['jpeg', 'png', 'webp', 'avif', 'heif'].includes(metadata.format ?? '')) throw new Error('Unsupported image')
    buffer = await source.rotate().resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toBuffer()
  } catch { res.status(400).json({ error: { message: 'Cette image est invalide ou dépasse les dimensions autorisées.' } }); return }
  await mkdir(mediaDirectory, { recursive: true })
  const filename = `${randomUUID()}.webp`
  await writeFile(path.join(mediaDirectory, filename), buffer, { flag: 'wx' })
  res.status(201).json({ src: `/images/uploads/${filename}`, width: metadata.width, height: metadata.height })
}
