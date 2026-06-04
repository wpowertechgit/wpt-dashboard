import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchFluxZilnic, fetchProiecte, fetchSubansambluri, insertFluxZilnic, updateFluxZilnic, deleteFluxZilnic } from '../lib/api'
import { formatDateLabel } from '../lib/dateUtils'
import { usePermissions } from '../lib/permissionsContext'
import { buildProjectOptions } from '../lib/projectOptions'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

const DEPT_COLORS: Record<string, string> = {
  LASER: '#818cf8', VIROLAT: '#60a5fa', SUDAT: '#fbbf24',
  ASAMBLAT: '#34d399', VOPSIT: '#f87171', PROIECTARE: '#a78bfa',
}
const DEPTS = ['PROIECTARE', 'LASER', 'VIROLAT', 'SUDAT', 'ASAMBLAT', 'VOPSIT']

function normalizeDept(d: string) { return d === 'ROLAT' ? 'VIROLAT' : d }

function deptBadge(d: string) {
  const label = normalizeDept(d)
  const c = DEPT_COLORS[label] || 'var(--color-ink-subtle)'
  return <Badge sx={{ bgcolor: `${c}18`, color: c }}>{label}</Badge>
}

const BLANK = { data: '', proiect: '', subansamblu: '', dept_origine: 'LASER', dept_destinatie: 'VIROLAT', echipa: '', validat_de: '', observatii: '' }

