import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchSubansambluri, upsertSubansamblu } from '../lib/api'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

type FilterStatus = 'ALL' | 'FINALIZAT' | 'IN LUCRU' | 'BLOCAT'

function statusChip(s: string) {
  if (s === 'Finalizat') return <Badge tone="success">Finalizat</Badge>
  if (s === 'ÃŽn lucru') return <Badge tone="info">ÃŽn lucru</Badge>
  if (s === 'Blocat') return <Badge tone="error">Blocat</Badge>
  if (s === 'N/A') return <Badge>N/A</Badge>
  return <Badge>{s || 'NeÃ®nceput'}</Badge>
}

function globalChip(s: string) {
  if (s.includes('FINALIZAT')) return <Badge tone="success">âœ… Finalizat</Badge>
  if (s.includes('BLOCAT')) return <Badge tone="error">â›” Blocat</Badge>
  if (s.includes('IN LUCRU')) return <Badge tone="info">ðŸ”„ ÃŽn Lucru</Badge>
  return <Badge>{s}</Badge>
}

const DEPT_COLS = ['laser','rolat','sudat','asamblat','vopsit'] as const
const STATUS_OPTIONS = ['Finalizat', 'ÃŽn lucru', 'Blocat', 'NeÃ®nceput', 'N/A']

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
      <PageTitle eyebrow={s.eyebrow} title={s.title} subtitle={`LASER â†’ ROLAT â†’ SUDAT â†’ ASAMBLAT â†’ VOPSIT Â· ${filtered.length} ${t.common.records}`} />
      {error && <ErrorBanner message={error} />}

      <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
        <AppField type="text" placeholder={s.search} value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 220 }} />
        {projects.length > 1 && pills(projects, filterProiect, v => setFilterProiect(v))}
        {pills(['ALL','FINALIZAT','IN LUCRU','BLOCAT'], filterStatus, v => setFilterStatus(v as FilterStatus))}
      </Stack>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <DataTable sx={{ overflowX: 'auto' }} head={<TableRow><TableCell>{s.colProiect}</TableCell><TableCell>{s.colNr}</TableCell><TableCell>{s.colNume}</TableCell><TableCell>{s.colStatus}</TableCell><TableCell>{s.colProgres}</TableCell><TableCell sx={{ textAlign: 'center' }}>LASER</TableCell><TableCell sx={{ textAlign: 'center' }}>ROLAT</TableCell><TableCell sx={{ textAlign: 'center' }}>SUDAT</TableCell><TableCell sx={{ textAlign: 'center' }}>ASAMBLAT</TableCell><TableCell sx={{ textAlign: 'center' }}>VOPSIT</TableCell><TableCell>{s.colComentarii}</TableCell><TableCell /></TableRow>}>
          {loading ? <LoadingRows cols={12} /> : filtered.length === 0 ? <EmptyState label={s.empty} /> :
            filtered.map(sa => (
              editId === sa.id ? (
                <TableRow key={sa.id} sx={{ bgcolor: 'rgba(94,106,210,0.06)' }}>
                  <TableCell colSpan={2}><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{sa.proiect} #{sa.nr}</Typography></TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{sa.nume}</TableCell>
                  <TableCell><AppSelect value={String(editRow?.status_global ?? sa.status_global)} onChange={e => setEditRow(r => ({ ...r!, status_global: e.target.value }))} options={['âœ… FINALIZAT','ðŸ”„ IN LUCRU','â›” BLOCAT']} /></TableCell>
                  <TableCell><AppField value={String(editRow?.progres ?? sa.progres)} onChange={e => setEditRow(r => ({ ...r!, progres: e.target.value }))} sx={{ width: 70 }} /></TableCell>
                  {DEPT_COLS.map(col => (
                    <TableCell key={col} sx={{ textAlign: 'center' }}><AppSelect value={String(editRow?.[col] ?? sa[col])} onChange={e => setEditRow(r => ({ ...r!, [col]: e.target.value }))} options={STATUS_OPTIONS} sx={{ minWidth: 110 }} /></TableCell>
                  ))}
                  <TableCell><AppField value={String(editRow?.comentarii ?? sa.comentarii ?? '')} onChange={e => setEditRow(r => ({ ...r!, comentarii: e.target.value }))} sx={{ width: 140 }} /></TableCell>
                  <TableCell>
                    <Stack direction="row" gap={0.75}>
                      <ActionButton onClick={saveEdit} disabled={saving} sx={{ px: 1.25, py: 0.5, fontSize: 11 }}>{saving ? '...' : t.common.save}</ActionButton>
                      <ActionButton variant="outlined" onClick={() => { setEditId(null); setEditRow(null) }} sx={{ px: 1, py: 0.5, fontSize: 11 }}>âœ•</ActionButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={sa.id} sx={sa.blocat ? { bgcolor: 'rgba(239,68,68,0.03)' } : undefined}>
                  <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{sa.proiect}</Typography></TableCell>
                  <TableCell sx={{ color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{sa.nr}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>{sa.nume}</Typography>
                    {sa.conditionat_de && <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-primary)', mt: 0.25 }}>ðŸ”µ {sa.conditionat_de}</Typography>}
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
                  {DEPT_COLS.map(col => <TableCell key={col} sx={{ textAlign: 'center' }}>{statusChip(sa[col])}</TableCell>)}
                  <TableCell sx={{ fontSize: 12, color: sa.blocat ? '#f87171' : 'var(--color-ink-muted)', maxWidth: 180 }}>{sa.comentarii}</TableCell>
                  <TableCell>
                    <ActionButton variant="outlined" onClick={() => { setEditId(sa.id); setEditRow({ status_global: sa.status_global, progres: sa.progres, blocat: sa.blocat, laser: sa.laser, rolat: sa.rolat, sudat: sa.sudat, asamblat: sa.asamblat, vopsit: sa.vopsit, comentarii: sa.comentarii ?? '' }) }} sx={{ px: 1, py: 0.375, fontSize: 11 }}>
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
