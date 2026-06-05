import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '../lib/useQuery'
import { fetchTasksForUser, updateTask } from '../lib/api'
import type { Task } from '../lib/api'
import { useLang } from '../lib/i18n'
import { Box, Stack, Typography } from '@mui/material'
import { Badge } from './Ui'

const PRIORITY_TONE: Record<string, 'error' | 'warning' | 'info' | undefined> = {
  URGENT: 'error', HIGH: 'warning', NORMAL: 'info',
}

function priorityLabel(p: string) {
  if (p === 'URGENT') return '🔴'
  if (p === 'HIGH') return '🟠'
  if (p === 'NORMAL') return '🔵'
  return '⚪'
}

function isOverdue(task: Task) {
  return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE'
}

export default function ActiveTasksPanel({ userId, onClose, onCountChange }: { userId: string; onClose: () => void; onCountChange?: (n: number) => void }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const { data, refetch } = useQuery(() => fetchTasksForUser(userId))

  const activeTasks = (data?.assigned ?? []).filter(t => t.status !== 'DONE')
  const overdue = activeTasks.filter(isOverdue)

  useEffect(() => {
    onCountChange?.(activeTasks.length)
  }, [activeTasks.length, onCountChange])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function markDone(task: Task) {
    await updateTask(task.id, { status: 'DONE' })
    refetch()
  }

  return (
    <>
      {/* Backdrop (mobile only) */}
      <Box
        onClick={onClose}
        sx={{
          display: { xs: 'block', lg: 'none' },
          position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 199,
        }}
      />

      {/* Panel */}
      <Box sx={{
        position: 'fixed',
        top: { xs: 0, lg: '56px' },
        right: 0,
        bottom: 0,
        width: { xs: '100vw', sm: 340 },
        maxWidth: '100vw',
        bgcolor: 'var(--color-canvas)',
        borderLeft: '1px solid var(--color-hairline)',
        boxShadow: '-6px 0 32px rgba(0,0,0,0.25)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" sx={{ p: '14px 16px', borderBottom: '1px solid var(--color-hairline)', flexShrink: 0 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: 0.2 }}>
              {t.tasks.myTasks}
            </Typography>
            {overdue.length > 0 && (
              <Typography sx={{ fontSize: 11, color: '#f87171', mt: 0.125 }}>
                {overdue.length} {t.tasks.overdueShort ?? 'overdue'}
              </Typography>
            )}
          </Box>
          <Stack direction="row" alignItems="center" gap={1} sx={{ ml: 'auto' }}>
            <Box
              component="button"
              onClick={() => { navigate('/tasks'); onClose() }}
              sx={{ fontSize: 11, color: 'var(--color-primary)', bgcolor: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', p: 0 }}
            >
              {t.tasks.viewAll ?? 'View all'}
            </Box>
            <Box
              component="button"
              onClick={onClose}
              sx={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--color-ink-subtle)', fontSize: 14, '&:hover': { color: 'var(--color-ink)' } }}
            >
              ✕
            </Box>
          </Stack>
        </Stack>

        {/* Task list */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {activeTasks.length === 0 ? (
            <Box sx={{ p: '32px 16px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 28, mb: 1 }}>✅</Typography>
              <Typography sx={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>
                {t.tasks.noActiveTasks ?? 'No active tasks'}
              </Typography>
            </Box>
          ) : activeTasks.map((task, i) => (
            <Box
              key={task.id}
              sx={{
                p: '12px 16px',
                borderBottom: i < activeTasks.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                bgcolor: isOverdue(task) ? 'rgba(239,68,68,0.03)' : 'transparent',
                '&:hover': { bgcolor: 'var(--color-surface)' },
                cursor: 'pointer',
              }}
              onClick={() => { navigate('/tasks'); onClose() }}
            >
              <Stack direction="row" alignItems="flex-start" gap={1}>
                <Typography sx={{ fontSize: 14, flexShrink: 0, mt: 0.125 }}>{priorityLabel(task.priority)}</Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.5 }} flexWrap="wrap">
                    <Badge tone={task.status === 'IN_PROGRESS' ? 'info' : undefined} sx={{ fontSize: 10, px: '5px', py: '1px' }}>
                      {task.status === 'IN_PROGRESS' ? 'In progress' : 'Todo'}
                    </Badge>
                    {task.due_date && (
                      <Typography sx={{ fontSize: 11, color: isOverdue(task) ? '#f87171' : 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {isOverdue(task) ? '⚠ ' : ''}{task.due_date}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <Box
                  component="button"
                  onClick={e => { e.stopPropagation(); markDone(task) }}
                  title="Mark done"
                  sx={{ flexShrink: 0, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: '#4ade80', fontSize: 13, '&:hover': { bgcolor: 'rgba(39,166,68,0.18)' } }}
                >
                  ✓
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>

        {/* Footer count */}
        {activeTasks.length > 0 && (
          <Box sx={{ p: '10px 16px', borderTop: '1px solid var(--color-hairline)', flexShrink: 0 }}>
            <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)', textAlign: 'center' }}>
              {activeTasks.length} {t.tasks.activeTasks ?? 'active tasks'}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  )
}
