import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { createUserAccount, fetchProfiles, updateProfile } from '../lib/api'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

const DEPTS = ['', 'LASER', 'ROLAT', 'SUDAT', 'ASAMBLAT', 'VOPSIT', 'MANAGEMENT']
const ROLES = ['worker', 'admin']
const BLANK_USER = { email: '', password: '', full_name: '', departament: '', role: 'worker' }

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
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function createUser(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    setCreateError(null)
    setCreateSuccess(null)
    try {
      await createUserAccount(form)
      setCreateSuccess(`Cont creat pentru ${form.email}`)
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

  function roleBadge(role: string) {
    return role === 'admin' ? <Badge tone="warning">Admin</Badge> : <Badge>Worker</Badge>
  }

  return (
    <Stack gap={4}>
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
              <AppSelect label={a.departament} value={form.departament} onChange={e => setF('departament', e.target.value)} options={DEPTS.map(d => ({ value: d, label: d || '- Selectati -' }))} />
              <AppSelect label={a.rol} value={form.role} onChange={e => setF('role', e.target.value)} options={[{ value: 'worker', label: 'Worker' }, { value: 'admin', label: 'Admin' }]} />
            </Box>
            <ActionButton type="submit" disabled={saving} sx={{ alignSelf: 'flex-start', opacity: saving ? 0.7 : 1 }}>{saving ? a.creating : a.createBtn}</ActionButton>
          </Stack>
        </Card>
      )}

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}><Eyebrow>Utilizatori</Eyebrow></Box>
        <DataTable sx={{ overflowX: 'auto' }} head={<TableRow><TableCell>{a.colNume}</TableCell><TableCell>{a.colEmail}</TableCell><TableCell>{a.colDept}</TableCell><TableCell>{a.colRol}</TableCell><TableCell>{a.colCreat}</TableCell><TableCell /></TableRow>}>
          {loading ? <LoadingRows cols={6} /> : (profiles ?? []).map(p => (
            editId === p.id ? (
              <TableRow key={p.id} sx={{ bgcolor: 'rgba(94,106,210,0.06)' }}>
                <TableCell colSpan={2} sx={{ fontSize: 13, color: 'var(--color-ink-muted)' }}>{p.full_name || p.email}</TableCell>
                <TableCell><AppSelect value={editDept} onChange={e => setEditDept(e.target.value)} options={DEPTS.map(d => ({ value: d, label: d || '- Fara -' }))} /></TableCell>
                <TableCell><AppSelect value={editRole} onChange={e => setEditRole(e.target.value)} options={ROLES} /></TableCell>
                <TableCell />
                <TableCell><Stack direction="row" gap={0.75}><ActionButton onClick={() => saveEdit(p.id)} sx={{ px: 1.25, py: 0.5, fontSize: 11 }}>{t.common.save}</ActionButton><ActionButton variant="outlined" onClick={() => setEditId(null)} sx={{ px: 1, py: 0.5, fontSize: 11 }}>x</ActionButton></Stack></TableCell>
              </TableRow>
            ) : (
              <TableRow key={p.id}>
                <TableCell sx={{ fontWeight: 500, fontSize: 13 }}>{p.full_name || <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>-</Typography>}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>{p.email}</TableCell>
                <TableCell>{p.departament ? <Badge>{p.departament}</Badge> : <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>-</Typography>}</TableCell>
                <TableCell>{roleBadge(p.role)}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-tertiary)' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('ro-RO') : '-'}</TableCell>
                <TableCell><ActionButton variant="outlined" onClick={() => { setEditId(p.id); setEditRole(p.role); setEditDept(p.departament ?? '') }} sx={{ px: 1, py: 0.375, fontSize: 11 }}>{t.common.edit}</ActionButton></TableCell>
              </TableRow>
            )
          ))}
        </DataTable>
      </Card>

      <Card>
        <Eyebrow sx={{ mb: 1.5 }}>{a.ghidTitle}</Eyebrow>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
          {[{ title: 'Worker', desc: a.workerDesc, color: '#8a8f98' }, { title: 'Admin', desc: a.adminDesc, color: '#818cf8' }].map(({ title, desc, color }) => (
            <Box key={title} sx={{ bgcolor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', p: '14px 16px', borderLeft: `3px solid ${color}` }}>
              <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600, color, mb: 0.5 }}>{title}</Typography>
              <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{desc}</Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Stack>
  )
}
