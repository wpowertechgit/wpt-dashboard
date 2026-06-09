import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { logActivity } from '../lib/api'
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

function buildPrintHtml(report: ReportData, logoUrl: string): string {
  const cacheRate = report.totals.bytes > 0
    ? ((report.totals.cachedBytes / report.totals.bytes) * 100).toFixed(0) + '%'
    : '—'

  const cards = [
    { label: 'Unique Visitors',  value: fmtNum(report.totals.visitors) },
    { label: 'Page Views',       value: fmtNum(report.totals.pageViews) },
    { label: 'Total Requests',   value: fmtNum(report.totals.requests) },
    { label: 'Bandwidth',        value: fmtBytes(report.totals.bytes), sub: `${fmtBytes(report.totals.cachedBytes)} cached` },
    { label: 'Threats Blocked',  value: fmtNum(report.totals.threats) },
    { label: 'Cache Rate',       value: cacheRate },
  ]

  const dayRows = report.days.map(d => `
    <tr>
      <td>${fmtDate(d.date)}</td>
      <td class="num">${fmtNum(d.visitors)}</td>
      <td class="num">${fmtNum(d.requests)}</td>
      <td class="num">${fmtNum(d.pageViews)}</td>
      <td class="num">${fmtBytes(d.bytes)}</td>
      <td class="num${d.threats > 0 ? ' threat' : ''}">${d.threats}</td>
    </tr>`).join('')

  const countryRows = report.countries.map((c, i) => {
    const pct = report.totals.requests > 0
      ? ((c.requests / report.totals.requests) * 100).toFixed(1)
      : '0.0'
    const barW = Math.round(parseFloat(pct) * 1.2)
    return `<tr>
      <td class="rank">${i + 1}</td>
      <td>${c.name}</td>
      <td class="num">${fmtNum(c.requests)}</td>
      <td><div style="display:flex;align-items:center;gap:8px"><div style="width:${barW}px;height:3px;background:#F6821F;border-radius:2px;min-width:3px"></div><span class="pct">${pct}%</span></div></td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Website Analytics Report — ${fmtDate(report.from)} to ${fmtDate(report.to)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      color: #1D1D1D;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 28px 48px 24px;
      border-bottom: 3px solid #F6821F;
    }
    .header img { height: 80px; width: auto; display: block; margin-left: -12px; }
    .header-right { text-align: right; }
    .report-title {
      font-size: 18px;
      font-weight: 700;
      color: #1D1D1D;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .report-period {
      font-size: 11px;
      color: #6B7280;
      margin-top: 3px;
    }

    /* ── Body ── */
    .body { padding: 32px 48px 48px; }

    /* ── Stat grid ── */
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 36px;
    }
    .card {
      background: #F8F8F8;
      border: 1px solid #E2E2E2;
      border-radius: 6px;
      padding: 16px 18px;
    }
    .card-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #6B7280;
      margin-bottom: 8px;
    }
    .card-value {
      font-size: 26px;
      font-weight: 700;
      color: #F6821F;
      line-height: 1;
      letter-spacing: -0.02em;
    }
    .card-sub {
      font-size: 10px;
      color: #9CA3AF;
      margin-top: 5px;
    }

    /* ── Section ── */
    .section { margin-bottom: 32px; page-break-inside: avoid; }
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .section-header::before {
      content: '';
      display: block;
      width: 3px;
      height: 14px;
      background: #F6821F;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #1D1D1D;
    }

    /* ── Tables ── */
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      padding: 8px 10px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #6B7280;
      border-bottom: 2px solid #E2E2E2;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #F0F0F0;
      color: #1D1D1D;
      font-size: 12px;
    }
    tr:last-child td { border-bottom: none; }
    .num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; }
    .rank { color: #9CA3AF; font-weight: 500; width: 28px; }
    .pct { font-size: 11px; color: #6B7280; min-width: 36px; }
    .threat { color: #FF4040; font-weight: 600; }

    /* ── Footer ── */
    .footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #E2E2E2;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-left { font-size: 10px; color: #9CA3AF; }
    .footer-right { font-size: 10px; color: #9CA3AF; }
    .cf-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: #6B7280;
      font-weight: 500;
    }
    .cf-dot { width: 6px; height: 6px; border-radius: 50%; background: #F6821F; display: inline-block; }
  </style>
</head>
<body>

  <div class="header">
    <img src="${logoUrl}" alt="WastePowerTech" />
    <div class="header-right">
      <div class="report-title">Website Analytics Report</div>
      <div class="report-period">${fmtDate(report.from)} &ndash; ${fmtDate(report.to)}</div>
    </div>
  </div>

  <div class="body">

    <div class="grid">
      ${cards.map(c => `
      <div class="card">
        <div class="card-label">${c.label}</div>
        <div class="card-value">${c.value}</div>
        ${c.sub ? `<div class="card-sub">${c.sub}</div>` : ''}
      </div>`).join('')}
    </div>

    <div class="section">
      <div class="section-header"><span class="section-title">Daily Breakdown</span></div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th style="text-align:right">Visitors</th>
            <th style="text-align:right">Requests</th>
            <th style="text-align:right">Page Views</th>
            <th style="text-align:right">Bandwidth</th>
            <th style="text-align:right">Threats</th>
          </tr>
        </thead>
        <tbody>${dayRows}</tbody>
      </table>
    </div>

    ${report.countries.length > 0 ? `
    <div class="section">
      <div class="section-header"><span class="section-title">Top Countries by Requests</span></div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Country</th>
            <th style="text-align:right">Requests</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>${countryRows}</tbody>
      </table>
    </div>` : ''}

    <div class="footer">
      <div class="footer-left">Generated ${new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;&middot;&nbsp; WastePowerTech OMS</div>
      <div class="cf-badge"><span class="cf-dot"></span> Powered by Cloudflare Analytics</div>
    </div>

  </div>
</body>
</html>`
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
  return d.toLocaleDateString('sv')
}

function defaultRange(days: number) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: toLocalIso(from), to: toLocalIso(to) }
}

