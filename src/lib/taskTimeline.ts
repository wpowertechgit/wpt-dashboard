import dayjs from 'dayjs'
import type { Task } from './api.ts'

export type TaskTimelineTone = 'success' | 'warning' | 'danger' | 'neutral'

export interface TaskTimelineRow {
  id: string
  label: string
  sublabel: string
  source: 'production' | 'task'
  startDate: string
  endDate: string
  startPct: number
  widthPct: number
  progressPct: number
  tone: TaskTimelineTone
  isDone: boolean
  tooltip: string
}

interface MonthTick {
  label: string
  pct: number
}

interface TaskTimelineInput {
  today: string
  tasks: Task[]
  paddingDays?: number
  pixelsPerDay?: number
}

interface CalendarTimelineInput extends TaskTimelineInput {
  includeProduction: boolean
  includeTasks: boolean
  projects: Array<Record<string, unknown>>
  subassemblies: Array<Record<string, unknown>>
}

const DEFAULT_PADDING_DAYS = 14
const MIN_TIMELINE_DAYS = 30
const MIN_CANVAS_WIDTH = 1440
const DEFAULT_PIXELS_PER_DAY = 44

function parseDate(value: unknown): dayjs.Dayjs | null {
  if (!value || typeof value !== 'string') return null
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.startOf('day') : null
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function toPct(date: dayjs.Dayjs, start: dayjs.Dayjs, totalDays: number) {
  return clamp((date.diff(start, 'day') / totalDays) * 100, 0, 100)
}

function buildMonthTicks(start: dayjs.Dayjs, totalDays: number): MonthTick[] {
  const ticks: MonthTick[] = []
  let cursor = start.startOf('month')
  const end = start.add(totalDays, 'day')

  while (cursor.isBefore(end)) {
    const pct = toPct(cursor, start, totalDays)
    if (pct >= 0 && pct <= 100) ticks.push({ label: cursor.format('MMM YY'), pct })
    cursor = cursor.add(1, 'month')
  }

  return ticks
}

function taskEndDate(task: Task, start: dayjs.Dayjs) {
  return parseDate(task.due_date) ?? start.add(7, 'day')
}

function taskProgress(status: Task['status']) {
  if (status === 'DONE') return 100
  if (status === 'IN_PROGRESS') return 50
  return 15
}

function taskTone(task: Task, today: dayjs.Dayjs, end: dayjs.Dayjs): TaskTimelineTone {
  if (task.status === 'DONE') return 'success'
  if (end.isBefore(today)) return 'danger'
  if (end.diff(today, 'day') <= 7 || task.priority === 'URGENT') return 'warning'
  return 'neutral'
}

function rowTone(done: dayjs.Dayjs | null, today: dayjs.Dayjs, end: dayjs.Dayjs, soonDays: number): TaskTimelineTone {
  if (done) return 'success'
  if (end.isBefore(today)) return 'danger'
  if (end.diff(today, 'day') <= soonDays) return 'warning'
  return 'neutral'
}

function buildTimelineFromRows(today: string, rows: Array<{
  row: Omit<TaskTimelineRow, 'startPct' | 'widthPct'>
  start: dayjs.Dayjs
  end: dayjs.Dayjs
}>, paddingDays = DEFAULT_PADDING_DAYS, pixelsPerDay = DEFAULT_PIXELS_PER_DAY) {
  const currentDay = parseDate(today) ?? dayjs().startOf('day')
  const allDates = [currentDay, ...rows.flatMap(item => [item.start, item.end])]
  const minDate = allDates.reduce((a, b) => (a.isBefore(b) ? a : b)).subtract(paddingDays, 'day')
  const maxDate = allDates.reduce((a, b) => (a.isAfter(b) ? a : b)).add(paddingDays, 'day')
  const totalDays = Math.max(maxDate.diff(minDate, 'day'), MIN_TIMELINE_DAYS)

  const timelineRows: TaskTimelineRow[] = rows.map(({ row, start, end }) => {
    const durationDays = Math.max(end.diff(start, 'day'), 1)

    return {
      ...row,
      startPct: toPct(start, minDate, totalDays),
      widthPct: Math.max((durationDays / totalDays) * 100, 0.5),
    }
  })

  return {
    timelineStart: minDate,
    totalDays,
    todayPct: toPct(currentDay, minDate, totalDays),
    monthTicks: buildMonthTicks(minDate, totalDays),
    rows: timelineRows,
    canvasWidth: Math.max(MIN_CANVAS_WIDTH, Math.ceil(totalDays * pixelsPerDay)),
  }
}

function taskRows(today: dayjs.Dayjs, tasks: Task[]) {
  return tasks.map(task => {
    const start = parseDate(task.created_at) ?? parseDate(task.due_date) ?? today
    const end = taskEndDate(task, start)

    return {
      start,
      end,
      row: {
        id: `task-${task.id}`,
        label: task.title,
        sublabel: task.due_date ? `Task due ${task.due_date}` : 'Task with no due date',
        source: 'task' as const,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        progressPct: taskProgress(task.status),
        tone: taskTone(task, today, end),
        isDone: task.status === 'DONE',
        tooltip: `${task.title}\nCreated: ${start.format('YYYY-MM-DD')} | Due: ${task.due_date ?? 'none'}\nPriority: ${task.priority} | Status: ${task.status}`,
      },
    }
  })
}

function productionProjectRows(today: dayjs.Dayjs, projects: Array<Record<string, unknown>>) {
  return projects
    .filter(project => project.data_start || project.data_target || project.data_done)
    .map(project => {
      const start = parseDate(project.data_start) ?? parseDate(project.data_target) ?? today
      const end = parseDate(project.data_target) ?? parseDate(project.data_done) ?? start.add(1, 'day')
      const done = parseDate(project.data_done)
      const id = String(project.id ?? '')
      const client = String(project.client ?? '')
      const progress = Number(project.progres ?? (done ? 100 : 0))

      return {
        start,
        end,
        row: {
          id: `project-${id}`,
          label: id,
          sublabel: client ? `Project due ${end.format('YYYY-MM-DD')} - ${client}` : `Project due ${end.format('YYYY-MM-DD')}`,
          source: 'production' as const,
          startDate: start.format('YYYY-MM-DD'),
          endDate: end.format('YYYY-MM-DD'),
          progressPct: Math.max(0, Math.min(progress, 100)),
          tone: rowTone(done, today, end, 14),
          isDone: !!done,
          tooltip: `${id}${client ? ` - ${client}` : ''}\nStart: ${start.format('YYYY-MM-DD')} | Due: ${end.format('YYYY-MM-DD')} | Done: ${done?.format('YYYY-MM-DD') ?? 'none'}`,
        },
      }
    })
}

function productionSubassemblyRows(today: dayjs.Dayjs, subassemblies: Array<Record<string, unknown>>) {
  return subassemblies
    .filter(subassembly => subassembly.data_start || subassembly.data_due || subassembly.data_done)
    .map(subassembly => {
      const start = parseDate(subassembly.data_start) ?? parseDate(subassembly.data_due) ?? today
      const end = parseDate(subassembly.data_due) ?? parseDate(subassembly.data_done) ?? start.add(1, 'day')
      const done = parseDate(subassembly.data_done)
      const project = String(subassembly.proiect ?? '')
      const nr = String(subassembly.nr ?? '')
      const name = String(subassembly.nume ?? '')
      const progress = Number(subassembly.progres ?? (done ? 100 : 0))

      return {
        start,
        end,
        row: {
          id: `subassembly-${project}-${nr}`,
          label: name || `${project}.${nr}`,
          sublabel: `${project} due ${end.format('YYYY-MM-DD')}`,
          source: 'production' as const,
          startDate: start.format('YYYY-MM-DD'),
          endDate: end.format('YYYY-MM-DD'),
          progressPct: Math.max(0, Math.min(progress, 100)),
          tone: rowTone(done, today, end, 7),
          isDone: !!done,
          tooltip: `${project}${nr ? `.${nr}` : ''} ${name}\nStart: ${start.format('YYYY-MM-DD')} | Due: ${end.format('YYYY-MM-DD')} | Done: ${done?.format('YYYY-MM-DD') ?? 'none'}`,
        },
      }
    })
}

export function buildTaskTimeline({ today, tasks, paddingDays = DEFAULT_PADDING_DAYS, pixelsPerDay = DEFAULT_PIXELS_PER_DAY }: TaskTimelineInput) {
  const currentDay = parseDate(today) ?? dayjs().startOf('day')
  return buildTimelineFromRows(today, taskRows(currentDay, tasks), paddingDays, pixelsPerDay)
}

export function buildCalendarTimeline({
  today,
  tasks,
  projects,
  subassemblies,
  includeProduction,
  includeTasks,
  paddingDays = DEFAULT_PADDING_DAYS,
  pixelsPerDay = DEFAULT_PIXELS_PER_DAY,
}: CalendarTimelineInput) {
  const currentDay = parseDate(today) ?? dayjs().startOf('day')
  const rows = [
    ...(includeProduction ? productionProjectRows(currentDay, projects) : []),
    ...(includeProduction ? productionSubassemblyRows(currentDay, subassemblies) : []),
    ...(includeTasks ? taskRows(currentDay, tasks) : []),
  ].sort((a, b) => a.start.valueOf() - b.start.valueOf())

  return buildTimelineFromRows(today, rows, paddingDays, pixelsPerDay)
}
