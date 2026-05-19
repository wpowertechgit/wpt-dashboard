import { useState } from 'react'
import { enterDemo } from '../lib/demo'
import { useLang } from '../lib/i18n'
import { supabase } from '../lib/supabase'
import { ActionButton, AppField, Box, Card, LanguageFlag, Stack, Typography } from './Ui'

export default function LoginPage() {
  const { t, lang, toggle } = useLang()
  const s = t.login
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
      <Stack gap={2} sx={{ width: '100%', maxWidth: 560 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ActionButton
            variant="outlined"
            onClick={toggle}
            sx={{ minWidth: 0, px: 1.25, py: 0.5, fontSize: 12, fontWeight: 600 }}
          >
            <LanguageFlag code={lang === 'ro' ? 'en' : 'ro'} />
          </ActionButton>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="video"
            src="/logo-animated-2.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Waste Powertech"
            sx={{ width: 'clamp(420px, 46vw, 560px)', height: 'clamp(92px, 10vw, 120px)', objectFit: 'fill', mx: 'auto', mb: 3.5, display: 'block' }}
          />
          <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--color-ink-subtle)' }}>
            {s.oms}
          </Typography>
        </Box>

        <Card sx={{ width: '100%', maxWidth: 400, mx: 'auto', p: 4 }}>
          <Typography variant="h5" fontWeight={600} sx={{ fontSize: 18, color: 'var(--color-ink)', mb: 0.75, letterSpacing: 0, fontFamily: 'var(--font-display)' }}>
            {s.title}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 13, color: 'var(--color-ink-subtle)', mb: 3 }}>
            {s.subtitle}
          </Typography>

          <Stack component="form" onSubmit={handleSubmit} gap={1.75}>
            <AppField
              label={s.email}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={s.emailPlaceholder}
              required
            />
            <AppField
              label={s.password}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={s.passwordPlaceholder}
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
              {loading ? s.submitting : s.submit}
            </ActionButton>
          </Stack>
        </Card>

        <ActionButton
          variant="outlined"
          onClick={handleDemo}
          sx={{
            width: '100%',
            maxWidth: 400,
            mx: 'auto',
            bgcolor: 'transparent',
            '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', bgcolor: 'transparent' },
          }}
        >
          {s.demo}
        </ActionButton>
      </Stack>
    </Box>
  )
}
