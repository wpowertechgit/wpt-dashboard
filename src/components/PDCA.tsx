import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchPDCA, insertPDCA, updatePDCA } from '../lib/api'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'

function priorityBadge(p: string) {
  if (p === 'CRITIC') return <span className="badge badge-danger">CRITIC</span>
  if (p === 'INALT') return <span className="badge badge-warning">INALT</span>
  if (p === 'MEDIU') return <span className="badge badge-info">MEDIU</span>
  return <span className="badge badge-neutral">SCĂZUT</span>
}
function statusBadge(s: string) {
  if (s === 'Deschis') return <span className="badge badge-warning">Deschis</span>
  if (s === 'In analiza') return <span className="badge badge-info">În Analiză</span>
  if (s === 'Inchis') return <span className="badge badge-success">Închis</span>
  return <span className="badge badge-neutral">{s}</span>
}

const BLANK = { id: '', sursa: '', data_deschis: '', proiect: '', problema: '', contramasura: '', responsabil: '', termen: '', status: 'Deschis', prioritate: 'MEDIU', zile_ramas: '' }
const inputStyle: React.CSSProperties = { background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', color: 'var(--color-ink)', fontSize: 13, fontFamily: 'var(--font-text)', width: '100%', outline: 'none' }
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 500, color: 'var(--color-ink-subtle)', display: 'block', marginBottom: 4 }

export default function PDCA_View() {
  const { t } = useLang()
  const pd = t.pdca
  const { data, loading, error, refetch } = useQuery(fetchPDCA)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK })
  const [saving, setSaving] = useState(false)

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.id) return
    setSaving(true)
    try { await insertPDCA(form); setShowForm(false); setForm({ ...BLANK }); refetch() }
    finally { setSaving(false) }
  }

  async function closeAction(id: string) {
    await updatePDCA(id, { status: 'Inchis' }); refetch()
  }

  const overdue = data?.filter(p => p.zile_ramas === 'DEPASIT') ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{pd.eyebrow}</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{pd.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 4 }}>{pd.subtitle} — {data?.length ?? '…'} · {overdue.length} {pd.overdueLabel}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{ background: showForm ? 'var(--color-surface-2)' : 'var(--color-primary)', border: showForm ? '1px solid var(--color-hairline)' : 'none', borderRadius: 'var(--radius-md)', padding: '8px 16px', color: showForm ? 'var(--color-ink-subtle)' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-text)' }}>
          {showForm ? `✕ ${t.common.cancel}` : pd.newBtn}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Phase pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { phase: '◆ PLAN', color: '#818cf8', bg: 'rgba(94,106,210,0.08)', desc: 'Identificare problemă' },
          { phase: '◆ DO', color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', desc: 'Contramasuri' },
          { phase: '◆ CHECK', color: '#4ade80', bg: 'rgba(39,166,68,0.08)', desc: 'Verificare rezultate' },
          { phase: '◆ ACT', color: '#f87171', bg: 'rgba(239,68,68,0.08)', desc: 'Acțiune urmă' },
        ].map(({ phase, color, bg, desc }) => (
          <div key={phase} style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 'var(--radius-lg)', padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color, letterSpacing: '0.3px' }}>{phase}</div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-subtle)', marginTop: 2 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <div style={{ marginBottom: 16 }}><span className="eyebrow">{pd.formTitle}</span></div>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              <div><label style={labelStyle}>ID PDCA *</label><input required style={inputStyle} value={form.id} onChange={e => setF('id', e.target.value)} placeholder="PDCA-006" /></div>
              <div><label style={labelStyle}>Sursă</label><input style={inputStyle} value={form.sursa} onChange={e => setF('sursa', e.target.value)} placeholder="BLK-001" /></div>
              <div><label style={labelStyle}>Data Deschis</label><input style={inputStyle} value={form.data_deschis} onChange={e => setF('data_deschis', e.target.value)} placeholder="12-Mai-25" /></div>
              <div><label style={labelStyle}>Proiect</label>
                <select style={inputStyle} value={form.proiect} onChange={e => setF('proiect', e.target.value)}>
                  <option value="">— Selectați —</option>
                  {['WP1000-08','WP1000-09','WP1000-10','TOATE'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Responsabil</label><input style={inputStyle} value={form.responsabil} onChange={e => setF('responsabil', e.target.value)} /></div>
              <div><label style={labelStyle}>Termen</label><input style={inputStyle} value={form.termen} onChange={e => setF('termen', e.target.value)} placeholder="20-Mai-25" /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Problemă (Plan) *</label><input required style={inputStyle} value={form.problema} onChange={e => setF('problema', e.target.value)} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Contramasură (Do)</label><input style={inputStyle} value={form.contramasura} onChange={e => setF('contramasura', e.target.value)} /></div>
              <div><label style={labelStyle}>Prioritate</label>
                <select style={inputStyle} value={form.prioritate} onChange={e => setF('prioritate', e.target.value)}>
                  {['SCAZUT','MEDIU','INALT','CRITIC'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 20px', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-text)' }}>
              {saving ? t.common.saving : pd.saveBtn}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center' }}>
          <span className="eyebrow">{pd.tableTitle}</span>
          {overdue.length > 0 && <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>{overdue.length} depășite</span>}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>{pd.colId}</th><th>{pd.colSursa}</th><th>{pd.colData}</th><th>{pd.colProiect}</th><th style={{ minWidth: 200 }}>{pd.colProblema}</th><th style={{ minWidth: 220 }}>{pd.colContramasura}</th><th>{pd.colResponsabil}</th><th>{pd.colTermen}</th><th>{pd.colStatus}</th><th>{pd.colPrioritate}</th><th>{pd.colZile}</th><th></th></tr></thead>
            <tbody>
              {loading ? <LoadingRows cols={12} /> : (data ?? []).length === 0 ? <EmptyState label={pd.tableTitle} /> :
                (data ?? []).map(p => (
                  <tr key={p.id} style={p.zile_ramas === 'DEPASIT' ? { background: 'rgba(239,68,68,0.03)' } : undefined}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{p.id}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-subtle)' }}>{p.sursa}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{p.data_deschis}</td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{p.proiect}</span></td>
                    <td style={{ fontSize: 12, maxWidth: 240 }}>{p.problema}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', maxWidth: 260 }}>{p.contramasura}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{p.responsabil}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>{p.termen}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td>{priorityBadge(p.prioritate)}</td>
                    <td>{p.zile_ramas === 'DEPASIT' ? <span className="badge badge-danger">⛔ DEPĂȘIT</span> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{p.zile_ramas}</span>}</td>
                    <td>
                      {p.status !== 'Inchis' && (
                        <button onClick={() => closeAction(p.id)} style={{ background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.2)', borderRadius: 4, color: '#4ade80', fontSize: 11, padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          ✅ Închide
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escalation */}
      <div className="card">
        <div style={{ marginBottom: 16 }}><span className="eyebrow">{pd.escaladare}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { nivel: 'Nivel 1 — Șef Echipă', desc: 'Blocaj rezolvabil în <4 ore fără resurse extra', color: '#4ade80' },
            { nivel: 'Nivel 2 — Șef Producție', desc: 'Blocaj >4 ore SAU implică alt departament SAU aprovizionare', color: '#fbbf24' },
            { nivel: 'Nivel 3 — Director General', desc: 'Blocaj >1 zi SAU risc livrare proiect SAU cost suplimentar major', color: '#f87171' },
          ].map(({ nivel, desc, color }) => (
            <div key={nivel} style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: '14px 16px', borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 4 }}>{nivel}</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
