import { useQuery } from '../lib/useQuery'
import { fetchKpiEchipe, upsertKpiEchipe } from '../lib/api'
import { ErrorBanner, LoadingRows } from './StateViews'
import { useState } from 'react'
import { useLang } from '../lib/i18n'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend, ResponsiveContainer,
} from 'recharts'

const DEPT_COLORS: Record<string, string> = {
  LASER: '#818cf8', ROLAT: '#60a5fa', SUDAT: '#fbbf24', ASAMBLAT: '#34d399', VOPSIT: '#f87171',
}
const DEPTS = ['LASER','ROLAT','SUDAT','ASAMBLAT','VOPSIT']

const tooltipStyle = {
  backgroundColor: '#0f1011', border: '1px solid #23252a',
  borderRadius: 8, color: '#f7f8f8', fontSize: 12,
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)',
  borderRadius: 'var(--radius-sm)', padding: '5px 8px', color: 'var(--color-ink)',
  fontSize: 12, fontFamily: 'var(--font-text)', width: 70, outline: 'none',
  textAlign: 'right',
}

const BLANK_ROW = { saptamana: '', echipa: 'LASER', sa_intrare: 0, sa_iesire: 0, sa_blocate: 0, sa_intarziate: 0, eficienta: 0, lead_time: 0, calitate: 0, observatii: '' }

