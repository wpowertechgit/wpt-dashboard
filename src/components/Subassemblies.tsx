import { useState, useRef, useMemo } from 'react'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchSubansambluri, updateSubansamblu, insertBlocaj } from '../lib/api'
import { formatDateLabel } from '../lib/dateUtils'
import { normalizeDepartmentStatus, normalizeGlobalStatus } from '../lib/subassemblyStatus'
import { usePermissions } from '../lib/permissionsContext'
import { pageInfo } from '../lib/pageInfo'
import { ErrorBanner, EmptyState, LoadingRows } from './StateViews'
import { ActionButton, AppField, AppSelect, Badge, Box, Card, DataTable, PageTitle, Stack, TableCell, TableRow, Typography } from './Ui'
import { Confetti } from './ui/Confetti'
import type { ConfettiRef } from './ui/Confetti'

type FilterStatus = 'ALL' | 'completed' | 'inProgress' | 'blocked'

// DB column key → display label (ROLAT shows as VIROLAT)
const DEPT_COLS = ['proiectare', 'laser', 'rolat', 'sudat', 'asamblat', 'vopsit'] as const
const DEPT_DISPLAY: Record<string, string> = {
  proiectare: 'PROIECTARE', laser: 'LASER', rolat: 'VIROLAT',
  sudat: 'SUDAT', asamblat: 'ASAMBLAT', vopsit: 'VOPSIT',
}
const STATUS_OPTIONS = ['Finalizat', 'În lucru', 'Blocat', 'Neînceput', 'N/A']
const PROGRESS_PRESETS = ['0%', '25%', '50%', '75%', '100%']
const DATE_FIELDS = new Set(['data_start','data_due','data_done','proiectare_done','laser_done','rolat_done','sudat_done','asamblat_done','vopsit_done'])
const TABLE_STATUS_CHIP_SX = {
  maxWidth: 116,
  minWidth: 0,
  position: 'relative',
  zIndex: 1,
  transition: 'max-width 140ms ease, transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
  '& .MuiChip-label': {
    px: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '&:hover': {
    maxWidth: 190,
    zIndex: 8,
    transform: 'translateY(-1px)',
    boxShadow: '0 10px 24px rgba(0,0,0,0.28)',
  },
}

function statusChip(s: string) {
  if (s === 'Finalizat') return <Badge tone="success" sx={TABLE_STATUS_CHIP_SX}>Finalizat</Badge>
  if (s === 'În lucru') return <Badge tone="info" sx={TABLE_STATUS_CHIP_SX}>În lucru</Badge>
  if (s === 'Blocat') return <Badge tone="error" sx={TABLE_STATUS_CHIP_SX}>Blocat</Badge>
  if (s === 'N/A') return <Badge sx={TABLE_STATUS_CHIP_SX}>N/A</Badge>
  return <Badge sx={TABLE_STATUS_CHIP_SX}>{s || 'Neînceput'}</Badge>
}

type SubT = { statusNotStarted: string; statusInProgress: string; statusToVerify: string; statusCompleted: string; statusBlocked: string }

function globalChip(s: string, t: SubT) {
  if (s === 'completed') return <Badge tone="success" sx={TABLE_STATUS_CHIP_SX}>✅ {t.statusCompleted}</Badge>
  if (s === 'blocked') return <Badge tone="error" sx={TABLE_STATUS_CHIP_SX}>⛔ {t.statusBlocked}</Badge>
  if (s === 'inProgress') return <Badge tone="info" sx={TABLE_STATUS_CHIP_SX}>🔄 {t.statusInProgress}</Badge>
  if (s === 'notStarted') return <Badge tone="default" sx={TABLE_STATUS_CHIP_SX}>⏳ {t.statusNotStarted}</Badge>
  if (s === 'toVerify') return <Badge tone="warning" sx={TABLE_STATUS_CHIP_SX}>🔍 {t.statusToVerify}</Badge>
  return <Badge sx={TABLE_STATUS_CHIP_SX}>{s}</Badge>
}

function timelineSummary(sa: Record<string, unknown>) {
  return [
    ['S', formatDateLabel(sa.data_start as string)],
    ['D', formatDateLabel(sa.data_due as string)],
    ['F', formatDateLabel(sa.data_done as string)],
  ]
}

function deptDateSummary(sa: Record<string, unknown>) {
  return [
    ['P', formatDateLabel(sa.proiectare_done as string)],
    ['L', formatDateLabel(sa.laser_done as string)],
    ['V', formatDateLabel(sa.rolat_done as string)],
    ['S', formatDateLabel(sa.sudat_done as string)],
    ['A', formatDateLabel(sa.asamblat_done as string)],
    ['Vop', formatDateLabel(sa.vopsit_done as string)],
  ].filter(([, v]) => v && v !== '—')
}

function getFirstBlockedDept(row: Record<string, string | boolean>): string {
  for (const col of DEPT_COLS) {
    if (row[col] === 'Blocat') return DEPT_DISPLAY[col]
  }
  return 'GENERAL'
}

type EditFormValues = Record<string, string | boolean>

function prepareRow(row: EditFormValues): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, DATE_FIELDS.has(k) && v === '' ? null : v])
  )
}

