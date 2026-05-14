import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchBlocaje, insertBlocaj, updateBlocaj } from '../lib/api'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'

function impactBadge(i: string) {
  if (i === 'CRITIC') return <span className="badge badge-danger">CRITIC</span>
  if (i === 'INALT') return <span className="badge badge-warning">INALT</span>
  return <span className="badge badge-neutral">MEDIU</span>
}
function statusBadge(s: string) {
  return s === 'Deschis'
    ? <span className="badge badge-danger">⛔ Deschis</span>
    : <span className="badge badge-success">✅ Rezolvat</span>
}

const BLANK = { id: '', data_deschidere: '', proiect: '', subansamblu: '', departament: 'SUDAT', descriere: '', responsabil: '', impact: 'MEDIU', status: 'Deschis', data_rezolvare: '', zile_deschis: 0, observatii: '' }

export default function Blocaje() {
  const { t } = useLang()
  const b = t.blocaje
  const { data, loading, error, refetch } = useQuery(fetchBlocaje)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [resolveId, setResolveId] = useState<string | null>(null)

  const open = data?.filter(b => b.status === 'Deschis') ?? []
  const resolved = data?.filter(b => b.status === 'Rezolvat') ?? []

  function setF(k: string, v: string | number) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.id) return
    setSaving(true)
    try {
      await insertBlocaj(form)
      setShowForm(false); setForm({ ...BLANK }); refetch()
    } finally { setSaving(false) }
  }

  async function resolveBlockage(id: string) {
    const today = new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
    await updateBlocaj(id, { status: 'Rezolvat', data_rezolvare: today })
    refetch()
  }

  const inputStyle: React.CSSProperties = { background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', color: 'var(--color-ink)', fontSize: 13, fontFamily: 'var(--font-text)', width: '100%', outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 500, color: 'var(--color-ink-subtle)', display: 'block', marginBottom: 4 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{b.eyebrow}</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{b.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 4 }}>{b.subtitle}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{ background: showForm ? 'var(--color-surface-2)' : 'var(--color-primary)', border: showForm ? '1px solid var(--color-hairline)' : 'none', borderRadius: 'var(--radius-md)', padding: '8px 16px', color: showForm ? 'var(--color-ink-subtle)' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-text)', flexShrink: 0 }}>
          {showForm ? `✕ ${t.common.cancel}` : b.newBtn}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* New blockage form */}
      {showForm && (
        <div className="card" style={{ borderLeft: '3px solid var(--color-danger)' }}>
          <div style={{ marginBottom: 16 }}><span className="eyebrow">{b.formTitle}</span></div>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              <div><label style={labelStyle}>ID Blocare *</label><input required style={inputStyle} value={form.id} onChange={e => setF('id', e.target.value)} placeholder="BLK-005" /></div>
              <div><label style={labelStyle}>Data Deschidere</label><input style={inputStyle} value={form.data_deschidere} onChange={e => setF('data_deschidere', e.target.value)} placeholder="12-Mai-25" /></div>
              <div><label style={labelStyle}>Proiect</label>
                <select style={inputStyle} value={form.proiect} onChange={e => setF('proiect', e.target.value)}>
                  <option value="">— Selectați —</option>
                  {['WP1000-08','WP1000-09','WP1000-10'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Subansamblu</label><input style={inputStyle} value={form.subansamblu} onChange={e => setF('subansamblu', e.target.value)} /></div>
              <div><label style={labelStyle}>Departament</label>
                <select style={inputStyle} value={form.departament} onChange={e => setF('departament', e.target.value)}>
                  {['LASER','ROLAT','SUDAT','ASAMBLAT','VOPSIT'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Responsabil</label><input style={inputStyle} value={form.responsabil} onChange={e => setF('responsabil', e.target.value)} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Descriere Blocaj *</label><input required style={inputStyle} value={form.descriere} onChange={e => setF('descriere', e.target.value)} /></div>
              <div><label style={labelStyle}>Impact</label>
                <select style={inputStyle} value={form.impact} onChange={e => setF('impact', e.target.value)}>
                  {['MEDIU','INALT','CRITIC'].map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Observații</label><input style={inputStyle} value={form.observatii} onChange={e => setF('observatii', e.target.value)} /></div>
            </div>
            <button type="submit" disabled={saving} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 20px', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-text)' }}>
              {saving ? t.common.saving : b.saveBtn}
            </button>
          </form>
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[{ val: open.length, label: 'Blocaje Deschise', sub: 'necesită acțiune', color: '#f87171' }, { val: resolved.length, label: 'Rezolvate', sub: 'închise', color: '#4ade80' }].map(({ val, label, sub, color }) => (
          <div key={label} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{val}</span>
            <div><div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div><div style={{ fontSize: 11, color: 'var(--color-ink-subtle)' }}>{sub}</div></div>
          </div>
        ))}
      </div>

      {/* Open */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center' }}>
          <span className="eyebrow">{b.activeTitle}</span>
          <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>{open.length} {b.openCount}</span>
        </div>
        <table>
          <thead><tr><th>{b.colId}</th><th>{b.colData}</th><th>{b.colProiect}</th><th>{b.colSubansamblu}</th><th>{b.colDept}</th><th>{b.colDescriere}</th><th>{b.colResponsabil}</th><th>{b.colImpact}</th><th>{b.colZile}</th><th>{b.colObs}</th><th></th></tr></thead>
          <tbody>
            {loading ? <LoadingRows cols={11} /> : open.length === 0 ? <EmptyState label="✅ Niciun blocaj activ" /> :
              open.map(b => (
                <tr key={b.id} style={{ background: 'rgba(239,68,68,0.03)' }}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f87171' }}>{b.id}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{b.data_deschidere}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{b.proiect}</span></td>
                  <td style={{ fontWeight: 500 }}>{b.subansamblu}</td>
                  <td><span className="badge badge-neutral">{b.departament}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', maxWidth: 220 }}>{b.descriere}</td>
                  <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{b.responsabil}</td>
                  <td>{impactBadge(b.impact)}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: b.zile_deschis > 30 ? '#f87171' : 'var(--color-ink-muted)' }}>{b.zile_deschis}z</span></td>
                  <td style={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{b.observatii}</td>
                  <td>
                    <button onClick={() => resolveBlockage(b.id)} style={{ background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.2)', borderRadius: 4, color: '#4ade80', fontSize: 11, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {b.resolveBtn}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Resolved */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center' }}>
          <span className="eyebrow">{b.resolvedTitle}</span>
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>{resolved.length} {b.closedCount}</span>
        </div>
        <table>
          <thead><tr><th>{b.colId}</th><th>{b.colData}</th><th>{b.colProiect}</th><th>{b.colSubansamblu}</th><th>{b.colDept}</th><th>{b.colDescriere}</th><th>{b.colResponsabil}</th><th>{b.colImpact}</th><th>{b.colStatus}</th><th>{b.colRezolvat}</th><th>{b.colZile}</th></tr></thead>
          <tbody>
            {loading ? <LoadingRows cols={11} /> : resolved.length === 0 ? <EmptyState label="Niciun blocaj rezolvat" /> :
              resolved.map(b => (
                <tr key={b.id}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{b.id}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{b.data_deschidere}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{b.proiect}</span></td>
                  <td style={{ fontWeight: 500 }}>{b.subansamblu}</td>
                  <td><span className="badge badge-neutral">{b.departament}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', maxWidth: 200 }}>{b.descriere}</td>
                  <td style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{b.responsabil}</td>
                  <td>{impactBadge(b.impact)}</td>
                  <td>{statusBadge(b.status)}</td>
                  <td style={{ fontSize: 12, color: '#4ade80' }}>{b.data_rezolvare}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{b.zile_deschis}z</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
