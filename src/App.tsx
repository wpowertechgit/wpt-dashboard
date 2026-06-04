import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { supabase } from './lib/supabase'
import { useLang } from './lib/i18n'
import { isDemoMode, exitDemo } from './lib/demo'
import { PermissionsProvider, usePermissions } from './lib/permissionsContext'
import type { AppRole } from './lib/permissions'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import Subassemblies from './components/Subassemblies'
import Blockages from './components/Blockages'
import PDCA from './components/PDCA'
import DailyFlow from './components/DailyFlow'
import TeamKPI from './components/TeamKPI'
import Projects from './components/Projects'
import Admin from './components/Admin'
import PlanningCalendar from './components/PlanningCalendar'
import TaskBoard from './components/TaskBoard'
import Inventory from './components/Inventory'
import { LanguageFlag } from './components/Ui'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: AppRole
  departament: string | null
}

function NavButton({ path, label, admin }: { path: string; label: string; admin?: boolean }) {
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
      {admin ? `⚙ ${label}` : label}
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

function AppNav({ profile, demoMode, onExitDemo }: { profile: Profile | null; demoMode: boolean; onExitDemo: () => void }) {
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const canViewCalendar = hasPermission('view_planning') || hasPermission('view_tasks')

  const navItems = [
    hasPermission('view_dashboard')      && { path: '/dashboard',   label: t.nav.dashboard },
    hasPermission('view_projects')       && { path: '/projects',    label: t.nav.proiecte },
    hasPermission('view_subassemblies')  && { path: '/subassemblies', label: t.nav.subansambluri },
    canViewCalendar                      && { path: '/planning',    label: t.nav.planning },
    hasPermission('view_blockages')      && { path: '/blockages',   label: t.nav.blocaje },
    hasPermission('view_pdca')           && { path: '/pdca',        label: t.nav.pdca },
    hasPermission('view_daily_flow')     && { path: '/daily-flow',  label: t.nav.flux },
    hasPermission('view_kpi')            && { path: '/kpi',         label: t.nav.kpi },
    hasPermission('view_tasks')          && { path: '/tasks',       label: t.nav.tasks },
    hasPermission('view_inventory')      && { path: '/inventory',   label: t.nav.inventory },
  ].filter(Boolean) as { path: string; label: string }[]

  const defaultPath = navItems[0]?.path ?? '/login'

  return (
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
      <Box component={NavLink} to={defaultPath} sx={{ display: 'flex', alignItems: 'center', mr: 4, flexShrink: 0, textDecoration: 'none' }}>
        <Box component="img" src="/wpt symbol-02.png" alt="Waste Powertech" sx={{ height: 'clamp(28px, 2.5vw, 38px)', width: 'auto', display: 'block' }} />
      </Box>

      <Stack direction="row" alignItems="center" gap={0.25} sx={{ flex: 1, overflowX: 'auto' }}>
        {navItems.map(({ path, label }) => (
          <NavButton key={path} path={path} label={label} />
        ))}
        {hasPermission('manage_users') && (
          <NavButton path="/admin" label={t.nav.admin} admin />
        )}
      </Stack>

      <Stack direction="row" alignItems="center" gap={1.25} sx={{ flexShrink: 0 }}>
        {demoMode ? (
          <>
            <StatusPill demo label="DEMO MODE" />
            <SmallButton onClick={toggle}><LanguageFlag code={lang === 'ro' ? 'en' : 'ro'} /></SmallButton>
            <SmallButton onClick={() => { onExitDemo(); navigate('/login', { replace: true }) }}>✕ Exit Demo</SmallButton>
          </>
        ) : (
          <>
            <StatusPill label={t.status.active} />
            <SmallButton onClick={toggle}><LanguageFlag code={lang === 'ro' ? 'en' : 'ro'} /></SmallButton>
            <Stack direction="row" alignItems="center" gap={1} sx={{ borderLeft: '1px solid var(--color-hairline)', pl: 1.25 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name || profile?.email}
                </Typography>
                {profile?.departament && <Typography variant="body2" sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textAlign: 'right' }}>{profile.departament}</Typography>}
              </Box>
              <SmallButton onClick={() => supabase.auth.signOut().then(() => navigate('/', { replace: true }))}>{t.status.signOut}</SmallButton>
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  )
}

const ORDERED_ROUTES = [
  { perm: 'view_dashboard',     path: '/dashboard' },
  { perm: 'view_tasks',         path: '/tasks' },
  { perm: 'view_inventory',     path: '/inventory' },
  { perm: 'view_projects',      path: '/projects' },
  { perm: 'view_subassemblies', path: '/subassemblies' },
  { perm: 'view_planning',      path: '/planning' },
  { perm: 'view_blockages',     path: '/blockages' },
  { perm: 'view_pdca',          path: '/pdca' },
  { perm: 'view_daily_flow',    path: '/daily-flow' },
  { perm: 'view_kpi',           path: '/kpi' },
] as const

function RootRedirect() {
  const { hasPermission, permissionsLoaded } = usePermissions()
  if (!permissionsLoaded) return null
  const first = ORDERED_ROUTES.find(r => hasPermission(r.perm))
  if (!first) return null  // profile loaded but no permissions yet — wait
  return <Navigate to={first.path} replace />
}

function PermGuard({ perm, children }: { perm: Parameters<ReturnType<typeof usePermissions>['hasPermission']>[0]; children: ReactNode }) {
  const { hasPermission, permissionsLoaded } = usePermissions()
  if (!permissionsLoaded) return null
  if (!hasPermission(perm)) return <RootRedirect />
  return <>{children}</>
}

function AnyPermGuard({ perms, children }: { perms: Parameters<ReturnType<typeof usePermissions>['hasPermission']>[0][]; children: ReactNode }) {
  const { hasPermission, permissionsLoaded } = usePermissions()
  if (!permissionsLoaded) return null
  if (!perms.some(perm => hasPermission(perm))) return <RootRedirect />
  return <>{children}</>
}

function AppShell({ session, profile, demoMode, onExitDemo }: { session: Session | null; profile: Profile | null; demoMode: boolean; onExitDemo: () => void }) {
  return (
    <PermissionsProvider role={profile?.role ?? null} userId={profile?.id ?? null} demoMode={demoMode}>
      <Stack sx={{ minHeight: '100vh', bgcolor: 'var(--color-canvas)' }}>
        <AppNav profile={profile} demoMode={demoMode} onExitDemo={onExitDemo} />

        <Box component="main" sx={{ flex: 1, p: '24px 24px 48px', maxWidth: 1400, width: '100%', mx: 'auto' }}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/dashboard"     element={<PermGuard perm="view_dashboard"><Dashboard userId={profile?.id} /></PermGuard>} />
            <Route path="/projects"      element={<PermGuard perm="view_projects"><Projects /></PermGuard>} />
            <Route path="/subassemblies" element={<PermGuard perm="view_subassemblies"><Subassemblies /></PermGuard>} />
            <Route path="/planning"      element={<AnyPermGuard perms={['view_planning', 'view_tasks']}><PlanningCalendar userId={profile?.id ?? null} /></AnyPermGuard>} />
            <Route path="/blockages"     element={<PermGuard perm="view_blockages"><Blockages /></PermGuard>} />
            <Route path="/pdca"          element={<PermGuard perm="view_pdca"><PDCA /></PermGuard>} />
            <Route path="/daily-flow"    element={<PermGuard perm="view_daily_flow"><DailyFlow /></PermGuard>} />
            <Route path="/kpi"           element={<PermGuard perm="view_kpi"><TeamKPI /></PermGuard>} />
            <Route path="/tasks"         element={<PermGuard perm="view_tasks"><TaskBoard userId={profile?.id ?? null} /></PermGuard>} />
            <Route path="/inventory"     element={<PermGuard perm="view_inventory"><Inventory userId={profile?.id ?? null} /></PermGuard>} />
            <Route path="/admin"         element={<PermGuard perm="manage_users"><Admin /></PermGuard>} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Stack>
    </PermissionsProvider>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [demoMode, setDemoMode] = useState<boolean>(() => isDemoMode())

  const handleExitDemo = useCallback(() => {
    exitDemo()
    setDemoMode(false)
  }, [])

  useEffect(() => {
    if (demoMode) return
    let active = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setSession(session)
      if (session?.user) loadProfile(session.user.id)
      else { setSession(null); setProfile(null) }  // null = definitively no profile
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [demoMode])

  async function loadProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data as Profile)
    else {
      if (error) console.error('Profile load failed:', error.message)
      setProfile(null)
    }
  }

  const spinner = (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress size={24} />
    </Box>
  )

  if (demoMode) return <AppShell session={null} profile={null} demoMode={demoMode} onExitDemo={handleExitDemo} />

  // Still resolving initial auth state
  if (session === undefined) return spinner

  // No session → login page
  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  // Session exists but profile not yet fetched
  if (profile === undefined) return spinner

  return <AppShell session={session} profile={profile} demoMode={demoMode} onExitDemo={handleExitDemo} />
}
