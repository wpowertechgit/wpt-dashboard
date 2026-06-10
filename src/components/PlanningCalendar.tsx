import { useMemo, useRef, useState } from 'react'
import type { WheelEvent } from 'react'
import dayjs from 'dayjs'
import { Box, CircularProgress, IconButton, Stack, Typography, Tooltip } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import { FaEye } from 'react-icons/fa'
import { FaEyeSlash } from 'react-icons/fa6'
import { Card, Eyebrow, PageTitle } from './Ui'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchProiecte, fetchSubansambluri, fetchTasksForUser } from '../lib/api'
import { buildCalendarTimeline, type TaskTimelineRow } from '../lib/taskTimeline'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner } from './StateViews'
import { usePermissions } from '../lib/permissionsContext'

type GanttRow = TaskTimelineRow

const DEFAULT_PIXELS_PER_DAY = 44
const MIN_PIXELS_PER_DAY = 10
const MAX_PIXELS_PER_DAY = 72
const ZOOM_STEP = 4

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

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

type SourceFilter = 'all' | 'production' | 'task'

export default function PlanningCalendar({ userId }: { userId: string | null }) {
  const { t, lang } = useLang()
  const p = t.planning
  const { hasPermission } = usePermissions()
  const [today] = useState(() => dayjs())
  const [pixelsPerDay, setPixelsPerDay] = useState(DEFAULT_PIXELS_PER_DAY)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [showHiddenOverlay, setShowHiddenOverlay] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
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
    pixelsPerDay,
  }), [assignedTasks, includeProduction, includeTasks, pixelsPerDay, projects.data, subassemblies.data, todayKey])

  const visibleRows = useMemo(() => {
    return timeline.rows.filter(row => {
      if (hiddenIds.has(row.id)) return false
      if (sourceFilter === 'production' && row.source !== 'production') return false
      if (sourceFilter === 'task' && row.source !== 'task') return false
      return true
    })
  }, [timeline.rows, hiddenIds, sourceFilter])

  const hiddenRows = useMemo(() => {
    return timeline.rows.filter(row => hiddenIds.has(row.id))
  }, [timeline.rows, hiddenIds])

  const planning = useMemo(() => {
    const overdue = visibleRows
      .filter(row => row.tone === 'danger')
      .map(row => ({ title: row.label, subtitle: row.sublabel }))

    const upcoming = visibleRows
      .filter(row => row.tone !== 'danger' && row.tone !== 'success')
      .sort((a, b) => a.endDate.localeCompare(b.endDate))
      .slice(0, 6)
      .map(row => ({ title: row.label, subtitle: row.sublabel }))

    const completed = visibleRows
      .filter(row => row.tone === 'success')
      .sort((a, b) => b.endDate.localeCompare(a.endDate))
      .slice(0, 6)
      .map(row => ({ title: row.label, subtitle: row.sublabel }))

    return { overdue, upcoming, completed }
  }, [visibleRows])

  const ROW_H = 38
  const LABEL_W = 220
  const canvasHeight = visibleRows.length * ROW_H + 8
  const loading = tasks.loading || projects.loading || subassemblies.loading
  const error = tasks.error || projects.error || subassemblies.error

  function scrollTimeline(direction: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: direction * 420, behavior: 'smooth' })
  }

  function zoomTimeline(direction: -1 | 1) {
    const target = scrollerRef.current
    const maxScroll = target ? target.scrollWidth - target.clientWidth : 0
    const scrollRatio = target && maxScroll > 0 ? target.scrollLeft / maxScroll : 0

    setPixelsPerDay(current => clamp(current + direction * ZOOM_STEP, MIN_PIXELS_PER_DAY, MAX_PIXELS_PER_DAY))

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const nextTarget = scrollerRef.current
        if (!nextTarget) return
        nextTarget.scrollLeft = (nextTarget.scrollWidth - nextTarget.clientWidth) * scrollRatio
      })
    })
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
        subtitle={`${visibleRows.length} ${t.common.records}`}
        info={pageInfo(lang, 'planning')}
      />

      {error && <ErrorBanner message={error} />}

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: '16px 20px 12px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Eyebrow>{p.ganttTitle}</Eyebrow>

          {/* Source filter */}
          <Stack direction="row" gap={0.5}>
            {(['all', 'production', 'task'] as SourceFilter[]).map(f => {
              const label = f === 'all' ? p.filterAll : f === 'production' ? p.filterProduction : p.filterTasks
              const active = sourceFilter === f
              return (
                <Box
                  key={f}
                  onClick={() => setSourceFilter(f)}
                  sx={{
                    px: 1.25, py: 0.375, borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', border: '1px solid',
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-hairline)',
                    color: active ? 'var(--color-primary)' : 'var(--color-ink-subtle)',
                    bgcolor: active ? 'rgba(94,106,210,0.1)' : 'transparent',
                    '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' },
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </Box>
              )
            })}
          </Stack>

          {/* Hidden items button */}
          {hiddenRows.length > 0 && (
            <Tooltip title={p.hiddenItems} arrow>
              <Box
                onClick={() => setShowHiddenOverlay(v => !v)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.375,
                  borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: '1px solid', borderColor: showHiddenOverlay ? '#fbbf24' : 'var(--color-hairline)',
                  color: showHiddenOverlay ? '#fbbf24' : 'var(--color-ink-subtle)',
                  bgcolor: showHiddenOverlay ? 'rgba(251,191,36,0.1)' : 'transparent',
                  '&:hover': { borderColor: '#fbbf24', color: '#fbbf24' },
                  transition: 'all 0.15s',
                }}
              >
                <FaEye size={12} />
                {p.hiddenItems} ({hiddenRows.length})
              </Box>
            </Tooltip>
          )}

          <Stack direction="row" gap={1} sx={{ ml: 'auto' }}>
            <IconButton size="small" onClick={() => scrollTimeline(-1)} sx={{ color: 'var(--color-ink-subtle)', border: '1px solid var(--color-hairline)', width: 28, height: 28 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => scrollTimeline(1)} sx={{ color: 'var(--color-ink-subtle)', border: '1px solid var(--color-hairline)', width: 28, height: 28 }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
            <Tooltip title="Zoom out" arrow>
              <IconButton size="small" onClick={() => zoomTimeline(-1)} sx={{ color: 'var(--color-ink-subtle)', border: '1px solid var(--color-hairline)', width: 28, height: 28 }}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography sx={{ minWidth: 38, textAlign: 'center', alignSelf: 'center', fontSize: 11, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {Math.round((pixelsPerDay / DEFAULT_PIXELS_PER_DAY) * 100)}%
            </Typography>
            <Tooltip title="Zoom in" arrow>
              <IconButton size="small" onClick={() => zoomTimeline(1)} sx={{ color: 'var(--color-ink-subtle)', border: '1px solid var(--color-hairline)', width: 28, height: 28 }}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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

        {/* Hidden items overlay */}
        {showHiddenOverlay && hiddenRows.length > 0 && (
          <Box sx={{ borderBottom: '1px solid var(--color-hairline)', bgcolor: 'rgba(251,191,36,0.05)', px: 2.5, py: 1.5 }}>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {hiddenRows.map(row => (
                <Box
                  key={row.id}
                  onClick={() => setHiddenIds(prev => { const next = new Set(prev); next.delete(row.id); return next })}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5,
                    borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
                    border: '1px solid var(--color-hairline)', cursor: 'pointer',
                    color: 'var(--color-ink-muted)', bgcolor: 'var(--color-surface-1)',
                    '&:hover': { borderColor: '#4ade80', color: '#4ade80' },
                    transition: 'all 0.15s',
                  }}
                >
                  <FaEye size={11} />
                  {row.label}
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        <Box ref={scrollerRef} onWheel={handleTimelineWheel} sx={{ overflow: 'auto', maxHeight: { xs: 380, md: 620 } }}>
          <Box sx={{ width: timeline.canvasWidth + LABEL_W, minWidth: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', borderBottom: '1px solid var(--color-hairline)', height: 32 }}>
              <Box sx={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid var(--color-hairline)' }} />
              <Box sx={{ width: timeline.canvasWidth, flexShrink: 0, position: 'relative' }}>
                {timeline.monthTicks.map(tick => (
                  <Box
                    key={`${tick.label}-${tick.pct}`}
                    sx={{
                      position: 'absolute',
                      left: `${tick.pct}%`,
                      top: 0,
                      height: '100%',
                      width: `${tick.widthPct}%`,
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                      pl: 0.75,
                      pr: 0.75,
                      overflow: 'hidden',
                    }}
                  >
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-mono)', letterSpacing: 0 }}>{tick.label.toUpperCase()}</Typography>
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

              {visibleRows.map((row, i) => {
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
                      '&:hover .row-hide-btn': { opacity: 1 },
                    }}
                  >
                    <Box sx={{ width: LABEL_W, flexShrink: 0, px: 1.5, pr: 0.5, borderRight: '1px solid var(--color-hairline)', height: '100%', display: 'flex', alignItems: 'center', gap: 0.5, overflow: 'hidden' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.label}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.sublabel}
                        </Typography>
                      </Box>
                      <Tooltip title={p.hideRow} placement="right" arrow>
                        <Box
                          className="row-hide-btn"
                          onClick={() => setHiddenIds(prev => new Set([...prev, row.id]))}
                          sx={{
                            opacity: 0, flexShrink: 0, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 'var(--radius-xs)', cursor: 'pointer', color: 'var(--color-ink-tertiary)',
                            '&:hover': { color: '#f87171', bgcolor: 'rgba(248,113,113,0.1)' },
                            transition: 'opacity 0.15s, color 0.15s',
                          }}
                        >
                          <FaEyeSlash size={11} />
                        </Box>
                      </Tooltip>
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

              {!loading && visibleRows.length === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
                  <Typography sx={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>{t.tasks.noTasks}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <SummaryCard title={p.overdue} rows={planning.overdue} emptyLabel={p.empty} tone="danger" />
        <SummaryCard title={p.upcoming} rows={planning.upcoming} emptyLabel={p.empty} tone="warning" />
        <SummaryCard title={p.completed} rows={planning.completed} emptyLabel={p.empty} tone="success" />
      </Box>
    </Stack>
  )
}
