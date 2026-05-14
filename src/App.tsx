import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseAdmin } from './lib/supabase'
import { useLang } from './lib/i18n'
import { isDemoMode, exitDemo } from './lib/demo'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import Subassemblies from './components/Subassemblies'
import Blockages from './components/Blockages'
import PDCA from './components/PDCA'
import DailyFlow from './components/DailyFlow'
import TeamKPI from './components/TeamKPI'
import Projects from './components/Projects'
import Admin from './components/Admin'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  departament: string | null
}

function AppShell({ session, profile }: { session: Session | null; profile: Profile | null }) {
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()
  const demoMode = isDemoMode()
  const isAdmin = profile?.role === 'admin'

  const BASE_ROUTES = [
    { path: '/dashboard', label: t.nav.dashboard },
    { path: '/projects', label: t.nav.proiecte },
    { path: '/subassemblies', label: t.nav.subansambluri },
    { path: '/blockages', label: t.nav.blocaje },
    { path: '/pdca', label: t.nav.pdca },
    { path: '/daily-flow', label: t.nav.flux },
    { path: '/kpi', label: t.nav.kpi },
  ]
  const routes = isAdmin ? [...BASE_ROUTES, { path: '/admin', label: t.nav.admin }] : BASE_ROUTES

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        height: 56, background: 'var(--color-canvas)', borderBottom: '1px solid var(--color-hairline)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Brand */}
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', marginRight: 32, flexShrink: 0, textDecoration: 'none' }}>
          <img src="/wpt symbol-02.png" alt="Waste Powertech" style={{ height: 'clamp(28px, 2.5vw, 38px)', width: 'auto', display: 'block' }} />
        </NavLink>

        {/* Nav tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {routes.map(({ path, label }) => {
            const isAdmin = path === '/admin'
            return (
              <NavLink key={path} to={path} style={({ isActive }) => ({
                padding: '6px 12px',
                background: isActive ? 'var(--color-surface-2)' : 'transparent',
                color: isActive
                  ? (isAdmin ? '#818cf8' : 'var(--color-ink)')
                  : (isAdmin ? '#5e6ad2' : 'var(--color-ink-subtle)'),
                borderRadius: 'var(--radius-md)', fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                transition: 'background 0.15s, color 0.15s', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-text)', letterSpacing: '-0.05px',
                textDecoration: 'none', display: 'inline-block',
              })}>
                {isAdmin ? `⚙ ${label}` : label}
              </NavLink>
            )
          })}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {demoMode ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(251,191,36,0.12)', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(251,191,36,0.3)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }} />
                <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600, letterSpacing: '0.3px' }}>DEMO MODE</span>
              </div>
              <button onClick={toggle} style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-md)', padding: '4px 10px', color: 'var(--color-ink-subtle)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
                {lang === 'ro' ? 'EN' : 'RO'}
              </button>
              <button onClick={() => { exitDemo(); navigate('/login') }} style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-md)', padding: '4px 10px', color: 'var(--color-ink-subtle)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-text)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-subtle)')}>
                ✕ Exit Demo
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(39,166,68,0.1)', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(39,166,68,0.2)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)' }} />
                <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 500 }}>{t.status.active}</span>
              </div>
              <button onClick={toggle} style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-md)', padding: '4px 10px', color: 'var(--color-ink-subtle)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
                {lang === 'ro' ? 'EN' : 'RO'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderLeft: '1px solid var(--color-hairline)', paddingLeft: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-subtle)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name || session?.user.email}
                  </div>
                  {profile?.departament && (
                    <div style={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textAlign: 'right' }}>{profile.departament}</div>
                  )}
                </div>
                <button onClick={() => supabase.auth.signOut()} style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--radius-md)', padding: '4px 10px', color: 'var(--color-ink-subtle)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-text)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-subtle)')}>
                  {t.status.signOut}
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, padding: '24px 24px 48px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/subassemblies" element={<Subassemblies />} />
          <Route path="/blockages" element={<Blockages />} />
          <Route path="/pdca" element={<PDCA />} />
          <Route path="/daily-flow" element={<DailyFlow />} />
          <Route path="/kpi" element={<TeamKPI />} />
          {isAdmin && <Route path="/admin" element={<Admin />} />}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [profile, setProfile] = useState<Profile | null>(null)
  const demoMode = isDemoMode()

  useEffect(() => {
    if (demoMode) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [demoMode])

  async function loadProfile(userId: string) {
    const client = supabaseAdmin ?? supabase
    const { data, error } = await client.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data as Profile)
    else if (error) console.error('Profile load failed:', error.message)
  }

  if (demoMode) {
    return <AppShell session={null} profile={null} />
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--color-hairline)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return <AppShell session={session} profile={profile} />
}
