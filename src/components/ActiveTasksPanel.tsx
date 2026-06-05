import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '../lib/useQuery'
import { fetchTasksForUser, updateTask } from '../lib/api'
import type { Task } from '../lib/api'
import { useLang } from '../lib/i18n'
import { Stack, Typography, Box } from '@mui/material'
import { Badge } from './Ui'

function isOverdue(task: Task) {
  return !!task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE'
}

function PriorityDot({ p }: { p: string }) {
  const color = p === 'URGENT' ? '#f87171' : p === 'HIGH' ? '#fb923c' : p === 'NORMAL' ? '#818cf8' : '#6b7280'
  return <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0, mt: '5px' }} />
}

export default function ActiveTasksPanel({ userId, onCountChange }: { userId: string; onCountChange?: (n: number) => void }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const { data, refetch } = useQuery(() => fetchTasksForUser(userId))

  const activeTasks = (data?.assigned ?? []).filter(t => t.status !== 'DONE')
  const overdueCount = activeTasks.filter(isOverdue).length

  // collapsed = bubble, expanded = card
  const [collapsed, setCollapsed] = useState(false)

  // auto-collapse after 10s
  useEffect(() => {
    const id = setTimeout(() => setCollapsed(true), 10000)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    onCountChange?.(activeTasks.length)
  }, [activeTasks.length]) // eslint-disable-line

  async function markDone(e: React.MouseEvent, task: Task) {
    e.stopPropagation()
    await updateTask(task.id, { status: 'DONE' })
    refetch()
  }

  return (
    <AnimatePresence mode="wait">
      {collapsed ? (
        /* ── Bubble ── */
        <motion.div
          key="bubble"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          onClick={() => setCollapsed(false)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: '10vw',
            height: '10vw',
            minWidth: 56,
            minHeight: 56,
            maxWidth: 80,
            maxHeight: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #5e6ad2, #818cf8)',
            boxShadow: '0 4px 24px rgba(94,106,210,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 300,
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: 22 }}>📋</span>
          {activeTasks.length > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              minWidth: 18, height: 18, borderRadius: 9,
              background: '#f87171', color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px',
            }}>
              {activeTasks.length}
            </span>
          )}
        </motion.div>
      ) : (
        /* ── Card ── */
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9, borderRadius: '50%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 300,
            maxHeight: 420,
            borderRadius: 14,
            background: 'var(--color-canvas)',
            border: '1px solid var(--color-hairline)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
            zIndex: 300,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 15 }}>📋</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', flex: 1 }}>
              {t.tasks.myTasks}
              {activeTasks.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: 'var(--color-ink-subtle)' }}>
                  ({activeTasks.length})
                </span>
              )}
            </span>
            {overdueCount > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 6 }}>
                {overdueCount} {t.tasks.overdueShort}
              </span>
            )}
            <button
              onClick={() => setCollapsed(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-tertiary)', fontSize: 14, padding: '2px 4px', borderRadius: 4, lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          {/* Task list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTasks.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{t.tasks.noActiveTasks}</div>
              </div>
            ) : activeTasks.map((task, i) => (
              <div
                key={task.id}
                style={{
                  padding: '9px 12px',
                  borderBottom: i < activeTasks.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                  background: isOverdue(task) ? 'rgba(239,68,68,0.03)' : 'transparent',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  cursor: 'pointer',
                }}
                onClick={() => { navigate('/tasks') }}
              >
                <PriorityDot p={task.priority} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                    {task.title}
                  </div>
                  {task.due_date && (
                    <div style={{ fontSize: 10, color: isOverdue(task) ? '#f87171' : 'var(--color-ink-tertiary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                      {isOverdue(task) ? '⚠ ' : ''}{task.due_date}
                    </div>
                  )}
                </div>
                <button
                  onClick={e => markDone(e, task)}
                  title="Mark done"
                  style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 5, background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.25)', cursor: 'pointer', color: '#4ade80', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✓
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{ padding: '8px 12px', borderTop: '1px solid var(--color-hairline)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}
          >
            <button
              onClick={() => navigate('/tasks')}
              style={{ fontSize: 11, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              {t.tasks.viewAll} →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
