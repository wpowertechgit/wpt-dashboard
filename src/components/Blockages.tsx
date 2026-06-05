import { useState } from 'react'
import type { ReactNode } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchBlocaje, fetchProiecte, fetchSubansambluri, insertBlocaj, updateBlocaj } from '../lib/api'
import { formatDateLabel } from '../lib/dateUtils'
import { usePermissions } from '../lib/permissionsContext'
import { buildProjectOptions } from '../lib/projectOptions'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

function impactBadge(i: string) {
  if (i === 'CRITIC') return <Badge tone="error">CRITIC</Badge>
  if (i === 'INALT') return <Badge tone="warning">INALT</Badge>
  return <Badge>MEDIU</Badge>
}

function statusBadge(s: string) {
  return s === 'Deschis' ? <Badge tone="error">Deschis</Badge> : <Badge tone="success">Rezolvat</Badge>
}

const BLANK = { id: '', data_deschidere: '', proiect: '', subansamblu: '', departament: 'SUDAT', descriere: '', responsabil: '', impact: 'MEDIU', status: 'Deschis', data_rezolvare: '', zile_deschis: 0, observatii: '' }

export default function Blocaje() {
  const { t, lang } = useLang()
  const { canWrite } = usePermissions()
  const b = t.blocaje
  const { data, loading, error, refetch } = useQuery(fetchBlocaje)
  const projects = useQuery(fetchProiecte)
  const saQuery = useQuery(fetchSubansambluri)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)

  const open = data?.filter(b => b.status === 'Deschis') ?? []
  const resolved = data?.filter(b => b.status === 'Rezolvat') ?? []

  // SAs marked BLOCAT that don't already have a matching open blocaj entry
  const blocateSA = (saQuery.data ?? []).filter(s =>
    (s.blocat || s.status_global?.includes('BLOCAT')) &&
    !open.some(bl => bl.subansamblu === s.nume && bl.proiect === s.proiect)
  )

  const projectOptions = buildProjectOptions(projects.data)
  function setF(k: string, v: string | number) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.id) return
    setSaving(true)
    try { await insertBlocaj(form); setShowForm(false); setForm({ ...BLANK }); refetch() }
    finally { setSaving(false) }
  }

  async function resolveBlockage(id: string) {
    const today = new Date().toISOString().slice(0, 10)
    await updateBlocaj(id, { status: 'Rezolvat', data_rezolvare: today })
    refetch()
  }

  const formFields = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5, mb: 1.5 }}>
      <AppField label="ID Blocare *" required value={form.id} onChange={e => setF('id', e.target.value)} placeholder="BLK-005" />
      <AppField label="Data Deschidere" type="date" value={form.data_deschidere} onChange={e => setF('data_deschidere', e.target.value)} />
      <AppSelect label="Proiect" value={form.proiect} onChange={e => setF('proiect', e.target.value)} options={[{ value: '', label: '- Selectati -' }, ...projectOptions]} />
      <AppField label="Subansamblu" value={form.subansamblu} onChange={e => setF('subansamblu', e.target.value)} />
      <AppSelect label="Departament" value={form.departament} onChange={e => setF('departament', e.target.value)} options={['PROIECTARE','LASER','VIROLAT','SUDAT','ASAMBLAT','VOPSIT']} />
      <AppField label="Responsabil" value={form.responsabil} onChange={e => setF('responsabil', e.target.value)} />
      <AppField label="Descriere Blocaj *" required value={form.descriere} onChange={e => setF('descriere', e.target.value)} sx={{ gridColumn: '1 / -1' }} />
      <AppSelect label="Impact" value={form.impact} onChange={e => setF('impact', e.target.value)} options={['MEDIU','INALT','CRITIC']} />
      <AppField label="Observatii" value={form.observatii} onChange={e => setF('observatii', e.target.value)} />
    </Box>
  )

  return (
    <Stack gap={4}>
      <PageTitle eyebrow={b.eyebrow} title={b.title} subtitle={b.subtitle} info={pageInfo(lang, 'blockages')} action={canWrite ? <ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => setShowForm(s => !s)}>{showForm ? `x ${t.common.cancel}` : b.newBtn}</ActionButton> : undefined} />
      {(error || projects.error) && <ErrorBanner message={(error || projects.error) ?? ''} />}
      {canWrite && showForm && (
        <Card sx={{ borderLeft: '3px solid var(--color-danger)' }}>
          <Eyebrow sx={{ mb: 2 }}>{b.formTitle}</Eyebrow>
          <Stack component="form" onSubmit={submit}>
            {formFields}
            <ActionButton type="submit" disabled={saving} sx={{ alignSelf: 'flex-start' }}>{saving ? t.common.saving : b.saveBtn}</ActionButton>
          </Stack>
        </Card>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
        {[
          { val: open.length + blocateSA.length, label: b.deschise, sub: b.deschiseHint, color: '#f87171' },
          { val: resolved.length, label: b.rezolvate, sub: b.rezolvateHint, color: '#4ade80' },
        ].map(({ val, label, sub, color }) => (
          <Card key={label} sx={{ p: '14px 20px' }}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Typography variant="h4" fontWeight={700} sx={{ fontSize: 28, color, fontFamily: 'var(--font-display)' }}>{val}</Typography>
              <Box>
                <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 500 }}>{label}</Typography>
                <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-subtle)' }}>{sub}</Typography>
              </Box>
            </Stack>
          </Card>
        ))}
      </Box>

      <BlockageTable title={b.activeTitle} counter={<Badge tone="error">{open.length + blocateSA.length} {b.openCount}</Badge>} loading={loading} rows={open} saRows={blocateSA} empty="Niciun blocaj activ" onResolve={canWrite ? resolveBlockage : undefined} labels={b} />
      <BlockageTable title={b.resolvedTitle} counter={<Badge tone="success">{resolved.length} {b.closedCount}</Badge>} loading={loading} rows={resolved} empty="Niciun blocaj rezolvat" labels={b} resolved />
    </Stack>
  )
}

