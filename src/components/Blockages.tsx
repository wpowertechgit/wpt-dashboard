import { useState } from 'react'
import type { ReactNode } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchBlocaje, insertBlocaj, updateBlocaj } from '../lib/api'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

function impactBadge(i: string) {
  if (i === 'CRITIC') return <Badge tone="error">CRITIC</Badge>
  if (i === 'INALT') return <Badge tone="warning">INALT</Badge>
  return <Badge>MEDIU</Badge>
}
function statusBadge(s: string) {
  return s === 'Deschis' ? <Badge tone="error">⛔ Deschis</Badge> : <Badge tone="success">✅ Rezolvat</Badge>
}

const BLANK = { id: '', data_deschidere: '', proiect: '', subansamblu: '', departament: 'SUDAT', descriere: '', responsabil: '', impact: 'MEDIU', status: 'Deschis', data_rezolvare: '', zile_deschis: 0, observatii: '' }

export default function Blocaje() {
  const { t } = useLang()
  const b = t.blocaje
  const { data, loading, error, refetch } = useQuery(fetchBlocaje)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)

  const open = data?.filter(b => b.status === 'Deschis') ?? []
  const resolved = data?.filter(b => b.status === 'Rezolvat') ?? []
  function setF(k: string, v: string | number) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.id) return
    setSaving(true)
    try { await insertBlocaj(form); setShowForm(false); setForm({ ...BLANK }); refetch() }
    finally { setSaving(false) }
  }

  async function resolveBlockage(id: string) {
    const today = new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
    await updateBlocaj(id, { status: 'Rezolvat', data_rezolvare: today })
    refetch()
  }

  const formFields = (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 1.5 }}>
      <AppField label="ID Blocare *" required value={form.id} onChange={e => setF('id', e.target.value)} placeholder="BLK-005" />
      <AppField label="Data Deschidere" value={form.data_deschidere} onChange={e => setF('data_deschidere', e.target.value)} placeholder="12-Mai-25" />
      <AppSelect label="Proiect" value={form.proiect} onChange={e => setF('proiect', e.target.value)} options={[{ value: '', label: '— Selectați —' }, 'WP1000-08','WP1000-09','WP1000-10']} />
      <AppField label="Subansamblu" value={form.subansamblu} onChange={e => setF('subansamblu', e.target.value)} />
      <AppSelect label="Departament" value={form.departament} onChange={e => setF('departament', e.target.value)} options={['LASER','ROLAT','SUDAT','ASAMBLAT','VOPSIT']} />
      <AppField label="Responsabil" value={form.responsabil} onChange={e => setF('responsabil', e.target.value)} />
      <AppField label="Descriere Blocaj *" required value={form.descriere} onChange={e => setF('descriere', e.target.value)} sx={{ gridColumn: '1 / -1' }} />
      <AppSelect label="Impact" value={form.impact} onChange={e => setF('impact', e.target.value)} options={['MEDIU','INALT','CRITIC']} />
      <AppField label="Observații" value={form.observatii} onChange={e => setF('observatii', e.target.value)} />
    </Box>
  )

  return (
    <Stack gap={4}>
      <PageTitle eyebrow={b.eyebrow} title={b.title} subtitle={b.subtitle} action={<ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => setShowForm(s => !s)}>{showForm ? `✕ ${t.common.cancel}` : b.newBtn}</ActionButton>} />
      {error && <ErrorBanner message={error} />}
      {showForm && <Card sx={{ borderLeft: '3px solid var(--color-danger)' }}><Eyebrow sx={{ mb: 2 }}>{b.formTitle}</Eyebrow><Stack component="form" onSubmit={submit}>{formFields}<ActionButton type="submit" disabled={saving} sx={{ alignSelf: 'flex-start' }}>{saving ? t.common.saving : b.saveBtn}</ActionButton></Stack></Card>}

      <Stack direction="row" gap={1.5}>
        {[{ val: open.length, label: 'Blocaje Deschise', sub: 'necesită acțiune', color: '#f87171' }, { val: resolved.length, label: 'Rezolvate', sub: 'închise', color: '#4ade80' }].map(({ val, label, sub, color }) => (
          <Card key={label} sx={{ p: '14px 20px' }}><Stack direction="row" alignItems="center" gap={1.5}><Typography variant="h4" fontWeight={700} sx={{ fontSize: 28, color, fontFamily: 'var(--font-display)' }}>{val}</Typography><Box><Typography variant="body2" sx={{ fontSize: 12, fontWeight: 500 }}>{label}</Typography><Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-subtle)' }}>{sub}</Typography></Box></Stack></Card>
        ))}
      </Stack>

      <BlockageTable title={b.activeTitle} counter={<Badge tone="error">{open.length} {b.openCount}</Badge>} loading={loading} rows={open} empty="✅ Niciun blocaj activ" onResolve={resolveBlockage} labels={b} />
      <BlockageTable title={b.resolvedTitle} counter={<Badge tone="success">{resolved.length} {b.closedCount}</Badge>} loading={loading} rows={resolved} empty="Niciun blocaj rezolvat" labels={b} resolved />
    </Stack>
  )
}

