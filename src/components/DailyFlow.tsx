import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchFluxZilnic, insertFluxZilnic } from '../lib/api'
import { formatDateLabel } from '../lib/dateUtils'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

const DEPT_COLORS: Record<string, string> = { LASER: '#818cf8', ROLAT: '#60a5fa', SUDAT: '#fbbf24', ASAMBLAT: '#34d399', VOPSIT: '#f87171' }
const DEPTS = ['LASER','ROLAT','SUDAT','ASAMBLAT','VOPSIT']

function deptBadge(d: string) {
  const c = DEPT_COLORS[d] || 'var(--color-ink-subtle)'
  return <Badge sx={{ bgcolor: `${c}18`, color: c }}>{d}</Badge>
}

const BLANK = { data: '', proiect: '', subansamblu: '', dept_origine: 'SUDAT', dept_destinatie: 'ASAMBLAT', echipa: '', validat_de: '', observatii: '' }

export default function FluxZilnic() {
  const { t } = useLang()
  const f = t.flux
  const { data, loading, error, refetch } = useQuery(fetchFluxZilnic)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const setF = (k: string, v: string) => setForm(frm => ({ ...frm, [k]: v }))

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    try { await insertFluxZilnic(form); setShowForm(false); setForm({ ...BLANK }); refetch() }
    finally { setSaving(false) }
  }

  const byDate = (data ?? []).reduce<Record<string, typeof data>>((acc, item) => {
    if (!acc[item.data]) acc[item.data] = []
    acc[item.data]!.push(item)
    return acc
  }, {})
  const deptCounts = DEPTS.map(d => ({ dept: d, count: (data ?? []).filter(fl => fl.dept_origine === d || fl.dept_destinatie === d).length }))

  return (
    <Stack gap={4}>
      <PageTitle eyebrow={f.eyebrow} title={f.title} subtitle={`${f.subtitle} · ${data?.length ?? '…'} ${f.miscari}`} action={<ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => setShowForm(s => !s)}>{showForm ? `✕ ${t.common.cancel}` : f.newBtn}</ActionButton>} />
      {error && <ErrorBanner message={error} />}

      <Card>
        <Eyebrow sx={{ mb: 2 }}>{f.vizTitle}</Eyebrow>
        <Stack direction="row" alignItems="center">
          {deptCounts.map(({ dept, count }, i) => {
            const c = DEPT_COLORS[dept]
            return (
              <Stack key={dept} direction="row" alignItems="center" sx={{ flex: 1 }}>
                <Box sx={{ flex: 1, bgcolor: `${c}12`, border: `1px solid ${c}30`, borderRadius: 'var(--radius-md)', p: '12px 10px', textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: 11, fontWeight: 600, color: c, letterSpacing: 0.3 }}>{dept}</Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: 18, color: c, mt: 0.5, fontFamily: 'var(--font-display)' }}>{count}</Typography>
                  <Typography variant="body2" sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', mt: 0.125 }}>{f.miscari}</Typography>
                </Box>
                {i < deptCounts.length - 1 && <Typography variant="body2" sx={{ px: 0.5, color: 'var(--color-hairline-strong)', fontSize: 18 }}>→</Typography>}
              </Stack>
            )
          })}
        </Stack>
      </Card>

      {showForm && (
        <Card sx={{ borderLeft: '3px solid var(--color-primary)' }}>
          <Eyebrow sx={{ mb: 2 }}>{f.formTitle}</Eyebrow>
          <Stack component="form" onSubmit={submit} gap={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              <AppField label={f.data} type="date" value={form.data} onChange={e => setF('data', e.target.value)} />
              <AppSelect label={f.proiect} value={form.proiect} onChange={e => setF('proiect', e.target.value)} options={[{ value: '', label: '— Selectați —' }, 'WP1000-08','WP1000-09','WP1000-10']} />
              <AppField label={f.subansamblu} required value={form.subansamblu} onChange={e => setF('subansamblu', e.target.value)} />
              <AppSelect label={f.deLa} value={form.dept_origine} onChange={e => setF('dept_origine', e.target.value)} options={DEPTS} />
              <AppSelect label={f.la} value={form.dept_destinatie} onChange={e => setF('dept_destinatie', e.target.value)} options={DEPTS} />
              <AppField label={f.echipa} value={form.echipa} onChange={e => setF('echipa', e.target.value)} />
              <AppField label={f.validatDe} value={form.validat_de} onChange={e => setF('validat_de', e.target.value)} />
              <AppField label={f.observatii} value={form.observatii} onChange={e => setF('observatii', e.target.value)} sx={{ gridColumn: '1 / -1' }} />
            </Box>
            <ActionButton type="submit" disabled={saving} sx={{ alignSelf: 'flex-start' }}>{saving ? t.common.saving : f.saveBtn}</ActionButton>
          </Stack>
        </Card>
      )}

      {loading ? <FlowTable title={null} rows={[]} loading labels={f} /> :
        Object.keys(byDate).length === 0 ? <Card sx={{ p: 0, overflow: 'hidden' }}><DataTable><EmptyState label={f.empty} /></DataTable></Card> :
          Object.entries(byDate).map(([date, items]) => <FlowTable key={date} title={date} count={items!.length} rows={items ?? []} labels={f} />)}
    </Stack>
  )
}

function FlowTable({ title, count, rows, loading, labels }: { title?: string | null; count?: number; rows: any[]; loading?: boolean; labels: any }) {
  return (
    <Card sx={{ p: 0, overflow: 'hidden' }}>
      {title && <Stack direction="row" alignItems="center" gap={1} sx={{ p: '16px 24px', borderBottom: '1px solid var(--color-hairline)' }}><Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600 }}>{formatDateLabel(title)}</Typography><Badge>{count} {labels.miscari}</Badge></Stack>}
      <DataTable head={<TableRow><TableCell>{labels.colProiect}</TableCell><TableCell>{labels.colSubansamblu}</TableCell><TableCell>{labels.colDeLa}</TableCell><TableCell /><TableCell>{labels.colLa}</TableCell><TableCell>{labels.colEchipa}</TableCell><TableCell>{labels.colValidat}</TableCell><TableCell>{labels.colObs}</TableCell></TableRow>}>
        {loading ? <LoadingRows cols={8} /> : rows.map((fl, i) => (
          <TableRow key={i}>
            <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{fl.proiect}</Typography></TableCell>
            <TableCell sx={{ fontWeight: 500 }}>{fl.subansamblu}</TableCell>
            <TableCell>{deptBadge(fl.dept_origine)}</TableCell>
            <TableCell sx={{ color: 'var(--color-ink-tertiary)', p: '10px 4px' }}>→</TableCell>
            <TableCell>{deptBadge(fl.dept_destinatie)}</TableCell>
            <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{fl.echipa}</TableCell>
            <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{fl.validat_de}</TableCell>
            <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{fl.observatii}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    </Card>
  )
}
