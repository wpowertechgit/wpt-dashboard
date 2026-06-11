import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/material'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { usePermissions } from '@/lib/permissionsContext'
import { LanguageFlag } from '@/components/Ui'
import NotificationBell from '@/components/NotificationBell'
import { Backlight } from '@/registry/magicui/backlight'
import { SmallButton, type Profile } from './NavbarShared'

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

export default function NavbarDesktop({ profile, demoMode, onExitDemo }: { profile: Profile | null; demoMode: boolean; onExitDemo: () => void }) {
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
            ...(hasPermission('view_reports') ? [{ path: '/reports', label: 'Cloudflare Reports' }] : []),
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
