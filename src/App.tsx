import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
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

function NavButton({ path, label, admin }: { path: string; label: string; admin: boolean }) {
  return (
    <Button
      component={NavLink}
      to={path}
      sx={{
        px: 1.5,
        py: 0.75,
        minWidth: 0,
        borderRadius: 'var(--radius-md)',
        fontSize: 13,
        fontFamily: 'var(--font-text)',
        letterSpacing: 0,
        textTransform: 'none',
        whiteSpace: 'nowrap',
        color: admin ? '#5e6ad2' : 'var(--color-ink-subtle)',
        '&.active': {
          bgcolor: 'var(--color-surface-2)',
          color: admin ? '#818cf8' : 'var(--color-ink)',
          fontWeight: 500,
        },
        '&:hover': { bgcolor: 'var(--color-surface-2)' },
      }}
    >
      {admin ? `âš™ ${label}` : label}
    </Button>
  )
}

function SmallButton({ children, onClick, mono }: { children: ReactNode; onClick: () => void; mono?: boolean }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        px: 1.25,
        py: 0.5,
        minWidth: 0,
        bgcolor: 'var(--color-surface-1)',
        borderColor: 'var(--color-hairline)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-ink-subtle)',
        fontSize: 12,
        fontWeight: mono ? 600 : 500,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-text)',
        letterSpacing: mono ? 0.5 : 0,
        textTransform: 'none',
        '&:hover': { color: 'var(--color-ink)', borderColor: 'var(--color-hairline-strong)', bgcolor: 'var(--color-surface-2)' },
      }}
    >
      {children}
    </Button>
  )
}

function StatusPill({ demo, label }: { demo?: boolean; label: string }) {
  const color = demo ? '#fbbf24' : '#4ade80'
  return (
    <Stack direction="row" alignItems="center" gap={0.75} sx={{ p: '4px 10px', bgcolor: demo ? 'rgba(251,191,36,0.12)' : 'rgba(39,166,68,0.1)', borderRadius: 'var(--radius-pill)', border: `1px solid ${demo ? 'rgba(251,191,36,0.3)' : 'rgba(39,166,68,0.2)'}` }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: demo ? '#fbbf24' : 'var(--color-success)' }} />
      <Typography variant="body2" sx={{ fontSize: 11, color, fontWeight: demo ? 600 : 500, letterSpacing: demo ? 0.3 : 0 }}>
        {label}
      </Typography>
    </Stack>
  )
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
    <Stack sx={{ minHeight: '100vh', bgcolor: 'var(--color-canvas)' }}>
      <Box
        component="nav"
        sx={{
          height: 56,
          bgcolor: 'var(--color-canvas)',
          borderBottom: '1px solid var(--color-hairline)',
          display: 'flex',
          alignItems: 'center',
          px: 3,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Box component={NavLink} to="/dashboard" sx={{ display: 'flex', alignItems: 'center', mr: 4, flexShrink: 0, textDecoration: 'none' }}>
          <Box component="img" src="/wpt symbol-02.png" alt="Waste Powertech" sx={{ height: 'clamp(28px, 2.5vw, 38px)', width: 'auto', display: 'block' }} />
        </Box>

        <Stack direction="row" alignItems="center" gap={0.25} sx={{ flex: 1 }}>
          {routes.map(({ path, label }) => <NavButton key={path} path={path} label={label} admin={path === '/admin'} />)}
        </Stack>

        <Stack direction="row" alignItems="center" gap={1.25} sx={{ flexShrink: 0 }}>
          {demoMode ? (
            <>
              <StatusPill demo label="DEMO MODE" />
              <SmallButton onClick={toggle} mono>{lang === 'ro' ? 'EN' : 'RO'}</SmallButton>
              <SmallButton onClick={() => { exitDemo(); navigate('/login') }}>âœ• Exit Demo</SmallButton>
            </>
          ) : (
            <>
              <StatusPill label={t.status.active} />
              <SmallButton onClick={toggle} mono>{lang === 'ro' ? 'EN' : 'RO'}</SmallButton>
              <Stack direction="row" alignItems="center" gap={1} sx={{ borderLeft: '1px solid var(--color-hairline)', pl: 1.25 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name || session?.user.email}
                  </Typography>
                  {profile?.departament && <Typography variant="body2" sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textAlign: 'right' }}>{profile.departament}</Typography>}
                </Box>
                <SmallButton onClick={() => supabase.auth.signOut()}>{t.status.signOut}</SmallButton>
              </Stack>
            </>
          )}
        </Stack>
      </Box>

      <Box component="main" sx={{ flex: 1, p: '24px 24px 48px', maxWidth: 1400, width: '100%', mx: 'auto' }}>
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
      </Box>
    </Stack>
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

  if (demoMode) return <AppShell session={null} profile={null} />

  if (session === undefined) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Box>
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
