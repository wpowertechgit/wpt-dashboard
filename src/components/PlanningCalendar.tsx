import { useMemo, useRef, useState } from 'react'
import type { WheelEvent } from 'react'
import dayjs from 'dayjs'
import { Box, CircularProgress, IconButton, Stack, Typography, Tooltip } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Card, Eyebrow, PageTitle } from './Ui'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchProiecte, fetchSubansambluri, fetchTasksForUser } from '../lib/api'
import { buildCalendarTimeline, type TaskTimelineRow } from '../lib/taskTimeline'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner } from './StateViews'
import { usePermissions } from '../lib/permissionsContext'

type GanttRow = TaskTimelineRow

function barColor(tone: GanttRow['tone']): { bar: string; fill: string; border: string } {
  if (tone === 'success') return { bar: 'rgba(74,222,128,0.12)', fill: '#4ade80', border: 'rgba(74,222,128,0.5)' }
  if (tone === 'danger') return { bar: 'rgba(248,113,113,0.12)', fill: '#f87171', border: 'rgba(248,113,113,0.5)' }
  if (tone === 'warning') return { bar: 'rgba(251,191,36,0.12)', fill: '#fbbf24', border: 'rgba(251,191,36,0.5)' }
  return { bar: 'rgba(94,106,210,0.12)', fill: '#818cf8', border: 'rgba(94,106,210,0.4)' }
}

