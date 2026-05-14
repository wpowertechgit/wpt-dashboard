import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { updateProfile } from '../lib/api'
import { supabaseAdmin } from '../lib/supabase'
import { ErrorBanner, LoadingRows } from './StateViews'

const DEPTS = ['', 'LASER', 'ROLAT', 'SUDAT', 'ASAMBLAT', 'VOPSIT', 'MANAGEMENT']
const ROLES = ['worker', 'admin']

const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)',
  borderRadius: 'var(--radius-sm)', padding: '6px 10px', color: 'var(--color-ink)',
  fontSize: 13, fontFamily: 'var(--font-text)', width: '100%', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: 'var(--color-ink-subtle)', display: 'block', marginBottom: 4,
}

const BLANK_USER = { email: '', password: '', full_name: '', departament: '', role: 'worker' }

export default function Admin() {
  const { t } = useLang()
  const a = t.admin

  async function fetchProfilesAdmin() {
    if (!supabaseAdmin) throw new Error('Service key not configured')
    const { data, error } = await supabaseAdmin.from('profiles').select('*').order('created_at')
    if (error) throw error
    return data
  }

  const { data: profiles, loading, error, refetch } = useQuery(fetchProfilesAdmin)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK_USER })
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editDept, setEditDept] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function createUser(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!supabaseAdmin) {
      setCreateError('Service key not configured — add VITE_SUPABASE_SERVICE_KEY to .env.local')
      return
    }
    setSaving(true)
    setCreateError(null)
    setCreateSuccess(null)
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
        user_metadata: { full_name: form.full_name },
      })
      if (error) throw error
      if (data.user) {
        await updateProfile(data.user.id, {
          full_name: form.full_name || null,
          role: form.role,
          departament: form.departament || null,
        })
      }
      setCreateSuccess(`Cont creat pentru ${form.email}`)
      setForm({ ...BLANK_USER })
      setShowForm(false)
      refetch()
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit(id: string) {
    setSaveError(null)
    try {
      await updateProfile(id, { role: editRole, departament: editDept || null })
      setEditId(null)
      refetch()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : String(err))
    }
  }

  function roleBadge(role: string) {
    return role === 'admin'
      ? <span className="badge badge-warning">Admin</span>
      : <span className="badge badge-neutral">Worker</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>{a.eyebrow}</p>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{a.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 4 }}>
            {a.subtitle} · {profiles?.length ?? '…'} {a.users}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setCreateError(null); setCreateSuccess(null) }}
          style={{ background: showForm ? 'var(--color-surface-2)' : 'var(--color-primary)', border: showForm ? '1px solid var(--color-hairline)' : 'none', borderRadius: 'var(--radius-md)', padding: '8px 16px', color: showForm ? 'var(--color-ink-subtle)' : '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-text)' }}>
          {showForm ? `✕ ${t.common.cancel}` : a.newBtn}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}
      {saveError && <ErrorBanner message={saveError} />}

      {createSuccess && (
        <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 16px', fontSize: 13, color: '#4ade80' }}>
          ✅ {createSuccess}
        </div>
      )}

      {/* Create user form */}
      {showForm && (
        <div className="card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <div style={{ marginBottom: 16 }}><span className="eyebrow">{a.formTitle}</span></div>
          {createError && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, color: '#f87171', marginBottom: 12 }}>
              {createError}
            </div>
          )}
          <form onSubmit={createUser}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>{a.email} *</label>
                <input required type="email" style={inputStyle} value={form.email} onChange={e => setF('email', e.target.value)} placeholder="ion.popescu@wpowertech.ro" />
              </div>
              <div>
                <label style={labelStyle}>{a.password} *</label>
                <input required type="password" style={inputStyle} value={form.password} onChange={e => setF('password', e.target.value)} placeholder="min. 6 caractere" minLength={6} />
              </div>
              <div>
                <label style={labelStyle}>{a.fullName}</label>
                <input style={inputStyle} value={form.full_name} onChange={e => setF('full_name', e.target.value)} placeholder="Ion Popescu" />
              </div>
              <div>
                <label style={labelStyle}>{a.departament}</label>
                <select style={inputStyle} value={form.departament} onChange={e => setF('departament', e.target.value)}>
                  {DEPTS.map(d => <option key={d} value={d}>{d || '— Selectați —'}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{a.rol}</label>
                <select style={inputStyle} value={form.role} onChange={e => setF('role', e.target.value)}>
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 20px', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-text)', opacity: saving ? 0.7 : 1 }}>
              {saving ? a.creating : a.createBtn}
            </button>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
          <span className="eyebrow">Utilizatori</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>{a.colNume}</th><th>{a.colEmail}</th><th>{a.colDept}</th>
                <th>{a.colRol}</th><th>{a.colCreat}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows cols={6} /> : (profiles ?? []).map(p => (
                editId === p.id ? (
                  <tr key={p.id} style={{ background: 'rgba(94,106,210,0.06)' }}>
                    <td colSpan={2} style={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{p.full_name || p.email}</td>
                    <td>
                      <select value={editDept} onChange={e => setEditDept(e.target.value)}
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 4, color: 'var(--color-ink)', fontSize: 12, padding: '3px 6px' }}>
                        {DEPTS.map(d => <option key={d} value={d}>{d || '— Fără —'}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={editRole} onChange={e => setEditRole(e.target.value)}
                        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 4, color: 'var(--color-ink)', fontSize: 12, padding: '3px 6px' }}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </td>
                    <td></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => saveEdit(p.id)} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: 4, color: '#fff', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>{t.common.save}</button>
                        <button onClick={() => setEditId(null)} style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 4, color: 'var(--color-ink-subtle)', fontSize: 11, padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{p.full_name || <span style={{ color: 'var(--color-ink-tertiary)' }}>—</span>}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>{p.email}</td>
                    <td>{p.departament ? <span className="badge badge-neutral">{p.departament}</span> : <span style={{ color: 'var(--color-ink-tertiary)' }}>—</span>}</td>
                    <td>{roleBadge(p.role)}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('ro-RO') : '—'}</td>
                    <td>
                      <button onClick={() => { setEditId(p.id); setEditRole(p.role); setEditDept(p.departament ?? '') }}
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

      <div className="card">
        <div style={{ marginBottom: 12 }}><span className="eyebrow">{a.ghidTitle}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { title: 'Worker', desc: a.workerDesc, color: '#8a8f98' },
            { title: 'Admin', desc: a.adminDesc, color: '#818cf8' },
          ].map(({ title, desc, color }) => (
            <div key={title} style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: '14px 16px', borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
