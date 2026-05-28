import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchKpiEchipe, upsertKpiEchipe } from '../lib/api'
import { usePermissions } from '../lib/permissionsContext'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

const DEPT_COLORS: Record<string, string> = { LASER: '#818cf8', ROLAT: '#60a5fa', SUDAT: '#fbbf24', ASAMBLAT: '#34d399', VOPSIT: '#f87171' }
const DEPTS = ['LASER','ROLAT','SUDAT','ASAMBLAT','VOPSIT']
const tooltipStyle = { backgroundColor: '#0f1011', border: '1px solid #23252a', borderRadius: 8, color: '#f7f8f8', fontSize: 12 }
const BLANK_ROW = { saptamana: '', echipa: 'LASER', sa_intrare: 0, sa_iesire: 0, sa_blocate: 0, sa_intarziate: 0, eficienta: 0, lead_time: 0, calitate: 0, observatii: '' }

function MiniProgress({ value, width = 60 }: { value: number; width?: number }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75}>
      <Box className="progress-bar" sx={{ width }}>
        <Box className={`progress-fill ${value >= 90 ? 'progress-fill-success' : value >= 75 ? 'progress-fill-warning' : 'progress-fill-danger'}`} sx={{ width: `${value}%` }} />
      </Box>
      <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-muted)', fontWeight: 600 }}>{value}%</Typography>
    </Stack>
  )
}

