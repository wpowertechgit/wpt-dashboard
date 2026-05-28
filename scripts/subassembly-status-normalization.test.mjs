import test from 'node:test'
import assert from 'node:assert/strict'

const {
  normalizeDepartmentStatus,
  normalizeGlobalStatus,
} = await import('../src/lib/subassemblyStatus.ts')

test('normalizeDepartmentStatus maps unaccented values into the UI select values', () => {
  assert.equal(normalizeDepartmentStatus('Neinceput'), 'Neînceput')
  assert.equal(normalizeDepartmentStatus('În lucru'), 'În lucru')
  assert.equal(normalizeDepartmentStatus('In lucru'), 'În lucru')
  assert.equal(normalizeDepartmentStatus('Finalizat'), 'Finalizat')
})

test('normalizeGlobalStatus maps legacy unstarted values into editable global status', () => {
  assert.equal(normalizeGlobalStatus('Neinceput'), '🔄 IN LUCRU')
  assert.equal(normalizeGlobalStatus('Neînceput'), '🔄 IN LUCRU')
  assert.equal(normalizeGlobalStatus('🔄 IN LUCRU'), '🔄 IN LUCRU')
  assert.equal(normalizeGlobalStatus('⛔ BLOCAT'), '⛔ BLOCAT')
})
