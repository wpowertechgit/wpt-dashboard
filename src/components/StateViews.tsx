import { Box, TableCell, TableRow, Typography } from './Ui'

export function LoadingRows({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3].map(i => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <Box
                sx={{
                  height: 14,
                  bgcolor: 'var(--color-surface-3)',
                  borderRadius: 'var(--radius-xs)',
                  width: j === 0 ? 80 : '70%',
                  animation: 'pulse 1.4s ease-in-out infinite',
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <Box
      sx={{
        p: '12px 16px',
        bgcolor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 'var(--radius-md)',
        color: '#f87171',
      }}
    >
      <Typography variant="body2" sx={{ fontSize: 13, color: 'inherit' }}>
        â›” {message}
      </Typography>
    </Box>
  )
}

export function EmptyState({ label }: { label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={99} sx={{ textAlign: 'center', p: 4, color: 'var(--color-ink-tertiary)', fontSize: 13 }}>
        {label}
      </TableCell>
    </TableRow>
  )
}
