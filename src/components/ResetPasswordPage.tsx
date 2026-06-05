import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { supabase } from '../lib/supabase'
import { ActionButton, AppField, Card, Stack } from './Ui'

export default function ResetPasswordPage({ onDone }: { onDone?: () => void } = {}) {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Parolele nu coincid / Passwords do not match'); return }
    if (password.length < 6) { setError('Parola trebuie să aibă cel puțin 6 caractere / Password must be at least 6 characters'); return }
    setSaving(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => { onDone?.(); navigate('/', { replace: true }) }, 2500)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400, p: '32px 28px' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontFamily: 'var(--font-display)' }}>
          Setează parolă nouă
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-ink-subtle)', mb: 3, fontSize: 13 }}>
          Set new password
        </Typography>

        {done ? (
          <Stack alignItems="center" gap={2}>
            <Typography sx={{ color: '#4ade80', fontWeight: 600 }}>✅ Parolă actualizată! / Password updated!</Typography>
            <CircularProgress size={18} />
            <Typography sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>Redirecționare... / Redirecting...</Typography>
          </Stack>
        ) : (
          <Stack component="form" onSubmit={handleSubmit} gap={2}>
            <AppField
              label="Parolă nouă / New password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <AppField
              label="Confirmă parola / Confirm password"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            {error && (
              <Typography sx={{ fontSize: 12, color: '#f87171', bgcolor: 'rgba(239,68,68,0.08)', p: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </Typography>
            )}
            <ActionButton type="submit" disabled={saving} sx={{ mt: 0.5 }}>
              {saving ? 'Se salvează...' : 'Salvează parola / Save password'}
            </ActionButton>
          </Stack>
        )}
      </Card>
    </Box>
  )
}