export default function FluxZilnic() {
  const { t, lang } = useLang()
  const { canWrite } = usePermissions()
  const f = t.flux
  const { data, loading, error, refetch } = useQuery(fetchFluxZilnic)
  const projects = useQuery(fetchProiecte)
  const subansambluri = useQuery(fetchSubansambluri)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<typeof BLANK | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const setF = (k: string, v: string) => setForm(frm => ({ ...frm, [k]: v }))
  const setEF = (k: string, v: string) => setEditRow(r => r ? { ...r, [k]: v } : r)

  const projectOptions = buildProjectOptions(projects.data)

  // Get subassembly names for selected project
  function saOptions(proiect: string) {
    if (!proiect) return []
    return (subansambluri.data ?? [])
      .filter(s => s.proiect === proiect)
      .map(s => ({ value: s.nume, label: `#${s.nr} ${s.nume}` }))
  }

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    try { await insertFluxZilnic(form); setShowForm(false); setForm({ ...BLANK }); refetch() }
    finally { setSaving(false) }
  }

  async function saveEdit() {
    if (!editId || !editRow) return
    setSaving(true)
    try { await updateFluxZilnic(editId, editRow); setEditId(null); setEditRow(null); refetch() }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Ștergi această mișcare?')) return
    setDeletingId(id)
    try { await deleteFluxZilnic(id); refetch() }
    finally { setDeletingId(null) }
  }

  const byDate = (data ?? []).reduce<Record<string, typeof data>>((acc, item) => {
    if (!acc[item.data]) acc[item.data] = []
    acc[item.data]!.push(item)
    return acc
  }, {})

  const deptCounts = DEPTS.map(d => ({
    dept: d,
    count: (data ?? []).filter(fl => normalizeDept(fl.dept_origine) === d || normalizeDept(fl.dept_destinatie) === d).length,
  }))

  function FlowForm({ values, setVal, onSubmit, onCancel, isSaving, projectOpts }: {
    values: typeof BLANK; setVal: (k: string, v: string) => void
    onSubmit: (e: { preventDefault(): void }) => void; onCancel: () => void
    isSaving: boolean; projectOpts: ReturnType<typeof buildProjectOptions>
  }) {
    const saOpts = saOptions(values.proiect)
    return (
      <Card sx={{ borderLeft: '3px solid var(--color-primary)' }}>
        <Stack component="form" onSubmit={onSubmit} gap={1.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
            <AppField label={f.data} type="date" value={values.data} onChange={e => setVal('data', e.target.value)} />
            <AppSelect label={f.proiect} value={values.proiect} onChange={e => { setVal('proiect', e.target.value); setVal('subansamblu', '') }} options={[{ value: '', label: '- Selectati -' }, ...projectOpts]} />
            {saOpts.length > 0
              ? <AppSelect label={f.subansamblu} value={values.subansamblu} onChange={e => setVal('subansamblu', e.target.value)} options={[{ value: '', label: '- Selectati -' }, ...saOpts]} />
              : <AppField label={f.subansamblu} value={values.subansamblu} onChange={e => setVal('subansamblu', e.target.value)} />}
            <AppSelect label={f.deLa} value={normalizeDept(values.dept_origine)} onChange={e => setVal('dept_origine', e.target.value)} options={DEPTS} />
            <AppSelect label={f.la} value={normalizeDept(values.dept_destinatie)} onChange={e => setVal('dept_destinatie', e.target.value)} options={DEPTS} />
            <AppField label={f.echipa} value={values.echipa} onChange={e => setVal('echipa', e.target.value)} />
            <AppField label={f.validatDe} value={values.validat_de} onChange={e => setVal('validat_de', e.target.value)} />
            <AppField label={f.observatii} value={values.observatii} onChange={e => setVal('observatii', e.target.value)} sx={{ gridColumn: '1 / -1' }} />
          </Box>
          <Stack direction="row" gap={1}>
            <ActionButton type="submit" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>{isSaving ? t.common.saving : f.saveBtn}</ActionButton>
            <ActionButton variant="outlined" onClick={onCancel}>{t.common.cancel}</ActionButton>
          </Stack>
        </Stack>
      </Card>
    )
  }

  return (
    <Stack gap={4}>
      <PageTitle eyebrow={f.eyebrow} title={f.title} subtitle={`${f.subtitle} - ${data?.length ?? '...'} ${f.miscari}`} info={pageInfo(lang, 'dailyFlow')} action={canWrite ? <ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => setShowForm(s => !s)}>{showForm ? `x ${t.common.cancel}` : f.newBtn}</ActionButton> : undefined} />
      {(error || projects.error) && <ErrorBanner message={(error || projects.error) ?? ''} />}

      <Card>
        <Eyebrow sx={{ mb: 2 }}>{f.vizTitle}</Eyebrow>
        <Stack direction="row" alignItems="center" sx={{ overflowX: 'auto', pb: 0.5 }}>
          {deptCounts.map(({ dept, count }, i) => {
            const c = DEPT_COLORS[dept] || 'var(--color-ink-subtle)'
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

      {canWrite && showForm && (
        <FlowForm values={form} setVal={setF} onSubmit={submit} onCancel={() => setShowForm(false)} isSaving={saving} projectOpts={projectOptions} />
      )}

      {loading ? (
        <Card sx={{ p: 0, overflow: 'hidden' }}><DataTable><LoadingRows cols={9} /></DataTable></Card>
      ) : Object.keys(byDate).length === 0 ? (
        <Card sx={{ p: 0, overflow: 'hidden' }}><DataTable><EmptyState label={f.empty} /></DataTable></Card>
      ) : Object.entries(byDate).map(([date, items]) => (
        <Card key={date} sx={{ p: 0, overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ p: '16px 24px', borderBottom: '1px solid var(--color-hairline)' }}>
            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600 }}>{formatDateLabel(date)}</Typography>
            <Badge>{items!.length} {f.miscari}</Badge>
          </Stack>
          <DataTable head={
            <TableRow>
              <TableCell>{f.colProiect}</TableCell>
              <TableCell>{f.colSubansamblu}</TableCell>
              <TableCell>{f.colDeLa}</TableCell>
              <TableCell />
              <TableCell>{f.colLa}</TableCell>
              <TableCell>{f.colEchipa}</TableCell>
              <TableCell>{f.colValidat}</TableCell>
              <TableCell>{f.colObs}</TableCell>
              {canWrite && <TableCell />}
            </TableRow>
          }>
            {(items ?? []).map((fl, i) => (
              canWrite && editId === fl.id ? (
                <TableRow key={fl.id ?? i} sx={{ bgcolor: 'rgba(94,106,210,0.06)' }}>
                  <TableCell colSpan={9} sx={{ p: 2 }}>
                    <FlowForm
                      values={editRow!}
                      setVal={setEF}
                      onSubmit={e => { e.preventDefault(); saveEdit() }}
                      onCancel={() => { setEditId(null); setEditRow(null) }}
                      isSaving={saving}
                      projectOpts={projectOptions}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={fl.id ?? i}>
                  <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{fl.proiect}</Typography></TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{fl.subansamblu}</TableCell>
                  <TableCell>{deptBadge(fl.dept_origine)}</TableCell>
                  <TableCell sx={{ color: 'var(--color-ink-tertiary)', p: '10px 4px' }}>→</TableCell>
                  <TableCell>{deptBadge(fl.dept_destinatie)}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{fl.echipa}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{fl.validat_de}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{fl.observatii}</TableCell>
                  {canWrite && (
                    <TableCell>
                      <Stack direction="row" gap={0.5}>
                        <ActionButton variant="outlined" onClick={() => { setEditId(fl.id); setEditRow({ data: fl.data, proiect: fl.proiect, subansamblu: fl.subansamblu, dept_origine: normalizeDept(fl.dept_origine), dept_destinatie: normalizeDept(fl.dept_destinatie), echipa: fl.echipa ?? '', validat_de: fl.validat_de ?? '', observatii: fl.observatii ?? '' }) }} sx={{ px: 1, py: 0.375, fontSize: 11 }}>
                          {t.common.edit}
                        </ActionButton>
                        <ActionButton onClick={() => handleDelete(fl.id)} disabled={deletingId === fl.id}
                          sx={{ px: 1, py: 0.375, fontSize: 11, color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', '&:hover': { borderColor: '#f87171' } }}>
                          {deletingId === fl.id ? '...' : '✕'}
                        </ActionButton>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              )
            ))}
          </DataTable>
        </Card>
      ))}
    </Stack>
  )
}
