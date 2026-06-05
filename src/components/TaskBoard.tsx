import { useState, useEffect, useCallback } from 'react'
import {
  Box, Stack, Typography, Dialog, DialogContent, DialogTitle,
  TextField, IconButton, CircularProgress, Tabs, Tab, Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import {
  fetchTasksForUser, createTask, updateTask, deleteTask,
  fetchTaskComments, createTaskComment, fetchAllUsers,
} from '../lib/api'
import type { Task, TaskComment } from '../lib/api'
import { usePermissions } from '../lib/permissionsContext'
import { useLang } from '../lib/i18n'
import { pageInfo } from '../lib/pageInfo'
import {
  ActionButton, AppField, AppSelect, Badge, Card,
  DataTable, Eyebrow, PageTitle, Stack as UiStack,
  TableCell, TableRow, Typography as UiTypo,
} from './Ui'
import { ErrorBanner } from './StateViews'

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

const PRIORITY_TONE = { LOW: 'default', NORMAL: 'info', HIGH: 'warning', URGENT: 'error' } as const
const STATUS_TONE = { TODO: 'default', IN_PROGRESS: 'info', DONE: 'success' } as const

function priorityLabel(p: TaskPriority, t: ReturnType<typeof useLang>['t']) {
  return { LOW: t.tasks.priorityLow, NORMAL: t.tasks.priorityNormal, HIGH: t.tasks.priorityHigh, URGENT: t.tasks.priorityUrgent }[p]
}

function statusLabel(s: TaskStatus, t: ReturnType<typeof useLang>['t']) {
  return { TODO: t.tasks.statusTodo, IN_PROGRESS: t.tasks.statusInProgress, DONE: t.tasks.statusDone }[s]
}

interface UserOption { id: string; label: string }

interface TaskDetailProps {
  task: Task
  users: UserOption[]
  userId: string | null
  onClose: () => void
  onUpdated: () => void
}

function TaskDetail({ task, users, userId, onClose, onUpdated }: TaskDetailProps) {
  const { t } = useLang()
  const tk = t.tasks
  const { hasPermission } = usePermissions()
  const canManage = hasPermission('manage_tasks')
  const isOwner = task.created_by === userId || task.assigned_to === userId

  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    setLoadingComments(true)
    try { setComments(await fetchTaskComments(task.id)) } catch { /* noop */ }
    setLoadingComments(false)
  }, [task.id])

  useEffect(() => { loadComments() }, [loadComments])

  async function changeStatus(s: TaskStatus) {
    setStatus(s)
    setSaving(true)
    try { await updateTask(task.id, { status: s }); onUpdated() } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    }
    setSaving(false)
  }

  async function postComment() {
    if (!newComment.trim() || !userId) return
    setPostingComment(true)
    try {
      await createTaskComment(task.id, userId, newComment.trim())
      setNewComment('')
      await loadComments()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)) }
    setPostingComment(false)
  }

  const assigneeName = users.find(u => u.id === task.assigned_to)?.label ?? tk.unassigned
  const creatorName  = users.find(u => u.id === task.created_by)?.label ?? '—'

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'var(--color-surface-1)', backgroundImage: 'none', border: '1px solid var(--color-hairline)', m: { xs: 1, sm: 2 } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.3 }}>{task.title}</Typography>
          <Stack direction="row" gap={1} mt={0.5}>
            <Badge tone={PRIORITY_TONE[task.priority]}>{priorityLabel(task.priority, t)}</Badge>
            <Badge tone={STATUS_TONE[status]}>{statusLabel(status, t)}</Badge>
            {task.due_date && <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)', alignSelf: 'center' }}>{task.due_date}</Typography>}
          </Stack>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'var(--color-ink-subtle)', mt: -0.5 }}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {error && <ErrorBanner message={error} />}
        <Stack gap={2}>
          {task.description && (
            <Typography sx={{ fontSize: 13, color: 'var(--color-ink-muted)', whiteSpace: 'pre-wrap' }}>{task.description}</Typography>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', mb: 0.25 }}>{tk.colAssignee}</Typography>
              <Typography sx={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{assigneeName}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', mb: 0.25 }}>{tk.colCreatedBy}</Typography>
              <Typography sx={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{creatorName}</Typography>
            </Box>
          </Box>
          {(canManage || isOwner) && (
            <AppSelect label={tk.status} value={status} onChange={e => changeStatus(e.target.value as TaskStatus)}
              options={[{ value: 'TODO', label: tk.statusTodo }, { value: 'IN_PROGRESS', label: tk.statusInProgress }, { value: 'DONE', label: tk.statusDone }]} />
          )}
          {saving && <CircularProgress size={16} />}
          <Divider sx={{ borderColor: 'var(--color-hairline)' }} />
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-subtle)', letterSpacing: 0.5, textTransform: 'uppercase', mb: 1 }}>{tk.comments}</Typography>
            {loadingComments ? <CircularProgress size={16} /> : comments.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{tk.noComments}</Typography>
            ) : (
              <Stack gap={1} mb={1.5}>
                {comments.map(c => (
                  <Box key={c.id} sx={{ bgcolor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', p: '10px 12px' }}>
                    <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)', mb: 0.25 }}>
                      {users.find(u => u.id === c.author_id)?.label ?? '?'} · {new Date(c.created_at).toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: 'var(--color-ink-muted)', whiteSpace: 'pre-wrap' }}>{c.content}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
            <Stack direction="row" gap={1} mt={1}>
              <TextField fullWidth size="small" multiline maxRows={4} placeholder={tk.addComment} value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) postComment() }}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: 13, bgcolor: 'var(--color-surface-2)', '& fieldset': { borderColor: 'var(--color-hairline)' } } }} />
              <ActionButton onClick={postComment} disabled={!newComment.trim() || postingComment} sx={{ alignSelf: 'flex-end', px: 1.5 }}>
                {postingComment ? <CircularProgress size={14} /> : tk.postComment}
              </ActionButton>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

interface TaskFormProps {
  users: UserOption[]
  userId: string | null
  onSave: () => void
  onCancel: () => void
}

const BLANK_TASK = { title: '', description: '', assigned_to: '', priority: 'NORMAL' as TaskPriority, due_date: '' }

function TaskForm({ users, userId, onSave, onCancel }: TaskFormProps) {
  const { t } = useLang()
  const tk = t.tasks
  const [form, setForm] = useState({ ...BLANK_TASK })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createTask({ title: form.title.trim(), description: form.description || null, created_by: userId, assigned_to: form.assigned_to || null, priority: form.priority, status: 'TODO', due_date: form.due_date || null })
      onSave()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)) }
    setSaving(false)
  }

  return (
    <Card sx={{ borderLeft: '3px solid var(--color-primary)' }}>
      <Eyebrow sx={{ mb: 2 }}>{tk.formTitle}</Eyebrow>
      {error && <ErrorBanner message={error} />}
      <UiStack component="form" onSubmit={submit} gap={1.5}>
        <AppField label={`${tk.title_} *`} required value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Titlu sarcină..." />
        <AppField label={tk.description} value={form.description} onChange={e => setF('description', e.target.value)} multiline rows={3} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          <AppSelect label={tk.assignTo} value={form.assigned_to} onChange={e => setF('assigned_to', e.target.value)}
            options={[{ value: '', label: `— ${tk.unassigned} —` }, ...users.map(u => ({ value: u.id, label: u.label }))]} />
          <AppSelect label={tk.priority} value={form.priority} onChange={e => setF('priority', e.target.value)}
            options={[{ value: 'LOW', label: tk.priorityLow }, { value: 'NORMAL', label: tk.priorityNormal }, { value: 'HIGH', label: tk.priorityHigh }, { value: 'URGENT', label: tk.priorityUrgent }]} />
          <AppField label={tk.dueDate} type="date" value={form.due_date} onChange={e => setF('due_date', e.target.value)} InputLabelProps={{ shrink: true }} />
        </Box>
        <Stack direction="row" gap={1}>
          <ActionButton type="submit" disabled={saving || !form.title.trim()}>{saving ? t.common.saving : t.common.create}</ActionButton>
          <ActionButton variant="outlined" onClick={onCancel}>{t.common.cancel}</ActionButton>
        </Stack>
      </UiStack>
    </Card>
  )
}

