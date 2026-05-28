import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildProjectOptions, buildProjectStatuses } from '../src/lib/projectOptions.ts'

test('buildProjectOptions derives sorted project ids from live rows', () => {
  assert.deepEqual(
    buildProjectOptions([
      { id: 'WP1000-12' },
      { id: 'WP1000-08' },
      { id: '' },
      { client: 'missing id' },
      { id: 'WP1000-12' },
    ]),
    ['WP1000-08', 'WP1000-12'],
  )
})

test('buildProjectStatuses keeps each project id and status for summaries', () => {
  assert.deepEqual(
    buildProjectStatuses([
      { id: 'WP1000-08', status: 'IN PRODUCTIE' },
      { id: 'WP1000-12', status: 'BLOCAJE ACTIVE' },
    ]),
    [
      { id: 'WP1000-08', status: 'IN PRODUCTIE' },
      { id: 'WP1000-12', status: 'BLOCAJE ACTIVE' },
    ],
  )
})
