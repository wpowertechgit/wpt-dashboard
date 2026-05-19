import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchSubansambluri, upsertSubansamblu } from '../lib/api'
import { daysBetween, formatDateLabel } from '../lib/dateUtils'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

type FilterStatus = 'ALL' | 'FINALIZAT' | 'IN LUCRU' | 'BLOCAT'

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

const DEPT_COLS = ['laser','rolat','sudat','asamblat','vopsit'] as const
const DEPT_DONE_COLS = ['laser_done','rolat_done','sudat_done','asamblat_done','vopsit_done'] as const
const STATUS_OPTIONS = ['Finalizat', 'În lucru', 'Blocat', 'Neînceput', 'N/A']

function timelineSummary(sa: Record<string, any>) {
  return [
    ['S', formatDateLabel(sa.data_start)],
    ['D', formatDateLabel(sa.data_due)],
    ['F', formatDateLabel(sa.data_done)],
  ]
}

function deptDateSummary(sa: Record<string, any>) {
  return [
    ['L', formatDateLabel(sa.laser_done)],
    ['R', formatDateLabel(sa.rolat_done)],
    ['S', formatDateLabel(sa.sudat_done)],
    ['A', formatDateLabel(sa.asamblat_done)],
    ['V', formatDateLabel(sa.vopsit_done)],
  ]
}

