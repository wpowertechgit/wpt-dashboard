import { useState, useCallback } from 'react'
import { Box, Stack, Typography, Checkbox, FormControlLabel, Divider, CircularProgress } from '@mui/material'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { createUserAccount, fetchProfiles, updateProfile, fetchUserPermissionOverrides, saveUserPermissionOverrides } from '../lib/api'
import type { PermissionKey, PermissionOverride } from '../lib/permissions'
import { ROLE_DEFAULTS } from '../lib/permissions'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box as UiBox, Card, DataTable, Eyebrow, PageTitle, Stack as UiStack, TableCell, TableRow, Typography as UiTypo } from './Ui'

const DEPTS = ['', 'LASER', 'ROLAT', 'SUDAT', 'ASAMBLAT', 'VOPSIT', 'MANAGEMENT', 'OFFICE']
const ROLES = ['viewer', 'production', 'office', 'office_production', 'admin']
const BLANK_USER = { email: '', password: '', full_name: '', departament: '', role: 'viewer' }

interface PermDef {
  key: PermissionKey
  label: string
  category: 'production' | 'office' | 'admin'
}

const ALL_PERMISSIONS: PermDef[] = [
  { key: 'view_dashboard',     label: 'View Dashboard',       category: 'production' },
  { key: 'view_projects',      label: 'View Projects',        category: 'production' },
  { key: 'edit_projects',      label: 'Edit Projects',        category: 'production' },
  { key: 'view_subassemblies', label: 'View Subassemblies',   category: 'production' },
  { key: 'edit_subassemblies', label: 'Edit Subassemblies',   category: 'production' },
  { key: 'view_planning',      label: 'View Planning',        category: 'production' },
  { key: 'view_blockages',     label: 'View Blockages',       category: 'production' },
  { key: 'edit_blockages',     label: 'Edit Blockages',       category: 'production' },
  { key: 'view_pdca',          label: 'View PDCA',            category: 'production' },
  { key: 'edit_pdca',          label: 'Edit PDCA',            category: 'production' },
  { key: 'view_daily_flow',    label: 'View Daily Flow',      category: 'production' },
  { key: 'edit_daily_flow',    label: 'Edit Daily Flow',      category: 'production' },
  { key: 'view_kpi',           label: 'View KPI',             category: 'production' },
  { key: 'edit_kpi',           label: 'Edit KPI',             category: 'production' },
  { key: 'view_tasks',         label: 'View Tasks',           category: 'office' },
  { key: 'create_tasks',       label: 'Create Tasks',         category: 'office' },
  { key: 'manage_tasks',       label: 'Manage All Tasks',     category: 'office' },
  { key: 'view_inventory',     label: 'View Inventory',       category: 'office' },
  { key: 'edit_inventory',     label: 'Edit Inventory',       category: 'office' },
  { key: 'manage_users',       label: 'Manage Users',         category: 'admin' },
  { key: 'manage_roles',       label: 'Manage Roles',         category: 'admin' },
]

type OverrideState = Record<PermissionKey, boolean | 'role' | 'revoked'>

function buildOverrideState(role: string, overrides: PermissionOverride[]): OverrideState {
  const rolePerms = new Set<PermissionKey>(ROLE_DEFAULTS[role] ?? [])
  const state: Partial<OverrideState> = {}
  for (const p of ALL_PERMISSIONS) {
    const override = overrides.find(o => o.permission_key === p.key)
    if (override) {
      state[p.key] = override.granted ? true : 'revoked'
    } else {
      state[p.key] = rolePerms.has(p.key) ? 'role' : false
    }
  }
  return state as OverrideState
}

function effectiveValue(v: boolean | 'role' | 'revoked'): boolean {
  return v === true || v === 'role'
}

interface PermEditorProps {
  userId: string
  role: string
  onClose: () => void
}

