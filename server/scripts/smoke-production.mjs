import 'dotenv/config'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'
import path from 'node:path'

const port = 3002
const origin = 'http://127.0.0.1:' + port
const child = spawn(process.execPath, ['dist-server/server/index.js'], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'production', HOST: '127.0.0.1', PORT: String(port) },
  stdio: 'ignore',
  windowsHide: true,
})
child.on('error', () => { process.exitCode = 1 })
try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    try { const response = await fetch(origin + '/api/health'); if (response.ok) { ready = true; break } } catch {}
    await delay(250)
  }
  assert.ok(ready, 'Le serveur de production doit démarrer.')
  for (const route of ['/', '/actualites', '/actualites/entreprendre-ici', '/opportunites', '/formations', '/evenements', '/ocean-tv', '/admin', '/admin/administrateurs', '/admin/contacts']) {
    const response = await fetch(origin + route)
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type') ?? '', /text\/html/)
    assert.match(await response.text(), /id="root"/)
  }
  const response = await fetch(origin + '/api/home')
  assert.equal(response.status, 200)
  const data = await response.json()
  assert.equal(data.articles.items.length, 4)
  assert.equal(data.opportunities.items.length, 3)
  const files = await readdir('dist/assets')
  const secrets = [process.env.DATABASE_URL, process.env.ADMIN_API_KEY].filter(Boolean)
  for (const file of files.filter(name => name.endsWith('.js'))) {
    const contents = await readFile(path.join('dist/assets', file), 'utf8')
    for (const secret of secrets) assert.ok(!contents.includes(secret), 'Aucun secret ne doit apparaître dans le frontend compilé.')
    assert.ok(!contents.includes('seed-content'), 'Les données de migration ne doivent pas entrer dans le frontend.')
  }
  console.log('Production vérifiée : routes frontend, API PostgreSQL et absence de secrets dans les bundles.')
} finally { child.kill() }

