import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchSubansambluri, upsertSubansamblu } from '../lib/api'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'

type FilterStatus = 'ALL' | 'FINALIZAT' | 'IN LUCRU' | 'BLOCAT'

function statusChip(s: string) {
  if (s === 'Finalizat') return <span className="badge badge-success">Finalizat</span>
  if (s === 'În lucru') return <span className="badge badge-info">În lucru</span>
  if (s === 'Blocat') return <span className="badge badge-danger">Blocat</span>
  if (s === 'N/A') return <span className="badge badge-neutral">N/A</span>
  return <span className="badge badge-neutral">{s || 'Neînceput'}</span>
}

function globalChip(s: string) {
  if (s.includes('FINALIZAT')) return <span className="badge badge-success">✅ Finalizat</span>
  if (s.includes('BLOCAT')) return <span className="badge badge-danger">⛔ Blocat</span>
  if (s.includes('IN LUCRU')) return <span className="badge badge-info">🔄 În Lucru</span>
  return <span className="badge badge-neutral">{s}</span>
}

const DEPT_COLS = ['laser','rolat','sudat','asamblat','vopsit'] as const

export default function Subansambluri() {
  const { t } = useLang()
  const s = t.subansambluri
  const [filterProiect, setFilterProiect] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<Record<string, string | boolean> | null>(null)
  const [saving, setSaving] = useState(false)

  const { data, loading, error, refetch } = useQuery(fetchSubansambluri)
  const projects = ['ALL', ...Array.from(new Set((data ?? []).map(sa => sa.proiect))).sort()]

  const filtered = (data ?? []).filter(sa => {
    if (filterProiect !== 'ALL' && sa.proiect !== filterProiect) return false
    if (filterStatus === 'FINALIZAT' && !sa.status_global.includes('FINALIZAT')) return false
    if (filterStatus === 'IN LUCRU' && !sa.status_global.includes('IN LUCRU')) return false
    if (filterStatus === 'BLOCAT' && !sa.blocat) return false
    if (search && !sa.nume.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function saveEdit() {
    if (!editRow || editId === null) return
    setSaving(true)
    try {
      await upsertSubansamblu({ id: editId, ...editRow })
      setEditId(null); setEditRow(null)
      refetch()
    } finally { setSaving(false) }
  }

  const pills = (opts: string[], val: string, set: (v: string) => void) => (
    <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-1)', borderRadius: 'var(--radius-pill)', padding: 3, border: '1px solid var(--color-hairline)' }}>
      {opts.map(o => (
        <button key={o} onClick={() => set(o)} style={{ padding: '4px 12px', borderRadius: 'var(--radius-pill)', border: 'none', background: val === o ? 'var(--color-surface-3)' : 'transparent', color: val === o ? 'var(--color-ink)' : 'var(--color-ink-subtle)', fontSize: 12, fontWeight: val === o ? 500 : 400, cursor: 'pointer', fontFamily: 'var(--font-text)' }}>{o}</button>
      ))}
    </div>
  )

  const STATUS_OPTIONS = ['Finalizat', 'În lucru', 'Blocat', 'Neînceput', 'N/A']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p className="eyebrow" style={{ marginBottom: 6 }}>{s.eyebrow}</p>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{s.title}</h1>
        <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 4 }}>
          LASER → ROLAT → SUDAT → ASAMBLAT → VOPSIT · {filtered.length} {t.common.records}
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <input type="text" placeholder={s.search} value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-md)', padding: '7px 12px', color: 'var(--color-ink)', fontSize: 13, fontFamily: 'var(--font-text)', width: 220, outline: 'none' }} />
        {projects.length > 1 && pills(projects, filterProiect, v => setFilterProiect(v))}
        {pills(['ALL','FINALIZAT','IN LUCRU','BLOCAT'], filterStatus, v => setFilterStatus(v as FilterStatus))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>{s.colProiect}</th><th>{s.colNr}</th><th>{s.colNume}</th><th>{s.colStatus}</th><th>{s.colProgres}</th>
                <th style={{ textAlign: 'center' }}>LASER</th><th style={{ textAlign: 'center' }}>ROLAT</th>
                <th style={{ textAlign: 'center' }}>SUDAT</th><th style={{ textAlign: 'center' }}>ASAMBLAT</th>
                <th style={{ textAlign: 'center' }}>VOPSIT</th><th>{s.colComentarii}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={12} /> : filtered.length === 0 ? <EmptyState label={s.empty} /> :
                filtered.map(sa => (
                  editId === sa.id ? (
                    <tr key={sa.id} style={{ background: 'rgba(94,106,210,0.06)' }}>
                      <td colSpan={2}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{sa.proiect} #{sa.nr}</span></td>
                      <td style={{ fontWeight: 500 }}>{sa.nume}</td>
                      <td>
                        <select value={String(editRow?.status_global ?? sa.status_global)} onChange={e => setEditRow(r => ({ ...r!, status_global: e.target.value }))}
                          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 4, color: 'var(--color-ink)', fontSize: 12, padding: '3px 6px' }}>
                          {['✅ FINALIZAT','🔄 IN LUCRU','⛔ BLOCAT'].map(st => <option key={st}>{st}</option>)}
                        </select>
                      </td>
                      <td><input value={String(editRow?.progres ?? sa.progres)} onChange={e => setEditRow(r => ({ ...r!, progres: e.target.value }))}
                        style={{ width: 60, background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 4, color: 'var(--color-ink)', fontSize: 12, padding: '3px 6px' }} /></td>
                      {DEPT_COLS.map(col => (
                        <td key={col} style={{ textAlign: 'center' }}>
                          <select value={String(editRow?.[col] ?? sa[col])} onChange={e => setEditRow(r => ({ ...r!, [col]: e.target.value }))}
                            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 4, color: 'var(--color-ink)', fontSize: 11, padding: '2px 4px' }}>
                            {STATUS_OPTIONS.map(st => <option key={st}>{st}</option>)}
                          </select>
                        </td>
                      ))}
                      <td><input value={String(editRow?.comentarii ?? sa.comentarii ?? '')} onChange={e => setEditRow(r => ({ ...r!, comentarii: e.target.value }))}
                        style={{ width: 140, background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 4, color: 'var(--color-ink)', fontSize: 12, padding: '3px 6px' }} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={saveEdit} disabled={saving} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>
                            {saving ? '...' : t.common.save}
                          </button>
                          <button onClick={() => { setEditId(null); setEditRow(null) }} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 4, color: 'var(--color-ink-subtle)', fontSize: 11, padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={sa.id} style={sa.blocat ? { background: 'rgba(239,68,68,0.03)' } : undefined}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{sa.proiect}</span></td>
                      <td style={{ color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{sa.nr}</td>
                      <td>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{sa.nume}</span>
                        {sa.conditionat_de && <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 2 }}>🔵 {sa.conditionat_de}</div>}
                      </td>
                      <td>{globalChip(sa.status_global)}</td>
                      <td style={{ minWidth: 90 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="progress-bar" style={{ width: 50 }}>
                            <div className={`progress-fill ${parseInt(sa.progres) >= 90 ? 'progress-fill-success' : parseInt(sa.progres) >= 60 ? 'progress-fill-warning' : 'progress-fill-danger'}`} style={{ width: sa.progres }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{sa.progres}</span>
                        </div>
                      </td>
                      {DEPT_COLS.map(col => <td key={col} style={{ textAlign: 'center' }}>{statusChip(sa[col])}</td>)}
                      <td style={{ fontSize: 12, color: sa.blocat ? '#f87171' : 'var(--color-ink-muted)', maxWidth: 180 }}>{sa.comentarii}</td>
                      <td>
                        <button onClick={() => { setEditId(sa.id); setEditRow({ status_global: sa.status_global, progres: sa.progres, blocat: sa.blocat, laser: sa.laser, rolat: sa.rolat, sudat: sa.sudat, asamblat: sa.asamblat, vopsit: sa.vopsit, comentarii: sa.comentarii ?? '' }) }}
                          style={{ background: 'none', border: '1px solid var(--color-hairline)', borderRadius: 4, color: 'var(--color-ink-subtle)', fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}>
                          {t.common.edit}
                        </button>
                      </td>
                    </tr>
                  )
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
