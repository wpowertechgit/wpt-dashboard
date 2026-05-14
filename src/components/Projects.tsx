import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchProiecte, insertProiect } from '../lib/api'
import { ErrorBanner, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

function priorityBadge(p: string) {
  if (p === 'CRITIC') return <Badge tone="error">ðŸ”´ CRITIC</Badge>
  if (p === 'RIDICAT') return <Badge tone="warning">ðŸŸ¡ RIDICAT</Badge>
  return <Badge tone="success">ðŸŸ¢ NORMAL</Badge>
}

function statusBadge(s: string) {
  if (s === 'LIVRAT') return <Badge tone="success">âœ… LIVRAT</Badge>
  if (s === 'IN LIVRARE') return <Badge tone="warning">ðŸŸ¡ IN LIVRARE</Badge>
  if (s === 'BLOCAJE ACTIVE') return <Badge tone="error">â›” BLOCAJE ACTIVE</Badge>
  return <Badge>{s}</Badge>
}

function ProgressBar({ value }: { value: number }) {
  const c = value >= 95 ? 'success' : value >= 80 ? 'warning' : 'danger'
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Box className="progress-bar" sx={{ flex: 1 }}>
        <Box className={`progress-fill progress-fill-${c}`} sx={{ width: `${value}%` }} />
      </Box>
      <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-muted)', minWidth: 40, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
        {value.toFixed(1)}%
      </Typography>
    </Stack>
  )
}

const BLANK = { id: '', client: '', responsabil: '', data_start: '', data_target: '', total_sa: 0, buget_ore: 0, prioritate: 'NORMAL', status: 'IN PRODUCTIE' }