export default function Subansambluri() {
  const { t } = useLang()
  const s = t.subansambluri
  const [filterProiect, setFilterProiect] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<Record<string, string | boolean> | null>(null)
  const [saving, setSaving] = useState(false)

  const { data, loading, error, refetch } = useQuery(fetchSubansambluri)
  const projects = ['ALL', ...Array.from(new Set((data ?? []).map(sa => sa.proiect))).sort()]

  const filtered = (data ?? []).filter(sa => {
    if (filterProiect !== 'ALL' && sa.proiect !== filterProiect) return false
    if (filterStatus === 'FINALIZAT' && !sa.status_global.includes('FINALIZAT')) return false
    if (filterStatus === 'IN LUCRU' && !sa.status_global.includes('IN LUCRU')) return false
    if (filterStatus === 'BLOCAT' && !sa.blocat) return false
    if (search && !sa.nume.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function saveEdit() {
    if (!editRow || editId === null) return
    setSaving(true)
    try {
      await upsertSubansamblu({ id: editId, ...editRow })
      setEditId(null); setEditRow(null)
      refetch()
    } finally { setSaving(false) }
  }

  const pills = (opts: string[], val: string, set: (v: string) => void) => (
    <Stack direction="row" gap={0.5} sx={{ bgcolor: 'var(--color-surface-1)', borderRadius: 'var(--radius-pill)', p: 0.375, border: '1px solid var(--color-hairline)' }}>
      {opts.map(o => (
        <ActionButton key={o} variant="outlined" onClick={() => set(o)} sx={{ px: 1.5, py: 0.5, borderRadius: 'var(--radius-pill)', border: 'none', bgcolor: val === o ? 'var(--color-surface-3)' : 'transparent', color: val === o ? 'var(--color-ink)' : 'var(--color-ink-subtle)', fontSize: 12, fontWeight: val === o ? 500 : 400, '&:hover': { bgcolor: 'var(--color-surface-3)' } }}>{o}</ActionButton>
      ))}
    </Stack>
  )

  return (
    <Stack gap={3}>
      <PageTitle eyebrow={s.eyebrow} title={s.title} subtitle={`LASER → ROLAT → SUDAT → ASAMBLAT → VOPSIT · ${filtered.length} ${t.common.records}`} />
      {error && <ErrorBanner message={error} />}

      <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
        <AppField type="text" placeholder={s.search} value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 220 }} />
        {projects.length > 1 && pills(projects, filterProiect, v => setFilterProiect(v))}
        {pills(['ALL','FINALIZAT','IN LUCRU','BLOCAT'], filterStatus, v => setFilterStatus(v as FilterStatus))}
      </Stack>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <DataTable sx={{ overflowX: 'auto' }} head={<TableRow><TableCell>{s.colProiect}</TableCell><TableCell>{s.colNr}</TableCell><TableCell>{s.colNume}</TableCell><TableCell>{s.colStatus}</TableCell><TableCell>{s.colProgres}</TableCell><TableCell>{s.colTimeline}</TableCell><TableCell>{s.colDeptDates}</TableCell><TableCell sx={{ textAlign: 'center' }}>LASER</TableCell><TableCell sx={{ textAlign: 'center' }}>ROLAT</TableCell><TableCell sx={{ textAlign: 'center' }}>SUDAT</TableCell><TableCell sx={{ textAlign: 'center' }}>ASAMBLAT</TableCell><TableCell sx={{ textAlign: 'center' }}>VOPSIT</TableCell><TableCell>{s.colComentarii}</TableCell><TableCell /></TableRow>}>
          {loading ? <LoadingRows cols={14} /> : filtered.length === 0 ? <EmptyState label={s.empty} /> :
            filtered.map(sa => (
              editId === sa.id ? (
                <TableRow key={sa.id} sx={{ bgcolor: 'rgba(94,106,210,0.06)' }}>
                  <TableCell colSpan={14} sx={{ p: 2 }}>
                    <Stack gap={1.5}>
                      <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{sa.proiect} #{sa.nr} · {sa.nume}</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 1.25 }}>
                        <AppSelect label="Status Global" value={String(editRow?.status_global ?? sa.status_global)} onChange={e => setEditRow(r => ({ ...r!, status_global: e.target.value }))} options={['✅ FINALIZAT','🔄 IN LUCRU','⛔ BLOCAT']} />
                        <AppField label="Progres" value={String(editRow?.progres ?? sa.progres)} onChange={e => setEditRow(r => ({ ...r!, progres: e.target.value }))} />
                        <AppField label="Start" type="date" value={String(editRow?.data_start ?? sa.data_start ?? '')} onChange={e => setEditRow(r => ({ ...r!, data_start: e.target.value }))} />
                        <AppField label="Due" type="date" value={String(editRow?.data_due ?? sa.data_due ?? '')} onChange={e => setEditRow(r => ({ ...r!, data_due: e.target.value }))} />
                        <AppField label="Done" type="date" value={String(editRow?.data_done ?? sa.data_done ?? '')} onChange={e => setEditRow(r => ({ ...r!, data_done: e.target.value }))} />
                        <AppField label="Laser Done" type="date" value={String(editRow?.laser_done ?? sa.laser_done ?? '')} onChange={e => setEditRow(r => ({ ...r!, laser_done: e.target.value }))} />
                        <AppField label="Rolat Done" type="date" value={String(editRow?.rolat_done ?? sa.rolat_done ?? '')} onChange={e => setEditRow(r => ({ ...r!, rolat_done: e.target.value }))} />
                        <AppField label="Sudat Done" type="date" value={String(editRow?.sudat_done ?? sa.sudat_done ?? '')} onChange={e => setEditRow(r => ({ ...r!, sudat_done: e.target.value }))} />
                        <AppField label="Asamblat Done" type="date" value={String(editRow?.asamblat_done ?? sa.asamblat_done ?? '')} onChange={e => setEditRow(r => ({ ...r!, asamblat_done: e.target.value }))} />
                        <AppField label="Vopsit Done" type="date" value={String(editRow?.vopsit_done ?? sa.vopsit_done ?? '')} onChange={e => setEditRow(r => ({ ...r!, vopsit_done: e.target.value }))} />
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(120px, 1fr))', gap: 1.25 }}>
                        {DEPT_COLS.map(col => (
                          <AppSelect key={col} label={col.toUpperCase()} value={String(editRow?.[col] ?? sa[col])} onChange={e => setEditRow(r => ({ ...r!, [col]: e.target.value }))} options={STATUS_OPTIONS} />
                        ))}
                      </Box>
                      <AppField label={s.colComentarii} value={String(editRow?.comentarii ?? sa.comentarii ?? '')} onChange={e => setEditRow(r => ({ ...r!, comentarii: e.target.value }))} />
                      <Stack direction="row" gap={0.75}>
                        <ActionButton onClick={saveEdit} disabled={saving} sx={{ px: 1.25, py: 0.5, fontSize: 11 }}>{saving ? '...' : t.common.save}</ActionButton>
                        <ActionButton variant="outlined" onClick={() => { setEditId(null); setEditRow(null) }} sx={{ px: 1, py: 0.5, fontSize: 11 }}>✕</ActionButton>
                      </Stack>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={sa.id} sx={sa.blocat ? { bgcolor: 'rgba(239,68,68,0.03)' } : undefined}>
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
                      {timelineSummary(sa).map(([label, value]) => (
                        <Typography key={label} variant="body2" sx={{ fontSize: 10, color: 'var(--color-ink-muted)' }}>{label}: {value}</Typography>
                      ))}
                      {daysBetween(sa.data_start, sa.data_done) !== null && (
                        <Typography variant="body2" sx={{ fontSize: 10, color: 'var(--color-primary)', fontWeight: 600 }}>
                          LT: {daysBetween(sa.data_start, sa.data_done)}d
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    <Stack gap={0.25}>
                      {deptDateSummary(sa).map(([label, value]) => (
                        <Typography key={label} variant="body2" sx={{ fontSize: 10, color: 'var(--color-ink-subtle)' }}>{label}: {value}</Typography>
                      ))}
                    </Stack>
                  </TableCell>
                  {DEPT_COLS.map(col => <TableCell key={col} sx={{ textAlign: 'center' }}>{statusChip(sa[col])}</TableCell>)}
                  <TableCell sx={{ fontSize: 12, color: sa.blocat ? '#f87171' : 'var(--color-ink-muted)', maxWidth: 180 }}>{sa.comentarii}</TableCell>
                  <TableCell>
                    <ActionButton variant="outlined" onClick={() => { setEditId(sa.id); setEditRow({ status_global: sa.status_global, progres: sa.progres, blocat: sa.blocat, laser: sa.laser, rolat: sa.rolat, sudat: sa.sudat, asamblat: sa.asamblat, vopsit: sa.vopsit, data_start: sa.data_start ?? '', data_due: sa.data_due ?? '', data_done: sa.data_done ?? '', laser_done: sa.laser_done ?? '', rolat_done: sa.rolat_done ?? '', sudat_done: sa.sudat_done ?? '', asamblat_done: sa.asamblat_done ?? '', vopsit_done: sa.vopsit_done ?? '', comentarii: sa.comentarii ?? '' }) }} sx={{ px: 1, py: 0.375, fontSize: 11 }}>
                      {t.common.edit}
                    </ActionButton>
                  </TableCell>
                </TableRow>
              )
            ))}
        </DataTable>
      </Card>
    </Stack>
  )
}
