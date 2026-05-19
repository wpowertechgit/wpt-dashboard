import { compareDateStrings, formatDateLabel, isOverdue } from './dateUtils.ts'

export type PlanningTone = 'warning' | 'danger' | 'success'

export interface PlanningItem {
  date: string
  title: string
  subtitle: string
  tone: PlanningTone
  kind: 'project-due' | 'subassembly-due' | 'subassembly-done'
}

interface PlanningInput {
  today: string
  proiecte: Array<Record<string, unknown>>
  subansambluri: Array<Record<string, unknown>>
}

function makeSubtitle(prefix: string, value?: string | null) {
  return `${prefix}: ${formatDateLabel(value)}`
}

export function buildPlanningBuckets({ today, proiecte, subansambluri }: PlanningInput) {
  const calendarItems: PlanningItem[] = []

  for (const proiect of proiecte) {
    const due = typeof proiect.data_target === 'string' ? proiect.data_target : ''
    if (!due) continue

    calendarItems.push({
      date: due,
      title: `${String(proiect.id)} · ${String(proiect.client ?? '')}`.trim(),
      subtitle: makeSubtitle('Project due', due),
      tone: isOverdue({ due, done: typeof proiect.data_done === 'string' ? proiect.data_done : '' }, today) ? 'danger' : 'warning',
      kind: 'project-due',
    })
  }

  for (const subansamblu of subansambluri) {
    const title = `${String(subansamblu.proiect)} · ${String(subansamblu.nume)}`
    const due = typeof subansamblu.data_due === 'string' ? subansamblu.data_due : ''
    const done = typeof subansamblu.data_done === 'string' ? subansamblu.data_done : ''

    if (due && !done) {
      calendarItems.push({
        date: due,
        title,
        subtitle: makeSubtitle('Subassembly due', due),
        tone: isOverdue({ due, done }, today) ? 'danger' : 'warning',
        kind: 'subassembly-due',
      })
    }

    if (done) {
      calendarItems.push({
        date: done,
        title,
        subtitle: makeSubtitle('Completed', done),
        tone: 'success',
        kind: 'subassembly-done',
      })
    }
  }

  calendarItems.sort((a, b) => compareDateStrings(a.date, b.date))

  const overdue = calendarItems.filter(item => item.tone === 'danger' && item.kind !== 'subassembly-done')
  const upcoming = calendarItems
    .filter(item => item.kind !== 'subassembly-done' && item.tone !== 'danger')
    .slice(0, 6)
  const completed = calendarItems
    .filter(item => item.kind === 'subassembly-done')
    .slice(-6)
    .reverse()

  return {
    calendarItems,
    overdue,
    upcoming,
    completed,
  }
}
