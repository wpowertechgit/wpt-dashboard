import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { enterDemo } from '../lib/demo'
import { ActionButton, AppField, Box, Card, Stack, Typography } from './Ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  function handleDemo() {
    enterDemo()
    window.location.reload()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'var(--color-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Stack gap={2} sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src="/wpt logo-02.png"
            alt="Waste Powertech"
            sx={{ height: 'clamp(72px, 10vw, 140px)', width: 'auto', mx: 'auto', mb: 3.5, display: 'block' }}
          />
          <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>
            OMS · Operational Management System
          </Typography>
        </Box>

        <Card sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600} sx={{ fontSize: 18, color: 'var(--color-ink)', mb: 0.75, letterSpacing: 0, fontFamily: 'var(--font-display)' }}>
            Autentificare
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--color-ink-subtle)', mb: 3 }}>
            Introduceți credențialele primite de la administrator.
          </Typography>

          <Stack component="form" onSubmit={handleSubmit} gap={1.75}>
            <AppField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nume@wpowertech.ro"
              required
            />
            <AppField
              label="Parolă"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <Box sx={{ bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', p: '8px 12px' }}>
                <Typography variant="body2" sx={{ fontSize: 12, color: '#f87171' }}>
                  {error}
                </Typography>
              </Box>
            )}

            <ActionButton type="submit" disabled={loading} sx={{ width: '100%', mt: 0.5, bgcolor: loading ? 'var(--color-surface-3)' : 'var(--color-primary)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Se procesează...' : 'Autentificare'}
            </ActionButton>
          </Stack>
        </Card>

        <ActionButton
          variant="outlined"
          onClick={handleDemo}
          sx={{
            width: '100%',
            bgcolor: 'transparent',
            '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', bgcolor: 'transparent' },
          }}
        >
          ▶ Demo version
        </ActionButton>
      </Stack>
    </Box>
  )
}
