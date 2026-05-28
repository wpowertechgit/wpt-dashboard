import pg from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const connectionString = process.env.SUPABASE_DB_URL

if (!connectionString) {
  throw new Error('Set SUPABASE_DB_URL before running migration 006.')
}

const client = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: process.env.SUPABASE_DB_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true,
  },
})

const sql = readFileSync(join(__dirname, '../migrations/006_project_budget.sql'), 'utf8')

await client.connect()
console.log('Connected to Supabase PostgreSQL')
await client.query(sql)
console.log('✅ 006_project_budget.sql')
await client.end()
console.log('Done.')
