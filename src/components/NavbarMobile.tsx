import type { ComponentType } from 'react'
import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
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
import { FaCloudflare } from 'react-icons/fa'
import { CiViewList } from 'react-icons/ci'
import { FaCircleUser } from 'react-icons/fa6'
import { Backlight } from '@/registry/magicui/backlight'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { usePermissions } from '@/lib/permissionsContext'
import { LanguageFlag } from '@/components/Ui'
import NotificationBell from '@/components/NotificationBell'
import { SmallButton, type Profile } from './NavbarShared'

const NAV_ICONS: Record<string, ComponentType<{ className?: string }>> = {
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
  '/logs': CiViewList,
  '/reports': FaCloudflare,
  '/admin': SettingsOutlinedIcon,
  '/profile': FaCircleUser,
}

export default function NavbarMobile({ profile, demoMode, onExitDemo }: { profile: Profile | null; demoMode: boolean; onExitDemo: () => void }) {
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
    hasPermission('view_reports') && { path: '/reports', label: 'Cloudflare Reports', admin: true },
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
                  {Icon && <Box component={Icon} sx={{ fontSize: 20, display: 'block' }} />}
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
