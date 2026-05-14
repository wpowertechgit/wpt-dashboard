import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchFluxZilnic, insertFluxZilnic } from '../lib/api'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'

const DEPT_COLORS: Record<string, string> = {
  LASER: '#818cf8', ROLAT: '#60a5fa', SUDAT: '#fbbf24', ASAMBLAT: '#34d399', VOPSIT: '#f87171',
}
const DEPTS = ['LASER','ROLAT','SUDAT','ASAMBLAT','VOPSIT']

function deptBadge(d: string) {
  const c = DEPT_COLORS[d] || 'var(--color-ink-subtle)'
  return <span className="badge" style={{ background: `${c}18`, color: c }}>{d}</span>
}

const BLANK = { data: '', proiect: '', subansamblu: '', dept_origine: 'SUDAT', dept_destinatie: 'ASAMBLAT', echipa: '', validat_de: '', observatii: '' }
const inputStyle: React.CSSProperties = { background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', color: 'var(--color-ink)', fontSize: 13, fontFamily: 'var(--font-text)', width: '100%', outline: 'none' }
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 500, color: 'var(--color-ink-subtle)', display: 'block', marginBottom: 4 }

export default function FluxZilnic() {
  const { t } = useLang()
  const f = t.flux
  const { data, loading, error, refetch } = useQuery(fetchFluxZilnic)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)

  const setF = (k: string, v: string) => setForm(frm => ({ ...frm, [k]: v }))

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    try { await insertFluxZilnic(form); setShowForm(false); setForm({ ...BLANK }); refetch() }
    finally { setSaving(false) }
  }

  const byDate = (data ?? []).reduce<Record<string, typeof data>>((acc, item) => {
    if (!acc[item.data]) acc[item.data] = []
    acc[item.data]!.push(item)
    return acc
  }, {})

  const deptCounts = DEPTS.map(d => ({
    dept: d,
    count: (data ?? []).filter(fl => fl.dept_origine === d || fl.dept_destinatie === d).length
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{f.eyebrow}</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{f.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 4 }}>{f.subtitle} · {data?.length ?? '…'} {f.miscari}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{ background: showForm ? 'var(--color-surface-2)' : 'var(--color-primary)', border: showForm ? '1px solid var(--color-hairline)' : 'none', borderRadius: 'var(--radius-md)', padding: '8px 16px', color: showForm ? 'var(--color-ink-subtle)' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-text)' }}>
          {showForm ? `✕ ${t.common.cancel}` : f.newBtn}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Flow visualization */}
      <div className="card">
        <div style={{ marginBottom: 16 }}><span className="eyebrow">{f.vizTitle}</span></div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {deptCounts.map(({ dept, count }, i) => {
            const c = DEPT_COLORS[dept]
            return (
              <div key={dept} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ flex: 1, background: `${c}12`, border: `1px solid ${c}30`, borderRadius: 'var(--radius-md)', padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: c, letterSpacing: '0.3px' }}>{dept}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c, marginTop: 4, fontFamily: 'var(--font-display)' }}>{count}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-ink-tertiary)', marginTop: 1 }}>{f.miscari}</div>
                </div>
                {i < deptCounts.length - 1 && <div style={{ padding: '0 4px', color: 'var(--color-hairline-strong)', fontSize: 18 }}>→</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* New entry form */}
      {showForm && (
        <div className="card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <div style={{ marginBottom: 16 }}><span className="eyebrow">{f.formTitle}</span></div>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              <div><label style={labelStyle}>{f.data}</label><input style={inputStyle} value={form.data} onChange={e => setF('data', e.target.value)} placeholder="12-Mai-25" /></div>
              <div><label style={labelStyle}>{f.proiect}</label>
                <select style={inputStyle} value={form.proiect} onChange={e => setF('proiect', e.target.value)}>
                  <option value="">— Selectați —</option>
                  {['WP1000-08','WP1000-09','WP1000-10'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>{f.subansamblu}</label><input required style={inputStyle} value={form.subansamblu} onChange={e => setF('subansamblu', e.target.value)} /></div>
              <div><label style={labelStyle}>{f.deLa}</label>
                <select style={inputStyle} value={form.dept_origine} onChange={e => setF('dept_origine', e.target.value)}>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>{f.la}</label>
                <select style={inputStyle} value={form.dept_destinatie} onChange={e => setF('dept_destinatie', e.target.value)}>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>{f.echipa}</label><input style={inputStyle} value={form.echipa} onChange={e => setF('echipa', e.target.value)} /></div>
              <div><label style={labelStyle}>{f.validatDe}</label><input style={inputStyle} value={form.validat_de} onChange={e => setF('validat_de', e.target.value)} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>{f.observatii}</label><input style={inputStyle} value={form.observatii} onChange={e => setF('observatii', e.target.value)} /></div>
            </div>
            <button type="submit" disabled={saving} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 20px', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-text)' }}>
              {saving ? t.common.saving : f.saveBtn}
            </button>
          </form>
        </div>
      )}

      {/* Log grouped by date */}
      {loading ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table><thead><tr><th>{f.colProiect}</th><th>{f.colSubansamblu}</th><th>{f.colDeLa}</th><th></th><th>{f.colLa}</th><th>{f.colEchipa}</th><th>{f.colValidat}</th><th>{f.colObs}</th></tr></thead>
          <tbody><LoadingRows cols={8} /></tbody></table>
        </div>
      ) : Object.keys(byDate).length === 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table><tbody><EmptyState label={f.empty} /></tbody></table>
        </div>
      ) : (
        Object.entries(byDate).map(([date, items]) => (
          <div key={date} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{date}</span>
              <span className="badge badge-neutral">{items!.length} {f.miscari}</span>
            </div>
            <table>
              <thead><tr><th>{f.colProiect}</th><th>{f.colSubansamblu}</th><th>{f.colDeLa}</th><th></th><th>{f.colLa}</th><th>{f.colEchipa}</th><th>{f.colValidat}</th><th>{f.colObs}</th></tr></thead>
              <tbody>
                {(items ?? []).map((fl, i) => (
                  <tr key={i}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{fl.proiect}</span></td>
                    <td style={{ fontWeight: 500 }}>{fl.subansamblu}</td>
                    <td>{deptBadge(fl.dept_origine)}</td>
                    <td style={{ color: 'var(--color-ink-tertiary)', padding: '10px 4px' }}>→</td>
                    <td>{deptBadge(fl.dept_destinatie)}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{fl.echipa}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{fl.validat_de}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{fl.observatii}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}
