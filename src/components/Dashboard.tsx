import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchProiecte, fetchBlocaje, fetchSubansambluri } from '../lib/api'
import { ErrorBanner, LoadingRows } from './StateViews'
import { Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

function priorityBadge(p: string) {
  if (p === 'CRITIC') return <Badge tone="error">â›” CRITIC</Badge>
  if (p === 'RIDICAT') return <Badge tone="warning">ðŸŸ¡ RIDICAT</Badge>
  return <Badge tone="success">ðŸŸ¢ NORMAL</Badge>
}

function statusBadge(s: string) {
  if (s === 'LIVRAT') return <Badge tone="success">âœ… LIVRAT</Badge>
  if (s === 'IN LIVRARE') return <Badge tone="warning">ðŸŸ¡ IN LIVRARE</Badge>
  if (s === 'BLOCAJE ACTIVE') return <Badge tone="error">â›” BLOCAJE ACTIVE</Badge>
  return <Badge>{s}</Badge>
}

function impactBadge(i: string) {
  if (i === 'CRITIC') return <Badge tone="error">CRITIC</Badge>
  if (i === 'INALT') return <Badge tone="warning">INALT</Badge>
  return <Badge>MEDIU</Badge>
}

function ProgressBar({ value, color }: { value: number; color?: string }) {
  const c = color || (value >= 90 ? 'success' : value >= 70 ? 'warning' : 'danger')
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Box className="progress-bar" sx={{ flex: 1 }}>
        <Box className={`progress-fill progress-fill-${c}`} sx={{ width: `${value}%` }} />
      </Box>
      <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-muted)', minWidth: 36, textAlign: 'right' }}>
        {value}%
      </Typography>
    </Stack>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <Card>
      <Stack gap={0.75}>
        <Eyebrow>{label}</Eyebrow>
        <Typography variant="h4" fontWeight={600} sx={{ fontSize: 36, letterSpacing: 0, color: accent || 'var(--color-ink)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
          {value}
        </Typography>
        {sub && <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{sub}</Typography>}
      </Stack>
    </Card>
  )
}

const DEPTS = ['LASER', 'ROLAT', 'SUDAT', 'ASAMBLAT', 'VOPSIT'] as const

export default function Dashboard() {
  const { t } = useLang()
  const d = t.dashboard
  const proiecte = useQuery(fetchProiecte)
  const blocaje = useQuery(fetchBlocaje)
  const sa = useQuery(fetchSubansambluri)

  const totalSA = sa.data?.length ?? 0
  const finalizateSA = sa.data?.filter(s => s.status_global.includes('FINALIZAT')).length ?? 0
  const inLucruSA = sa.data?.filter(s => s.status_global.includes('IN LUCRU')).length ?? 0
  const blocateSA = sa.data?.filter(s => s.blocat).length ?? 0
  const progresGlobal = totalSA ? Math.round((finalizateSA / totalSA) * 1000) / 10 : 0
  const blocajeActive = blocaje.data?.filter(b => b.status === 'Deschis') ?? []

  const heatmap = DEPTS.map(dept => {
    const deptKey = dept.toLowerCase() as string
    const row: Record<string, string | number> = { departament: dept }
    let totalBlocaje = 0
    let saActive = 0
    for (const p of ['WP1000-08', 'WP1000-09', 'WP1000-10']) {
      const items = sa.data?.filter(s => s.proiect === p) ?? []
      const blocati = items.filter(s => s[deptKey] === 'Blocat').length
      const inLucru = items.filter(s => s[deptKey] === 'ÃŽn lucru').length
      const finalizati = items.filter(s => s[deptKey] === 'Finalizat').length
      const total = items.filter(s => s[deptKey] !== 'N/A').length
      if (blocati > 0) { row[p] = `â›” ${blocati}`; totalBlocaje += blocati }
      else if (inLucru > 0) { row[p] = `ðŸ”„ ${inLucru}`; saActive += inLucru }
      else if (finalizati === total && total > 0) row[p] = `âœ… ${finalizati}/${total}`
      else row[p] = `â€“`
    }
    row.totalBlocaje = totalBlocaje
    row.saActive = saActive
    return row
  })

  const err = proiecte.error || blocaje.error || sa.error

  return (
    <Stack gap={4}>
      <PageTitle eyebrow={d.eyebrow} title={d.title} subtitle={d.subtitle} />
      {err && <ErrorBanner message={err} />}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        <StatCard label={d.totalSA} value={totalSA} />
        <StatCard label={d.finalizate} value={finalizateSA} accent="var(--color-success)" />
        <StatCard label={d.inLucru} value={inLucruSA} accent="var(--color-primary)" />
        <StatCard label={d.blocate} value={blocateSA} accent="var(--color-danger)" sub={d.blocateHint} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        <StatCard label={d.progresGlobal} value={`${progresGlobal}%`} />
        <StatCard label={d.proiecteActive} value={proiecte.data?.length ?? 0} />
        <StatCard label={d.blocajeDeschise} value={blocajeActive.length} />
        <StatCard label={d.intarziate} value={sa.data?.filter(s => s.intarziat).length ?? 0} />
      </Box>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
          <Eyebrow>{d.progresProiecte}</Eyebrow>
        </Box>
        <DataTable head={<TableRow><TableCell>{d.colProiect}</TableCell><TableCell>{d.colClient}</TableCell><TableCell>{d.colResponsabil}</TableCell><TableCell>{d.colPrioritate}</TableCell><TableCell sx={{ minWidth: 160 }}>{d.colProgres}</TableCell><TableCell>{d.colStatus}</TableCell><TableCell>{d.colBlocaje}</TableCell></TableRow>}>
          {proiecte.loading ? <LoadingRows cols={7} /> : proiecte.data?.map(p => (
            <TableRow key={p.id}>
              <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-primary)' }}>{p.id}</Typography></TableCell>
              <TableCell sx={{ color: 'var(--color-ink-muted)' }}>{p.client}</TableCell>
              <TableCell sx={{ color: 'var(--color-ink-muted)' }}>{p.responsabil}</TableCell>
              <TableCell>{priorityBadge(p.prioritate)}</TableCell>
              <TableCell sx={{ minWidth: 160 }}><ProgressBar value={Number(p.progres)} /></TableCell>
              <TableCell>{statusBadge(p.status)}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{p.blocaje_active > 0 ? <Badge tone="error">{p.blocaje_active}</Badge> : <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>â€“</Typography>}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Card sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
            <Eyebrow>{d.heatmap}</Eyebrow>
          </Box>
          <DataTable head={<TableRow><TableCell>{d.colDept}</TableCell><TableCell>WP1000-08</TableCell><TableCell>WP1000-09</TableCell><TableCell>WP1000-10</TableCell><TableCell>{d.colBlocaje}</TableCell><TableCell>{d.colActive}</TableCell></TableRow>}>
            {sa.loading ? <LoadingRows cols={6} /> : heatmap.map(row => (
              <TableRow key={String(row.departament)}>
                <TableCell sx={{ fontWeight: 500 }}>{row.departament}</TableCell>
                {['WP1000-08','WP1000-09','WP1000-10'].map(p => {
                  const v = String(row[p] ?? 'â€“')
                  const bg = v.startsWith('â›”') ? 'rgba(239,68,68,0.1)' : v.startsWith('ðŸ”„') ? 'rgba(94,106,210,0.1)' : v.startsWith('âœ…') ? 'rgba(39,166,68,0.08)' : 'transparent'
                  const color = v.startsWith('â›”') ? '#f87171' : v.startsWith('ðŸ”„') ? '#818cf8' : v.startsWith('âœ…') ? '#4ade80' : 'var(--color-ink-tertiary)'
                  return <TableCell key={p}><Box component="span" sx={{ fontSize: 12, fontFamily: 'var(--font-mono)', bgcolor: bg, color, p: '2px 6px', borderRadius: 'var(--radius-xs)', display: 'inline-block' }}>{v}</Box></TableCell>
                })}
                <TableCell sx={{ textAlign: 'center' }}>{Number(row.totalBlocaje) > 0 ? <Badge tone="error">{row.totalBlocaje}</Badge> : <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>â€“</Typography>}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{Number(row.saActive) > 0 ? <Badge tone="info">{row.saActive}</Badge> : <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>â€“</Typography>}</TableCell>
              </TableRow>
            ))}
          </DataTable>
        </Card>

        <Card sx={{ p: 0, overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
            <Eyebrow>{d.blocajeActive}</Eyebrow>
            <Badge tone="error" sx={{ ml: 'auto' }}>{d.actiuneImediata}</Badge>
          </Stack>
          <DataTable head={<TableRow><TableCell>{d.colProiect.slice(0,2)}</TableCell><TableCell>{d.colSubansamblu}</TableCell><TableCell>{d.colDept}</TableCell><TableCell>{d.colOwner}</TableCell><TableCell>{d.colImpact}</TableCell></TableRow>}>
            {blocaje.loading ? <LoadingRows cols={5} /> : blocajeActive.map(b => (
              <TableRow key={b.id}>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{b.id}</Typography></TableCell>
                <TableCell sx={{ maxWidth: 180 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>{b.subansamblu}</Typography>
                  <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-subtle)', mt: 0.25 }}>{b.descriere}</Typography>
                </TableCell>
                <TableCell><Badge>{b.departament}</Badge></TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{b.responsabil}</TableCell>
                <TableCell>{impactBadge(b.impact)}</TableCell>
              </TableRow>
            ))}
          </DataTable>
        </Card>
      </Box>
    </Stack>
  )
}
