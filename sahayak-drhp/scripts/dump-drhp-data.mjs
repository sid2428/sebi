// Dumps the app's own domain data to JSON so the offer document can be
// typeset from exactly the values the UI shows. Run via `npm run drhp:data`.
//
// The data modules are TypeScript, so they are bundled with esbuild (already
// present as a Vite dependency) before being imported.

import { build } from 'esbuild'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const out = process.argv[2] ?? join(root, 'scripts', 'drhp-data.json')

const dir = await mkdtemp(join(tmpdir(), 'drhp-data-'))
const bundle = join(dir, 'data.mjs')

// The data modules pull in the zustand store transitively; stub the browser
// globals it touches at import time so this runs under plain Node.
globalThis.window = undefined

await build({
  entryPoints: [join(root, 'scripts', 'dump-entry.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: bundle,
  logLevel: 'silent',
})

const mod = await import(pathToFileURL(bundle).href)
await writeFile(out, JSON.stringify(mod.payload, null, 2), 'utf8')
await rm(dir, { recursive: true, force: true })

console.log(`wrote ${out}`)