function BlockageTable({ title, counter, loading, rows, saRows = [], empty, labels, resolved, onResolve }: {
  title: string; counter: ReactNode; loading: boolean; rows: any[]; saRows?: any[]
  empty: string; labels: any; resolved?: boolean; onResolve?: (id: string) => void
}) {
  const idColor = resolved ? 'var(--color-primary)' : '#f87171'
  const totalEmpty = rows.length === 0 && saRows.length === 0

  return (
    <Card sx={{ p: 0, overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
        <Eyebrow>{title}</Eyebrow>
        <Box sx={{ ml: 'auto' }}>{counter}</Box>
      </Stack>

      {/* ── Desktop table (md+) ── */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <DataTable head={
          <TableRow>
            <TableCell>{labels.colId}</TableCell>
            <TableCell>{labels.colData}</TableCell>
            <TableCell>{labels.colProiect}</TableCell>
            <TableCell>{labels.colSubansamblu}</TableCell>
            <TableCell>{labels.colDept}</TableCell>
            <TableCell>{labels.colDescriere}</TableCell>
            <TableCell>{labels.colResponsabil}</TableCell>
            <TableCell>{labels.colImpact}</TableCell>
            <TableCell>{resolved ? labels.colStatus : labels.colZile}</TableCell>
            <TableCell>{resolved ? labels.colRezolvat : labels.colObs}</TableCell>
            <TableCell>{resolved ? labels.colZile : ''}</TableCell>
          </TableRow>
        }>
          {loading ? <LoadingRows cols={11} /> : totalEmpty ? <EmptyState label={empty} /> : <>
            {rows.map(b => (
              <TableRow key={b.id} sx={!resolved ? { bgcolor: 'rgba(239,68,68,0.03)' } : undefined}>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: idColor }}>{b.id}</Typography></TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{formatDateLabel(b.data_deschidere)}</TableCell>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{b.proiect}</Typography></TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{b.subansamblu}</TableCell>
                <TableCell><Badge>{b.departament}</Badge></TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', maxWidth: resolved ? 200 : 220 }}>{b.descriere}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{b.responsabil}</TableCell>
                <TableCell>{impactBadge(b.impact)}</TableCell>
                {resolved
                  ? <TableCell>{statusBadge(b.status)}</TableCell>
                  : <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: b.zile_deschis > 30 ? '#f87171' : 'var(--color-ink-muted)' }}>{b.zile_deschis}z</Typography></TableCell>}
                {resolved
                  ? <TableCell sx={{ fontSize: 12, color: '#4ade80' }}>{formatDateLabel(b.data_rezolvare)}</TableCell>
                  : <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{b.observatii}</TableCell>}
                <TableCell>
                  {resolved
                    ? <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{b.zile_deschis}z</Typography>
                    : onResolve
                      ? <ActionButton variant="outlined" onClick={() => onResolve(b.id)} sx={{ bgcolor: 'rgba(39,166,68,0.1)', borderColor: 'rgba(39,166,68,0.2)', color: '#4ade80', fontSize: 11, px: 1, py: 0.375, whiteSpace: 'nowrap' }}>{labels.resolveBtn}</ActionButton>
                      : null}
                </TableCell>
              </TableRow>
            ))}
            {!resolved && saRows.map(s => (
              <TableRow key={`sa-${s.id}`} sx={{ bgcolor: 'rgba(239,68,68,0.03)' }}>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f87171' }}>SA</Typography></TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>—</TableCell>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{s.proiect}</Typography></TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{s.nume} #{s.nr}</TableCell>
                <TableCell><Badge tone="error">⛔ SA</Badge></TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', maxWidth: 220 }}>{s.comentarii || '—'}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>—</TableCell>
                <TableCell><Badge>—</Badge></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>—</Typography></TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>—</TableCell>
                <TableCell />
              </TableRow>
            ))}
          </>}
        </DataTable>
      </Box>

      {/* ── Mobile cards (xs–sm) ── */}
      <Stack sx={{ display: { xs: 'flex', md: 'none' } }} gap={0}>
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>Se încarcă...</Typography>
          </Box>
        ) : totalEmpty ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>{empty}</Typography>
          </Box>
        ) : <>
          {rows.map((b, i) => (
            <Box
              key={b.id}
              sx={{
                p: '14px 16px',
                borderBottom: (i < rows.length - 1 || saRows.length > 0) ? '1px solid var(--color-hairline)' : 'none',
                bgcolor: !resolved ? 'rgba(239,68,68,0.02)' : 'transparent',
              }}
            >
              {/* Row 1: ID + badges */}
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }} flexWrap="wrap">
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: idColor, flexShrink: 0 }}>
                  {b.id}
                </Typography>
                {statusBadge(b.status)}
                {impactBadge(b.impact)}
                <Badge>{b.departament}</Badge>
              </Stack>

              {/* Row 2: project + subassembly */}
              {(b.proiect || b.subansamblu) && (
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.75 }} flexWrap="wrap">
                  {b.proiect && (
                    <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)', bgcolor: 'rgba(94,106,210,0.1)', px: '6px', py: '2px', borderRadius: 'var(--radius-xs)' }}>
                      {b.proiect}
                    </Typography>
                  )}
                  {b.subansamblu && (
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)' }}>{b.subansamblu}</Typography>
                  )}
                </Stack>
              )}

              {/* Row 3: description */}
              <Typography sx={{ fontSize: 13, color: 'var(--color-ink)', lineHeight: 1.5, mb: 1 }}>{b.descriere}</Typography>

              {/* Row 4: meta pills */}
              <Stack direction="row" gap={1.5} sx={{ mb: b.observatii || (!resolved && onResolve) ? 1 : 0 }} flexWrap="wrap">
                {b.responsabil && (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Resp.</Typography>
                    <Typography sx={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{b.responsabil}</Typography>
                  </Stack>
                )}
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Data</Typography>
                  <Typography sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{formatDateLabel(b.data_deschidere)}</Typography>
                </Stack>
                {resolved ? (
                  b.data_rezolvare && (
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Rezolvat</Typography>
                      <Typography sx={{ fontSize: 12, color: '#4ade80' }}>{formatDateLabel(b.data_rezolvare)}</Typography>
                    </Stack>
                  )
                ) : (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Zile</Typography>
                    <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: b.zile_deschis > 30 ? '#f87171' : 'var(--color-ink-muted)', fontWeight: b.zile_deschis > 30 ? 700 : 400 }}>
                      {b.zile_deschis}z
                    </Typography>
                  </Stack>
                )}
              </Stack>

              {/* Row 5: observations */}
              {b.observatii && (
                <Typography sx={{ fontSize: 12, color: 'var(--color-ink-subtle)', fontStyle: 'italic', mb: !resolved && onResolve ? 1 : 0 }}>
                  {b.observatii}
                </Typography>
              )}

              {/* Row 6: resolve button */}
              {!resolved && onResolve && (
                <ActionButton
                  variant="outlined"
                  onClick={() => onResolve(b.id)}
                  sx={{ width: '100%', mt: 0.5, bgcolor: 'rgba(39,166,68,0.08)', borderColor: 'rgba(39,166,68,0.25)', color: '#4ade80', fontSize: 12, py: 0.75 }}
                >
                  {labels.resolveBtn}
                </ActionButton>
              )}
            </Box>
          ))}
          {!resolved && saRows.map((s, i) => (
            <Box
              key={`sa-${s.id}`}
              sx={{
                p: '14px 16px',
                borderBottom: i < saRows.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                bgcolor: 'rgba(239,68,68,0.02)',
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.75 }} flexWrap="wrap">
                <Badge tone="error">⛔ SA</Badge>
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)', bgcolor: 'rgba(94,106,210,0.1)', px: '6px', py: '2px', borderRadius: 'var(--radius-xs)' }}>
                  {s.proiect}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)', mb: 0.5 }}>{s.nume} #{s.nr}</Typography>
              {s.comentarii && (
                <Typography sx={{ fontSize: 12, color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>{s.comentarii}</Typography>
              )}
            </Box>
          ))}
        </>}
      </Stack>
    </Card>
  )
}
