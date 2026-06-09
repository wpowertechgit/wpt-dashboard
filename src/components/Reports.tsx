import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { ActionButton, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'
import { ErrorBanner } from './StateViews'

interface DayRow { date: string; visitors: number; requests: number; pageViews: number; bytes: number; threats: number }
interface Country { name: string; requests: number }
interface ReportData {
  from: string; to: string
  totals: { visitors: number; requests: number; pageViews: number; bytes: number; cachedBytes: number; threats: number }
  days: DayRow[]
  countries: Country[]
}

function fmtBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + ' KB'
  return bytes + ' B'
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card sx={{ p: '20px 24px', flex: 1, minWidth: 160 }}>
      <Typography sx={{ fontSize: 11, color: 'var(--color-ink-subtle)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', mb: 1 }}>{label}</Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: 12, color: 'var(--color-ink-tertiary)', mt: 0.75 }}>{sub}</Typography>}
    </Card>
  )
}

function inputStyle(): React.CSSProperties {
  return {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-ink)',
    padding: '6px 10px',
    fontSize: 13,
    outline: 'none',
    colorScheme: 'dark',
  }
}

function toLocalIso(d: Date) {
  return d.toLocaleDateString('sv') // sv locale gives YYYY-MM-DD
}

function defaultRange(days: number) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: toLocalIso(from), to: toLocalIso(to) }
}

