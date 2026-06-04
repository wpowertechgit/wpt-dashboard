import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchSubansambluri, updateSubansamblu, insertBlocaj } from '../lib/api'
import { formatDateLabel } from '../lib/dateUtils'
import { normalizeDepartmentStatus, normalizeGlobalStatus } from '../lib/subassemblyStatus'
import { usePermissions } from '../lib/permissionsContext'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

type FilterStatus = 'ALL' | 'FINALIZAT' | 'IN LUCRU' | 'BLOCAT'

// DB column key → display label (ROLAT shows as VIROLAT)
const DEPT_COLS = ['proiectare', 'laser', 'rolat', 'sudat', 'asamblat', 'vopsit'] as const
const DEPT_DISPLAY: Record<string, string> = {
  proiectare: 'PROIECTARE', laser: 'LASER', rolat: 'VIROLAT',
  sudat: 'SUDAT', asamblat: 'ASAMBLAT', vopsit: 'VOPSIT',
}
const STATUS_OPTIONS = ['Finalizat', 'În lucru', 'Blocat', 'Neînceput', 'N/A']
const PROGRESS_PRESETS = ['0%', '25%', '50%', '75%', '100%']

function statusChip(s: string) {
  if (s === 'Finalizat') return <Badge tone="success">Finalizat</Badge>
  if (s === 'În lucru') return <Badge tone="info">În lucru</Badge>
  if (s === 'Blocat') return <Badge tone="error">Blocat</Badge>
  if (s === 'N/A') return <Badge>N/A</Badge>
  return <Badge>{s || 'Neînceput'}</Badge>
}

function globalChip(s: string) {
  if (s.includes('FINALIZAT')) return <Badge tone="success">✅ Finalizat</Badge>
  if (s.includes('BLOCAT')) return <Badge tone="error">⛔ Blocat</Badge>
  if (s.includes('IN LUCRU')) return <Badge tone="info">🔄 În Lucru</Badge>
  return <Badge>{s}</Badge>
}

function timelineSummary(sa: Record<string, unknown>) {
  return [
    ['S', formatDateLabel(sa.data_start as string)],
    ['D', formatDateLabel(sa.data_due as string)],
    ['F', formatDateLabel(sa.data_done as string)],
  ]
}

function deptDateSummary(sa: Record<string, unknown>) {
  return [
    ['P', formatDateLabel(sa.proiectare_done as string)],
    ['L', formatDateLabel(sa.laser_done as string)],
    ['V', formatDateLabel(sa.rolat_done as string)],
    ['S', formatDateLabel(sa.sudat_done as string)],
    ['A', formatDateLabel(sa.asamblat_done as string)],
    ['Vop', formatDateLabel(sa.vopsit_done as string)],
  ].filter(([, v]) => v && v !== '—')
}

function getFirstBlockedDept(row: Record<string, string | boolean>): string {
  for (const col of DEPT_COLS) {
    if (row[col] === 'Blocat') return DEPT_DISPLAY[col]
  }
  return 'GENERAL'
}

