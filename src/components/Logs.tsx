import { useState, useMemo } from 'react'
import { useQuery } from '../lib/useQuery'
import { fetchLogs, deleteLog, clearAllLogs } from '../lib/api'
import type { ActivityLog } from '../lib/api'
import { usePermissions } from '../lib/permissionsContext'
import { useLang } from '../lib/i18n'
import { ErrorBanner } from './StateViews'
import { ActionButton, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

const ACTION_TONE: Record<string, 'error' | 'warning' | 'success' | 'info' | undefined> = {
  create: 'success', complete: 'success', resolve: 'success',
  delete: 'error',
  update: 'info', update_permissions: 'info', comment: 'info',
  close: 'warning', reset_password: 'warning', transaction: 'warning',
}

const ENTITY_COLOR: Record<string, string> = {
  project: '#818cf8', subassembly: '#a78bfa', blocaj: '#f87171',
  pdca: '#fb923c', flux: '#4ade80', kpi: '#facc15',
  task: '#c084fc', inventory: '#22d3ee', user: '#f472b6',
}

function ActionBadge({ action }: { action: string }) {
  return <Badge tone={ACTION_TONE[action]}>{action}</Badge>
}

function EntityBadge({ type }: { type: string | null }) {
  if (!type) return null
  return (
    <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: ENTITY_COLOR[type] ?? 'var(--color-ink-subtle)', bgcolor: `${ENTITY_COLOR[type] ?? '#888'}18`, px: '5px', py: '2px', borderRadius: 'var(--radius-xs)', whiteSpace: 'nowrap' }}>
      {type}
    </Typography>
  )
}

function formatTs(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const ACTION_OPTIONS = ['all', 'create', 'update', 'delete', 'complete', 'resolve', 'close', 'comment', 'transaction', 'reset_password', 'update_permissions']
const ENTITY_OPTIONS = ['all', 'project', 'subassembly', 'blocaj', 'pdca', 'flux', 'kpi', 'task', 'inventory', 'user']

export default function LogsPage() {
  const { t } = useLang()
  const { hasPermission } = usePermissions()
  const canDelete = hasPermission('delete_logs')
  const { data, loading, error, refetch } = useQuery(fetchLogs)

  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterEntity, setFilterEntity] = useState('all')
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)

  const logs = useMemo(() => {
    let rows = data ?? []
    if (filterAction !== 'all') rows = rows.filter(r => r.action === filterAction)
    if (filterEntity !== 'all') rows = rows.filter(r => r.entity_type === filterEntity)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.user_email?.toLowerCase().includes(q) ||
        r.entity_label?.toLowerCase().includes(q) ||
        r.action?.toLowerCase().includes(q)
      )
    }
    return rows
  }, [data, filterAction, filterEntity, search])

  async function handleDelete(log: ActivityLog) {
    await deleteLog(log.id)
    refetch()
  }

  async function handleClearAll() {
    setClearing(true)
    try { await clearAllLogs(); refetch(); setConfirmClear(false) }
    finally { setClearing(false) }
  }

  return (
    <Stack gap={4}>
      <PageTitle
        eyebrow="Admin"
        title={t.logs.title}
        subtitle={t.logs.subtitle}
        action={canDelete ? (
          confirmClear ? (
            <Stack direction="row" gap={1}>
              <ActionButton variant="outlined" onClick={() => setConfirmClear(false)} sx={{ fontSize: 12 }}>
                {t.common.cancel}
              </ActionButton>
              <ActionButton onClick={handleClearAll} disabled={clearing} sx={{ bgcolor: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', fontSize: 12 }}>
                {clearing ? t.common.saving : t.logs.confirmClear}
              </ActionButton>
            </Stack>
          ) : (
            <ActionButton variant="outlined" onClick={() => setConfirmClear(true)} sx={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.4)', fontSize: 12 }}>
              {t.logs.clearAll}
            </ActionButton>
          )
        ) : undefined}
      />

      {error && <ErrorBanner message={error} />}

      {/* Filters */}
      <Card sx={{ p: '14px 20px' }}>
        <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.logs.search}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', color: 'var(--color-ink)', padding: '6px 10px', fontSize: 13, outline: 'none', minWidth: 200 }}
          />
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', color: 'var(--color-ink)', padding: '6px 10px', fontSize: 12 }}>
            {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a === 'all' ? t.logs.allActions : a}</option>)}
          </select>
          <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', color: 'var(--color-ink)', padding: '6px 10px', fontSize: 12 }}>
            {ENTITY_OPTIONS.map(e => <option key={e} value={e}>{e === 'all' ? t.logs.allEntities : e}</option>)}
          </select>
          <Typography sx={{ fontSize: 12, color: 'var(--color-ink-subtle)', ml: 'auto' }}>
            {logs.length} {t.common.records}
          </Typography>
        </Stack>
      </Card>

      {/* Desktop table */}
      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" sx={{ p: '16px 24px', borderBottom: '1px solid var(--color-hairline)' }}>
          <Eyebrow>{t.logs.tableTitle}</Eyebrow>
        </Stack>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <DataTable head={
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{t.logs.colTime}</TableCell>
              <TableCell>{t.logs.colUser}</TableCell>
              <TableCell>{t.logs.colAction}</TableCell>
              <TableCell>{t.logs.colEntity}</TableCell>
              <TableCell sx={{ minWidth: 240 }}>{t.logs.colLabel}</TableCell>
              {canDelete && <TableCell />}
            </TableRow>
          }>
            {loading ? (
              <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: 'var(--color-ink-tertiary)', fontSize: 13 }}>{t.common.loading}</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: 'var(--color-ink-tertiary)', fontSize: 13 }}>{t.logs.noLogs}</TableCell></TableRow>
            ) : logs.map(log => (
              <TableRow key={log.id}>
                <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{formatTs(log.created_at)}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{log.user_email ?? '—'}</TableCell>
                <TableCell><ActionBadge action={log.action} /></TableCell>
                <TableCell><EntityBadge type={log.entity_type} /></TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink)', maxWidth: 320 }}>{log.entity_label ?? '—'}</TableCell>
                {canDelete && (
                  <TableCell>
                    <ActionButton onClick={() => handleDelete(log)} sx={{ px: 1, py: 0.25, fontSize: 11, color: '#f87171', bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>✕</ActionButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </DataTable>
        </Box>

        {/* Mobile cards */}
        <Stack sx={{ display: { xs: 'flex', md: 'none' } }} gap={0}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><Typography sx={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>{t.common.loading}</Typography></Box>
          ) : logs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><Typography sx={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>{t.logs.noLogs}</Typography></Box>
          ) : logs.map((log, i) => (
            <Box key={log.id} sx={{ p: '12px 16px', borderBottom: i < logs.length - 1 ? '1px solid var(--color-hairline)' : 'none' }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }} flexWrap="wrap">
                <ActionBadge action={log.action} />
                <EntityBadge type={log.entity_type} />
                {canDelete && (
                  <ActionButton onClick={() => handleDelete(log)} sx={{ ml: 'auto', px: 1, py: 0.25, fontSize: 11, color: '#f87171', bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>✕</ActionButton>
                )}
              </Stack>
              <Typography sx={{ fontSize: 13, color: 'var(--color-ink)', mb: 0.25 }}>{log.entity_label ?? '—'}</Typography>
              <Stack direction="row" gap={1.5} flexWrap="wrap">
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-tertiary)' }}>{formatTs(log.created_at)}</Typography>
                <Typography sx={{ fontSize: 11, color: 'var(--color-ink-subtle)' }}>{log.user_email ?? '—'}</Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Card>
    </Stack>
  )
}
