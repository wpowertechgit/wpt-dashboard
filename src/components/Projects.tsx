import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchProiecte, insertProiect } from '../lib/api'
import { ErrorBanner, LoadingRows } from './StateViews'

function priorityBadge(p: string) {
  if (p === 'CRITIC') return <span className="badge badge-danger">🔴 CRITIC</span>
  if (p === 'RIDICAT') return <span className="badge badge-warning">🟡 RIDICAT</span>
  return <span className="badge badge-success">🟢 NORMAL</span>
}

function statusBadge(s: string) {
  if (s === 'LIVRAT') return <span className="badge badge-success">✅ LIVRAT</span>
  if (s === 'IN LIVRARE') return <span className="badge badge-warning">🟡 IN LIVRARE</span>
  if (s === 'BLOCAJE ACTIVE') return <span className="badge badge-danger">⛔ BLOCAJE ACTIVE</span>
  return <span className="badge badge-neutral">{s}</span>
}

function ProgressBar({ value }: { value: number }) {
  const c = value >= 95 ? 'success' : value >= 80 ? 'warning' : 'danger'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className={`progress-fill progress-fill-${c}`} style={{ width: `${value}%` }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--color-ink-muted)', minWidth: 40, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{value.toFixed(1)}%</span>
    </div>
  )
}

const BLANK = { id: '', client: '', responsabil: '', data_start: '', data_target: '', total_sa: 0, buget_ore: 0, prioritate: 'NORMAL', status: 'IN PRODUCTIE' }

const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)',
  borderRadius: 'var(--radius-sm)', padding: '6px 10px', color: 'var(--color-ink)',
  fontSize: 13, fontFamily: 'var(--font-text)', width: '100%', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: 'var(--color-ink-subtle)', display: 'block', marginBottom: 4,
}

export default function Proiecte() {
  const { t } = useLang()
  const p = t.proiecte
  const { data, loading, error, refetch } = useQuery(fetchProiecte)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const setF = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await insertProiect(form)
      setShowForm(false)
      setForm({ ...BLANK })
      refetch()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{p.eyebrow}</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{p.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 4 }}>{data?.length ?? '…'} {t.common.records}</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setFormError(null) }}
          style={{ background: showForm ? 'var(--color-surface-2)' : 'var(--color-primary)', border: showForm ? '1px solid var(--color-hairline)' : 'none', borderRadius: 'var(--radius-md)', padding: '8px 16px', color: showForm ? 'var(--color-ink-subtle)' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-text)' }}>
          {showForm ? `✕ ${t.common.cancel}` : p.newBtn}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* New project form */}
      {showForm && (
        <div className="card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <div style={{ marginBottom: 16 }}><span className="eyebrow">{p.formTitle}</span></div>
          {formError && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, color: '#f87171', marginBottom: 12 }}>
              {formError}
            </div>
          )}
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>{p.idProiect} *</label>
                <input required style={inputStyle} value={form.id} onChange={e => setF('id', e.target.value)} placeholder="WP1000-11" />
              </div>
              <div>
                <label style={labelStyle}>{p.client} *</label>
                <input required style={inputStyle} value={form.client} onChange={e => setF('client', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>{p.responsabil}</label>
                <input style={inputStyle} value={form.responsabil} onChange={e => setF('responsabil', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>{p.dataStart}</label>
                <input style={inputStyle} value={form.data_start} onChange={e => setF('data_start', e.target.value)} placeholder="01-Ian-25" />
              </div>
              <div>
                <label style={labelStyle}>{p.dataTarget}</label>
                <input style={inputStyle} value={form.data_target} onChange={e => setF('data_target', e.target.value)} placeholder="30-Iun-25" />
              </div>
              <div>
                <label style={labelStyle}>{p.totalSA}</label>
                <input type="number" min={0} style={inputStyle} value={form.total_sa} onChange={e => setF('total_sa', Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>{p.bugetOre}</label>
                <input type="number" min={0} style={inputStyle} value={form.buget_ore} onChange={e => setF('buget_ore', Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>{p.prioritate}</label>
                <select style={inputStyle} value={form.prioritate} onChange={e => setF('prioritate', e.target.value)}>
                  {['NORMAL', 'RIDICAT', 'CRITIC'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{p.status}</label>
                <select style={inputStyle} value={form.status} onChange={e => setF('status', e.target.value)}>
                  {['IN PRODUCTIE', 'IN LIVRARE', 'LIVRAT', 'BLOCAJE ACTIVE'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 20px', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-text)', opacity: saving ? 0.7 : 1 }}>
              {saving ? t.common.saving : p.createBtn}
            </button>
          </form>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {loading ? [1,2,3].map(i => (
          <div key={i} className="card" style={{ height: 260, animation: 'pulse 1.4s ease-in-out infinite', background: 'var(--color-surface-1)' }} />
        )) : data?.map(p => (
          <div key={p.id} className="card" style={{ borderTop: `3px solid ${p.prioritate === 'CRITIC' ? '#f87171' : p.prioritate === 'RIDICAT' ? '#fbbf24' : '#4ade80'}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>{p.id}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginTop: 2, letterSpacing: '-0.2px' }}>{p.client}</div>
              </div>
              {statusBadge(p.status)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Responsabil', val: p.responsabil },
                { label: 'Data Start', val: p.data_start, mono: true },
                { label: 'Target', val: p.data_target, mono: true, warn: p.status !== 'LIVRAT' },
              ].map(({ label, val, mono, warn }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontFamily: mono ? 'var(--font-mono)' : undefined, color: warn ? '#fbbf24' : 'var(--color-ink-muted)' }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>Prioritate</span>
                {priorityBadge(p.prioritate)}
              </div>
              <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 10, marginTop: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>Subansambluri</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>{p.finalizate_sa}/{p.total_sa}</span>
                </div>
                <ProgressBar value={Number(p.progres)} />
              </div>
              {p.blocaje_active > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', display: 'flex', gap: 8 }}>
                  <span>⛔</span>
                  <span style={{ fontSize: 12, color: '#f87171' }}><strong>{p.blocaje_active}</strong> blocaje active</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
          <span className="eyebrow">{p.tabelar}</span>
        </div>
        <table>
          <thead>
            <tr><th>{p.colId}</th><th>{p.colClient}</th><th>{p.colResponsabil}</th><th>{p.colPrioritate}</th><th>{p.colStart}</th><th>{p.colTarget}</th><th>{p.colSATotal}</th><th>{p.colSAFinal}</th><th style={{ minWidth: 180 }}>{p.colProgres}</th><th>{p.colBlocaje}</th><th>{p.colStatus}</th></tr>
          </thead>
          <tbody>
            {loading ? <LoadingRows cols={11} /> : data?.map(p => (
              <tr key={p.id}>
                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>{p.id}</span></td>
                <td style={{ fontWeight: 500 }}>{p.client}</td>
                <td style={{ color: 'var(--color-ink-muted)' }}>{p.responsabil}</td>
                <td>{priorityBadge(p.prioritate)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{p.data_start}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: p.status !== 'LIVRAT' ? '#fbbf24' : 'var(--color-ink-muted)' }}>{p.data_target}</td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.total_sa}</td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.finalizate_sa}</td>
                <td style={{ minWidth: 180 }}><ProgressBar value={Number(p.progres)} /></td>
                <td style={{ textAlign: 'center' }}>{p.blocaje_active > 0 ? <span className="badge badge-danger">{p.blocaje_active}</span> : <span style={{ color: 'var(--color-ink-tertiary)' }}>–</span>}</td>
                <td>{statusBadge(p.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
