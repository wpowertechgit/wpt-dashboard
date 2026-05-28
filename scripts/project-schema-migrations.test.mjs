import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('migration runner includes follow-up project schema migrations', () => {
  const runner = readFileSync(new URL('../scripts/migrate.mjs', import.meta.url), 'utf8')

  assert.match(runner, /005_date_tracking\.sql/)
  assert.match(runner, /006_project_budget\.sql/)
  assert.match(runner, /007_role_based_rls\.sql/)
})

test('role-based RLS migration removes blanket authenticated write policies', () => {
  const migration = readFileSync(new URL('../migrations/007_role_based_rls.sql', import.meta.url), 'utf8')

  for (const policy of [
    'auth_all_proiecte',
    'auth_all_subansambluri',
    'auth_all_blocaje',
    'auth_all_pdca',
    'auth_all_flux_zilnic',
    'auth_all_kpi_echipe',
  ]) {
    assert.match(migration, new RegExp(`DROP POLICY IF EXISTS ${policy}`))
  }

  assert.doesNotMatch(migration, /FOR ALL TO authenticated USING \(true\) WITH CHECK \(true\)/i)
  assert.match(migration, /CREATE SCHEMA IF NOT EXISTS private/)
  assert.match(migration, /CREATE OR REPLACE FUNCTION private\.is_admin/)
  assert.match(migration, /CREATE POLICY proiecte_admin_all/)
  assert.match(migration, /CREATE POLICY proiecte_worker_read/)
})