export default function KPIEchipe() {
  const { t } = useLang()
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
    try {
      await upsertKpiEchipe(form)
      setShowForm(false); setForm({ ...BLANK_ROW }); refetch()
    } finally { setSaving(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{k.eyebrow}</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{k.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 4 }}>{k.subtitle}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{ background: showForm ? 'var(--color-surface-2)' : 'var(--color-primary)', border: showForm ? '1px solid var(--color-hairline)' : 'none', borderRadius: 'var(--radius-md)', padding: '8px 16px', color: showForm ? 'var(--color-ink-subtle)' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-text)' }}>
          {showForm ? `✕ ${t.common.cancel}` : k.newBtn}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Latest week cards */}
      {latestWeek && (
        <div>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="eyebrow">{k.currentWeek}</span>
            <span className="badge badge-info">{latestWeek}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {latestData.map(row => (
              <div key={row.echipa} className="card" style={{ padding: 16, borderTop: `3px solid ${DEPT_COLORS[row.echipa]}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: DEPT_COLORS[row.echipa], letterSpacing: '0.3px', marginBottom: 10 }}>{row.echipa}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[{ label: k.eficienta, val: Number(row.eficienta) }, { label: k.calitate, val: Number(row.calitate) }].map(({ label, val }) => (
                    <div key={label}>
                      <div className="eyebrow" style={{ marginBottom: 2 }}>{label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className={`progress-fill ${val >= 90 ? 'progress-fill-success' : val >= 75 ? 'progress-fill-warning' : 'progress-fill-danger'}`} style={{ width: `${val}%` }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-muted)' }}>{val}%</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                    {[{ v: row.sa_iesire, l: k.saIesite }, { v: `${row.lead_time}h`, l: k.leadTime }].map(({ v, l }) => (
                      <div key={l} style={{ textAlign: 'center', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', padding: '6px 4px' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{v}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-ink-tertiary)' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {row.sa_blocate > 0 && <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-xs)', padding: '4px 8px', textAlign: 'center' }}><span style={{ fontSize: 11, color: '#f87171' }}>⛔ {row.sa_blocate} {k.blocate}</span></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ marginBottom: 20 }}><span className="eyebrow">{k.chartEficienta}</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData('eficienta')} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#23252a" />
              <XAxis dataKey="saptamana" tick={{ fill: '#8a8f98', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8a8f98', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 105]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8a8f98' }} />
              {DEPTS.map(d => <Line key={d} type="monotone" dataKey={d} stroke={DEPT_COLORS[d]} strokeWidth={2} dot={{ r: 3, fill: DEPT_COLORS[d] }} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{ marginBottom: 20 }}><span className="eyebrow">{k.chartLeadTime}</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData('lead_time')} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#23252a" />
              <XAxis dataKey="saptamana" tick={{ fill: '#8a8f98', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8a8f98', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8a8f98' }} />
              {DEPTS.map(d => <Bar key={d} dataKey={d} fill={DEPT_COLORS[d]} radius={[3, 3, 0, 0]} maxBarSize={14} />)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New KPI form */}
      {showForm && (
        <div className="card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <div style={{ marginBottom: 16 }}><span className="eyebrow">{k.formTitle}</span></div>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-ink-subtle)', display: 'block', marginBottom: 4 }}>{k.saptamana}</label>
                <input style={{ ...inputStyle, width: '100%', textAlign: 'left' }} value={form.saptamana} onChange={e => setF('saptamana', e.target.value)} placeholder="S-20 (Mai 19)" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-ink-subtle)', display: 'block', marginBottom: 4 }}>{k.echipa}</label>
                <select style={{ ...inputStyle, width: '100%', textAlign: 'left' }} value={form.echipa} onChange={e => setF('echipa', e.target.value)}>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              {[
                { key: 'sa_intrare', label: k.saIntrare }, { key: 'sa_iesire', label: k.saIesire },
                { key: 'sa_blocate', label: k.saBlocate }, { key: 'sa_intarziate', label: k.saIntarziate },
                { key: 'eficienta', label: k.eficientaPct }, { key: 'lead_time', label: k.leadTimeH },
                { key: 'calitate', label: k.calitatePct },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-ink-subtle)', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type="number" style={{ ...inputStyle, width: '100%' }} value={String(form[key as keyof typeof form])} onChange={e => setF(key, Number(e.target.value))} />
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 20px', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-text)' }}>
              {saving ? t.common.saving : k.saveBtn}
            </button>
          </form>
        </div>
      )}

      {/* Full table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}><span className="eyebrow">{k.tableTitle}</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>{k.colSaptamana}</th><th>{k.colEchipa}</th><th>{k.colSAIn}</th><th>{k.colSAOut}</th>
                <th>{k.colBlocate}</th><th>{k.colIntarziate}</th><th style={{ minWidth: 120 }}>{k.colEficienta}</th>
                <th>{k.colLeadTime}</th><th style={{ minWidth: 120 }}>{k.colCalitate}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={9} /> : (data ?? []).map((row, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{row.saptamana}</td>
                  <td><span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--radius-xs)', background: `${DEPT_COLORS[row.echipa]}18`, color: DEPT_COLORS[row.echipa], fontSize: 11, fontWeight: 600 }}>{row.echipa}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.sa_intrare}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.sa_iesire}</td>
                  <td>{row.sa_blocate > 0 ? <span className="badge badge-danger">{row.sa_blocate}</span> : <span style={{ color: 'var(--color-ink-tertiary)' }}>–</span>}</td>
                  <td>{row.sa_intarziate > 0 ? <span className="badge badge-warning">{row.sa_intarziate}</span> : <span style={{ color: 'var(--color-ink-tertiary)' }}>–</span>}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="progress-bar" style={{ width: 60 }}><div className={`progress-fill ${Number(row.eficienta) >= 90 ? 'progress-fill-success' : Number(row.eficienta) >= 75 ? 'progress-fill-warning' : 'progress-fill-danger'}`} style={{ width: `${row.eficienta}%` }} /></div>
                      <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{row.eficienta}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: Number(row.lead_time) > 20 ? '#fbbf24' : 'var(--color-ink-muted)' }}>{row.lead_time}h</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="progress-bar" style={{ width: 60 }}><div className={`progress-fill ${Number(row.calitate) >= 95 ? 'progress-fill-success' : Number(row.calitate) >= 85 ? 'progress-fill-warning' : 'progress-fill-danger'}`} style={{ width: `${row.calitate}%` }} /></div>
                      <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{row.calitate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
