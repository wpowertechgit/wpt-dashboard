import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { Backlight } from '@/registry/magicui/backlight'
import { supabase } from './lib/supabase'
import { useLang } from './lib/i18n'
import { isDemoMode, exitDemo } from './lib/demo'
import { logAuthEvent } from './lib/api'
import { PermissionsProvider, usePermissions } from './lib/permissionsContext'
import type { AppRole } from './lib/permissions'
import LoginPage from './components/LoginPage'
import ResetPasswordPage from './components/ResetPasswordPage'
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
import { LanguageFlag } from './components/Ui'
import NotificationBell from './components/NotificationBell'
import DotField from './components/ui/DotField'
import { FoldPanels } from './components/PageTransition'
import type { FoldPhase } from './components/PageTransition'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: AppRole
  departament: string | null
  avatar_url: string | null
}

function AdminDropdown({ items }: { items: { path: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const isActive = items.some(i => location.pathname === i.path)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <Box ref={ref} sx={{ position: 'relative' }}>
      <Button
        onClick={() => setOpen(o => !o)}
        sx={{
          px: 1.5, py: 0.75, minWidth: 0, borderRadius: 'var(--radius-md)',
          fontSize: 13, fontFamily: 'var(--font-text)', letterSpacing: 0,
          textTransform: 'none', whiteSpace: 'nowrap',
          color: isActive || open ? '#818cf8' : '#5e6ad2',
          bgcolor: isActive || open ? 'var(--color-surface-2)' : 'transparent',
          fontWeight: isActive ? 500 : 400,
          '&:hover': { bgcolor: 'var(--color-surface-2)' },
        }}
      >
        ⚙ Admin {open ? '▲' : '▼'}
      </Button>

      {open && (
        <Box sx={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          minWidth: 160, bgcolor: 'var(--color-surface-1)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 200, overflow: 'hidden',
          py: 0.5,
        }}>
          {items.map(({ path, label }) => (
            <Box
              key={path}
              component={NavLink}
              to={path}
              onClick={() => setOpen(false)}
              sx={{
                display: 'block', px: 2, py: '8px',
                fontSize: 13, fontFamily: 'var(--font-text)',
                color: location.pathname === path ? '#818cf8' : 'var(--color-ink-subtle)',
                fontWeight: location.pathname === path ? 600 : 400,
                bgcolor: location.pathname === path ? 'rgba(99,102,241,0.08)' : 'transparent',
                textDecoration: 'none',
                '&:hover': { bgcolor: 'var(--color-surface-2)', color: 'var(--color-ink)' },
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
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

const NAV_ICONS: Record<string, ComponentType<{ sx?: object }>> = {
  '/dashboard': HomeOutlinedIcon,
  '/projects': FolderOutlinedIcon,
  '/subassemblies': BuildOutlinedIcon,
  '/planning': CalendarTodayOutlinedIcon,
  '/blockages': ReportProblemOutlinedIcon,
  '/pdca': RepeatOutlinedIcon,
  '/daily-flow': TrendingUpOutlinedIcon,
  '/kpi': BarChartOutlinedIcon,
  '/tasks': AssignmentOutlinedIcon,
  '/inventory': StorageOutlinedIcon,
  '/logs': BarChartOutlinedIcon,
  '/reports': BarChartOutlinedIcon,
  '/admin': SettingsOutlinedIcon,
  '/profile': SettingsOutlinedIcon,
}

function MobileShell({ profile, demoMode, onExitDemo }: { profile: Profile | null; demoMode: boolean; onExitDemo: () => void }) {
  const [open, setOpen] = useState(false)
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const { hasPermission } = usePermissions()
  const canViewCalendar = hasPermission('view_planning') || hasPermission('view_tasks')

  const navItems = [
    hasPermission('view_dashboard') && { path: '/dashboard', label: t.nav.dashboard },
    hasPermission('view_projects') && { path: '/projects', label: t.nav.proiecte },
    hasPermission('view_subassemblies') && { path: '/subassemblies', label: t.nav.subansambluri },
    canViewCalendar && { path: '/planning', label: t.nav.planning },
    hasPermission('view_blockages') && { path: '/blockages', label: t.nav.blocaje },
    hasPermission('view_pdca') && { path: '/pdca', label: t.nav.pdca },
    hasPermission('view_daily_flow') && { path: '/daily-flow', label: t.nav.flux },
    hasPermission('view_kpi') && { path: '/kpi', label: t.nav.kpi },
    hasPermission('view_tasks') && { path: '/tasks', label: t.nav.tasks },
    hasPermission('view_inventory') && { path: '/inventory', label: t.nav.inventory },
    hasPermission('view_logs') && { path: '/logs', label: t.nav.logs, admin: true },
    hasPermission('view_reports') && { path: '/reports', label: 'Reports', admin: true },
    hasPermission('manage_users') && { path: '/admin', label: t.nav.admin, admin: true },
    { path: '/profile', label: 'My Profile' },
  ].filter(Boolean) as { path: string; label: string; admin?: boolean }[]

  const defaultPath = navItems[0]?.path ?? '/login'

  return (
    <>
      {/* Sticky mobile / tablet header */}
      <Box
        component="header"
        sx={{
          display: { xs: 'flex', lg: 'none' },
          height: 52,
          alignItems: 'center',
          px: 1.5,
          gap: 1,
          bgcolor: 'var(--color-canvas)',
          borderBottom: '1px solid var(--color-hairline)',
          position: 'sticky',
          top: 0,
          zIndex: 200,
        }}
      >
        <IconButton onClick={() => setOpen(true)} size="small" sx={{ color: 'var(--color-ink-subtle)', flexShrink: 0 }}>
          <MenuIcon />
        </IconButton>
        <Box component={NavLink} to={defaultPath} sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0, ml: 0.5 }}>
          <Backlight blur={6} animationDuration={5000}>
            <Box component="img" src="/wpt symbol-02-f.png" alt="WPT" sx={{ height: 26, width: 'auto', display: 'block' }} />
          </Backlight>
        </Box>
        <Typography sx={{ flex: 1, fontSize: 12, color: 'var(--color-ink-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ml: 0.5 }}>
          {profile?.full_name || profile?.email || (demoMode ? 'Demo' : '')}
        </Typography>
        <SmallButton onClick={toggle}><LanguageFlag code={lang === 'ro' ? 'en' : 'ro'} /></SmallButton>
        {!demoMode && <NotificationBell userId={profile?.id ?? null} />}
        {demoMode
          ? <SmallButton onClick={() => { onExitDemo(); navigate('/login', { replace: true }) }}>✕</SmallButton>
          : <SmallButton onClick={() => supabase.auth.signOut().then(() => navigate('/', { replace: true }))}>{t.status.signOut}</SmallButton>
        }
      </Box>

      {/* Slide-out drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'var(--color-canvas)',
            backgroundImage: 'none',
            borderRight: '1px solid var(--color-hairline)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Drawer header */}
        <Box sx={{ p: '16px 20px 12px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Backlight blur={6} animationDuration={5000}>
            <Box component="img" src="/wpt symbol-02.png" alt="WPT" sx={{ height: 28, width: 'auto' }} />
          </Backlight>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
              {profile?.full_name || 'WPT Dashboard'}
            </Typography>
            {profile?.departament && (
              <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)' }}>{profile.departament}</Typography>
            )}
          </Box>
        </Box>

        {/* Nav items */}
        <List sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
          {navItems.map(({ path, label, admin }) => {
            const Icon = NAV_ICONS[path]
            const isActive = location.pathname === path
            const activeColor = admin ? '#818cf8' : 'var(--color-primary)'
            return (
              <ListItemButton
                key={path}
                component={NavLink}
                to={path}
                onClick={() => setOpen(false)}
                sx={{
                  mx: 1,
                  mb: 0.25,
                  borderRadius: 'var(--radius-md)',
                  bgcolor: isActive ? 'var(--color-surface-2)' : 'transparent',
                  color: isActive ? activeColor : 'var(--color-ink-subtle)',
                  '&:hover': { bgcolor: 'var(--color-surface-2)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  {Icon && <Icon sx={{ fontSize: 20 }} />}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { sx: { fontSize: 14, fontWeight: isActive ? 600 : 400, color: 'inherit', fontFamily: 'var(--font-text)' } } }}
                />
              </ListItemButton>
            )
          })}
        </List>

        {/* Drawer footer */}
        <Box sx={{ borderTop: '1px solid var(--color-hairline)', p: 2 }}>
          <Stack direction="row" gap={1}>
            <SmallButton onClick={toggle}><LanguageFlag code={lang === 'ro' ? 'en' : 'ro'} /></SmallButton>
            {demoMode
              ? <SmallButton onClick={() => { onExitDemo(); setOpen(false); navigate('/login', { replace: true }) }}>✕ Exit Demo</SmallButton>
              : <SmallButton onClick={() => supabase.auth.signOut().then(() => navigate('/', { replace: true }))}>{t.status.signOut}</SmallButton>
            }
          </Stack>
        </Box>
      </Drawer>
    </>
  )
}

function AppNav({ profile, demoMode, onExitDemo }: { profile: Profile | null; demoMode: boolean; onExitDemo: () => void }) {
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const canViewCalendar = hasPermission('view_planning') || hasPermission('view_tasks')

  const navItems = [
    hasPermission('view_dashboard') && { path: '/dashboard', label: t.nav.dashboard },
    hasPermission('view_projects') && { path: '/projects', label: t.nav.proiecte },
    hasPermission('view_subassemblies') && { path: '/subassemblies', label: t.nav.subansambluri },
    canViewCalendar && { path: '/planning', label: t.nav.planning },
    hasPermission('view_blockages') && { path: '/blockages', label: t.nav.blocaje },
    hasPermission('view_pdca') && { path: '/pdca', label: t.nav.pdca },
    hasPermission('view_daily_flow') && { path: '/daily-flow', label: t.nav.flux },
    hasPermission('view_kpi') && { path: '/kpi', label: t.nav.kpi },
    hasPermission('view_tasks') && { path: '/tasks', label: t.nav.tasks },
    hasPermission('view_inventory') && { path: '/inventory', label: t.nav.inventory },
  ].filter(Boolean) as { path: string; label: string }[]

  const defaultPath = navItems[0]?.path ?? '/login'

  return (
    <Box
      component="nav"
      sx={{
        height: 56,
        bgcolor: 'var(--color-canvas)',
        borderBottom: '1px solid var(--color-hairline)',
        display: { xs: 'none', lg: 'flex' },
        alignItems: 'center',
        px: 3,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Box component={NavLink} to={defaultPath} sx={{ display: 'flex', alignItems: 'center', mr: 4, flexShrink: 0, textDecoration: 'none' }}>
        <Backlight blur={8} animationDuration={5000}>
          <Box component="img" src="/wpt symbol-02-f.png" alt="Waste Powertech" sx={{ height: 'clamp(28px, 2.5vw, 38px)', width: 'auto', display: 'block' }} />
        </Backlight>
      </Box>

      <Stack direction="row" alignItems="center" gap={0.25} sx={{ flex: 1, overflow: 'hidden' }}>
        {navItems.map(({ path, label }) => (
          <NavButton key={path} path={path} label={label} />
        ))}
      </Stack>

      <Stack direction="row" alignItems="center" gap={1.25} sx={{ flexShrink: 0 }}>
        {(hasPermission('view_logs') || hasPermission('view_reports') || hasPermission('manage_users')) && (
          <AdminDropdown items={[
            ...(hasPermission('view_logs') ? [{ path: '/logs', label: t.nav.logs }] : []),
            ...(hasPermission('view_reports') ? [{ path: '/reports', label: 'Reports' }] : []),
            ...(hasPermission('manage_users') ? [{ path: '/admin', label: t.nav.admin }] : []),
          ]} />
        )}
        {demoMode ? (
          <>
            <StatusPill demo label="DEMO MODE" />
            <SmallButton onClick={toggle}><LanguageFlag code={lang === 'ro' ? 'en' : 'ro'} /></SmallButton>
            <SmallButton onClick={() => { onExitDemo(); navigate('/login', { replace: true }) }}>✕ Exit Demo</SmallButton>
          </>
        ) : (
          <>
            <SmallButton onClick={toggle}><LanguageFlag code={lang === 'ro' ? 'en' : 'ro'} /></SmallButton>
            <NotificationBell userId={profile?.id ?? null} />
            <Stack direction="row" alignItems="center" gap={1} sx={{ borderLeft: '1px solid var(--color-hairline)', pl: 1.25 }}>
              <Box
                component={NavLink}
                to="/profile"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', px: 0.75, py: 0.25, '&:hover': { bgcolor: 'var(--color-surface-2)' } }}
              >
                <Box
                  component="img"
                  src={profile?.avatar_url || '/user.png'}
                  alt="avatar"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/user.png' }}
                  sx={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-hairline)', flexShrink: 0 }}
                />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name || profile?.email}
                  </Typography>
                  {profile?.departament && <Typography variant="body2" sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textAlign: 'right' }}>{profile.departament}</Typography>}
                </Box>
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
          <AppNav profile={profile} demoMode={demoMode} onExitDemo={onExitDemo} />
          <MobileShell profile={profile} demoMode={demoMode} onExitDemo={onExitDemo} />

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
