import { useState, useRef } from 'react'
import { Box, CircularProgress, Stack } from '@mui/material'
import { uploadAvatar, updateOwnProfile } from '../lib/api'
import { useLang } from '../lib/i18n'
import { ActionButton, AppField, Card, Eyebrow, PageTitle, Typography } from './Ui'
import { ErrorBanner } from './StateViews'

interface ProfileData {
  id: string
  email: string
  full_name: string | null
  departament: string | null
  avatar_url: string | null
}

interface Props {
  profile: ProfileData
  onUpdated: () => void
}

export default function ProfilePage({ profile, onUpdated }: Props) {
  const { t } = useLang()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [departament, setDepartament] = useState(profile.departament ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadAvatar(profile.id, file)
      setAvatarUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await updateOwnProfile(profile.id, {
        full_name: fullName.trim() || undefined,
        departament: departament.trim() || undefined,
        ...(avatarUrl !== profile.avatar_url ? { avatar_url: avatarUrl ?? undefined } : {}),
      })
      setSaved(true)
      onUpdated()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
    setSaving(false)
  }

  const displayAvatar = avatarUrl || '/user.png'

  return (
    <Stack gap={4} sx={{ maxWidth: 540 }}>
      <PageTitle eyebrow="Account" title="My Profile" subtitle="Edit your name, department and profile picture" />

      {error && <ErrorBanner message={error} />}

      <Card>
        <Eyebrow sx={{ mb: 3 }}>Profile Picture</Eyebrow>

        <Stack direction="row" alignItems="center" gap={3}>
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Box
              component="img"
              src={displayAvatar}
              alt="Avatar"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/user.png' }}
              sx={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-hairline)', display: 'block' }}
            />
            {uploading && (
              <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={20} sx={{ color: '#fff' }} />
              </Box>
            )}
          </Box>

          <Stack gap={1}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <ActionButton
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{ fontSize: 13 }}
            >
              {uploading ? 'Uploading…' : 'Upload Photo'}
            </ActionButton>
            <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)' }}>
              JPG, PNG or WebP · max 5 MB
            </Typography>
          </Stack>
        </Stack>
      </Card>

      <Card>
        <Eyebrow sx={{ mb: 3 }}>Personal Info</Eyebrow>

        <Stack gap={2}>
          <Box>
            <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', mb: 0.5 }}>
              Email
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>
              {profile.email}
            </Typography>
          </Box>

          <AppField
            label="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Your full name"
          />

          <AppField
            label="Department"
            value={departament}
            onChange={e => setDepartament(e.target.value)}
            placeholder="e.g. Production, Logistics…"
          />

          <Stack direction="row" gap={1.5} alignItems="center" sx={{ pt: 1 }}>
            <ActionButton onClick={handleSave} disabled={saving || uploading}>
              {saving ? t.common.saving : 'Save Changes'}
            </ActionButton>
            {saved && (
              <Typography sx={{ fontSize: 12, color: '#4ade80' }}>Saved!</Typography>
            )}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
