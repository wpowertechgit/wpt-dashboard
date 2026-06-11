import type { ReactNode } from 'react'
import { Button } from '@mui/material'
import type { AppRole } from '@/lib/permissions'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: AppRole
  departament: string | null
  avatar_url: string | null
}

export function SmallButton({ children, onClick, mono }: { children: ReactNode; onClick: () => void; mono?: boolean }) {
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
