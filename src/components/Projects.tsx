import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchProiecte, insertProiect, updateProiect, deleteProiect } from '../lib/api'
import { formatDateLabel } from '../lib/dateUtils'
import { DEFAULT_SUBASSEMBLY_NAMES } from '../lib/projectDefaults'
import { usePermissions } from '../lib/permissionsContext'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, Eyebrow, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'

function priorityBadge(p: string) {
  if (p === 'CRITIC') return <Badge tone="error">CRITIC</Badge>
  if (p === 'RIDICAT') return <Badge tone="warning">RIDICAT</Badge>
  return <Badge tone="success">NORMAL</Badge>
}

function statusBadge(s: string) {
  if (s === 'LIVRAT') return <Badge tone="success">LIVRAT</Badge>
  if (s === 'IN LIVRARE') return <Badge tone="warning">IN LIVRARE</Badge>
  if (s === 'BLOCAJE ACTIVE') return <Badge tone="error">BLOCAJE ACTIVE</Badge>
  return <Badge>{s}</Badge>
}

function ProgressBar({ value }: { value: number }) {
  const c = value >= 95 ? 'success' : value >= 80 ? 'warning' : 'danger'
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Box className="progress-bar" sx={{ flex: 1 }}>
        <Box className={`progress-fill progress-fill-${c}`} sx={{ width: `${value}%` }} />
      </Box>
      <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-muted)', minWidth: 40, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
        {value.toFixed(1)}%
      </Typography>
    </Stack>
  )
}

const BLANK = { id: '', client: '', responsabil: '', data_start: '', data_target: '', data_done: '', total_sa: DEFAULT_SUBASSEMBLY_NAMES.length, buget_ore: 0, prioritate: 'NORMAL', status: 'IN PRODUCTIE' }

type FormMode = 'create' | 'edit'

interface ProjectForm {
  id: string; client: string; responsabil: string
  data_start: string; data_target: string; data_done: string
  total_sa: number; buget_ore: number; prioritate: string; status: string
}

