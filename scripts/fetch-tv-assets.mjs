import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const sourceDirectory = path.join(root, 'design-assets', 'tv')
const metadataDirectory = path.join(root, '.sites-runtime', 'qa-tv')
const ids = ['aBU7JsDsF0Y', 'C6iXeFHqRHg', '8cZfOpKIKZs', 'JwN6ZCg-dZ4', 'lgewV5cuH9U', 'vFgWXF3iHlo', 'Oqndd84ydYw', '5vr7WdYF3uw']

await mkdir(sourceDirectory, { recursive: true })
await mkdir(metadataDirectory, { recursive: true })

const metadata = await Promise.all(ids.map(async (id) => {
  const videoUrl = `https://www.youtube.com/watch?v=${id}`
  const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`)
  if (!response.ok) throw new Error(`oEmbed ${id}: HTTP ${response.status}`)
  const data = await response.json()
  return { id, videoUrl, ...data }
}))

await writeFile(path.join(metadataDirectory, 'metadata.json'), JSON.stringify(metadata, null, 2))
console.log(JSON.stringify(metadata.map(({ id, title, author_name, author_url }) => ({ id, title, author_name, author_url })), null, 2))

await Promise.all(ids.map(async (id) => {
  for (const size of ['maxresdefault', 'sddefault', 'hqdefault']) {
    const sourceUrl = `https://i.ytimg.com/vi/${id}/${size}.jpg`
    const response = await fetch(sourceUrl)
    if (!response.ok) continue
    const bytes = Buffer.from(await response.arrayBuffer())
    await writeFile(path.join(sourceDirectory, `tv-${id}.jpg`), bytes)
    console.log(`${id}: ${size}, ${bytes.length} bytes`)
    return
  }
  throw new Error(`No thumbnail was downloadable for ${id}`)
}))