function GanttBar({ row }: { row: GanttRow }) {
  const c = barColor(row.tone)

  return (
    <Tooltip title={row.tooltip} placement="top" arrow>
      <Box
        sx={{
          position: 'absolute',
          left: `${row.startPct}%`,
          width: `${Math.max(row.widthPct, 0.4)}%`,
          height: 26,
          bgcolor: c.bar,
          border: `1px solid ${c.border}`,
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          cursor: 'default',
          '&:hover': { filter: 'brightness(1.15)' },
        }}
      >
        <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${row.progressPct}%`, bgcolor: c.fill, opacity: 0.35 }} />
        <Typography sx={{ position: 'absolute', left: 6, right: row.isDone ? 20 : 6, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 600, color: c.fill, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>
          {row.label}
        </Typography>
        {row.isDone && (
          <CheckIcon sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: c.fill }} />
        )}
      </Box>
    </Tooltip>
  )
}

function SummaryCard({ title, rows, emptyLabel, tone }: {
  title: string
  rows: { title: string; subtitle: string }[]
  emptyLabel: string
  tone: 'danger' | 'warning' | 'success'
}) {
  const border = tone === 'danger' ? '#f87171' : tone === 'warning' ? '#fbbf24' : '#4ade80'
  return (
    <Card>
      <Eyebrow sx={{ mb: 2 }}>{title}</Eyebrow>
      <Stack gap={1}>
        {rows.length === 0 ? (
          <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{emptyLabel}</Typography>
        ) : rows.map(row => (
          <Box key={`${row.title}-${row.subtitle}`} sx={{ borderLeft: `3px solid ${border}`, pl: 1.25, py: 0.25 }}>
            <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>{row.title}</Typography>
            <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{row.subtitle || '-'}</Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  )
}

export default function PlanningCalendar({ userId }: { userId: string | null }) {
  const { t, lang } = useLang()
  const p = t.planning
  const { hasPermission } = usePermissions()
  const [today] = useState(() => dayjs())
  const todayKey = today.format('YYYY-MM-DD')
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const includeProduction = hasPermission('view_projects') || hasPermission('view_subassemblies') || hasPermission('view_planning')
  const includeTasks = hasPermission('view_tasks')

  const tasks = useQuery(
    includeTasks && userId ? () => fetchTasksForUser(userId) : () => Promise.resolve({ assigned: [], created: [] }),
    [includeTasks, userId],
  )
  const projects = useQuery(includeProduction ? fetchProiecte : () => Promise.resolve([]), [includeProduction])
  const subassemblies = useQuery(includeProduction ? fetchSubansambluri : () => Promise.resolve([]), [includeProduction])

  const assignedTasks = tasks.data?.assigned ?? []
  const timeline = useMemo(() => buildCalendarTimeline({
    today: todayKey,
    tasks: assignedTasks,
    projects: projects.data ?? [],
    subassemblies: subassemblies.data ?? [],
    includeProduction,
    includeTasks,
  }), [assignedTasks, includeProduction, includeTasks, projects.data, subassemblies.data, todayKey])

  const planning = useMemo(() => {
    const overdue = timeline.rows
      .filter(row => row.tone === 'danger')
      .map(row => ({ title: row.label, subtitle: row.sublabel }))

    const upcoming = timeline.rows
      .filter(row => row.tone !== 'danger' && row.tone !== 'success')
      .sort((a, b) => a.endDate.localeCompare(b.endDate))
      .slice(0, 6)
      .map(row => ({ title: row.label, subtitle: row.sublabel }))

    const completed = timeline.rows
      .filter(row => row.tone === 'success')
      .sort((a, b) => b.endDate.localeCompare(a.endDate))
      .slice(0, 6)
      .map(row => ({ title: row.label, subtitle: row.sublabel }))

    return { overdue, upcoming, completed }
  }, [timeline.rows])

  const ROW_H = 38
  const LABEL_W = 220
  const canvasHeight = timeline.rows.length * ROW_H + 8
  const loading = tasks.loading || projects.loading || subassemblies.loading
  const error = tasks.error || projects.error || subassemblies.error

  function scrollTimeline(direction: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: direction * 420, behavior: 'smooth' })
  }

  function handleTimelineWheel(event: WheelEvent<HTMLDivElement>) {
    const target = scrollerRef.current
    if (!target) return

    const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : -event.deltaY
    if (horizontalDelta === 0) return

    event.preventDefault()
    target.scrollLeft += horizontalDelta
  }

  return (
    <Stack gap={4}>
      <PageTitle
        eyebrow={p.eyebrow}
        title={p.title}
        subtitle={`${timeline.rows.length} ${t.common.records}`}
        info={pageInfo(lang, 'planning')}
      />

      {error && <ErrorBanner message={error} />}

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: '16px 20px 12px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Eyebrow>{p.ganttTitle}</Eyebrow>

          <Stack direction="row" gap={1} sx={{ ml: 'auto' }}>
            <IconButton size="small" onClick={() => scrollTimeline(-1)} sx={{ color: 'var(--color-ink-subtle)', border: '1px solid var(--color-hairline)', width: 28, height: 28 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => scrollTimeline(1)} sx={{ color: 'var(--color-ink-subtle)', border: '1px solid var(--color-hairline)', width: 28, height: 28 }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack direction="row" gap={1.5}>
            {[
              { label: p.legendDone, color: '#4ade80' },
              { label: p.legendOverdue, color: '#f87171' },
              { label: p.legendSoon, color: '#fbbf24' },
              { label: p.legendActive, color: '#818cf8' },
            ].map(({ label, color }) => (
              <Stack key={label} direction="row" alignItems="center" gap={0.5}>
                <Box sx={{ width: 10, height: 10, borderRadius: 'var(--radius-xs)', bgcolor: color, opacity: 0.7 }} />
                <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)' }}>{label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box ref={scrollerRef} onWheel={handleTimelineWheel} sx={{ overflow: 'auto', maxHeight: 620 }}>
          <Box sx={{ width: timeline.canvasWidth + LABEL_W, minWidth: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', borderBottom: '1px solid var(--color-hairline)', height: 32 }}>
              <Box sx={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid var(--color-hairline)' }} />
              <Box sx={{ width: timeline.canvasWidth, flexShrink: 0, position: 'relative' }}>
                {timeline.monthTicks.map(tick => (
                  <Box
                    key={`${tick.label}-${tick.pct}`}
                    sx={{ position: 'absolute', left: `${tick.pct}%`, top: 0, height: '100%', display: 'flex', alignItems: 'center', pl: 0.75 }}
                  >
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', letterSpacing: 0 }}>{tick.label.toUpperCase()}</Typography>
                    <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '1px', bgcolor: 'var(--color-hairline)' }} />
                  </Box>
                ))}
                <Box sx={{ position: 'absolute', left: `${timeline.todayPct}%`, top: 0, height: '100%', width: '2px', bgcolor: '#5e6ad2', opacity: 0.6 }} />
              </Box>
            </Box>

            <Box sx={{ position: 'relative', height: loading ? 88 : canvasHeight }}>
              <Box sx={{ position: 'absolute', left: LABEL_W, width: timeline.canvasWidth, top: 0, bottom: 0, pointerEvents: 'none' }}>
                {timeline.monthTicks.map(tick => (
                  <Box key={`${tick.label}-${tick.pct}`} sx={{ position: 'absolute', left: `${tick.pct}%`, top: 0, bottom: 0, width: '1px', bgcolor: 'var(--color-hairline)', opacity: 0.5 }} />
                ))}
                <Box sx={{ position: 'absolute', left: `${timeline.todayPct}%`, top: 0, bottom: 0, width: '2px', bgcolor: '#5e6ad2', opacity: 0.7, zIndex: 2 }}>
                  <Box sx={{ position: 'absolute', top: -1, left: -3, width: 8, height: 8, borderRadius: '50%', bgcolor: '#5e6ad2' }} />
                </Box>
              </Box>

              {timeline.rows.map((row, i) => {
                const y = i * ROW_H
                return (
                  <Box
                    key={row.id}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: y,
                      height: ROW_H,
                      width: timeline.canvasWidth + LABEL_W,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--color-hairline)',
                      bgcolor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    }}
                  >
                    <Box sx={{ width: LABEL_W, flexShrink: 0, px: 1.5, borderRight: '1px solid var(--color-hairline)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.label}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.sublabel}
                      </Typography>
                    </Box>

                    <Box sx={{ width: timeline.canvasWidth, flexShrink: 0, position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                      <GanttBar row={row} />
                    </Box>
                  </Box>
                )
              })}

              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 88 }}>
                  <CircularProgress size={20} />
                </Box>
              )}

              {!loading && timeline.rows.length === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
                  <Typography sx={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>{t.tasks.noTasks}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <SummaryCard title={p.overdue} rows={planning.overdue} emptyLabel={p.empty} tone="danger" />
        <SummaryCard title={p.upcoming} rows={planning.upcoming} emptyLabel={p.empty} tone="warning" />
        <SummaryCard title={p.completed} rows={planning.completed} emptyLabel={p.empty} tone="success" />
      </Box>
    </Stack>
  )
}