function BlockageTable({ title, counter, loading, rows, empty, labels, resolved, onResolve }: { title: string; counter: ReactNode; loading: boolean; rows: any[]; empty: string; labels: any; resolved?: boolean; onResolve?: (id: string) => void }) {
  return (
    <Card sx={{ p: 0, overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}><Eyebrow>{title}</Eyebrow><Box sx={{ ml: 'auto' }}>{counter}</Box></Stack>
      <DataTable head={<TableRow><TableCell>{labels.colId}</TableCell><TableCell>{labels.colData}</TableCell><TableCell>{labels.colProiect}</TableCell><TableCell>{labels.colSubansamblu}</TableCell><TableCell>{labels.colDept}</TableCell><TableCell>{labels.colDescriere}</TableCell><TableCell>{labels.colResponsabil}</TableCell><TableCell>{labels.colImpact}</TableCell><TableCell>{resolved ? labels.colStatus : labels.colZile}</TableCell><TableCell>{resolved ? labels.colRezolvat : labels.colObs}</TableCell><TableCell>{resolved ? labels.colZile : ''}</TableCell></TableRow>}>
        {loading ? <LoadingRows cols={11} /> : rows.length === 0 ? <EmptyState label={empty} /> : rows.map(b => (
          <TableRow key={b.id} sx={!resolved ? { bgcolor: 'rgba(239,68,68,0.03)' } : undefined}>
            <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: resolved ? 'var(--color-primary)' : '#f87171' }}>{b.id}</Typography></TableCell>
            <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{b.data_deschidere}</TableCell>
            <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{b.proiect}</Typography></TableCell>
            <TableCell sx={{ fontWeight: 500 }}>{b.subansamblu}</TableCell>
            <TableCell><Badge>{b.departament}</Badge></TableCell>
            <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', maxWidth: resolved ? 200 : 220 }}>{b.descriere}</TableCell>
            <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{b.responsabil}</TableCell>
            <TableCell>{impactBadge(b.impact)}</TableCell>
            {resolved ? <TableCell>{statusBadge(b.status)}</TableCell> : <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: b.zile_deschis > 30 ? '#f87171' : 'var(--color-ink-muted)' }}>{b.zile_deschis}z</Typography></TableCell>}
            {resolved ? <TableCell sx={{ fontSize: 12, color: '#4ade80' }}>{b.data_rezolvare}</TableCell> : <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{b.observatii}</TableCell>}
            <TableCell>{resolved ? <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{b.zile_deschis}z</Typography> : <ActionButton variant="outlined" onClick={() => onResolve?.(b.id)} sx={{ bgcolor: 'rgba(39,166,68,0.1)', borderColor: 'rgba(39,166,68,0.2)', color: '#4ade80', fontSize: 11, px: 1, py: 0.375, whiteSpace: 'nowrap' }}>{labels.resolveBtn}</ActionButton>}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    </Card>
  )
}
