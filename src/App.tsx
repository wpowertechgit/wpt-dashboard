import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { Box, CircularProgress, Stack } from '@mui/material'
import { supabase } from './lib/supabase'
import { isDemoMode, exitDemo } from './lib/demo'
import { logAuthEvent } from './lib/api'
import { PermissionsProvider, usePermissions } from './lib/permissionsContext'
import LoginPage from './components/LoginPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import NavbarDesktop from './components/NavbarDesktop'
import NavbarMobile from './components/NavbarMobile'
import type { Profile } from './components/NavbarShared'
const Dashboard = lazy(() => import('./components/Dashboard'))
const Subassemblies = lazy(() => import('./components/Subassemblies'))
const Blockages = lazy(() => import('./components/Blockages'))
const PDCA = lazy(() => import('./components/PDCA'))
const DailyFlow = lazy(() => import('./components/DailyFlow'))
const TeamKPI = lazy(() => import('./components/TeamKPI'))
const Projects = lazy(() => import('./components/Projects'))
const Admin = lazy(() => import('./components/Admin'))
const PlanningCalendar = lazy(() => import('./components/PlanningCalendar'))
const TaskBoard = lazy(() => import('./components/TaskBoard'))
const Inventory = lazy(() => import('./components/Inventory'))
const LogsPage = lazy(() => import('./components/Logs'))
const ReportsPage = lazy(() => import('./components/Reports'))
const ProfilePage = lazy(() => import('./components/Profile'))
import ActiveTasksPanel from './components/ActiveTasksPanel'
import DotField from './components/ui/DotField'
import { FoldPanels } from './components/PageTransition'
import type { FoldPhase } from './components/PageTransition'