function ProjectFormCard({
  mode, initial, onSave, onCancel,
}: {
  mode: FormMode
  initial: ProjectForm
  onSave: (form: ProjectForm) => Promise<void>
  onCancel: () => void
}) {
  const { t } = useLang()
  const p = t.proiecte
  const [form, setForm] = useState<ProjectForm>({ ...initial })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const setF = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await onSave(form)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card sx={{ borderLeft: '3px solid var(--color-primary)' }}>
      <Eyebrow sx={{ mb: 2 }}>{mode === 'create' ? p.formTitle : `${p.editTitle} · ${initial.id}`}</Eyebrow>
      {formError && (
        <Box sx={{ bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', p: '8px 12px', mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontSize: 12, color: '#f87171' }}>{formError}</Typography>
        </Box>
      )}
      <Stack component="form" onSubmit={submit} gap={1.5}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          <AppField label={`${p.idProiect} *`} required value={form.id} onChange={e => setF('id', e.target.value)} placeholder="WP1000-11" disabled={mode === 'edit'} />
          <AppField label={`${p.client} *`} required value={form.client} onChange={e => setF('client', e.target.value)} />
          <AppField label={p.responsabil} value={form.responsabil} onChange={e => setF('responsabil', e.target.value)} />
          <AppField label={p.dataStart} type="date" value={form.data_start} onChange={e => setF('data_start', e.target.value)} InputLabelProps={{ shrink: true }} />
          <AppField label={p.dataTarget} type="date" value={form.data_target} onChange={e => setF('data_target', e.target.value)} InputLabelProps={{ shrink: true }} />
          <AppField label={p.dataDone} type="date" value={form.data_done} onChange={e => setF('data_done', e.target.value)} InputLabelProps={{ shrink: true }} />
          <AppField label={p.totalSA} type="number" value={form.total_sa} onChange={e => setF('total_sa', Number(e.target.value))} inputProps={{ min: 0 }} />
          <AppField label={p.bugetOre} type="number" value={form.buget_ore} onChange={e => setF('buget_ore', Number(e.target.value))} inputProps={{ min: 0 }} />
          <AppSelect label={p.prioritate} value={form.prioritate} onChange={e => setF('prioritate', e.target.value)} options={['NORMAL', 'RIDICAT', 'CRITIC']} />
          <AppSelect label={p.status} value={form.status} onChange={e => setF('status', e.target.value)} options={['IN PRODUCTIE', 'IN LIVRARE', 'LIVRAT', 'BLOCAJE ACTIVE']} />
        </Box>
        <Stack direction="row" gap={1}>
          <ActionButton type="submit" disabled={saving} sx={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? t.common.saving : mode === 'create' ? p.createBtn : t.common.save}
          </ActionButton>
          <ActionButton variant="outlined" onClick={onCancel}>{t.common.cancel}</ActionButton>
        </Stack>
      </Stack>
    </Card>
  )
}

export default function Proiecte() {
  const { t, lang } = useLang()
  const { canWrite } = usePermissions()
  const p = t.proiecte
  const { data, loading, error, refetch } = useQuery(fetchProiecte)

  const [mode, setMode] = useState<FormMode>('create')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<ProjectForm | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openCreate() {
    setMode('create')
    setEditTarget(null)
    setShowForm(true)
    setDeleteError(null)
  }

  function openEdit(row: Record<string, unknown>) {
    setMode('edit')
    setEditTarget({
      id: String(row.id ?? ''),
      client: String(row.client ?? ''),
      responsabil: String(row.responsabil ?? ''),
      data_start: String(row.data_start ?? ''),
      data_target: String(row.data_target ?? ''),
      data_done: String(row.data_done ?? ''),
      total_sa: Number(row.total_sa ?? 0),
      buget_ore: Number(row.buget_ore ?? 0),
      prioritate: String(row.prioritate ?? 'NORMAL'),
      status: String(row.status ?? 'IN PRODUCTIE'),
    })
    setShowForm(true)
    setDeleteError(null)
  }

  async function handleSave(form: ProjectForm) {
    if (mode === 'create') {
      await insertProiect(form as unknown as Record<string, unknown>)
    } else {
      await updateProiect(form.id, {
        client: form.client, responsabil: form.responsabil,
        data_start: form.data_start, data_target: form.data_target, data_done: form.data_done,
        total_sa: form.total_sa, buget_ore: form.buget_ore,
        prioritate: form.prioritate, status: form.status,
      })
    }
    setShowForm(false)
    setEditTarget(null)
    refetch()
  }

  async function handleDelete(id: string) {
    if (!confirm(p.deleteConfirm.replace('{id}', id))) return
    setDeletingId(id)
    setDeleteError(null)
    try {
      await deleteProiect(id)
      refetch()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : String(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Stack gap={4}>
      <PageTitle
        eyebrow={p.eyebrow}
        title={p.title}
        subtitle={`${data?.length ?? '...'} ${t.common.records}`}
        info={pageInfo(lang, 'projects')}
        action={canWrite ? (
          <ActionButton variant={showForm && mode === 'create' ? 'outlined' : 'contained'} onClick={() => showForm && mode === 'create' ? setShowForm(false) : openCreate()}>
            {showForm && mode === 'create' ? `x ${t.common.cancel}` : p.newBtn}
          </ActionButton>
        ) : undefined}
      />

      {error && <ErrorBanner message={error} />}
      {deleteError && <ErrorBanner message={deleteError} />}

      {canWrite && showForm && (
        <ProjectFormCard
          mode={mode}
          initial={editTarget ?? { ...BLANK }}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}

      {/* Project cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {loading ? [1, 2, 3].map(i => (
          <Card key={i} sx={{ height: 260, animation: 'pulse 1.4s ease-in-out infinite', bgcolor: 'var(--color-surface-1)' }} />
        )) : data?.map(proj => (
          <Card key={proj.id} sx={{ borderTop: `3px solid ${proj.prioritate === 'CRITIC' ? '#f87171' : proj.prioritate === 'RIDICAT' ? '#fbbf24' : '#4ade80'}` }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>{proj.id}</Typography>
                <Typography variant="body2" sx={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', mt: 0.25, letterSpacing: 0 }}>{proj.client}</Typography>
              </Box>
              {statusBadge(proj.status)}
            </Stack>
            <Stack gap={1.25}>
              {[
                { label: p.labelResponsabil, val: proj.responsabil },
                { label: p.labelStart, val: formatDateLabel(proj.data_start), mono: true },
                { label: p.labelTarget, val: formatDateLabel(proj.data_target), mono: true, warn: proj.status !== 'LIVRAT' && proj.status !== 'IN LIVRARE' },
                { label: p.labelDone, val: formatDateLabel(proj.data_done), mono: true },
              ].map(({ label, val, mono, warn }) => (
                <Stack key={label} direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{label}</Typography>
                  <Typography variant="body2" sx={{ fontSize: 12, fontFamily: mono ? 'var(--font-mono)' : undefined, color: warn ? '#fbbf24' : 'var(--color-ink-muted)' }}>{val}</Typography>
                </Stack>
              ))}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{p.labelPrioritate}</Typography>
                {priorityBadge(proj.prioritate)}
              </Stack>
              <Box sx={{ borderTop: '1px solid var(--color-hairline)', pt: 1.25, mt: 0.25 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{p.labelSA}</Typography>
                  <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>{proj.finalizate_sa}/{proj.total_sa}</Typography>
                </Stack>
                <ProgressBar value={Number(proj.progres)} />
              </Box>
              {proj.blocaje_active > 0 && (
                <Stack direction="row" gap={1} sx={{ bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', p: '8px 12px' }}>
                  <Typography variant="body2" sx={{ fontSize: 12, color: '#f87171' }}><strong>{proj.blocaje_active}</strong> {p.blocajeActive}</Typography>
                </Stack>
              )}
              {canWrite && (
                <Stack direction="row" gap={0.75} sx={{ borderTop: '1px solid var(--color-hairline)', pt: 1.25, mt: 0.25 }}>
                  <ActionButton variant="outlined" onClick={() => openEdit(proj as unknown as Record<string, unknown>)} sx={{ flex: 1, py: 0.5, fontSize: 11 }}>{t.common.edit}</ActionButton>
                  <ActionButton
                    onClick={() => handleDelete(proj.id)}
                    disabled={deletingId === proj.id}
                    sx={{ flex: 1, py: 0.5, fontSize: 11, color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', '&:hover': { border: '1px solid #f87171', bgcolor: 'rgba(248,113,113,0.08)' } }}
                  >
                    {deletingId === proj.id ? '...' : p.deleteBtn}
                  </ActionButton>
                </Stack>
              )}
            </Stack>
          </Card>
        ))}
      </Box>

      {/* Table view */}
      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: '20px 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}><Eyebrow>{p.tabelar}</Eyebrow></Box>
        <DataTable
          head={
            <TableRow>
              <TableCell>{p.colId}</TableCell><TableCell>{p.colClient}</TableCell><TableCell>{p.colResponsabil}</TableCell>
              <TableCell>{p.colPrioritate}</TableCell><TableCell>{p.colStart}</TableCell><TableCell>{p.colTarget}</TableCell>
              <TableCell>{p.colDone}</TableCell><TableCell>{p.colSATotal}</TableCell><TableCell>{p.colSAFinal}</TableCell>
              <TableCell sx={{ minWidth: 180 }}>{p.colProgres}</TableCell><TableCell>{p.colBlocaje}</TableCell>
              <TableCell>{p.colStatus}</TableCell>
              {canWrite && <TableCell />}
            </TableRow>
          }
        >
          {loading ? <LoadingRows cols={canWrite ? 13 : 12} /> : data?.map(proj => (
            <TableRow key={proj.id}>
              <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>{proj.id}</Typography></TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{proj.client}</TableCell>
              <TableCell sx={{ color: 'var(--color-ink-muted)' }}>{proj.responsabil}</TableCell>
              <TableCell>{priorityBadge(proj.prioritate)}</TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{formatDateLabel(proj.data_start)}</TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: proj.status !== 'LIVRAT' ? '#fbbf24' : 'var(--color-ink-muted)' }}>{formatDateLabel(proj.data_target)}</TableCell>
              <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{formatDateLabel(proj.data_done)}</TableCell>
              <TableCell sx={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{proj.total_sa}</TableCell>
              <TableCell sx={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{proj.finalizate_sa}</TableCell>
              <TableCell sx={{ minWidth: 180 }}><ProgressBar value={Number(proj.progres)} /></TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{proj.blocaje_active > 0 ? <Badge tone="error">{proj.blocaje_active}</Badge> : <Typography variant="body2" sx={{ color: 'var(--color-ink-tertiary)' }}>-</Typography>}</TableCell>
              <TableCell>{statusBadge(proj.status)}</TableCell>
              {canWrite && (
                <TableCell>
                  <Stack direction="row" gap={0.5}>
                    <ActionButton variant="outlined" onClick={() => openEdit(proj as unknown as Record<string, unknown>)} sx={{ px: 1, py: 0.375, fontSize: 11 }}>{t.common.edit}</ActionButton>
                    <ActionButton onClick={() => handleDelete(proj.id)} disabled={deletingId === proj.id}
                      sx={{ px: 1, py: 0.375, fontSize: 11, color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', '&:hover': { border: '1px solid #f87171' } }}>
                      {deletingId === proj.id ? '...' : '✕'}
                    </ActionButton>
                  </Stack>
                </TableCell>
              )}
            </TableRow>
          ))}
        </DataTable>
      </Card>
    </Stack>
  )
}
