import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { enterDemo } from '../lib/demo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  function handleDemo() {
    enterDemo()
    window.location.reload()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-hairline)',
    borderRadius: 'var(--radius-md)',
    padding: '9px 12px',
    color: 'var(--color-ink)',
    fontSize: 14,
    fontFamily: 'var(--font-text)',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src="/wpt logo-02.png" alt="Waste Powertech" style={{ height: 'clamp(72px, 10vw, 140px)', width: 'auto', margin: '0 auto 28px', display: 'block' }} />
          <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>OMS · Operational Management System</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6, letterSpacing: '-0.3px', fontFamily: 'var(--font-display)' }}>
            Autentificare
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginBottom: 24 }}>
            Introduceți credențialele primite de la administrator.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nume@wpowertech.ro" required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-hairline)')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: 6 }}>Parolă</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-hairline)')} />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, color: '#f87171' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? 'var(--color-surface-3)' : 'var(--color-primary)',
              color: 'var(--color-on-primary)', border: 'none', borderRadius: 'var(--radius-md)',
              padding: '9px 14px', fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-text)', transition: 'background 0.15s', marginTop: 4,
            }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = 'var(--color-primary-hover)' }}
              onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.background = 'var(--color-primary)' }}
            >
              {loading ? 'Se procesează...' : 'Autentificare'}
            </button>
          </form>
        </div>

        {/* Demo button */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button onClick={handleDemo} style={{
            background: 'transparent', border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-md)', padding: '8px 20px',
            color: 'var(--color-ink-subtle)', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font-text)', width: '100%',
            transition: 'border-color 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget.style.borderColor = 'var(--color-primary)'); (e.currentTarget.style.color = 'var(--color-primary)') }}
            onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--color-hairline)'); (e.currentTarget.style.color = 'var(--color-ink-subtle)') }}
          >
            ▶ Demo version
          </button>
        </div>
      </div>
    </div>
  )
}
