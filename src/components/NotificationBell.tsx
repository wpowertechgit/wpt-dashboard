import { useState, useRef } from 'react'
import { Box, IconButton, Popover, Stack, Typography } from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import { useNotifications } from '../lib/notifications'

export default function NotificationBell({ userId }: { userId: string | null }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(userId)
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  if (!userId) return null

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <IconButton
          ref={anchorRef}
          onClick={() => setOpen(true)}
          size="small"
          sx={{ color: 'var(--color-ink-subtle)', '&:hover': { color: 'var(--color-ink)', bgcolor: 'var(--color-surface-2)' } }}
        >
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        {unreadCount > 0 && (
          <Box sx={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: '#f87171',
            border: '1.5px solid var(--color-canvas)',
            pointerEvents: 'none',
          }} />
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 320,
            bgcolor: 'var(--color-surface-1)',
            backgroundImage: 'none',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-md)',
            mt: 0.75,
            overflow: 'hidden',
          }
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between"
          sx={{ px: 2, py: 1.5, borderBottom: '1px solid var(--color-hairline)' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Typography>
          {unreadCount > 0 && (
            <Box onClick={markAllRead} sx={{ fontSize: 11, color: 'var(--color-primary)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Mark all read
            </Box>
          )}
        </Stack>

        <Box sx={{ overflowY: 'auto', maxHeight: 360 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>No notifications yet</Typography>
            </Box>
          ) : notifications.map(n => (
            <Box
              key={n.id}
              onClick={() => markRead(n.id)}
              sx={{
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                bgcolor: n.read ? 'transparent' : 'rgba(99,102,241,0.06)',
                borderBottom: '1px solid var(--color-hairline)',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bgcolor: 'var(--color-surface-2)' },
                display: 'flex',
                gap: 1.25,
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{
                width: 6, height: 6, borderRadius: '50%', mt: 0.75, flexShrink: 0,
                bgcolor: n.read ? 'transparent' : '#6366f1',
              }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, color: 'var(--color-ink-muted)', lineHeight: 1.4 }}>
                  {n.message}
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)', mt: 0.25 }}>
                  {new Date(n.created_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  )
}
