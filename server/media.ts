import express from 'express'
import sharp, { type Metadata } from 'sharp'
import { randomUUID } from 'node:crypto'
import { prisma } from './db.js'

async function storeImage(buffer: Buffer) {
  const id = randomUUID()
  await prisma.mediaAsset.create({ data: { id, data: Uint8Array.from(buffer), contentType: 'image/webp', byteLength: buffer.length } })
  return `/images/uploads/${id}.webp`
}

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
  const src = await storeImage(buffer)
  res.status(201).json({ src, width: metadata.width, height: metadata.height })
}

const mediaFilename = /^([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})\.webp$/
export const serveImage: express.RequestHandler = async (req, res) => {
  const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename
  const id = filename ? mediaFilename.exec(filename)?.[1] : undefined
  if (!id) { res.status(404).end(); return }
  const image = await prisma.mediaAsset.findUnique({ where: { id }, select: { id: true, data: true, contentType: true, byteLength: true } })
  if (!image) { res.status(404).end(); return }
  res.set({
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Length': String(image.byteLength),
    'Content-Type': image.contentType,
    ETag: `"${image.id}"`,
  })
  res.send(Buffer.from(image.data))
}