function PermEditor({ userId, role, onClose }: PermEditorProps) {
  const { t } = useLang()
  const a = t.admin
  const [overrideState, setOverrideState] = useState<OverrideState | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoadError(null)
    try {
      const overrides = await fetchUserPermissionOverrides(userId)
      setOverrideState(buildOverrideState(role, overrides))
    } catch (e: unknown) { setLoadError(e instanceof Error ? e.message : String(e)) }
  }, [userId, role])

  useState(() => { load() })

  function toggle(key: PermissionKey) {
    if (!overrideState) return
    const current = overrideState[key]
    const roleHas = (ROLE_DEFAULTS[role] ?? []).includes(key)
    let next: boolean | 'role' | 'revoked'
    if (current === 'role') next = 'revoked'
    else if (current === 'revoked') next = 'role'
    else if (current === true) next = false
    else next = roleHas ? 'role' : true
    setOverrideState(s => s ? { ...s, [key]: next } : s)
  }

  function resetToRole() {
    setOverrideState(buildOverrideState(role, []))
  }

  async function save() {
    if (!overrideState) return
    setSaving(true)
    setError(null)
    try {
      const overrides: { permission_key: PermissionKey; granted: boolean }[] = []
      const rolePerms = new Set<PermissionKey>(ROLE_DEFAULTS[role] ?? [])
      for (const p of ALL_PERMISSIONS) {
        const v = overrideState[p.key]
        if (v === true && !rolePerms.has(p.key)) overrides.push({ permission_key: p.key, granted: true })
        if (v === 'revoked' && rolePerms.has(p.key)) overrides.push({ permission_key: p.key, granted: false })
      }
      await saveUserPermissionOverrides(userId, overrides)
      onClose()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)) }
    setSaving(false)
  }

  const categories: { key: string; label: string; cat: PermDef['category'] }[] = [
    { key: 'production', label: a.catProduction, cat: 'production' },
    { key: 'office', label: a.catOffice, cat: 'office' },
    { key: 'admin', label: a.catAdmin, cat: 'admin' },
  ]

  return (
    <Card sx={{ borderLeft: '3px solid #818cf8' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Eyebrow>{a.permissionsTitle}</Eyebrow>
        <Stack direction="row" gap={1}>
          <ActionButton variant="outlined" onClick={resetToRole} sx={{ fontSize: 11, px: 1.25, py: 0.5 }}>{a.permReset}</ActionButton>
          <ActionButton onClick={save} disabled={saving || !overrideState} sx={{ fontSize: 11, px: 1.25, py: 0.5 }}>
            {saving ? <CircularProgress size={14} /> : a.permSave}
          </ActionButton>
          <ActionButton variant="outlined" onClick={onClose} sx={{ fontSize: 11, px: 1, py: 0.5 }}>✕</ActionButton>
        </Stack>
      </Box>
      {(loadError || error) && <ErrorBanner message={loadError ?? error ?? ''} />}
      {!overrideState ? <CircularProgress size={20} /> : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {categories.map(({ key, label, cat }) => (
            <Box key={key}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', mb: 1 }}>{label}</Typography>
              <Stack gap={0.5}>
                {ALL_PERMISSIONS.filter(p => p.category === cat).map(p => {
                  const v = overrideState[p.key]
                  const checked = effectiveValue(v)
                  const isFromRole = v === 'role'
                  const isAdded = v === true
                  const isRevoked = v === 'revoked'
                  return (
                    <FormControlLabel
                      key={p.key}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={() => toggle(p.key)}
                          size="small"
                          sx={{
                            py: 0.25,
                            color: isRevoked ? '#f87171' : isAdded ? '#fbbf24' : 'var(--color-ink-tertiary)',
                            '&.Mui-checked': { color: isRevoked ? '#f87171' : isAdded ? '#fbbf24' : '#4ade80' },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: 12, color: isRevoked ? '#f87171' : isAdded ? '#fbbf24' : checked ? 'var(--color-ink-muted)' : 'var(--color-ink-tertiary)' }}>
                          {p.label}
                          {isFromRole && <Box component="span" sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', ml: 0.5 }}>({a.permFromRole})</Box>}
                          {isAdded && <Box component="span" sx={{ fontSize: 10, color: '#fbbf24', ml: 0.5 }}>+</Box>}
                          {isRevoked && <Box component="span" sx={{ fontSize: 10, color: '#f87171', ml: 0.5 }}>✕</Box>}
                        </Typography>
                      }
                      sx={{ alignItems: 'center', m: 0 }}
                    />
                  )
                })}
              </Stack>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  )
}

const ROLE_COLORS: Record<string, string> = {
  admin: '#818cf8', production: '#4ade80', office: '#38bdf8',
  office_production: '#a78bfa', viewer: '#8a8f98',
}

function roleBadge(role: string, a: { roleAdmin: string; roleProduction: string; roleOffice: string; roleOfficeProd: string; roleViewer: string }) {
  const color = ROLE_COLORS[role] ?? '#8a8f98'
  const label = ({ admin: a.roleAdmin, production: a.roleProduction, office: a.roleOffice, office_production: a.roleOfficeProd, viewer: a.roleViewer } as Record<string, string>)[role] ?? role
  return <Badge tone="default" sx={{ color, bgcolor: `${color}18` }}>{label}</Badge>
}

function roleOptions(a: { roleAdmin: string; roleProduction: string; roleOffice: string; roleOfficeProd: string; roleViewer: string }) {
  return ROLES.map(r => ({
    value: r,
    label: ({ admin: a.roleAdmin, production: a.roleProduction, office: a.roleOffice, office_production: a.roleOfficeProd, viewer: a.roleViewer } as Record<string, string>)[r] ?? r,
  }))
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'adminDesc', production: 'productionDesc', office: 'officeDesc',
  office_production: 'officeProdDesc', viewer: 'viewerDesc',
}

export default function Admin() {
  const { t, lang } = useLang()
  const a = t.admin
  const { data: profiles, loading, error, refetch } = useQuery(fetchProfiles)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK_USER })
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editDept, setEditDept] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [permEditorId, setPermEditorId] = useState<string | null>(null)
  const [permEditorRole, setPermEditorRole] = useState<string>('')
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function createUser(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    setCreateError(null)
    setCreateSuccess(null)
    try {
      await createUserAccount(form)
      setCreateSuccess(`${a.createSuccess} ${form.email}`)
      setForm({ ...BLANK_USER })
      setShowForm(false)
      refetch()
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit(id: string) {
    setSaveError(null)
    try {
      await updateProfile(id, { role: editRole, departament: editDept || null })
      setEditId(null)
      refetch()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : String(err))
    }
  }

  function openPermEditor(userId: string, role: string) {
    setPermEditorId(userId)
    setPermEditorRole(role)
  }

  return (
    <UiStack gap={4}>
      <PageTitle
        eyebrow={a.eyebrow}
        title={a.title}
        subtitle={`${a.subtitle} · ${profiles?.length ?? '...'} ${a.users}`}
        info={pageInfo(lang, 'admin')}
        action={<ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => { setShowForm(s => !s); setCreateError(null); setCreateSuccess(null) }}>{showForm ? `x ${t.common.cancel}` : a.newBtn}</ActionButton>}
      />
      {error && <ErrorBanner message={error} />}
      {saveError && <ErrorBanner message={saveError} />}
      {createSuccess && (
        <Box sx={{ bgcolor: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 'var(--radius-md)', p: '10px 16px' }}>
          <Typography variant="body2" sx={{ fontSize: 13, color: '#4ade80' }}>{createSuccess}</Typography>
        </Box>
      )}

      {showForm && (
        <Card sx={{ borderLeft: '3px solid var(--color-primary)' }}>
          <Eyebrow sx={{ mb: 2 }}>{a.formTitle}</Eyebrow>
          {createError && (
            <Box sx={{ bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', p: '8px 12px', mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontSize: 12, color: '#f87171' }}>{createError}</Typography>
            </Box>
          )}
          <Stack component="form" onSubmit={createUser} gap={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              <AppField label={`${a.email} *`} required type="email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="ion.popescu@wpowertech.ro" />
              <AppField label={`${a.password} *`} required type="password" value={form.password} onChange={e => setF('password', e.target.value)} placeholder="min. 6 caractere" inputProps={{ minLength: 6 }} />
              <AppField label={a.fullName} value={form.full_name} onChange={e => setF('full_name', e.target.value)} placeholder="Ion Popescu" />
              <AppSelect label={a.departament} value={form.departament} onChange={e => setF('departament', e.target.value)} options={DEPTS.map(d => ({ value: d, label: d || '- Selectați -' }))} />
              <AppSelect label={a.rol} value={form.role} onChange={e => setF('role', e.target.value)} options={roleOptions(a)} />
            </Box>
            <ActionButton type="submit" disabled={saving} sx={{ alignSelf: 'flex-start', opacity: saving ? 0.7 : 1 }}>{saving ? a.creating : a.createBtn}</ActionButton>
          </Stack>
        </Card>
      )}

      {permEditorId && (
        <PermEditor
          userId={permEditorId}
          role={permEditorRole}
          onClose={() => setPermEditorId(null)}
        />
      )}

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}><Eyebrow>{a.usersTitle}</Eyebrow></Box>
        <DataTable sx={{ overflowX: 'auto' }} head={<TableRow><TableCell>{a.colNume}</TableCell><TableCell>{a.colEmail}</TableCell><TableCell>{a.colDept}</TableCell><TableCell>{a.colRol}</TableCell><TableCell>{a.colCreat}</TableCell><TableCell /></TableRow>}>
          {loading ? <LoadingRows cols={6} /> : (profiles ?? []).map(p => (
            editId === p.id ? (
              <TableRow key={p.id} sx={{ bgcolor: 'rgba(94,106,210,0.06)' }}>
                <TableCell colSpan={2} sx={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{p.full_name || p.email}</TableCell>
                <TableCell><AppSelect value={editDept} onChange={e => setEditDept(e.target.value)} options={DEPTS.map(d => ({ value: d, label: d || a.noRoleOption }))} /></TableCell>
                <TableCell>
                  <AppSelect value={editRole} onChange={e => setEditRole(e.target.value)} options={roleOptions(a)} />
                </TableCell>
                <TableCell />
                <TableCell>
                  <Stack direction="row" gap={0.75}>
                    <ActionButton onClick={() => saveEdit(p.id)} sx={{ px: 1.25, py: 0.5, fontSize: 11 }}>{t.common.save}</ActionButton>
                    <ActionButton variant="outlined" onClick={() => setEditId(null)} sx={{ px: 1, py: 0.5, fontSize: 11 }}>x</ActionButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={p.id}>
                <TableCell sx={{ fontWeight: 500, fontSize: 13 }}>{p.full_name || <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>-</Typography>}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>{p.email}</TableCell>
                <TableCell>{p.departament ? <Badge>{p.departament}</Badge> : <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>-</Typography>}</TableCell>
                <TableCell>{roleBadge(p.role, a)}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('ro-RO') : '-'}</TableCell>
                <TableCell>
                  <Stack direction="row" gap={0.75}>
                    <ActionButton variant="outlined" onClick={() => { setEditId(p.id); setEditRole(p.role); setEditDept(p.departament ?? '') }} sx={{ px: 1, py: 0.375, fontSize: 11 }}>{t.common.edit}</ActionButton>
                    <ActionButton variant="outlined" onClick={() => openPermEditor(p.id, p.role)} sx={{ px: 1, py: 0.375, fontSize: 11, color: '#818cf8', borderColor: 'rgba(129,140,248,0.3)' }}>{a.permBtn}</ActionButton>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          ))}
        </DataTable>
      </Card>

      <Card>
        <Eyebrow sx={{ mb: 1.5 }}>{a.ghidTitle}</Eyebrow>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
          {ROLES.map(role => {
            const color = ROLE_COLORS[role] ?? '#8a8f98'
            const descKey = ROLE_DESCRIPTIONS[role] as keyof typeof a
            return (
              <Box key={role} sx={{ bgcolor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', p: '14px 16px', borderLeft: `3px solid ${color}` }}>
                <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600, color, mb: 0.5, textTransform: 'capitalize' }}>
                  {({ admin: a.roleAdmin, production: a.roleProduction, office: a.roleOffice, office_production: a.roleOfficeProd, viewer: a.roleViewer } as Record<string, string>)[role] ?? role}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{String(a[descKey] ?? '')}</Typography>
              </Box>
            )
          })}
        </Box>
      </Card>
    </UiStack>
  )
}
