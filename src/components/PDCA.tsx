import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchPDCA, fetchProiecte, insertPDCA, updatePDCA } from '../lib/api'
import { formatDateLabel } from '../lib/dateUtils'
import { usePermissions } from '../lib/permissionsContext'
import { buildProjectOptions } from '../lib/projectOptions'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

function priorityBadge(p: string) {
  if (p === 'CRITIC') return <Badge tone="error">CRITIC</Badge>
  if (p === 'INALT') return <Badge tone="warning">INALT</Badge>
  if (p === 'MEDIU') return <Badge tone="info">MEDIU</Badge>
  return <Badge>SCAZUT</Badge>
}

function statusBadge(s: string) {
  if (s === 'Deschis') return <Badge tone="warning">Deschis</Badge>
  if (s === 'In analiza') return <Badge tone="info">In Analiza</Badge>
  if (s === 'Inchis') return <Badge tone="success">Inchis</Badge>
  return <Badge>{s}</Badge>
}

const BLANK = { id: '', sursa: '', data_deschis: '', proiect: '', problema: '', contramasura: '', responsabil: '', termen: '', status: 'Deschis', prioritate: 'MEDIU', zile_ramas: '' }

export default function PDCA_View() {
  const { t, lang } = useLang()
  const { canWrite } = usePermissions()
  const pd = t.pdca
  const { data, loading, error, refetch } = useQuery(fetchPDCA)
  const projects = useQuery(fetchProiecte)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  function autoGenerateId() {
    const next = String((data?.length ?? 0) + 1).padStart(3, '0')
    setF('id', `PDCA-${next}`)
  }

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.id) return
    setSaving(true)
    try { await insertPDCA(form); setShowForm(false); setForm({ ...BLANK }); refetch() }
    finally { setSaving(false) }
  }

  async function closeAction(id: string) {
    await updatePDCA(id, { status: 'Inchis' })
    refetch()
  }

  const overdue = data?.filter(p => p.zile_ramas === 'DEPASIT') ?? []
  const projectOptions = buildProjectOptions(projects.data)
  const rows = data ?? []

  return (
    <Stack gap={4}>
      <PageTitle eyebrow={pd.eyebrow} title={pd.title} subtitle={`${pd.subtitle} - ${rows.length} - ${overdue.length} ${pd.overdueLabel}`} info={pageInfo(lang, 'pdca')} action={canWrite ? <ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => setShowForm(s => !s)}>{showForm ? `x ${t.common.cancel}` : pd.newBtn}</ActionButton> : undefined} />
      {(error || projects.error) && <ErrorBanner message={(error || projects.error) ?? ''} />}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {[
          { phase: 'PLAN', color: '#818cf8', bg: 'rgba(94,106,210,0.08)', desc: 'Identificare problema' },
          { phase: 'DO', color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', desc: 'Contramasuri' },
          { phase: 'CHECK', color: '#4ade80', bg: 'rgba(39,166,68,0.08)', desc: 'Verificare rezultate' },
          { phase: 'ACT', color: '#f87171', bg: 'rgba(239,68,68,0.08)', desc: 'Actiune urmatoare' },
        ].map(({ phase, color, bg, desc }) => (
          <Box key={phase} sx={{ bgcolor: bg, border: `1px solid ${color}22`, borderRadius: 'var(--radius-lg)', p: '14px 16px', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600, color, letterSpacing: 0.3 }}>{phase}</Typography>
            <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-subtle)', mt: 0.25 }}>{desc}</Typography>
          </Box>
        ))}
      </Box>

      {canWrite && showForm && (
        <Card sx={{ borderLeft: '3px solid var(--color-primary)' }}>
          <Eyebrow sx={{ mb: 2 }}>{pd.formTitle}</Eyebrow>
          <Stack component="form" onSubmit={submit} gap={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              <Box>
                <AppField label="ID PDCA *" required value={form.id} onChange={e => setF('id', e.target.value)} placeholder="PDCA-006" />
                <ActionButton variant="outlined" onClick={autoGenerateId} sx={{ mt: 0.5, fontSize: 11, px: 1, py: 0.375 }}>Auto-generează</ActionButton>
              </Box>
              <AppField label="Sursa" value={form.sursa} onChange={e => setF('sursa', e.target.value)} placeholder="BLK-001" />
              <AppField label="Data Deschis" type="date" value={form.data_deschis} onChange={e => setF('data_deschis', e.target.value)} />
              <AppSelect label="Proiect" value={form.proiect} onChange={e => setF('proiect', e.target.value)} options={[{ value: '', label: '- Selectati -' }, ...projectOptions, 'TOATE']} />
              <AppField label="Responsabil" value={form.responsabil} onChange={e => setF('responsabil', e.target.value)} />
              <AppField label="Termen" type="date" value={form.termen} onChange={e => setF('termen', e.target.value)} />
              <AppField label="Problema (Plan) *" required value={form.problema} onChange={e => setF('problema', e.target.value)} sx={{ gridColumn: '1 / -1' }} />
              <AppField label="Contramasura (Do)" value={form.contramasura} onChange={e => setF('contramasura', e.target.value)} sx={{ gridColumn: '1 / -1' }} />
              <AppSelect label="Prioritate" value={form.prioritate} onChange={e => setF('prioritate', e.target.value)} options={['SCAZUT','MEDIU','INALT','CRITIC']} />
            </Box>
            <ActionButton type="submit" disabled={saving} sx={{ alignSelf: 'flex-start' }}>{saving ? t.common.saving : pd.saveBtn}</ActionButton>
          </Stack>
        </Card>
      )}

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
          <Eyebrow>{pd.tableTitle}</Eyebrow>
          {overdue.length > 0 && <Badge tone="error" sx={{ ml: 'auto' }}>{overdue.length} depasite</Badge>}
        </Stack>

        {/* ── Desktop table (md+) ── */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <DataTable head={
            <TableRow>
              <TableCell>{pd.colId}</TableCell>
              <TableCell>{pd.colSursa}</TableCell>
              <TableCell>{pd.colData}</TableCell>
              <TableCell>{pd.colProiect}</TableCell>
              <TableCell sx={{ minWidth: 200 }}>{pd.colProblema}</TableCell>
              <TableCell sx={{ minWidth: 220 }}>{pd.colContramasura}</TableCell>
              <TableCell>{pd.colResponsabil}</TableCell>
              <TableCell>{pd.colTermen}</TableCell>
              <TableCell>{pd.colStatus}</TableCell>
              <TableCell>{pd.colPrioritate}</TableCell>
              <TableCell>{pd.colZile}</TableCell>
              <TableCell />
            </TableRow>
          }>
            {loading ? <LoadingRows cols={12} /> : rows.length === 0 ? <EmptyState label={pd.tableTitle} /> : rows.map(p => (
              <TableRow key={p.id} sx={p.zile_ramas === 'DEPASIT' ? { bgcolor: 'rgba(239,68,68,0.03)' } : undefined}>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{p.id}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-subtle)' }}>{p.sursa}</Typography></TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{formatDateLabel(p.data_deschis)}</TableCell>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{p.proiect}</Typography></TableCell>
                <TableCell sx={{ fontSize: 12, maxWidth: 240 }}>{p.problema}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', maxWidth: 260 }}>{p.contramasura}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{p.responsabil}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{formatDateLabel(p.termen)}</TableCell>
                <TableCell>{statusBadge(p.status)}</TableCell>
                <TableCell>{priorityBadge(p.prioritate)}</TableCell>
                <TableCell>{p.zile_ramas === 'DEPASIT' ? <Badge tone="error">DEPASIT</Badge> : <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{p.zile_ramas}</Typography>}</TableCell>
                <TableCell>{canWrite && p.status !== 'Inchis' && <ActionButton variant="outlined" onClick={() => closeAction(p.id)} sx={{ bgcolor: 'rgba(39,166,68,0.1)', borderColor: 'rgba(39,166,68,0.2)', color: '#4ade80', fontSize: 11, px: 1, py: 0.375, whiteSpace: 'nowrap' }}>Inchide</ActionButton>}</TableCell>
              </TableRow>
            ))}
          </DataTable>
        </Box>

        {/* ── Mobile cards (xs–sm) ── */}
        <Stack sx={{ display: { xs: 'flex', md: 'none' } }} gap={0}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><Typography sx={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>Se încarcă...</Typography></Box>
          ) : rows.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><Typography sx={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>{pd.tableTitle}</Typography></Box>
          ) : rows.map((p, i) => (
            <Box
              key={p.id}
              sx={{
                p: '14px 16px',
                borderBottom: i < rows.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                bgcolor: p.zile_ramas === 'DEPASIT' ? 'rgba(239,68,68,0.03)' : 'transparent',
              }}
            >
              {/* Row 1: ID + badges */}
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.75 }} flexWrap="wrap">
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>{p.id}</Typography>
                {p.sursa && <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-subtle)' }}>{p.sursa}</Typography>}
                {statusBadge(p.status)}
                {priorityBadge(p.prioritate)}
                {p.zile_ramas === 'DEPASIT' && <Badge tone="error">DEPASIT</Badge>}
              </Stack>

              {/* Row 2: project + date + days */}
              <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }} flexWrap="wrap">
                {p.proiect && (
                  <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)', bgcolor: 'rgba(94,106,210,0.1)', px: '6px', py: '2px', borderRadius: 'var(--radius-xs)' }}>{p.proiect}</Typography>
                )}
                {p.data_deschis && (
                  <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)' }}>{formatDateLabel(p.data_deschis)}</Typography>
                )}
                {p.zile_ramas && p.zile_ramas !== 'DEPASIT' && (
                  <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>{p.zile_ramas}</Typography>
                )}
              </Stack>

              {/* Row 3: problem */}
              <Box sx={{ mb: p.contramasura ? 0.75 : 1 }}>
                <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.25 }}>PLAN — Problema</Typography>
                <Typography sx={{ fontSize: 13, color: 'var(--color-ink)', lineHeight: 1.5 }}>{p.problema}</Typography>
              </Box>

              {/* Row 4: countermeasure */}
              {p.contramasura && (
                <Box sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.25 }}>DO — Contramasura</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>{p.contramasura}</Typography>
                </Box>
              )}

              {/* Row 5: responsabil + termen */}
              <Stack direction="row" gap={2} sx={{ mb: canWrite && p.status !== 'Inchis' ? 1 : 0 }} flexWrap="wrap">
                {p.responsabil && (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Resp.</Typography>
                    <Typography sx={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{p.responsabil}</Typography>
                  </Stack>
                )}
                {p.termen && (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Termen</Typography>
                    <Typography sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{formatDateLabel(p.termen)}</Typography>
                  </Stack>
                )}
              </Stack>

              {/* Row 6: close button */}
              {canWrite && p.status !== 'Inchis' && (
                <ActionButton variant="outlined" onClick={() => closeAction(p.id)} sx={{ width: '100%', bgcolor: 'rgba(39,166,68,0.08)', borderColor: 'rgba(39,166,68,0.25)', color: '#4ade80', fontSize: 12, py: 0.75 }}>
                  Inchide
                </ActionButton>
              )}
            </Box>
          ))}
        </Stack>
      </Card>
    </Stack>
  )
}