export default function KPIEchipe() {
  const { t, lang } = useLang()
  const { canWrite } = usePermissions()
  const k = t.kpi
  const { data, loading, error, refetch } = useQuery(fetchKpiEchipe)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK_ROW })
  const [saving, setSaving] = useState(false)
  const setF = (key: string, v: string | number) => setForm(f => ({ ...f, [key]: v }))

  const weeks = [...new Set((data ?? []).map(row => row.saptamana))].filter(Boolean)
  const latestWeek = weeks[weeks.length - 1] ?? ''
  const latestData = (data ?? []).filter(row => row.saptamana === latestWeek)

  function chartData(field: string) {
    return weeks.map(w => {
      const row: Record<string, string | number> = { saptamana: w.split(' ')[0] ?? w }
      ;(data ?? []).filter(r => r.saptamana === w).forEach(r => { row[r.echipa] = Number(r[field as keyof typeof r]) })
      return row
    })
  }

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    try { await upsertKpiEchipe(form); setShowForm(false); setForm({ ...BLANK_ROW }); refetch() }
    finally { setSaving(false) }
  }

  return (
    <Stack gap={4}>
      <PageTitle eyebrow={k.eyebrow} title={k.title} subtitle={k.subtitle} info={pageInfo(lang, 'kpi')} action={canWrite ? <ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => setShowForm(s => !s)}>{showForm ? `x ${t.common.cancel}` : k.newBtn}</ActionButton> : undefined} />
      {error && <ErrorBanner message={error} />}

      {latestWeek && (
        <Box>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}><Eyebrow>{k.currentWeek}</Eyebrow><Badge tone="info">{latestWeek}</Badge></Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5 }}>
            {latestData.map(row => (
              <Card key={row.echipa} sx={{ p: 2, borderTop: `3px solid ${DEPT_COLORS[row.echipa]}` }}>
                <Typography variant="body2" sx={{ fontSize: 11, fontWeight: 600, color: DEPT_COLORS[row.echipa], letterSpacing: 0.3, mb: 1.25 }}>{row.echipa}</Typography>
                <Stack gap={1}>
                  {[{ label: k.eficienta, val: Number(row.eficienta) }, { label: k.calitate, val: Number(row.calitate) }].map(({ label, val }) => (
                    <Box key={label}><Eyebrow sx={{ mb: 0.25 }}>{label}</Eyebrow><MiniProgress value={val} width={999} /></Box>
                  ))}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 0.5 }}>
                    {[{ v: row.sa_iesire, l: k.saIesite }, { v: `${row.lead_time}h`, l: k.leadTime }].map(({ v, l }) => (
                      <Box key={l} sx={{ textAlign: 'center', bgcolor: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', p: '6px 4px' }}>
                        <Typography variant="body2" sx={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{v}</Typography>
                        <Typography variant="body2" sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)' }}>{l}</Typography>
                      </Box>
                    ))}
                  </Box>
                  {row.sa_blocate > 0 && <Box sx={{ bgcolor: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-xs)', p: '4px 8px', textAlign: 'center' }}><Typography variant="body2" sx={{ fontSize: 11, color: '#f87171' }}>{row.sa_blocate} {k.blocate}</Typography></Box>}
                </Stack>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Card><Eyebrow sx={{ mb: 2.5 }}>{k.chartEficienta}</Eyebrow><ResponsiveContainer width="100%" height={220}><LineChart data={chartData('eficienta')} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}><CartesianGrid strokeDasharray="3 3" stroke="#23252a" /><XAxis dataKey="saptamana" tick={{ fill: '#8a8f98', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#8a8f98', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 105]} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 11, color: '#8a8f98' }} />{DEPTS.map(d => <Line key={d} type="monotone" dataKey={d} stroke={DEPT_COLORS[d]} strokeWidth={2} dot={{ r: 3, fill: DEPT_COLORS[d] }} />)}</LineChart></ResponsiveContainer></Card>
        <Card><Eyebrow sx={{ mb: 2.5 }}>{k.chartLeadTime}</Eyebrow><ResponsiveContainer width="100%" height={220}><BarChart data={chartData('lead_time')} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}><CartesianGrid strokeDasharray="3 3" stroke="#23252a" /><XAxis dataKey="saptamana" tick={{ fill: '#8a8f98', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#8a8f98', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 11, color: '#8a8f98' }} />{DEPTS.map(d => <Bar key={d} dataKey={d} fill={DEPT_COLORS[d]} radius={[3, 3, 0, 0]} maxBarSize={14} />)}</BarChart></ResponsiveContainer></Card>
      </Box>

      {canWrite && showForm && (
        <Card sx={{ borderLeft: '3px solid var(--color-primary)' }}>
          <Eyebrow sx={{ mb: 2 }}>{k.formTitle}</Eyebrow>
          <Stack component="form" onSubmit={submit} gap={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
              <AppField label={k.saptamana} value={form.saptamana} onChange={e => setF('saptamana', e.target.value)} placeholder="S-20 (Mai 19)" />
              <AppSelect label={k.echipa} value={form.echipa} onChange={e => setF('echipa', e.target.value)} options={DEPTS} />
              {[{ key: 'sa_intrare', label: k.saIntrare }, { key: 'sa_iesire', label: k.saIesire }, { key: 'sa_blocate', label: k.saBlocate }, { key: 'sa_intarziate', label: k.saIntarziate }, { key: 'eficienta', label: k.eficientaPct }, { key: 'lead_time', label: k.leadTimeH }, { key: 'calitate', label: k.calitatePct }].map(({ key, label }) => (
                <AppField key={key} label={label} type="number" value={String(form[key as keyof typeof form])} onChange={e => setF(key, Number(e.target.value))} />
              ))}
            </Box>
            <ActionButton type="submit" disabled={saving} sx={{ alignSelf: 'flex-start' }}>{saving ? t.common.saving : k.saveBtn}</ActionButton>
          </Stack>
        </Card>
      )}

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}><Eyebrow>{k.tableTitle}</Eyebrow></Box>
        <DataTable sx={{ overflowX: 'auto' }} head={<TableRow><TableCell>{k.colSaptamana}</TableCell><TableCell>{k.colEchipa}</TableCell><TableCell>{k.colSAIn}</TableCell><TableCell>{k.colSAOut}</TableCell><TableCell>{k.colBlocate}</TableCell><TableCell>{k.colIntarziate}</TableCell><TableCell sx={{ minWidth: 120 }}>{k.colEficienta}</TableCell><TableCell>{k.colLeadTime}</TableCell><TableCell sx={{ minWidth: 120 }}>{k.colCalitate}</TableCell></TableRow>}>
          {loading ? <LoadingRows cols={9} /> : (data ?? []).map((row, i) => (
            <TableRow key={i}>
              <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{row.saptamana}</TableCell>
              <TableCell><Box component="span" sx={{ display: 'inline-block', p: '2px 8px', borderRadius: 'var(--radius-xs)', bgcolor: `${DEPT_COLORS[row.echipa]}18`, color: DEPT_COLORS[row.echipa], fontSize: 11, fontWeight: 600 }}>{row.echipa}</Box></TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.sa_intrare}</TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.sa_iesire}</TableCell>
              <TableCell>{row.sa_blocate > 0 ? <Badge tone="error">{row.sa_blocate}</Badge> : <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>-</Typography>}</TableCell>
              <TableCell>{row.sa_intarziate > 0 ? <Badge tone="warning">{row.sa_intarziate}</Badge> : <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>-</Typography>}</TableCell>
              <TableCell><MiniProgress value={Number(row.eficienta)} /></TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: Number(row.lead_time) > 20 ? '#fbbf24' : 'var(--color-ink-muted)' }}>{row.lead_time}h</TableCell>
              <TableCell><MiniProgress value={Number(row.calitate)} /></TableCell>
            </TableRow>
          ))}
        </DataTable>
      </Card>
    </Stack>
  )
}