export default function TaskBoard({ userId }: { userId: string | null }) {
  const { t, lang } = useLang()
  const tk = t.tasks
  const { hasPermission } = usePermissions()
  const canCreate = hasPermission('create_tasks')
  const canManage = hasPermission('manage_tasks')

  const [tab, setTab] = useState(0)
  const [assigned, setAssigned] = useState<Task[]>([])
  const [created, setCreated] = useState<Task[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const [taskData, userList] = await Promise.all([fetchTasksForUser(userId), fetchAllUsers()])
      setAssigned(taskData.assigned)
      setCreated(taskData.created)
      setUsers(userList.map(u => ({ id: u.id, label: u.full_name || u.email })))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)) }
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (!confirm(tk.deleteConfirm)) return
    setDeleting(id)
    try { await deleteTask(id); await load() } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)) }
    setDeleting(null)
  }

  const displayTasks = tab === 0 ? assigned : created

  return (
    <UiStack gap={4}>
      <PageTitle eyebrow={tk.eyebrow} title={tk.title} subtitle={`${displayTasks.length} ${t.common.records}`} info={pageInfo(lang, 'tasks')}
        action={canCreate ? <ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => setShowForm(s => !s)}>{showForm ? `x ${t.common.cancel}` : tk.newBtn}</ActionButton> : undefined} />

      {error && <ErrorBanner message={error} />}

      {showForm && canCreate && (
        <TaskForm users={users} userId={userId} onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
      )}

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid var(--color-hairline)', minHeight: 44, '& .MuiTab-root': { fontSize: 13, textTransform: 'none', minHeight: 44, color: 'var(--color-ink-subtle)', '&.Mui-selected': { color: 'var(--color-ink)' } }, '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' } }}>
          <Tab label={`${tk.myTasks} (${assigned.length})`} />
          <Tab label={`${tk.createdByMe} (${created.length})`} />
        </Tabs>

        {/* ── Desktop table (md+) ── */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <DataTable head={
            <TableRow>
              <TableCell>{tk.colTitle}</TableCell>
              <TableCell>{tk.colAssignee}</TableCell>
              <TableCell>{tk.colPriority}</TableCell>
              <TableCell>{tk.colDue}</TableCell>
              <TableCell>{tk.colStatus}</TableCell>
              <TableCell />
            </TableRow>
          }>
            {loading ? (
              <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={20} /></TableCell></TableRow>
            ) : displayTasks.length === 0 ? (
              <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: 'var(--color-ink-tertiary)', fontSize: 13 }}>{tk.noTasks}</TableCell></TableRow>
            ) : displayTasks.map(task => {
              const assigneeName = users.find(u => u.id === task.assigned_to)?.label ?? tk.unassigned
              const isDeleting = deleting === task.id
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE'
              return (
                <TableRow key={task.id} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'var(--color-surface-2)' } }} onClick={() => setDetailTask(task)}>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <UiTypo sx={{ fontSize: 13, fontWeight: 500, color: task.status === 'DONE' ? 'var(--color-ink-tertiary)' : 'var(--color-ink)', textDecoration: task.status === 'DONE' ? 'line-through' : 'none' }}>{task.title}</UiTypo>
                    {task.description && <UiTypo sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{task.description}</UiTypo>}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{assigneeName}</TableCell>
                  <TableCell><Badge tone={PRIORITY_TONE[task.priority]}>{priorityLabel(task.priority, t)}</Badge></TableCell>
                  <TableCell sx={{ fontSize: 12, color: isOverdue ? '#f87171' : 'var(--color-ink-tertiary)' }}>{task.due_date ?? '—'}</TableCell>
                  <TableCell><Badge tone={STATUS_TONE[task.status]}>{statusLabel(task.status, t)}</Badge></TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Stack direction="row" gap={0.5}>
                      {task.status !== 'DONE' && (task.assigned_to === userId || canManage) && (
                        <ActionButton onClick={() => updateTask(task.id, { status: 'DONE' }).then(load)}
                          sx={{ px: 1, py: 0.375, fontSize: 11, bgcolor: 'rgba(39,166,68,0.1)', color: '#4ade80', border: '1px solid rgba(39,166,68,0.2)', '&:hover': { bgcolor: 'rgba(39,166,68,0.2)' } }}>✓</ActionButton>
                      )}
                      {(canManage || task.created_by === userId) && (
                        <ActionButton variant="outlined" onClick={() => handleDelete(task.id)} disabled={isDeleting}
                          sx={{ px: 1, py: 0.375, fontSize: 11, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', '&:hover': { borderColor: '#f87171' } }}>
                          {isDeleting ? '...' : '✕'}
                        </ActionButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </DataTable>
        </Box>

        {/* ── Mobile cards (xs–sm) ── */}
        <Stack sx={{ display: { xs: 'flex', md: 'none' } }} gap={0}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={20} /></Box>
          ) : displayTasks.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><UiTypo sx={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>{tk.noTasks}</UiTypo></Box>
          ) : displayTasks.map((task, i) => {
            const assigneeName = users.find(u => u.id === task.assigned_to)?.label ?? tk.unassigned
            const isDeleting = deleting === task.id
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE'
            const isDone = task.status === 'DONE'
            return (
              <Box
                key={task.id}
                sx={{
                  p: '14px 16px',
                  borderBottom: i < displayTasks.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                  cursor: 'pointer',
                  '&:active': { bgcolor: 'var(--color-surface-2)' },
                }}
                onClick={() => setDetailTask(task)}
              >
                {/* Row 1: badges */}
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.75 }} flexWrap="wrap">
                  <Badge tone={PRIORITY_TONE[task.priority]}>{priorityLabel(task.priority, t)}</Badge>
                  <Badge tone={STATUS_TONE[task.status]}>{statusLabel(task.status, t)}</Badge>
                  {isOverdue && <Badge tone="error">Depășit</Badge>}
                </Stack>

                {/* Row 2: title */}
                <UiTypo sx={{ fontSize: 14, fontWeight: 600, color: isDone ? 'var(--color-ink-tertiary)' : 'var(--color-ink)', textDecoration: isDone ? 'line-through' : 'none', mb: task.description ? 0.375 : 0.75, lineHeight: 1.4 }}>
                  {task.title}
                </UiTypo>

                {/* Row 3: description */}
                {task.description && (
                  <UiTypo sx={{ fontSize: 12, color: 'var(--color-ink-tertiary)', mb: 0.75, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {task.description}
                  </UiTypo>
                )}

                {/* Row 4: assignee + due date */}
                <Stack direction="row" gap={2} sx={{ mb: 1 }} flexWrap="wrap">
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <UiTypo sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{tk.colAssignee}</UiTypo>
                    <UiTypo sx={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{assigneeName}</UiTypo>
                  </Stack>
                  {task.due_date && (
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <UiTypo sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{tk.colDue}</UiTypo>
                      <UiTypo sx={{ fontSize: 12, color: isOverdue ? '#f87171' : 'var(--color-ink-muted)', fontWeight: isOverdue ? 600 : 400 }}>{task.due_date}</UiTypo>
                    </Stack>
                  )}
                </Stack>

                {/* Row 5: actions */}
                <Stack direction="row" gap={1} onClick={e => e.stopPropagation()}>
                  {task.status !== 'DONE' && (task.assigned_to === userId || canManage) && (
                    <ActionButton
                      onClick={() => updateTask(task.id, { status: 'DONE' }).then(load)}
                      sx={{ flex: 1, fontSize: 12, py: 0.625, bgcolor: 'rgba(39,166,68,0.08)', color: '#4ade80', border: '1px solid rgba(39,166,68,0.2)', '&:hover': { bgcolor: 'rgba(39,166,68,0.15)' } }}
                    >
                      ✓ {tk.statusDone}
                    </ActionButton>
                  )}
                  {(canManage || task.created_by === userId) && (
                    <ActionButton variant="outlined" onClick={() => handleDelete(task.id)} disabled={isDeleting}
                      sx={{ fontSize: 12, py: 0.625, px: 1.5, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', '&:hover': { borderColor: '#f87171' } }}>
                      {isDeleting ? '...' : '✕'}
                    </ActionButton>
                  )}
                </Stack>
              </Box>
            )
          })}
        </Stack>
      </Card>

      {detailTask && (
        <TaskDetail task={detailTask} users={users} userId={userId} onClose={() => setDetailTask(null)}
          onUpdated={() => { load(); setDetailTask(t => t ? { ...t, status: detailTask.status } : null) }} />
      )}
    </UiStack>
  )
}