export default function ReportsPage() {
  const [from, setFrom] = useState(() => defaultRange(7).from)
  const [to, setTo] = useState(() => defaultRange(7).to)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  function setPreset(days: number) {
    const r = defaultRange(days)
    setFrom(r.from)
    setTo(r.to)
  }

  async function generate() {
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('cloudflare-report', {
        body: { from, to },
      })
      if (fnErr) throw new Error(fnErr.message)
      if (data?.error) throw new Error(data.error)
      setReport(data as ReportData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function downloadPdf() {
    const style = document.createElement('style')
    style.id = '__report-print'
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #report-printable { display: block !important; }
        #report-printable { position: fixed; inset: 0; overflow: auto; background: #fff; color: #111; padding: 32px; font-family: -apple-system, sans-serif; }
        .rp-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px; break-inside: avoid; }
        .rp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .rp-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 4px; }
        .rp-val { font-size: 24px; font-weight: 700; color: #111; }
        .rp-sub { font-size: 11px; color: #9ca3af; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { text-align: left; padding: 6px 8px; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; }
        td { padding: 5px 8px; border-bottom: 1px solid #f3f4f6; color: #374151; }
        h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
        h2 { font-size: 14px; font-weight: 600; margin: 0 0 12px; color: #374151; }
        .rp-period { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
        .rp-header { margin-bottom: 28px; }
        .rp-section { margin-bottom: 24px; }
      }
    `
    document.head.appendChild(style)

    const el = document.getElementById('report-printable')
    if (el) el.style.display = 'block'

    window.print()

    setTimeout(() => {
      document.head.removeChild(style)
      if (el) el.style.display = 'none'
    }, 500)
  }

  return (
    <Stack gap={4}>
      <PageTitle
        eyebrow="Admin"
        title="Cloudflare Report"
        subtitle="Website visitor analytics from Cloudflare zone data"
        action={report ? (
          <ActionButton variant="outlined" onClick={downloadPdf} sx={{ fontSize: 12 }}>
            Download PDF
          </ActionButton>
        ) : undefined}
      />

      {error && <ErrorBanner message={error} />}

      {/* Controls */}
      <Card sx={{ p: '14px 20px' }}>
        <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center">
          <ActionButton variant="outlined" onClick={() => setPreset(7)} sx={{ fontSize: 12 }}>Last 7 days</ActionButton>
          <ActionButton variant="outlined" onClick={() => setPreset(30)} sx={{ fontSize: 12 }}>Last 30 days</ActionButton>
          <Box sx={{ width: 1, height: 20, bgcolor: 'var(--color-hairline)', mx: 0.5 }} />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle()} />
          <Typography sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>to</Typography>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle()} />
          <ActionButton onClick={generate} disabled={loading || !from || !to} sx={{ fontSize: 12, ml: 0.5 }}>
            {loading ? 'Generating…' : 'Generate Report'}
          </ActionButton>
        </Stack>
      </Card>

      {report && (
        <>
          {/* Summary cards */}
          <Stack direction="row" gap={2} flexWrap="wrap">
            <SummaryCard label="Unique Visitors" value={fmtNum(report.totals.visitors)} />
            <SummaryCard label="Page Views" value={fmtNum(report.totals.pageViews)} />
            <SummaryCard label="Total Requests" value={fmtNum(report.totals.requests)} />
            <SummaryCard label="Bandwidth" value={fmtBytes(report.totals.bytes)} sub={`${fmtBytes(report.totals.cachedBytes)} cached`} />
            <SummaryCard label="Threats Blocked" value={fmtNum(report.totals.threats)} />
          </Stack>

          {/* Daily breakdown */}
          <Card sx={{ p: 0, overflow: 'hidden' }}>
            <Stack direction="row" alignItems="center" sx={{ p: '16px 24px', borderBottom: '1px solid var(--color-hairline)' }}>
              <Eyebrow>Daily Breakdown — {fmtDate(report.from)} → {fmtDate(report.to)}</Eyebrow>
            </Stack>
            <DataTable head={
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Visitors</TableCell>
                <TableCell>Requests</TableCell>
                <TableCell>Page Views</TableCell>
                <TableCell>Bandwidth</TableCell>
                <TableCell>Threats</TableCell>
              </TableRow>
            }>
              {report.days.map(d => (
                <TableRow key={d.date}>
                  <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmtDate(d.date)}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{fmtNum(d.visitors)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{fmtNum(d.requests)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{fmtNum(d.pageViews)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{fmtBytes(d.bytes)}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: d.threats > 0 ? '#f87171' : 'var(--color-ink-tertiary)' }}>{d.threats}</TableCell>
                </TableRow>
              ))}
            </DataTable>
          </Card>

          {/* Top countries */}
          {report.countries.length > 0 && (
            <Card sx={{ p: 0, overflow: 'hidden' }}>
              <Stack direction="row" alignItems="center" sx={{ p: '16px 24px', borderBottom: '1px solid var(--color-hairline)' }}>
                <Eyebrow>Top Countries by Requests</Eyebrow>
              </Stack>
              <DataTable head={
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Requests</TableCell>
                  <TableCell>Share</TableCell>
                </TableRow>
              }>
                {report.countries.map((c, i) => {
                  const pct = report.totals.requests > 0 ? ((c.requests / report.totals.requests) * 100).toFixed(1) : '0.0'
                  return (
                    <TableRow key={c.name}>
                      <TableCell sx={{ color: 'var(--color-ink-tertiary)', fontSize: 12, width: 32 }}>{i + 1}</TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{c.name}</TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{fmtNum(c.requests)}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Box sx={{ height: 4, width: `${pct}%`, maxWidth: 120, bgcolor: '#6366f1', borderRadius: 2, minWidth: 4 }} />
                          <Typography sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{pct}%</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </DataTable>
            </Card>
          )}
        </>
      )}

      {/* Print-only version */}
      {report && (
        <div id="report-printable" ref={printRef} style={{ display: 'none' }}>
          <div className="rp-header">
            <h1>Cloudflare Analytics Report</h1>
            <p className="rp-period">{fmtDate(report.from)} — {fmtDate(report.to)} &nbsp;·&nbsp; Generated {new Date().toLocaleDateString('ro-RO')}</p>
          </div>

          <div className="rp-grid">
            {[
              { label: 'Unique Visitors', value: fmtNum(report.totals.visitors) },
              { label: 'Page Views', value: fmtNum(report.totals.pageViews) },
              { label: 'Total Requests', value: fmtNum(report.totals.requests) },
              { label: 'Bandwidth', value: fmtBytes(report.totals.bytes), sub: `${fmtBytes(report.totals.cachedBytes)} cached` },
              { label: 'Threats Blocked', value: fmtNum(report.totals.threats) },
              { label: 'Cache Rate', value: report.totals.bytes > 0 ? ((report.totals.cachedBytes / report.totals.bytes) * 100).toFixed(0) + '%' : '—' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="rp-card">
                <div className="rp-label">{label}</div>
                <div className="rp-val">{value}</div>
                {sub && <div className="rp-sub">{sub}</div>}
              </div>
            ))}
          </div>

          <div className="rp-section">
            <h2>Daily Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Visitors</th><th>Requests</th><th>Page Views</th><th>Bandwidth</th><th>Threats</th>
                </tr>
              </thead>
              <tbody>
                {report.days.map(d => (
                  <tr key={d.date}>
                    <td>{fmtDate(d.date)}</td>
                    <td>{fmtNum(d.visitors)}</td>
                    <td>{fmtNum(d.requests)}</td>
                    <td>{fmtNum(d.pageViews)}</td>
                    <td>{fmtBytes(d.bytes)}</td>
                    <td>{d.threats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.countries.length > 0 && (
            <div className="rp-section">
              <h2>Top Countries by Requests</h2>
              <table>
                <thead>
                  <tr><th>#</th><th>Country</th><th>Requests</th><th>Share</th></tr>
                </thead>
                <tbody>
                  {report.countries.map((c, i) => {
                    const pct = report.totals.requests > 0
                      ? ((c.requests / report.totals.requests) * 100).toFixed(1)
                      : '0.0'
                    return (
                      <tr key={c.name}>
                        <td>{i + 1}</td>
                        <td>{c.name}</td>
                        <td>{fmtNum(c.requests)}</td>
                        <td>{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Stack>
  )
}