export default function Subansambluri() {
  const { t, lang } = useLang()
  const { canWrite } = usePermissions()
  const s = t.subansambluri
  const [filterProiect, setFilterProiect] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<Record<string, string | boolean> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [finalizing, setFinalizing] = useState<number | null>(null)

  const DATE_FIELDS = new Set(['data_start','data_due','data_done','proiectare_done','laser_done','rolat_done','sudat_done','asamblat_done','vopsit_done'])

  function prepareRow(row: Record<string, string | boolean>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, DATE_FIELDS.has(k) && v === '' ? null : v])
    )
  }

  const { data, loading, error, refetch } = useQuery(fetchSubansambluri)
  const projects = ['ALL', ...Array.from(new Set((data ?? []).map(sa => sa.proiect))).sort()]

  function isBlocat(sa: { blocat: boolean; status_global: string }) {
    return sa.blocat || sa.status_global?.includes('BLOCAT')
  }

  const filtered = (data ?? []).filter(sa => {
    if (filterProiect !== 'ALL' && sa.proiect !== filterProiect) return false
    if (filterStatus === 'FINALIZAT' && !sa.status_global.includes('FINALIZAT')) return false
    if (filterStatus === 'IN LUCRU' && !sa.status_global.includes('IN LUCRU')) return false
    if (filterStatus === 'BLOCAT' && !isBlocat(sa)) return false
    if (search && !sa.nume.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function saveEdit() {
    if (!editRow || editId === null) return
    setSaving(true)
    setSaveError(null)
    try {
      const original = data?.find(s => s.id === editId)
      const becomingBlocked = String(editRow.status_global).includes('BLOCAT') && !original?.blocat

      await updateSubansamblu(editId, prepareRow(editRow))

      if (becomingBlocked && original) {
        const today = new Date().toISOString().slice(0, 10)
        const blocajId = `BLK-${original.proiect}-${String(original.nr).padStart(2, '0')}-${Date.now().toString().slice(-4)}`
        await insertBlocaj({
          id: blocajId,
          data_deschidere: today,
          proiect: original.proiect,
          subansamblu: original.nume,
          departament: getFirstBlockedDept(editRow),
          descriere: String(editRow.comentarii || original.comentarii || `Subansamblu ${original.nume} blocat`),
          responsabil: '',
          impact: 'MEDIU',
          status: 'Deschis',
          zile_deschis: 0,
        })
      }

      setEditId(null); setEditRow(null)
      refetch()
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally { setSaving(false) }
  }

  async function finalizeRow(sa: Record<string, unknown>) {
    setFinalizing(sa.id as number)
    const today = new Date().toISOString().slice(0, 10)
    try {
      const deptUpdate: Record<string, string> = {}
      for (const col of DEPT_COLS) {
        deptUpdate[col] = (sa[col] as string) === 'N/A' ? 'N/A' : 'Finalizat'
        deptUpdate[`${col}_done`] = (sa[`${col}_done`] as string) || today
      }
      await updateSubansamblu(sa.id as number, {
        status_global: '✅ FINALIZAT',
        progres: '100%',
        blocat: false,
        data_done: today,
        ...deptUpdate,
      })
      refetch()
    } finally { setFinalizing(null) }
  }

  function startEdit(sa: Record<string, unknown>) {
    const row: Record<string, string | boolean> = {
      status_global: normalizeGlobalStatus(sa.status_global as string),
      progres: sa.progres as string,
      blocat: sa.blocat as boolean,
      data_start: (sa.data_start as string) ?? '',
      data_due: (sa.data_due as string) ?? '',
      data_done: (sa.data_done as string) ?? '',
      proiectare_done: (sa.proiectare_done as string) ?? '',
      laser_done: (sa.laser_done as string) ?? '',
      rolat_done: (sa.rolat_done as string) ?? '',
      sudat_done: (sa.sudat_done as string) ?? '',
      asamblat_done: (sa.asamblat_done as string) ?? '',
      vopsit_done: (sa.vopsit_done as string) ?? '',
      comentarii: (sa.comentarii as string) ?? '',
    }
    for (const col of DEPT_COLS) {
      row[col] = normalizeDepartmentStatus(sa[col] as string)
    }
    setEditId(sa.id as number)
    setEditRow(row)
  }

  const pills = (opts: string[], val: string, set: (v: string) => void) => (
    <Stack direction="row" gap={0.5} sx={{ bgcolor: 'var(--color-surface-1)', borderRadius: 'var(--radius-pill)', p: 0.375, border: '1px solid var(--color-hairline)', flexWrap: 'wrap' }}>
      {opts.map(o => (
        <ActionButton key={o} variant="outlined" onClick={() => set(o)} sx={{ px: 1.5, py: 0.5, borderRadius: 'var(--radius-pill)', border: 'none', bgcolor: val === o ? 'var(--color-surface-3)' : 'transparent', color: val === o ? 'var(--color-ink)' : 'var(--color-ink-subtle)', fontSize: 12, fontWeight: val === o ? 500 : 400, '&:hover': { bgcolor: 'var(--color-surface-3)' } }}>{o}</ActionButton>
      ))}
    </Stack>
  )

  return (
    <Stack gap={3}>
      <PageTitle eyebrow={s.eyebrow} title={s.title} subtitle={`PROIECTARE → LASER → VIROLAT → SUDAT → ASAMBLAT → VOPSIT · ${filtered.length} ${t.common.records}`} info={pageInfo(lang, 'subassemblies')} />
      {error && <ErrorBanner message={error} />}

      <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
        <AppField type="text" placeholder={s.search} value={search} onChange={e => setSearch(e.target.value)} sx={{ width: { xs: '100%', sm: 220 } }} />
        {projects.length > 1 && pills(projects, filterProiect, v => setFilterProiect(v))}
        {pills(['ALL', 'FINALIZAT', 'IN LUCRU', 'BLOCAT'], filterStatus, v => setFilterStatus(v as FilterStatus))}
      </Stack>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <DataTable sx={{ overflowX: 'auto' }} head={
          <TableRow>
            <TableCell>{s.colProiect}</TableCell>
            <TableCell>{s.colNr}</TableCell>
            <TableCell>{s.colNume}</TableCell>
            <TableCell>{s.colStatus}</TableCell>
            <TableCell>{s.colProgres}</TableCell>
            <TableCell>{s.colTimeline}</TableCell>
            {DEPT_COLS.map(col => <TableCell key={col} sx={{ textAlign: 'center' }}>{DEPT_DISPLAY[col]}</TableCell>)}
            <TableCell>{s.colComentarii}</TableCell>
            <TableCell sx={{ position: 'sticky', right: 0, bgcolor: 'var(--color-surface-1)', zIndex: 2, borderLeft: '1px solid var(--color-hairline)' }} />
          </TableRow>
        }>
          {loading ? <LoadingRows cols={14} /> : filtered.length === 0 ? <EmptyState label={s.empty} /> :
            filtered.map(sa => (
              canWrite && editId === sa.id ? (
                <TableRow key={sa.id} sx={{ bgcolor: 'rgba(94,106,210,0.06)' }}>
                  <TableCell colSpan={14} sx={{ p: 2 }}>
                    <Stack gap={1.5}>
                      <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{sa.proiect} #{sa.nr} · {sa.nume}</Typography>

                      {/* Global status + progress */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.25 }}>
                        <AppSelect label="Status Global" value={normalizeGlobalStatus(String(editRow?.status_global ?? ''))}
                          onChange={e => {
                            const val = e.target.value
                            setEditRow(r => ({ ...r!, status_global: val, blocat: val.includes('BLOCAT') ? true : val.includes('FINALIZAT') ? false : r!.blocat }))
                          }}
                          options={['✅ FINALIZAT', '🔄 IN LUCRU', '⛔ BLOCAT']} />

                        {/* Progress with quick-select */}
                        <Box>
                          <AppField label="Progres %" value={String(editRow?.progres ?? '').replace('%', '')}
                            onChange={e => setEditRow(r => ({ ...r!, progres: e.target.value ? `${e.target.value}%` : '0%' }))} />
                          <Stack direction="row" gap={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                            {PROGRESS_PRESETS.map(p => (
                              <ActionButton key={p} variant="outlined" onClick={() => setEditRow(r => ({ ...r!, progres: p }))}
                                sx={{ px: 0.75, py: 0.25, fontSize: 10, minWidth: 0, bgcolor: editRow?.progres === p ? 'var(--color-primary)' : 'transparent', color: editRow?.progres === p ? '#fff' : 'var(--color-ink-subtle)', border: '1px solid var(--color-hairline)' }}>
                                {p}
                              </ActionButton>
                            ))}
                          </Stack>
                        </Box>

                        <AppField label="Start" type="date" value={String(editRow?.data_start ?? '')} onChange={e => setEditRow(r => ({ ...r!, data_start: e.target.value }))} />
                        <AppField label="Due" type="date" value={String(editRow?.data_due ?? '')} onChange={e => setEditRow(r => ({ ...r!, data_due: e.target.value }))} />
                        <AppField label="Done" type="date" value={String(editRow?.data_done ?? '')} onChange={e => setEditRow(r => ({ ...r!, data_done: e.target.value }))} />
                      </Box>

                      {/* Department statuses */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1.25 }}>
                        {DEPT_COLS.map(col => (
                          <AppSelect key={col} label={DEPT_DISPLAY[col]}
                            value={normalizeDepartmentStatus(String(editRow?.[col] ?? ''))}
                            onChange={e => setEditRow(r => ({ ...r!, [col]: e.target.value }))}
                            options={STATUS_OPTIONS} />
                        ))}
                      </Box>

                      {/* Department done dates */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1.25 }}>
                        {DEPT_COLS.map(col => (
                          <AppField key={`${col}_done`} label={`${DEPT_DISPLAY[col]} Done`} type="date"
                            value={String(editRow?.[`${col}_done`] ?? '')}
                            onChange={e => setEditRow(r => ({ ...r!, [`${col}_done`]: e.target.value }))} />
                        ))}
                      </Box>

                      <AppField label={s.colComentarii} value={String(editRow?.comentarii ?? '')} onChange={e => setEditRow(r => ({ ...r!, comentarii: e.target.value }))} />
                      {saveError && (
                        <Box sx={{ bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', p: '6px 10px' }}>
                          <Typography variant="body2" sx={{ fontSize: 11, color: '#f87171' }}>{saveError}</Typography>
                        </Box>
                      )}
                      <Stack direction="row" gap={0.75}>
                        <ActionButton onClick={saveEdit} disabled={saving} sx={{ px: 1.25, py: 0.5, fontSize: 11 }}>{saving ? '...' : t.common.save}</ActionButton>
                        <ActionButton variant="outlined" onClick={() => { setEditId(null); setEditRow(null); setSaveError(null) }} sx={{ px: 1, py: 0.5, fontSize: 11 }}>✕</ActionButton>
                      </Stack>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={sa.id} sx={isBlocat(sa) ? { bgcolor: 'rgba(239,68,68,0.03)' } : undefined}>
                  <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{sa.proiect}</Typography></TableCell>
                  <TableCell sx={{ color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{sa.nr}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>{sa.nume}</Typography>
                    {sa.conditionat_de && <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-primary)', mt: 0.25 }}>🔵 {sa.conditionat_de}</Typography>}
                  </TableCell>
                  <TableCell>{globalChip(sa.status_global)}</TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <Stack direction="row" alignItems="center" gap={0.75}>
                      <Box className="progress-bar" sx={{ width: 50 }}>
                        <Box className={`progress-fill ${parseInt(sa.progres) >= 90 ? 'progress-fill-success' : parseInt(sa.progres) >= 60 ? 'progress-fill-warning' : 'progress-fill-danger'}`} sx={{ width: sa.progres }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{sa.progres}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ minWidth: 110 }}>
                    <Stack gap={0.25}>
                      {timelineSummary(sa as Record<string, unknown>).map(([label, value]) => (
                        <Typography key={label} variant="body2" sx={{ fontSize: 10, color: 'var(--color-ink-muted)' }}>{label}: {value}</Typography>
                      ))}
                    </Stack>
                  </TableCell>
                  {DEPT_COLS.map(col => <TableCell key={col} sx={{ textAlign: 'center' }}>{statusChip(sa[col])}</TableCell>)}
                  <TableCell sx={{ fontSize: 12, color: isBlocat(sa) ? '#f87171' : 'var(--color-ink-muted)', maxWidth: 160 }}>{sa.comentarii}</TableCell>
                  <TableCell sx={{ position: 'sticky', right: 0, bgcolor: isBlocat(sa) ? 'rgba(20,8,8,0.95)' : 'var(--color-surface-1)', zIndex: 1, borderLeft: '1px solid var(--color-hairline)', p: '8px 10px' }}>
                    {canWrite && (
                      <Stack direction="row" gap={0.5}>
                        <ActionButton variant="outlined" onClick={() => startEdit(sa as Record<string, unknown>)} sx={{ px: 1, py: 0.375, fontSize: 11 }}>
                          {t.common.edit}
                        </ActionButton>
                        {!sa.status_global.includes('FINALIZAT') && (
                          <ActionButton onClick={() => finalizeRow(sa as Record<string, unknown>)} disabled={finalizing === sa.id}
                            sx={{ px: 1, py: 0.375, fontSize: 11, bgcolor: 'rgba(39,166,68,0.1)', color: '#4ade80', border: '1px solid rgba(39,166,68,0.2)', '&:hover': { bgcolor: 'rgba(39,166,68,0.2)' } }}>
                            {finalizing === sa.id ? '...' : '✅'}
                          </ActionButton>
                        )}
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              )
            ))}
        </DataTable>
      </Card>
    </Stack>
  )
}
