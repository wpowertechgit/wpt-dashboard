import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchProiecte, fetchBlocaje, fetchSubansambluri } from '../lib/api'
import { ErrorBanner, LoadingRows } from './StateViews'

function priorityBadge(p: string) {
  if (p === 'CRITIC') return <span className="badge badge-danger">⛔ CRITIC</span>
  if (p === 'RIDICAT') return <span className="badge badge-warning">🟡 RIDICAT</span>
  return <span className="badge badge-success">🟢 NORMAL</span>
}

function statusBadge(s: string) {
  if (s === 'LIVRAT') return <span className="badge badge-success">✅ LIVRAT</span>
  if (s === 'IN LIVRARE') return <span className="badge badge-warning">🟡 IN LIVRARE</span>
  if (s === 'BLOCAJE ACTIVE') return <span className="badge badge-danger">⛔ BLOCAJE ACTIVE</span>
  return <span className="badge badge-neutral">{s}</span>
}

function impactBadge(i: string) {
  if (i === 'CRITIC') return <span className="badge badge-danger">CRITIC</span>
  if (i === 'INALT') return <span className="badge badge-warning">INALT</span>
  return <span className="badge badge-neutral">MEDIU</span>
}

function ProgressBar({ value, color }: { value: number; color?: string }) {
  const c = color || (value >= 90 ? 'success' : value >= 70 ? 'warning' : 'danger')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className={`progress-fill progress-fill-${c}`} style={{ width: `${value}%` }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--color-ink-muted)', minWidth: 36, textAlign: 'right' }}>{value}%</span>
    </div>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="eyebrow">{label}</span>
      <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-1px', color: accent || 'var(--color-ink)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{sub}</span>}
    </div>
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

  // Heatmap computed from live data
  const heatmap = DEPTS.map(dept => {
    const deptKey = dept.toLowerCase() as string
    const row: Record<string, string | number> = { departament: dept }
    let totalBlocaje = 0
    let saActive = 0
    for (const p of ['WP1000-08', 'WP1000-09', 'WP1000-10']) {
      const items = sa.data?.filter(s => s.proiect === p) ?? []
      const blocati = items.filter(s => s[deptKey] === 'Blocat').length
      const inLucru = items.filter(s => s[deptKey] === 'În lucru').length
      const finalizati = items.filter(s => s[deptKey] === 'Finalizat').length
      const total = items.filter(s => s[deptKey] !== 'N/A').length
      if (blocati > 0) { row[p] = `⛔ ${blocati}`; totalBlocaje += blocati }
      else if (inLucru > 0) { row[p] = `🔄 ${inLucru}`; saActive += inLucru }
      else if (finalizati === total && total > 0) row[p] = `✅ ${finalizati}/${total}`
      else row[p] = `–`
    }
    row.totalBlocaje = totalBlocaje
    row.saActive = saActive
    return row
  })

  const err = proiecte.error || blocaje.error || sa.error

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p className="eyebrow" style={{ marginBottom: 6 }}>{d.eyebrow}</p>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>
          {d.title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 4 }}>
          {d.subtitle}
        </p>
      </div>

      {err && <ErrorBanner message={err} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label={d.totalSA} value={totalSA} />
        <StatCard label={d.finalizate} value={finalizateSA} accent="var(--color-success)" />
        <StatCard label={d.inLucru} value={inLucruSA} accent="var(--color-primary)" />
        <StatCard label={d.blocate} value={blocateSA} accent="var(--color-danger)" sub={d.blocateHint} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label={d.progresGlobal} value={`${progresGlobal}%`} />
        <StatCard label={d.proiecteActive} value={proiecte.data?.length ?? 0} />
        <StatCard label={d.blocajeDeschise} value={blocajeActive.length} />
        <StatCard label={d.intarziate} value={sa.data?.filter(s => s.intarziat).length ?? 0} />
      </div>

      {/* Project progress */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
          <span className="eyebrow">{d.progresProiecte}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>{d.colProiect}</th><th>{d.colClient}</th><th>{d.colResponsabil}</th><th>{d.colPrioritate}</th>
              <th style={{ minWidth: 160 }}>{d.colProgres}</th><th>{d.colStatus}</th><th>{d.colBlocaje}</th>
            </tr>
          </thead>
          <tbody>
            {proiecte.loading ? <LoadingRows cols={7} /> :
              proiecte.data?.map(p => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-primary)' }}>{p.id}</span></td>
                  <td style={{ color: 'var(--color-ink-muted)' }}>{p.client}</td>
                  <td style={{ color: 'var(--color-ink-muted)' }}>{p.responsabil}</td>
                  <td>{priorityBadge(p.prioritate)}</td>
                  <td style={{ minWidth: 160 }}><ProgressBar value={Number(p.progres)} /></td>
                  <td>{statusBadge(p.status)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {p.blocaje_active > 0
                      ? <span className="badge badge-danger">{p.blocaje_active}</span>
                      : <span style={{ color: 'var(--color-ink-tertiary)' }}>–</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Heatmap */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
            <span className="eyebrow">{d.heatmap}</span>
          </div>
          <table>
            <thead>
              <tr><th>{d.colDept}</th><th>WP1000-08</th><th>WP1000-09</th><th>WP1000-10</th><th>{d.colBlocaje}</th><th>{d.colActive}</th></tr>
            </thead>
            <tbody>
              {sa.loading ? <LoadingRows cols={6} /> : heatmap.map(row => (
                <tr key={String(row.departament)}>
                  <td style={{ fontWeight: 500 }}>{row.departament}</td>
                  {['WP1000-08','WP1000-09','WP1000-10'].map(p => {
                    const v = String(row[p] ?? '–')
                    const bg = v.startsWith('⛔') ? 'rgba(239,68,68,0.1)' : v.startsWith('🔄') ? 'rgba(94,106,210,0.1)' : v.startsWith('✅') ? 'rgba(39,166,68,0.08)' : 'transparent'
                    const color = v.startsWith('⛔') ? '#f87171' : v.startsWith('🔄') ? '#818cf8' : v.startsWith('✅') ? '#4ade80' : 'var(--color-ink-tertiary)'
                    return <td key={p}><span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: bg, color, padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>{v}</span></td>
                  })}
                  <td style={{ textAlign: 'center' }}>{Number(row.totalBlocaje) > 0 ? <span className="badge badge-danger">{row.totalBlocaje}</span> : <span style={{ color: 'var(--color-ink-tertiary)' }}>–</span>}</td>
                  <td style={{ textAlign: 'center' }}>{Number(row.saActive) > 0 ? <span className="badge badge-info">{row.saActive}</span> : <span style={{ color: 'var(--color-ink-tertiary)' }}>–</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active blockages */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center' }}>
            <span className="eyebrow">{d.blocajeActive}</span>
            <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>{d.actiuneImediata}</span>
          </div>
          <table>
            <thead>
              <tr><th>{d.colProiect.slice(0,2)}</th><th>{d.colSubansamblu}</th><th>{d.colDept}</th><th>{d.colOwner}</th><th>{d.colImpact}</th></tr>
            </thead>
            <tbody>
              {blocaje.loading ? <LoadingRows cols={5} /> :
                blocajeActive.map(b => (
                  <tr key={b.id}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{b.id}</span></td>
                    <td style={{ maxWidth: 180 }}>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>{b.subansamblu}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-ink-subtle)', marginTop: 2 }}>{b.descriere}</div>
                    </td>
                    <td><span className="badge badge-neutral">{b.departament}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{b.responsabil}</td>
                    <td>{impactBadge(b.impact)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
