import type { ReactNode } from 'react'
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import type { ButtonProps, ChipProps, SxProps, TextFieldProps, Theme } from '@mui/material'

export type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'default'

export function Badge({ children, tone = 'default', sx }: { children: ReactNode; tone?: BadgeTone; sx?: SxProps<Theme> }) {
  return (
    <Chip
      size="small"
      label={children}
      color={tone as ChipProps['color']}
      sx={{
        bgcolor:
          tone === 'default'
            ? 'var(--color-surface-2)'
            : tone === 'success'
              ? 'rgba(39,166,68,0.12)'
              : tone === 'warning'
                ? 'rgba(245,158,11,0.12)'
                : tone === 'error'
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(94,106,210,0.12)',
        color:
          tone === 'default'
            ? 'var(--color-ink-muted)'
            : tone === 'success'
              ? '#4ade80'
              : tone === 'warning'
                ? '#fbbf24'
                : tone === 'error'
                  ? '#f87171'
                  : '#818cf8',
        '& .MuiChip-label': { px: 1 },
        ...sx,
      }}
    />
  )
}

export function Card({ children, sx }: { children?: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 'var(--radius-lg)', p: 3, ...sx }}>
      {children}
    </Paper>
  )
}

export function Eyebrow({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Typography
      variant="overline"
      sx={{ display: 'block', color: 'var(--color-ink-subtle)', lineHeight: 1.35, letterSpacing: 0.4, ...sx }}
    >
      {children}
    </Typography>
  )
}

export function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow: ReactNode; title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <Stack direction="row" alignItems="flex-end" justifyContent="space-between" gap={2}>
      <Box>
        <Eyebrow sx={{ mb: 0.75 }}>{eyebrow}</Eyebrow>
        <Typography variant="h4" fontWeight={600} sx={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 0 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'var(--color-ink-subtle)', mt: 0.5, fontSize: 13 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  )
}

export function ActionButton(props: ButtonProps) {
  return (
    <Button
      {...props}
      variant={props.variant ?? 'contained'}
      sx={{
        px: 2,
        py: 1,
        fontSize: 13,
        fontWeight: 500,
        color: props.variant === 'outlined' ? 'var(--color-ink-subtle)' : 'var(--color-on-primary)',
        bgcolor: props.variant === 'outlined' ? 'var(--color-surface-2)' : 'var(--color-primary)',
        borderColor: 'var(--color-hairline)',
        '&:hover': {
          bgcolor: props.variant === 'outlined' ? 'var(--color-surface-3)' : 'var(--color-primary-hover)',
          borderColor: props.variant === 'outlined' ? 'var(--color-hairline-strong)' : 'transparent',
        },
        ...props.sx,
      }}
    />
  )
}

export function AppField(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      size="small"
      variant="outlined"
      slotProps={{
        ...props.slotProps,
        inputLabel: {
          shrink: true,
          ...props.slotProps?.inputLabel,
        },
      }}
      sx={{
        width: '100%',
        '& .MuiInputBase-root': {
          bgcolor: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-ink)',
          fontSize: 13,
          fontFamily: 'var(--font-text)',
        },
        '& .MuiInputBase-input': { py: 0.75, px: 1.25 },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-hairline)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-hairline-strong)' },
        '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-primary)' },
        '& .MuiInputLabel-root': {
          color: 'var(--color-ink-subtle)',
          fontSize: 11,
          fontWeight: 500,
          transform: 'none',
          position: 'static',
          mb: 0.5,
        },
        ...props.sx,
      }}
    />
  )
}

export function AppSelect({ options, ...props }: TextFieldProps & { options: Array<string | { value: string; label: ReactNode }> }) {
  return (
    <AppField select {...props}>
      {options.map(option => {
        const value = typeof option === 'string' ? option : option.value
        const label = typeof option === 'string' ? option : option.label
        return (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        )
      })}
    </AppField>
  )
}

export function DataTable({ head, children, sx }: { head?: ReactNode; children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <TableContainer component={Box} sx={sx}>
      <Table size="small">
        {head && <TableHead>{head}</TableHead>}
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  )
}

export { Box, Stack, TableCell, TableRow, Typography }