const ORDERED_ROUTES = [
  { perm: 'view_dashboard', path: '/dashboard' },
  { perm: 'view_tasks', path: '/tasks' },
  { perm: 'view_inventory', path: '/inventory' },
  { perm: 'view_projects', path: '/projects' },
  { perm: 'view_subassemblies', path: '/subassemblies' },
  { perm: 'view_planning', path: '/planning' },
  { perm: 'view_blockages', path: '/blockages' },
  { perm: 'view_pdca', path: '/pdca' },
  { perm: 'view_daily_flow', path: '/daily-flow' },
  { perm: 'view_kpi', path: '/kpi' },
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


function AppShellInner({ session, profile, demoMode, onExitDemo, onProfileUpdated }: { session: Session | null; profile: Profile | null; demoMode: boolean; onExitDemo: () => void; onProfileUpdated: () => void }) {
  const canViewTasks = !demoMode && !!profile?.id
  const actualLocation = useLocation()
  const [displayLocation, setDisplayLocation] = useState(actualLocation)
  const [foldPhase, setFoldPhase] = useState<FoldPhase>('idle')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const displayLocationRef = useRef(displayLocation)
  const foldPhaseRef = useRef(foldPhase)
  const actualLocationRef = useRef(actualLocation)
  displayLocationRef.current = displayLocation
  foldPhaseRef.current = foldPhase
  actualLocationRef.current = actualLocation

  async function captureAndFold() {
    try {
      const { default: html2canvas } = await import('html2canvas')

      // Race capture against a 150 ms deadline.
      // scale: 0.15 → ~45× fewer pixels; stretched back to full size it looks
      // naturally blurry — quality loss is invisible behind the fold animation.
      const timeout = new Promise<null>(r => setTimeout(() => r(null), 600))
      const capture = html2canvas(document.documentElement, {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        scale: 0.15,
      })

      if (foldPhaseRef.current !== 'idle') return
      const result = await Promise.race([capture, timeout])
      setScreenshot(result ? result.toDataURL('image/jpeg', 0.5) : null)
      setFoldPhase('cover')
    } catch {
      setDisplayLocation(actualLocationRef.current)
    }
  }

  useEffect(() => {
    if (actualLocation.pathname === displayLocationRef.current.pathname) return
    if (foldPhaseRef.current !== 'idle') return

    const transitionsEnabled = false

    if (transitionsEnabled) {
      captureAndFold()
    } else {
      setDisplayLocation(actualLocation)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualLocation.pathname])

  function handleCoverDone() {
    setDisplayLocation(actualLocationRef.current)
    setFoldPhase('reveal')
  }

  function handleRevealDone() {
    setFoldPhase('idle')
    setScreenshot(null)
  }

  return (
    <Stack sx={{ minHeight: '100vh', bgcolor: 'var(--color-canvas)', position: 'relative' }}>
        <DotField
          dotRadius={2.5}
          dotSpacing={18}
          bulgeStrength={55}
          glowRadius={180}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={400}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="rgba(94, 106, 210, 0.22)"
          gradientTo="rgba(180, 151, 207, 0.14)"
          glowColor="#0d0b12"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' } as React.CSSProperties}
        />

        {/* z-index: 1 lifts all UI above the fixed DotField (z-index: 0 paints after normal flow) */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <NavbarDesktop profile={profile} demoMode={demoMode} onExitDemo={onExitDemo} />
          <NavbarMobile profile={profile} demoMode={demoMode} onExitDemo={onExitDemo} />

          <Box component="main" sx={{ flex: 1, p: { xs: '16px 12px 32px', md: '20px 20px 40px', lg: '24px 24px 48px' }, maxWidth: 1400, width: '100%', mx: 'auto' }}>
            <Suspense fallback={null}>
            <Routes location={displayLocation}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/dashboard" element={<PermGuard perm="view_dashboard"><Dashboard userId={profile?.id} /></PermGuard>} />
              <Route path="/projects" element={<PermGuard perm="view_projects"><Projects /></PermGuard>} />
              <Route path="/subassemblies" element={<PermGuard perm="view_subassemblies"><Subassemblies /></PermGuard>} />
              <Route path="/planning" element={<AnyPermGuard perms={['view_planning', 'view_tasks']}><PlanningCalendar userId={profile?.id ?? null} /></AnyPermGuard>} />
              <Route path="/blockages" element={<PermGuard perm="view_blockages"><Blockages /></PermGuard>} />
              <Route path="/pdca" element={<PermGuard perm="view_pdca"><PDCA /></PermGuard>} />
              <Route path="/daily-flow" element={<PermGuard perm="view_daily_flow"><DailyFlow /></PermGuard>} />
              <Route path="/kpi" element={<PermGuard perm="view_kpi"><TeamKPI /></PermGuard>} />
              <Route path="/tasks" element={<PermGuard perm="view_tasks"><TaskBoard userId={profile?.id ?? null} /></PermGuard>} />
              <Route path="/inventory" element={<PermGuard perm="view_inventory"><Inventory userId={profile?.id ?? null} /></PermGuard>} />
              <Route path="/logs" element={<PermGuard perm="view_logs"><LogsPage /></PermGuard>} />
              <Route path="/reports" element={<PermGuard perm="view_reports"><ReportsPage /></PermGuard>} />
              <Route path="/admin" element={<PermGuard perm="manage_users"><Admin /></PermGuard>} />
              <Route path="/profile" element={profile ? <ProfilePage profile={profile} onUpdated={onProfileUpdated} /> : null} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </Box>

          {canViewTasks && (
            <ActiveTasksPanel userId={profile!.id} />
          )}
        </Box>

        <FoldPanels phase={foldPhase} screenshot={screenshot} onCoverDone={handleCoverDone} onRevealDone={handleRevealDone} />
      </Stack>
  )
}

function AppShell({ session, profile, demoMode, onExitDemo, onProfileUpdated }: { session: Session | null; profile: Profile | null; demoMode: boolean; onExitDemo: () => void; onProfileUpdated: () => void }) {
  return (
    <PermissionsProvider role={profile?.role ?? null} userId={profile?.id ?? null} demoMode={demoMode}>
      <AppShellInner session={session} profile={profile} demoMode={demoMode} onExitDemo={onExitDemo} onProfileUpdated={onProfileUpdated} />
    </PermissionsProvider>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [demoMode, setDemoMode] = useState<boolean>(() => isDemoMode())
  const [isRecovery, setIsRecovery] = useState(false)

  const handleExitDemo = useCallback(() => {
    exitDemo()
    setDemoMode(false)
  }, [])

  const lastSessionRef = useRef<Session | null>(null)

  useEffect(() => {
    if (demoMode) return
    let active = true

    // Load the initial session directly — onAuthStateChange fires INITIAL_SESSION
    // only once per subscription, so in React StrictMode the second subscription
    // (after cleanup) never receives it and the user appears logged out on refresh.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      setSession(session)
      if (session?.user) {
        loadProfile(session.user.id)
        lastSessionRef.current = session
      } else {
        setSession(null)
        setProfile(null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      // INITIAL_SESSION is already handled by getSession() above
      if (event === 'INITIAL_SESSION') return
      if (event === 'PASSWORD_RECOVERY') { setIsRecovery(true); setSession(session); return }
      setIsRecovery(false)
      setSession(session)
      if (session?.user) {
        if (event === 'SIGNED_IN') {
          logAuthEvent('login', session.user.id, session.user.email ?? '')
        }
        loadProfile(session.user.id)
        lastSessionRef.current = session
      } else {
        if (event === 'SIGNED_OUT' && lastSessionRef.current?.user) {
          const u = lastSessionRef.current.user
          logAuthEvent('logout', u.id, u.email ?? '')
        }
        lastSessionRef.current = null
        setSession(null)
        setProfile(null)
      }
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

  if (demoMode) return <AppShell session={null} profile={null} demoMode={demoMode} onExitDemo={handleExitDemo} onProfileUpdated={() => { }} />

  // Still resolving initial auth state
  if (session === undefined) return spinner

  // Password recovery flow — show reset page regardless of auth state
  if (isRecovery) return <ResetPasswordPage onDone={() => setIsRecovery(false)} />

  // No session → login page (but allow /reset-password route for direct link access)
  if (!session) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  // Session exists but profile not yet fetched
  if (profile === undefined) return spinner

  return <AppShell session={session} profile={profile} demoMode={demoMode} onExitDemo={handleExitDemo} onProfileUpdated={() => profile && loadProfile(profile.id)} />
}
