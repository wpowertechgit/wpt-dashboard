import assert from 'node:assert/strict'
import { test } from 'node:test'

import { canWriteOperationalData } from '../src/lib/permissions.ts'

test('only admins can write operational data in real sessions', () => {
  assert.equal(canWriteOperationalData('admin'), true)
  assert.equal(canWriteOperationalData('worker'), false)
  assert.equal(canWriteOperationalData(null), false)
})

test('demo mode can remain interactive without touching production data', () => {
  assert.equal(canWriteOperationalData(null, { demoMode: true }), true)
})
