import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = process.cwd()
const scannedRoots = ['src', 'scripts', 'migrations', 'index.html', 'vite.config.ts', 'package.json', 'GHID_UTILIZARE.md']
const skippedDirs = new Set(['node_modules', 'dist', '.git'])

function collectFiles(path) {
  const fullPath = join(root, path)
  const stat = statSync(fullPath)

  if (stat.isFile()) return [fullPath]
  if (!stat.isDirectory()) return []

  return readdirSync(fullPath).flatMap((entry) => {
    if (skippedDirs.has(entry)) return []
    return collectFiles(join(path, entry))
  })
}

const files = scannedRoots.flatMap(collectFiles).filter((file) => !file.endsWith('.test.mjs'))

function filesContaining(pattern) {
  return files
    .filter((file) => pattern.test(readFileSync(file, 'utf8')))
    .map((file) => relative(root, file))
}

test('frontend source does not expose a Supabase service role client or env var', () => {
  assert.deepEqual(filesContaining(/VITE_SUPABASE_SERVICE_KEY|supabaseAdmin|service_role/i), [])
})

test('migration tooling reads the database URL from the environment', () => {
  assert.deepEqual(filesContaining(/postgres(?:ql)?:\/\/[^'"\s]+/i), [])
})