function buildInitialValues(sa: Record<string, unknown>): EditFormValues {
  const row: EditFormValues = {
    status_global: normalizeGlobalStatus(sa.status_global as string),
    progres: sa.progres as string,
    blocat: sa.blocat as boolean,
    data_start: (sa.data_start as string) ?? '',
    data_due: (sa.data_due as string) ?? '',
    data_done: (sa.data_done as string) ?? '',
    proiectare_done: (sa.proiectare_done as string) ?? '',
    laser_done: (sa.laser_done as string) ?? '',
    rolat_done: (sa.rolat_done as string) ?? '',
    sudat_done: (sa.sudat_done as string) ?? '',
    asamblat_done: (sa.asamblat_done as string) ?? '',
    vopsit_done: (sa.vopsit_done as string) ?? '',
    comentarii: (sa.comentarii as string) ?? '',
  }
  for (const col of DEPT_COLS) row[col] = normalizeDepartmentStatus(sa[col] as string)
  return row
}

interface EditFormContentProps {
  saId: number
  saLabel: string
  initialValues: EditFormValues
  onSave: (values: EditFormValues) => void
  onReset: () => void
  onCancel: () => void
  saving: boolean
  saveError: string | null
}

function EditFormContent({ saId: _saId, saLabel, initialValues, onSave, onReset, onCancel, saving, saveError }: EditFormContentProps) {
  const { t } = useLang()
  const s = t.subansambluri
  const [form, setForm] = useState<EditFormValues>(initialValues)
  const set = (k: string, v: string | boolean) => setForm(r => ({ ...r, [k]: v }))

  return (
    <Stack gap={1.5}>
      <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{saLabel}</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1.25, alignItems: 'start', '& > *': { minWidth: 0 } }}>
        <AppSelect label="Status Global" value={normalizeGlobalStatus(String(form.status_global ?? ''))}
          onChange={e => {
            const val = e.target.value
            setForm(r => ({ ...r, status_global: val, blocat: val === 'blocked' ? true : val === 'completed' ? false : r.blocat }))
          }}
          options={[
            { value: 'notStarted', label: `⏳ ${t.subansambluri.statusNotStarted}` },
            { value: 'inProgress', label: `🔄 ${t.subansambluri.statusInProgress}` },
            { value: 'toVerify',   label: `🔍 ${t.subansambluri.statusToVerify}` },
            { value: 'completed',  label: `✅ ${t.subansambluri.statusCompleted}` },
            { value: 'blocked',    label: `⛔ ${t.subansambluri.statusBlocked}` },
          ]} />
        <Box>
          <AppField label="Progres %" value={String(form.progres ?? '').replace('%', '')}
            onChange={e => set('progres', e.target.value ? `${e.target.value}%` : '0%')} />
          <Stack direction="row" gap={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            {PROGRESS_PRESETS.map(p => (
              <ActionButton key={p} variant="outlined" onClick={() => set('progres', p)}
                sx={{ px: 0.75, py: 0.25, fontSize: 10, minWidth: 0, bgcolor: form.progres === p ? 'var(--color-primary)' : 'transparent', color: form.progres === p ? '#fff' : 'var(--color-ink-subtle)', border: '1px solid var(--color-hairline)' }}>
                {p}
              </ActionButton>
            ))}
          </Stack>
        </Box>
        <AppField label="Start" type="date" value={String(form.data_start ?? '')} onChange={e => set('data_start', e.target.value)} />
        <AppField label="Due" type="date" value={String(form.data_due ?? '')} onChange={e => set('data_due', e.target.value)} />
        <AppField label="Done" type="date" value={String(form.data_done ?? '')} onChange={e => set('data_done', e.target.value)} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1.25, '& > *': { minWidth: 0 } }}>
        {DEPT_COLS.map(col => (
          <AppSelect key={col} label={DEPT_DISPLAY[col]}
            value={normalizeDepartmentStatus(String(form[col] ?? ''))}
            onChange={e => set(col, e.target.value)}
            options={STATUS_OPTIONS} />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1.25, '& > *': { minWidth: 0 } }}>
        {DEPT_COLS.map(col => (
          <AppField key={`${col}_done`} label={`${DEPT_DISPLAY[col]} Done`} type="date"
            value={String(form[`${col}_done`] ?? '')}
            onChange={e => set(`${col}_done`, e.target.value)} />
        ))}
      </Box>

      <AppField label={s.colComentarii} value={String(form.comentarii ?? '')} onChange={e => set('comentarii', e.target.value)} />
      {saveError && (
        <Box sx={{ bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', p: '6px 10px' }}>
          <Typography variant="body2" sx={{ fontSize: 11, color: '#f87171' }}>{saveError}</Typography>
        </Box>
      )}
      <Stack direction="row" gap={0.75} flexWrap="wrap">
        <ActionButton onClick={() => onSave(form)} disabled={saving} sx={{ px: 1.25, py: 0.5, fontSize: 11 }}>{saving ? '...' : t.common.save}</ActionButton>
        <ActionButton variant="outlined" onClick={onReset} disabled={saving}
          sx={{ px: 1.25, py: 0.5, fontSize: 11, color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)', '&:hover': { borderColor: '#fbbf24', bgcolor: 'rgba(251,191,36,0.06)' } }}>
          ↺ Reset
        </ActionButton>
        <ActionButton variant="outlined" onClick={onCancel} sx={{ px: 1, py: 0.5, fontSize: 11 }}>✕</ActionButton>
      </Stack>
    </Stack>
  )
}

export default function Subansambluri() {
  const { t, lang } = useLang()
  const { canWrite } = usePermissions()
  const s = t.subansambluri
  const [filterProiect, setFilterProiect] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [finalizing, setFinalizing] = useState<number | null>(null)
  const confettiRef = useRef<ConfettiRef>(null)

  const { data, loading, error, refetch } = useQuery(fetchSubansambluri)

  function isBlocat(sa: { blocat: boolean; status_global: string }) {
    return sa.blocat || sa.status_global === 'blocked'
  }

  const projects = useMemo(
    () => ['ALL', ...Array.from(new Set((data ?? []).map(sa => sa.proiect))).sort()],
    [data]
  )

  const filtered = useMemo(() => (data ?? []).filter(sa => {
    if (filterProiect !== 'ALL' && sa.proiect !== filterProiect) return false
    if (filterStatus === 'completed' && sa.status_global !== 'completed') return false
    if (filterStatus === 'inProgress' && sa.status_global !== 'inProgress') return false
    if (filterStatus === 'blocked' && !isBlocat(sa)) return false
    if (search && !sa.nume.toLowerCase().includes(search.toLowerCase())) return false
    return true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data, filterProiect, filterStatus, search])

  async function saveEdit(formValues: EditFormValues) {
    if (editId === null) return
    setSaving(true)
    setSaveError(null)
    try {
      const original = data?.find(s => s.id === editId)
      const becomingBlocked = String(formValues.status_global) === 'blocked' && !original?.blocat

      const rowToSave = { ...formValues }
      if (String(rowToSave.status_global) === 'completed') {
        const today = new Date().toISOString().slice(0, 10)
        rowToSave.progres = '100%'
        rowToSave.blocat = false
        rowToSave.data_done = (rowToSave.data_done as string) || today
        for (const col of DEPT_COLS) {
          if (rowToSave[col] !== 'N/A') rowToSave[col] = 'Finalizat'
          const doneKey = `${col}_done` as keyof typeof rowToSave
          rowToSave[doneKey] = (rowToSave[doneKey] as string) || today
        }
      }

      await updateSubansamblu(editId, prepareRow(rowToSave), original as Record<string, unknown>)

      if (becomingBlocked && original) {
        const today = new Date().toISOString().slice(0, 10)
        const blocajId = `BLK-${original.proiect}-${String(original.nr).padStart(2, '0')}-${Date.now().toString().slice(-4)}`
        await insertBlocaj({
          id: blocajId,
          data_deschidere: today,
          proiect: original.proiect,
          subansamblu: original.nume,
          departament: getFirstBlockedDept(formValues),
          descriere: String(formValues.comentarii || original.comentarii || `Subansamblu ${original.nume} blocat`),
          responsabil: '',
          impact: 'MEDIU',
          status: 'Deschis',
          zile_deschis: 0,
        })
      }

      setEditId(null)
      refetch()
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally { setSaving(false) }
  }

  async function resetRow(id: number) {
    setSaving(true)
    setSaveError(null)
    try {
      const original = data?.find(s => s.id === id)
      const resetData: Record<string, unknown> = {
        status_global: 'inProgress',
        progres: '0%',
        blocat: false,
        data_done: null,
        proiectare_done: null,
        laser_done: null,
        rolat_done: null,
        sudat_done: null,
        asamblat_done: null,
        vopsit_done: null,
      }
      for (const col of DEPT_COLS) resetData[col] = 'Neînceput'
      await updateSubansamblu(id, resetData, original as Record<string, unknown>)
      setEditId(null)
      refetch()
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally { setSaving(false) }
  }

  async function finalizeRow(sa: Record<string, unknown>) {
    setFinalizing(sa.id as number)
    const today = new Date().toISOString().slice(0, 10)
    try {
      const deptUpdate: Record<string, string> = {}
      for (const col of DEPT_COLS) {
        deptUpdate[col] = (sa[col] as string) === 'N/A' ? 'N/A' : 'Finalizat'
        deptUpdate[`${col}_done`] = (sa[`${col}_done`] as string) || today
      }
      await updateSubansamblu(sa.id as number, {
        status_global: 'completed',
        progres: '100%',
        blocat: false,
        data_done: today,
        ...deptUpdate,
      }, sa as Record<string, unknown>)
      confettiRef.current?.fire({ particleCount: 60, spread: 55, startVelocity: 30, origin: { y: 0.7 } })
      refetch()
    } finally { setFinalizing(null) }
  }

  function startEdit(sa: Record<string, unknown>) {
    setEditId(sa.id as number)
  }

  const pills = (opts: (string | { value: string; label: string })[], val: string, set: (v: string) => void) => (
    <Stack direction="row" gap={0.5} sx={{ bgcolor: 'var(--color-surface-1)', borderRadius: 'var(--radius-pill)', p: 0.375, border: '1px solid var(--color-hairline)', flexWrap: 'wrap' }}>
      {opts.map(o => {
        const v = typeof o === 'string' ? o : o.value
        const label = typeof o === 'string' ? o : o.label
        return (
          <ActionButton key={v} variant="outlined" onClick={() => set(v)} sx={{ px: 1.5, py: 0.5, borderRadius: 'var(--radius-pill)', border: 'none', bgcolor: val === v ? 'var(--color-surface-3)' : 'transparent', color: val === v ? 'var(--color-ink)' : 'var(--color-ink-subtle)', fontSize: 12, fontWeight: val === v ? 500 : 400, '&:hover': { bgcolor: 'var(--color-surface-3)' } }}>{label}</ActionButton>
        )
      })}
    </Stack>
  )

  return (
    <Stack gap={3} sx={{ position: 'relative' }}>
      <Confetti ref={confettiRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }} />
      <PageTitle eyebrow={s.eyebrow} title={s.title} subtitle={`${filtered.length} ${t.common.records}`} info={pageInfo(lang, 'subassemblies')} />
      {error && <ErrorBanner message={error} />}

      <Stack gap={1.5}>
        <AppField type="text" placeholder={s.search} value={search} onChange={e => setSearch(e.target.value)} />
        <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
          {projects.length > 1 && (
            <AppSelect
              value={filterProiect}
              onChange={e => setFilterProiect(e.target.value)}
              options={[
                { value: 'ALL', label: s.filterAll },
                ...projects.filter(p => p !== 'ALL').map(p => ({ value: p, label: p })),
              ]}
              sx={{ width: 200, minWidth: 0 }}
            />
          )}
          {pills([
            { value: 'ALL', label: s.filterAll },
            { value: 'completed', label: s.filterDone },
            { value: 'inProgress', label: s.filterInProgress },
            { value: 'blocked', label: s.filterBlocked },
          ], filterStatus, v => setFilterStatus(v as FilterStatus))}
        </Stack>
      </Stack>

      {/* ── Desktop / large-tablet table (md+) ── */}
      <Card sx={{ p: 0, overflow: 'hidden', display: { xs: 'none', md: 'block' } }}>
        <DataTable
          sx={{
            overflowX: 'auto',
            containerType: 'inline-size',
            '& table': { tableLayout: 'fixed' },
            '& th, & td': { px: 1.25 },
          }}
          minWidth={1350}
          head={
          <TableRow>
            <TableCell sx={{ width: 82 }}>{s.colProiect}</TableCell>
            <TableCell sx={{ width: 36 }}>{s.colNr}</TableCell>
            <TableCell sx={{ width: 122 }}>{s.colNume}</TableCell>
            <TableCell sx={{ width: 110 }}>{s.colStatus}</TableCell>
            <TableCell sx={{ width: 110 }}>{s.colProgres}</TableCell>
            <TableCell sx={{ width: 104 }}>{s.colTimeline}</TableCell>
            {DEPT_COLS.map(col => <TableCell key={col} sx={{ width: 86, textAlign: 'center' }}>{DEPT_DISPLAY[col]}</TableCell>)}
            <TableCell sx={{ width: 160 }}>{s.colComentarii}</TableCell>
            <TableCell sx={{ width: 110 }} />
          </TableRow>
        }>
          {loading ? <LoadingRows cols={14} /> : filtered.length === 0 ? <EmptyState label={s.empty} /> :
            filtered.map(sa => (
              canWrite && editId === sa.id ? (
                <TableRow key={sa.id} sx={{ bgcolor: 'rgba(94,106,210,0.06)' }}>
                  <TableCell colSpan={14} sx={{ p: 2 }}>
                    <Box sx={{ width: 'calc(100cqw - 32px)' }}>
                    <EditFormContent saId={sa.id} saLabel={`${sa.proiect} #${sa.nr} · ${sa.nume}`} initialValues={buildInitialValues(sa as Record<string, unknown>)} onSave={saveEdit} onReset={() => resetRow(sa.id)} onCancel={() => { setEditId(null); setSaveError(null) }} saving={saving} saveError={saveError} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={sa.id} sx={isBlocat(sa) ? { bgcolor: 'rgba(239,68,68,0.03)' } : undefined}>
                  <TableCell><Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>{sa.proiect}</Typography></TableCell>
                  <TableCell sx={{ color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{sa.nr}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>{sa.nume}</Typography>
                    {sa.conditionat_de && <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-primary)', mt: 0.25 }}>🔵 {sa.conditionat_de}</Typography>}
                  </TableCell>
                  <TableCell sx={{ overflow: 'visible', position: 'relative', zIndex: 2 }}>{globalChip(sa.status_global, t.subansambluri)}</TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <Stack direction="row" alignItems="center" gap={0.75}>
                      <Box className="progress-bar" sx={{ width: 50 }}>
                        <Box className={`progress-fill ${parseInt(sa.progres) >= 90 ? 'progress-fill-success' : parseInt(sa.progres) >= 60 ? 'progress-fill-warning' : 'progress-fill-danger'}`} sx={{ width: sa.progres }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{sa.progres}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ minWidth: 110 }}>
                    <Stack gap={0.25}>
                      {timelineSummary(sa as Record<string, unknown>).map(([label, value]) => (
                        <Typography key={label} variant="body2" sx={{ fontSize: 10, color: 'var(--color-ink-muted)' }}>{label}: {value}</Typography>
                      ))}
                    </Stack>
                  </TableCell>
                  {DEPT_COLS.map(col => <TableCell key={col} sx={{ textAlign: 'center', overflow: 'visible', position: 'relative', zIndex: 2 }}>{statusChip(sa[col])}</TableCell>)}
                  <TableCell sx={{ fontSize: 12, color: isBlocat(sa) ? '#f87171' : 'var(--color-ink-muted)', whiteSpace: 'normal', wordBreak: 'break-word' }}>{sa.comentarii}</TableCell>
                  <TableCell sx={{ borderLeft: '1px solid var(--color-hairline)', p: '8px 6px' }}>
                    {canWrite && (
                      <Stack direction="row" gap={0.5}>
                        <ActionButton variant="outlined" onClick={() => startEdit(sa as Record<string, unknown>)} sx={{ px: 0.75, py: 0.375, fontSize: 11, minWidth: 48 }}>
                          {t.common.edit}
                        </ActionButton>
                        {sa.status_global !== 'completed' && (
                          <ActionButton onClick={() => finalizeRow(sa as Record<string, unknown>)} disabled={finalizing === sa.id}
                            sx={{ px: 0.75, py: 0.375, fontSize: 11, minWidth: 34, bgcolor: 'rgba(39,166,68,0.1)', color: '#4ade80', border: '1px solid rgba(39,166,68,0.2)', '&:hover': { bgcolor: 'rgba(39,166,68,0.2)' } }}>
                            {finalizing === sa.id ? '...' : '✅'}
                          </ActionButton>
                        )}
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              )
            ))}
        </DataTable>
      </Card>

      {/* ── Mobile / small-tablet cards (xs–sm) ── */}
      <Stack gap={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
        {loading ? (
          [1, 2, 3].map(i => <Card key={i} sx={{ height: 180, opacity: 0.4, bgcolor: 'var(--color-surface-1)' }} />)
        ) : filtered.length === 0 ? (
          <Card><Typography sx={{ fontSize: 13, color: 'var(--color-ink-tertiary)', textAlign: 'center', py: 2 }}>{s.empty}</Typography></Card>
        ) : filtered.map(sa => (
          canWrite && editId === sa.id ? (
            <Card key={sa.id} sx={{ borderLeft: '3px solid var(--color-primary)' }}>
              <EditFormContent saId={sa.id} saLabel={`${sa.proiect} #${sa.nr} · ${sa.nume}`} initialValues={buildInitialValues(sa as Record<string, unknown>)} onSave={saveEdit} onReset={() => resetRow(sa.id)} onCancel={() => { setEditId(null); setSaveError(null) }} saving={saving} saveError={saveError} />
            </Card>
          ) : (
            <Card key={sa.id} sx={{ borderLeft: `3px solid ${isBlocat(sa) ? '#f87171' : sa.status_global === 'completed' ? '#4ade80' : 'var(--color-hairline)'}` }}>
              <Stack gap={1.5}>
                {/* Header row */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
                      {sa.proiect} <Typography component="span" sx={{ color: 'var(--color-ink-tertiary)' }}>#{sa.nr}</Typography>
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'var(--color-ink)', mt: 0.25, lineHeight: 1.3 }}>{sa.nume}</Typography>
                    {sa.conditionat_de && <Typography sx={{ fontSize: 11, color: 'var(--color-primary)', mt: 0.25 }}>🔵 {sa.conditionat_de}</Typography>}
                  </Box>
                  {globalChip(sa.status_global, t.subansambluri)}
                </Stack>

                {/* Progress */}
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box className="progress-bar" sx={{ flex: 1 }}>
                    <Box className={`progress-fill ${parseInt(sa.progres) >= 90 ? 'progress-fill-success' : parseInt(sa.progres) >= 60 ? 'progress-fill-warning' : 'progress-fill-danger'}`} sx={{ width: sa.progres }} />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)', minWidth: 36 }}>{sa.progres}</Typography>
                </Stack>

                {/* Timeline dates */}
                <Stack direction="row" gap={2} flexWrap="wrap">
                  {timelineSummary(sa as Record<string, unknown>).map(([label, value]) => (
                    <Box key={label}>
                      <Typography sx={{ fontSize: 9, color: 'var(--color-ink-tertiary)', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label === 'S' ? 'Start' : label === 'D' ? 'Due' : 'Done'}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>{value || '—'}</Typography>
                    </Box>
                  ))}
                </Stack>

                {/* Dept statuses grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
                  {DEPT_COLS.map(col => (
                    <Box key={col}>
                      <Typography sx={{ fontSize: 9, color: 'var(--color-ink-tertiary)', fontWeight: 700, letterSpacing: 0.4, mb: 0.25 }}>{DEPT_DISPLAY[col]}</Typography>
                      {statusChip(sa[col])}
                    </Box>
                  ))}
                </Box>

                {/* Dept done dates (non-empty only) */}
                {deptDateSummary(sa as Record<string, unknown>).length > 0 && (
                  <Stack direction="row" gap={1.5} flexWrap="wrap">
                    {deptDateSummary(sa as Record<string, unknown>).map(([label, value]) => (
                      <Typography key={label} sx={{ fontSize: 10, color: 'var(--color-ink-subtle)' }}>{label}: {value}</Typography>
                    ))}
                  </Stack>
                )}

                {/* Comments */}
                {sa.comentarii && (
                  <Typography sx={{ fontSize: 12, color: isBlocat(sa) ? '#f87171' : 'var(--color-ink-subtle)', fontStyle: 'italic' }}>
                    {sa.comentarii}
                  </Typography>
                )}

                {/* Actions */}
                {canWrite && (
                  <Stack direction="row" gap={1}>
                    <ActionButton variant="outlined" onClick={() => startEdit(sa as Record<string, unknown>)} sx={{ flex: 1, fontSize: 12, py: 0.75 }}>
                      ✏ {t.common.edit}
                    </ActionButton>
                    {sa.status_global !== 'completed' && (
                      <ActionButton onClick={() => finalizeRow(sa as Record<string, unknown>)} disabled={finalizing === sa.id}
                        sx={{ flex: 1, fontSize: 12, py: 0.75, bgcolor: 'rgba(39,166,68,0.1)', color: '#4ade80', border: '1px solid rgba(39,166,68,0.2)', '&:hover': { bgcolor: 'rgba(39,166,68,0.2)' } }}>
                        {finalizing === sa.id ? '...' : '✅ Finalizat'}
                      </ActionButton>
                    )}
                  </Stack>
                )}
              </Stack>
            </Card>
          )
        ))}
      </Stack>
    </Stack>
  )
}
