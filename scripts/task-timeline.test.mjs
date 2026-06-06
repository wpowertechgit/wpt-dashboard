import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildCalendarTimeline, buildTaskTimeline } from '../src/lib/taskTimeline.ts'

test('buildTaskTimeline creates one gantt row per assigned task', () => {
  const timeline = buildTaskTimeline({
    today: '2026-06-04',
    tasks: [
      {
        id: 'task-1',
        title: 'Review quote',
        description: null,
        created_by: 'manager',
        assigned_to: 'me',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        due_date: '2026-06-10',
        created_at: '2026-06-01T08:00:00Z',
        updated_at: '2026-06-01T08:00:00Z',
      },
      {
        id: 'task-2',
        title: 'Prepare docs',
        description: 'Export package',
        created_by: 'manager',
        assigned_to: 'me',
        priority: 'NORMAL',
        status: 'TODO',
        due_date: null,
        created_at: '2026-06-03T08:00:00Z',
        updated_at: '2026-06-03T08:00:00Z',
      },
    ],
  })

  assert.equal(timeline.rows.length, 2)
  assert.deepEqual(timeline.rows.map(row => row.label), ['Review quote', 'Prepare docs'])
  assert.equal(timeline.rows[0].tone, 'warning')
  assert.equal(timeline.rows[0].progressPct, 50)
  assert.equal(timeline.rows[1].progressPct, 15)
})

test('buildTaskTimeline expands canvas width for long schedules', () => {
  const timeline = buildTaskTimeline({
    today: '2026-06-04',
    tasks: [
      {
        id: 'long-task',
        title: 'Long delivery',
        description: null,
        created_by: 'manager',
        assigned_to: 'me',
        priority: 'URGENT',
        status: 'TODO',
        due_date: '2026-12-31',
        created_at: '2026-01-01T08:00:00Z',
        updated_at: '2026-01-01T08:00:00Z',
      },
    ],
  })

  assert.equal(timeline.totalDays > 300, true)
  assert.equal(timeline.canvasWidth > 3000, true)
})

test('buildTaskTimeline scales canvas width by pixels per day for zooming', () => {
  const task = {
    id: 'long-task',
    title: 'Long delivery',
    description: null,
    created_by: 'manager',
    assigned_to: 'me',
    priority: 'URGENT',
    status: 'TODO',
    due_date: '2026-12-31',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  }

  const zoomedIn = buildTaskTimeline({ today: '2026-06-04', tasks: [task], pixelsPerDay: 44 })
  const zoomedOut = buildTaskTimeline({ today: '2026-06-04', tasks: [task], pixelsPerDay: 12 })

  assert.equal(zoomedOut.canvasWidth < zoomedIn.canvasWidth, true)
})

test('buildCalendarTimeline combines production due dates and assigned tasks', () => {
  const timeline = buildCalendarTimeline({
    today: '2026-06-04',
    includeProduction: true,
    includeTasks: true,
    projects: [
      { id: 'WP1000-11', client: 'Client Nou', data_start: '2026-05-01', data_target: '2026-05-20', data_done: '' },
    ],
    subassemblies: [
      { proiect: 'WP1000-11', nr: 1, nume: 'Subassembly 01', data_start: '2026-05-02', data_due: '2026-05-18', data_done: '' },
    ],
    tasks: [
      {
        id: 'task-1',
        title: 'Review quote',
        description: null,
        created_by: 'manager',
        assigned_to: 'me',
        priority: 'HIGH',
        status: 'TODO',
        due_date: '2026-06-10',
        created_at: '2026-06-01T08:00:00Z',
        updated_at: '2026-06-01T08:00:00Z',
      },
    ],
  })

  assert.deepEqual(
    timeline.rows.map(row => ({ source: row.source, label: row.label })),
    [
      { source: 'production', label: 'WP1000-11' },
      { source: 'production', label: 'Subassembly 01' },
      { source: 'task', label: 'Review quote' },
    ],
  )
  assert.equal(timeline.timelineStart.isBefore('2026-05-01'), true)
})