export default function Proiecte() {
  const { t } = useLang()
  const p = t.proiecte
  const { data, loading, error, refetch } = useQuery(fetchProiecte)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const setF = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await insertProiect(form)
      setShowForm(false)
      setForm({ ...BLANK })
      refetch()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack gap={4}>
      <PageTitle
        eyebrow={p.eyebrow}
        title={p.title}
        subtitle={`${data?.length ?? 'â€¦'} ${t.common.records}`}
        action={<ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => { setShowForm(s => !s); setFormError(null) }}>{showForm ? `âœ• ${t.common.cancel}` : p.newBtn}</ActionButton>}
      />

      {error && <ErrorBanner message={error} />}

      {showForm && (
        <Card sx={{ borderLeft: '3px solid var(--color-primary)' }}>
          <Eyebrow sx={{ mb: 2 }}>{p.formTitle}</Eyebrow>
          {formError && <Box sx={{ bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', p: '8px 12px', mb: 1.5 }}><Typography variant="body2" sx={{ fontSize: 12, color: '#f87171' }}>{formError}</Typography></Box>}
          <Stack component="form" onSubmit={submit} gap={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              <AppField label={`${p.idProiect} *`} required value={form.id} onChange={e => setF('id', e.target.value)} placeholder="WP1000-11" />
              <AppField label={`${p.client} *`} required value={form.client} onChange={e => setF('client', e.target.value)} />
              <AppField label={p.responsabil} value={form.responsabil} onChange={e => setF('responsabil', e.target.value)} />
              <AppField label={p.dataStart} value={form.data_start} onChange={e => setF('data_start', e.target.value)} placeholder="01-Ian-25" />
              <AppField label={p.dataTarget} value={form.data_target} onChange={e => setF('data_target', e.target.value)} placeholder="30-Iun-25" />
              <AppField label={p.totalSA} type="number" value={form.total_sa} onChange={e => setF('total_sa', Number(e.target.value))} inputProps={{ min: 0 }} />
              <AppField label={p.bugetOre} type="number" value={form.buget_ore} onChange={e => setF('buget_ore', Number(e.target.value))} inputProps={{ min: 0 }} />
              <AppSelect label={p.prioritate} value={form.prioritate} onChange={e => setF('prioritate', e.target.value)} options={['NORMAL', 'RIDICAT', 'CRITIC']} />
              <AppSelect label={p.status} value={form.status} onChange={e => setF('status', e.target.value)} options={['IN PRODUCTIE', 'IN LIVRARE', 'LIVRAT', 'BLOCAJE ACTIVE']} />
            </Box>
            <ActionButton type="submit" disabled={saving} sx={{ alignSelf: 'flex-start', opacity: saving ? 0.7 : 1 }}>
              {saving ? t.common.saving : p.createBtn}
            </ActionButton>
          </Stack>
        </Card>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {loading ? [1,2,3].map(i => (
          <Card key={i} sx={{ height: 260, animation: 'pulse 1.4s ease-in-out infinite', bgcolor: 'var(--color-surface-1)' }} />
        )) : data?.map(p => (
          <Card key={p.id} sx={{ borderTop: `3px solid ${p.prioritate === 'CRITIC' ? '#f87171' : p.prioritate === 'RIDICAT' ? '#fbbf24' : '#4ade80'}` }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>{p.id}</Typography>
                <Typography variant="body2" sx={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', mt: 0.25, letterSpacing: 0 }}>{p.client}</Typography>
              </Box>
              {statusBadge(p.status)}
            </Stack>
            <Stack gap={1.25}>
              {[
                { label: 'Responsabil', val: p.responsabil },
                { label: 'Data Start', val: p.data_start, mono: true },
                { label: 'Target', val: p.data_target, mono: true, warn: p.status !== 'LIVRAT' },
              ].map(({ label, val, mono, warn }) => (
                <Stack key={label} direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{label}</Typography>
                  <Typography variant="body2" sx={{ fontSize: 12, fontFamily: mono ? 'var(--font-mono)' : undefined, color: warn ? '#fbbf24' : 'var(--color-ink-muted)' }}>{val}</Typography>
                </Stack>
              ))}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>Prioritate</Typography>
                {priorityBadge(p.prioritate)}
              </Stack>
              <Box sx={{ borderTop: '1px solid var(--color-hairline)', pt: 1.25, mt: 0.25 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>Subansambluri</Typography>
                  <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>{p.finalizate_sa}/{p.total_sa}</Typography>
                </Stack>
                <ProgressBar value={Number(p.progres)} />
              </Box>
              {p.blocaje_active > 0 && (
                <Stack direction="row" gap={1} sx={{ bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', p: '8px 12px' }}>
                  <Typography variant="body2">â›”</Typography>
                  <Typography variant="body2" sx={{ fontSize: 12, color: '#f87171' }}><strong>{p.blocaje_active}</strong> blocaje active</Typography>
                </Stack>
              )}
            </Stack>
          </Card>
        ))}
      </Box>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}><Eyebrow>{p.tabelar}</Eyebrow></Box>
        <DataTable head={<TableRow><TableCell>{p.colId}</TableCell><TableCell>{p.colClient}</TableCell><TableCell>{p.colResponsabil}</TableCell><TableCell>{p.colPrioritate}</TableCell><TableCell>{p.colStart}</TableCell><TableCell>{p.colTarget}</TableCell><TableCell>{p.colSATotal}</TableCell><TableCell>{p.colSAFinal}</TableCell><TableCell sx={{ minWidth: 180 }}>{p.colProgres}</TableCell><TableCell>{p.colBlocaje}</TableCell><TableCell>{p.colStatus}</TableCell></TableRow>}>
          {loading ? <LoadingRows cols={11} /> : data?.map(p => (
            <TableRow key={p.id}>
              <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>{p.id}</Typography></TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{p.client}</TableCell>
              <TableCell sx={{ color: 'var(--color-ink-muted)' }}>{p.responsabil}</TableCell>
              <TableCell>{priorityBadge(p.prioritate)}</TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{p.data_start}</TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: p.status !== 'LIVRAT' ? '#fbbf24' : 'var(--color-ink-muted)' }}>{p.data_target}</TableCell>
              <TableCell sx={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.total_sa}</TableCell>
              <TableCell sx={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.finalizate_sa}</TableCell>
              <TableCell sx={{ minWidth: 180 }}><ProgressBar value={Number(p.progres)} /></TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{p.blocaje_active > 0 ? <Badge tone="error">{p.blocaje_active}</Badge> : <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>â€“</Typography>}</TableCell>
              <TableCell>{statusBadge(p.status)}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </Card>
    </Stack>
  )
}
