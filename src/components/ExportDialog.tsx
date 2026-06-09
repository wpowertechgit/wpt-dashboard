import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, ToggleButton, ToggleButtonGroup, Stack, Typography, CircularProgress, Box,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { type Dayjs } from 'dayjs'
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi'
import { daysAgoISO, todayISO } from '../lib/exportUtils'

interface ExportDialogProps {
  open: boolean
  title: string
  onClose: () => void
  onExport: (from: string, to: string, format: 'xlsx' | 'csv') => Promise<void>
}

export default function ExportDialog({ open, title, onClose, onExport }: ExportDialogProps) {
  const [from, setFrom] = useState<Dayjs | null>(dayjs(daysAgoISO(30)))
  const [to, setTo] = useState<Dayjs | null>(dayjs(todayISO()))
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    if (!from || !to) return
    setLoading(true)
    setError(null)
    try {
      await onExport(from.format('YYYY-MM-DD'), to.format('YYYY-MM-DD'), format)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (loading) return
    onClose()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 'var(--radius-md)', bgcolor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)' } }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid var(--color-hairline)' }}>
          <PiMicrosoftExcelLogoFill size={22} color="#1D6F42" />
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink)' }}>{title}</Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: '20px !important', pb: 1 }}>
          <Stack gap={2.5}>
            <Stack gap={1.5}>
              <Typography variant="body2" sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-subtle)' }}>
                Interval date
              </Typography>
              <Stack direction="row" gap={1.5}>
                <DatePicker
                  label="De la"
                  value={from}
                  onChange={setFrom}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  maxDate={to ?? undefined}
                />
                <DatePicker
                  label="Pana la"
                  value={to}
                  onChange={setTo}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  minDate={from ?? undefined}
                />
              </Stack>
            </Stack>

            <Stack gap={1}>
              <Typography variant="body2" sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-subtle)' }}>
                Format
              </Typography>
              <ToggleButtonGroup
                value={format}
                exclusive
                onChange={(_, v) => v && setFormat(v)}
                size="small"
                fullWidth
              >
                <ToggleButton value="xlsx" sx={{ gap: 0.75, fontSize: 12, fontWeight: 600 }}>
                  <PiMicrosoftExcelLogoFill size={16} color={format === 'xlsx' ? '#1D6F42' : undefined} />
                  Excel (.xlsx)
                </ToggleButton>
                <ToggleButton value="csv" sx={{ fontSize: 12, fontWeight: 600 }}>
                  CSV (raw)
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {error && (
              <Box sx={{ bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', p: '8px 12px' }}>
                <Typography variant="body2" sx={{ fontSize: 11, color: '#f87171' }}>{error}</Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, borderTop: '1px solid var(--color-hairline)', gap: 1 }}>
          <Button onClick={handleClose} disabled={loading} variant="outlined" size="small" sx={{ fontSize: 12 }}>
            Anulare
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading || !from || !to}
            variant="contained"
            size="small"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <PiMicrosoftExcelLogoFill size={15} />}
            sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#1D6F42', '&:hover': { bgcolor: '#155534' }, minWidth: 100 }}
          >
            {loading ? 'Se genereaza...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}
