import pg from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const connectionString = process.env.SUPABASE_DB_URL

if (!connectionString) {
  throw new Error('Set SUPABASE_DB_URL before running migrations.')
}

const client = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: process.env.SUPABASE_DB_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true,
  },
})

const migrations = [
  '../migrations/001_create_tables.sql',
  '../migrations/002_seed.sql',
  '../migrations/003_profiles.sql',
  '../migrations/004_security_hardening.sql',
  '../migrations/005_date_tracking.sql',
  '../migrations/006_project_budget.sql',
  '../migrations/007_role_based_rls.sql',
]

await client.connect()
console.log('Connected to Supabase PostgreSQL')

for (const file of migrations) {
  const sql = readFileSync(join(__dirname, file), 'utf8')
  const name = file.split('/').pop()
  try {
    await client.query(sql)
    console.log(`✅ ${name}`)
  } catch (err) {
    console.error(`❌ ${name}: ${err.message}`)
    process.exit(1)
  }
}

await client.end()
console.log('Done.')
