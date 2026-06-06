import test from 'node:test'
import assert from 'node:assert/strict'

const {
  parseAppDate,
  formatDateLabel,
  isOverdue,
} = await import('../src/lib/dateUtils.ts')

const {
  buildPlanningBuckets,
} = await import('../src/lib/planning.ts')

test('parseAppDate supports ISO and legacy seeded dates', () => {
  assert.equal(parseAppDate('2026-05-19')?.toISOString().slice(0, 10), '2026-05-19')
  assert.equal(parseAppDate('15-Ian-24')?.toISOString().slice(0, 10), '2024-01-15')
  assert.equal(parseAppDate('31-Mar-25')?.toISOString().slice(0, 10), '2025-03-31')
  assert.equal(parseAppDate('') ?? null, null)
})

test('formatDateLabel returns a compact readable label for ISO dates', () => {
  assert.equal(formatDateLabel('2026-05-19'), '19 May 2026')
  assert.equal(formatDateLabel('15-Ian-24'), '15 Jan 2024')
  assert.equal(formatDateLabel(''), '—')
})

test('isOverdue detects due items that are not yet completed', () => {
  assert.equal(isOverdue({ due: '2026-05-01', done: '' }, '2026-05-19'), true)
  assert.equal(isOverdue({ due: '2026-05-21', done: '' }, '2026-05-19'), false)
  assert.equal(isOverdue({ due: '2026-05-01', done: '2026-05-03' }, '2026-05-19'), false)
})

test('buildPlanningBuckets derives calendar items for projects and subassemblies', () => {
  const result = buildPlanningBuckets({
    today: '2026-05-19',
    proiecte: [
      { id: 'WP1000-11', client: 'Client Nou', data_target: '2026-05-20', data_done: '' },
    ],
    subansambluri: [
      { proiect: 'WP1000-11', nr: 1, nume: 'Subassembly 01', data_due: '2026-05-18', data_done: '' },
      { proiect: 'WP1000-11', nr: 2, nume: 'Subassembly 02', data_due: '2026-05-21', data_done: '2026-05-19' },
    ],
  })

  assert.equal(result.overdue.length, 1)
  assert.equal(result.overdue[0].title, 'WP1000-11 · Subassembly 01')
  assert.equal(result.upcoming.length, 1)
  assert.equal(result.completed.length, 1)
  assert.deepEqual(
    result.calendarItems.map(item => ({ date: item.date, tone: item.tone, title: item.title })),
    [
      { date: '2026-05-18', tone: 'danger', title: 'WP1000-11 · Subassembly 01' },
      { date: '2026-05-19', tone: 'success', title: 'WP1000-11 · Subassembly 02' },
      { date: '2026-05-20', tone: 'warning', title: 'WP1000-11 · Client Nou' },
    ],
  )
})