export default function ReportsPage() {
  const [from, setFrom] = useState(() => defaultRange(7).from)
  const [to, setTo]     = useState(() => defaultRange(7).to)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [report, setReport]   = useState<ReportData | null>(null)

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
    if (!report) return
    logActivity('pdf_export', 'report', `cf-${report.from}-${report.to}`, `Cloudflare PDF: ${report.from} → ${report.to}`, { from: report.from, to: report.to })
    const logoUrl = `${window.location.origin}/wpt%20logo-01.png`
    const html = buildPrintHtml(report, logoUrl)

    // Write into a hidden iframe so the print dialog gets a clean standalone
    // document instead of the whole React app — avoids the parent-hidden CSS trap
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;'
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument!
    doc.open()
    doc.write(html)
    doc.close()

    // Small delay lets the iframe finish rendering before the print dialog opens
    setTimeout(() => {
      iframe.contentWindow!.focus()
      iframe.contentWindow!.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }, 200)
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
          <ActionButton variant="outlined" onClick={() => setPreset(7)}  sx={{ fontSize: 12 }}>Last 7 days</ActionButton>
          <ActionButton variant="outlined" onClick={() => setPreset(30)} sx={{ fontSize: 12 }}>Last 30 days</ActionButton>
          <Box sx={{ width: 1, height: 20, bgcolor: 'var(--color-hairline)', mx: 0.5 }} />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle()} />
          <Typography sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>to</Typography>
          <input type="date" value={to}   onChange={e => setTo(e.target.value)}   style={inputStyle()} />
          <ActionButton onClick={generate} disabled={loading || !from || !to} sx={{ fontSize: 12, ml: 0.5 }}>
            {loading ? 'Generating…' : 'Generate Report'}
          </ActionButton>
        </Stack>
      </Card>

      {report && (
        <>
          <Stack direction="row" gap={2} flexWrap="wrap">
            <SummaryCard label="Unique Visitors"  value={fmtNum(report.totals.visitors)} />
            <SummaryCard label="Page Views"        value={fmtNum(report.totals.pageViews)} />
            <SummaryCard label="Total Requests"    value={fmtNum(report.totals.requests)} />
            <SummaryCard label="Bandwidth"         value={fmtBytes(report.totals.bytes)} sub={`${fmtBytes(report.totals.cachedBytes)} cached`} />
            <SummaryCard label="Threats Blocked"   value={fmtNum(report.totals.threats)} />
          </Stack>

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
    </Stack>
  )
}
