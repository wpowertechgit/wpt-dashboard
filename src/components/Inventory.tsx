import { useState, useCallback } from 'react'
import {
  Box, Stack, Typography, Dialog, DialogContent, DialogTitle,
  IconButton, CircularProgress, Tabs, Tab, Divider,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import {
  fetchInventoryItems, fetchInventoryCategories, fetchInventoryTransactions,
  createInventoryItem, updateInventoryItem, deleteInventoryItem,
  createInventoryTransaction,
} from '../lib/api'
import type { InventoryItem, InventoryCategory, InventoryTransaction } from '../lib/api'
import { usePermissions } from '../lib/permissionsContext'
import { useQuery } from '../lib/useQuery'
import { useLang } from '../lib/i18n'
import { pageInfo } from '../lib/pageInfo'
import {
  ActionButton, AppField, AppSelect, Badge, Card,
  DataTable, Eyebrow, PageTitle, Stack as UiStack,
  TableCell, TableRow, Typography as UiTypo,
} from './Ui'
import { ErrorBanner, LoadingRows } from './StateViews'

type InvType = 'raw_material' | 'finished_good'

function lowStock(item: InventoryItem): boolean {
  return item.min_stock_level != null && item.quantity_on_hand < item.min_stock_level
}

const BLANK_ITEM: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'> = {
  category_id: null, name: '', sku: null, type: 'raw_material', unit: 'pcs',
  quantity_on_hand: 0, quantity_reserved: 0, min_stock_level: null,
  cost_per_unit: null, supplier: null, location: null, notes: null,
}

interface ItemFormProps {
  categories: InventoryCategory[]
  initial?: InventoryItem
  onSave: () => void
  onCancel: () => void
  type: InvType
}

function ItemForm({ categories, initial, onSave, onCancel, type }: ItemFormProps) {
  const { t } = useLang()
  const inv = t.inventory
  const [form, setForm] = useState<typeof BLANK_ITEM>(
    initial
      ? { category_id: initial.category_id, name: initial.name, sku: initial.sku, type: initial.type, unit: initial.unit,
          quantity_on_hand: initial.quantity_on_hand, quantity_reserved: initial.quantity_reserved,
          min_stock_level: initial.min_stock_level, cost_per_unit: initial.cost_per_unit,
          supplier: initial.supplier, location: initial.location, notes: initial.notes }
      : { ...BLANK_ITEM, type }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cats = categories.filter(c => c.type === type)
  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v === '' ? null : v }))

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!form.name.trim() || !form.unit.trim()) return
    setSaving(true)
    setError(null)
    try {
      if (initial) await updateInventoryItem(initial.id, { ...form })
      else await createInventoryItem({ ...form, name: form.name.trim() })
      onSave()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)) }
    setSaving(false)
  }

  return (
    <Card sx={{ borderLeft: '3px solid var(--color-primary)' }}>
      <Eyebrow sx={{ mb: 2 }}>{initial ? inv.editItem : inv.formTitle}</Eyebrow>
      {error && <ErrorBanner message={error} />}
      <Stack component="form" onSubmit={submit} gap={1.5}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          <AppField label={`${inv.name} *`} required value={form.name} onChange={e => setF('name', e.target.value)} />
          <AppField label={inv.sku} value={form.sku ?? ''} onChange={e => setF('sku', e.target.value)} />
          <AppSelect label={inv.category} value={form.category_id ?? ''} onChange={e => setF('category_id', e.target.value)}
            options={[{ value: '', label: inv.noCategory }, ...cats.map(c => ({ value: c.id, label: c.name }))]} />
          <AppField label={`${inv.unit} *`} required value={form.unit} onChange={e => setF('unit', e.target.value)} placeholder="pcs, kg, m..." />
          <AppField label={inv.minStock} type="number" value={form.min_stock_level ?? ''} onChange={e => setF('min_stock_level', e.target.value ? Number(e.target.value) : null)} />
          <AppField label={inv.costPerUnit} type="number" value={form.cost_per_unit ?? ''} onChange={e => setF('cost_per_unit', e.target.value ? Number(e.target.value) : null)} />
          <AppField label={inv.supplier} value={form.supplier ?? ''} onChange={e => setF('supplier', e.target.value)} />
          <AppField label={inv.location} value={form.location ?? ''} onChange={e => setF('location', e.target.value)} />
        </Box>
        <AppField label={inv.notes} value={form.notes ?? ''} onChange={e => setF('notes', e.target.value)} multiline rows={2} />
        <Stack direction="row" gap={1}>
          <ActionButton type="submit" disabled={saving || !form.name.trim()}>{saving ? t.common.saving : t.common.save}</ActionButton>
          <ActionButton variant="outlined" onClick={onCancel}>{t.common.cancel}</ActionButton>
        </Stack>
      </Stack>
    </Card>
  )
}

interface TxDialogProps {
  item: InventoryItem
  txType: 'in' | 'out' | 'adjustment'
  userId: string | null
  onClose: () => void
  onDone: () => void
}

function TxDialog({ item, txType, userId, onClose, onDone }: TxDialogProps) {
  const { t } = useLang()
  const inv = t.inventory
  const [qty, setQty] = useState('')
  const [ref, setRef] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = txType === 'in' ? inv.txIn : txType === 'out' ? inv.txOut : inv.txAdjustment

  async function submit(e: { preventDefault(): void }) {
    e.preventDefault()
    const quantity = parseFloat(qty)
    if (!quantity || isNaN(quantity) || quantity <= 0) return
    setSaving(true)
    setError(null)
    try {
      await createInventoryTransaction({ item_id: item.id, type: txType, quantity, reference: ref || null, notes: notes || null, performed_by: userId })
      onDone()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)) }
    setSaving(false)
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: 'var(--color-surface-1)', backgroundImage: 'none', border: '1px solid var(--color-hairline)', m: { xs: 1, sm: 2 } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>{label} · {item.name}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'var(--color-ink-subtle)' }}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        {error && <ErrorBanner message={error} />}
        <Stack component="form" onSubmit={submit} gap={1.5}>
          <AppField label={`${inv.qtyLabel} (${item.unit}) *`} required type="number" value={qty} onChange={e => setQty(e.target.value)} autoFocus inputProps={{ min: 0.001, step: 'any' }} />
          <AppField label={inv.refLabel} value={ref} onChange={e => setRef(e.target.value)} />
          <AppField label={inv.notes} value={notes} onChange={e => setNotes(e.target.value)} multiline rows={2} />
          <ActionButton type="submit" disabled={saving || !qty}>{saving ? t.common.saving : label}</ActionButton>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

interface TxLogProps {
  item: InventoryItem
  onClose: () => void
}

function TxLog({ item, onClose }: TxLogProps) {
  const { t } = useLang()
  const inv = t.inventory
  const { data: txs, loading } = useQuery(() => fetchInventoryTransactions(item.id))

  const typeLabel = (type: InventoryTransaction['type']) =>
    ({ in: inv.txIn, out: inv.txOut, adjustment: inv.txAdjustment, reservation: inv.txReservation }[type])
  const typeTone = (type: InventoryTransaction['type']) =>
    ({ in: 'success', out: 'error', adjustment: 'info', reservation: 'warning' } as const)[type]

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'var(--color-surface-1)', backgroundImage: 'none', border: '1px solid var(--color-hairline)', m: { xs: 1, sm: 2 } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>{inv.txTitle} · {item.name}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'var(--color-ink-subtle)' }}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? <CircularProgress size={20} /> : (txs ?? []).length === 0 ? (
          <Typography sx={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>—</Typography>
        ) : (
          <Stack gap={1}>
            {(txs ?? []).map(tx => (
              <Box key={tx.id} sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 1.5, alignItems: 'center', bgcolor: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', p: '8px 12px' }}>
                <Box>
                  <Stack direction="row" gap={1} alignItems="center">
                    <Badge tone={typeTone(tx.type)}>{typeLabel(tx.type)}</Badge>
                    <Typography sx={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 600 }}>{tx.quantity > 0 ? '+' : ''}{tx.quantity} {item.unit}</Typography>
                  </Stack>
                  {tx.reference && <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)', mt: 0.25 }}>Ref: {tx.reference}</Typography>}
                  {tx.notes && <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)' }}>{tx.notes}</Typography>}
                </Box>
                <Typography sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)', whiteSpace: 'nowrap' }}>{new Date(tx.created_at).toLocaleDateString()}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function Inventory({ userId }: { userId: string | null }) {
  const { t, lang } = useLang()
  const inv = t.inventory
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission('edit_inventory')

  const [tab, setTab] = useState(0)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [txItem, setTxItem] = useState<InventoryItem | null>(null)
  const [txType, setTxType] = useState<'in' | 'out' | 'adjustment'>('in')
  const [txLogItem, setTxLogItem] = useState<InventoryItem | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const currentType: InvType = tab === 0 ? 'raw_material' : 'finished_good'

  const { data: items, loading: loadingItems, error: itemsError, refetch } = useQuery(() => fetchInventoryItems(currentType), [tab])
  const { data: categories } = useQuery(fetchInventoryCategories)

  function openTx(item: InventoryItem, type: 'in' | 'out' | 'adjustment') {
    setTxItem(item)
    setTxType(type)
  }

  async function handleDelete(item: InventoryItem) {
    if (!confirm(inv.deleteConfirm)) return
    setDeleteError(null)
    try { await deleteInventoryItem(item.id); refetch() } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : String(e))
    }
  }

  const cats = categories ?? []
  const catName = (id: string | null) => cats.find(c => c.id === id)?.name ?? '—'
  const itemList = items ?? []

  return (
    <UiStack gap={4}>
      <PageTitle eyebrow={inv.eyebrow} title={inv.title} subtitle={`${itemList.length} ${t.common.records}`} info={pageInfo(lang, 'inventory')}
        action={canEdit ? <ActionButton variant={showForm ? 'outlined' : 'contained'} onClick={() => { setShowForm(s => !s); setEditItem(null) }}>{showForm ? `x ${t.common.cancel}` : inv.newItem}</ActionButton> : undefined} />

      {(itemsError || deleteError) && <ErrorBanner message={itemsError ?? deleteError ?? ''} />}

      {showForm && canEdit && (
        <ItemForm categories={cats} initial={editItem ?? undefined} type={currentType}
          onSave={() => { setShowForm(false); setEditItem(null); refetch() }}
          onCancel={() => { setShowForm(false); setEditItem(null) }} />
      )}

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setShowForm(false) }} sx={{ px: 2, borderBottom: '1px solid var(--color-hairline)', minHeight: 44, '& .MuiTab-root': { fontSize: 13, textTransform: 'none', minHeight: 44, color: 'var(--color-ink-subtle)', '&.Mui-selected': { color: 'var(--color-ink)' } }, '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' } }}>
          <Tab label={inv.rawMaterials} />
          <Tab label={inv.finishedGoods} />
        </Tabs>

        {/* ── Desktop table (md+) ── */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <DataTable head={
            <TableRow>
              <TableCell>{inv.colName}</TableCell>
              <TableCell>{inv.colSku}</TableCell>
              <TableCell>{inv.colCategory}</TableCell>
              <TableCell>{inv.colUnit}</TableCell>
              <TableCell>{inv.colQty}</TableCell>
              <TableCell>{inv.colMin}</TableCell>
              <TableCell>{inv.colLocation}</TableCell>
              <TableCell>{inv.colCost}</TableCell>
              {canEdit && <TableCell>Actions</TableCell>}
            </TableRow>
          }>
            {loadingItems ? <LoadingRows cols={canEdit ? 9 : 8} /> : itemList.length === 0 ? (
              <TableRow><TableCell colSpan={canEdit ? 9 : 8} sx={{ textAlign: 'center', py: 4, color: 'var(--color-ink-tertiary)', fontSize: 13 }}>{inv.noItems}</TableCell></TableRow>
            ) : itemList.map(item => {
              const isLow = lowStock(item)
              return (
                <TableRow key={item.id} sx={{ bgcolor: isLow ? 'rgba(239,68,68,0.04)' : undefined }}>
                  <TableCell sx={{ fontWeight: 500, fontSize: 13 }}>
                    <Stack direction="row" gap={1} alignItems="center">
                      {item.name}
                      {isLow && <Badge tone="error">{inv.lowStock}</Badge>}
                    </Stack>
                    {item.notes && <UiTypo sx={{ fontSize: 11, color: 'var(--color-ink-tertiary)', mt: 0.25 }}>{item.notes}</UiTypo>}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-muted)' }}>{item.sku ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{catName(item.category_id)}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{item.unit}</TableCell>
                  <TableCell><UiTypo sx={{ fontSize: 13, fontWeight: 600, color: isLow ? '#f87171' : 'var(--color-ink)' }}>{item.quantity_on_hand}</UiTypo></TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{item.min_stock_level ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{item.location ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{item.cost_per_unit != null ? `${item.cost_per_unit} lei` : '—'}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <Stack direction="row" gap={0.5} flexWrap="wrap">
                        <ActionButton onClick={() => openTx(item, 'in')} sx={{ px: 1, py: 0.375, fontSize: 11, color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', border: '1px solid' }}>+</ActionButton>
                        <ActionButton onClick={() => openTx(item, 'out')} sx={{ px: 1, py: 0.375, fontSize: 11, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', border: '1px solid' }}>−</ActionButton>
                        <ActionButton variant="outlined" onClick={() => setTxLogItem(item)} sx={{ px: 1, py: 0.375, fontSize: 11 }}>Log</ActionButton>
                        <ActionButton variant="outlined" onClick={() => { setEditItem(item); setShowForm(true) }} sx={{ px: 1, py: 0.375, fontSize: 11 }}>{t.common.edit}</ActionButton>
                        <ActionButton onClick={() => handleDelete(item)} sx={{ px: 1, py: 0.375, fontSize: 11, color: 'var(--color-ink-tertiary)', border: '1px solid var(--color-hairline)' }}>✕</ActionButton>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </DataTable>
        </Box>

        {/* ── Mobile cards (xs–sm) ── */}
        <Stack sx={{ display: { xs: 'flex', md: 'none' } }} gap={0}>
          {loadingItems ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={20} /></Box>
          ) : itemList.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><UiTypo sx={{ fontSize: 13, color: 'var(--color-ink-tertiary)' }}>{inv.noItems}</UiTypo></Box>
          ) : itemList.map((item, i) => {
            const isLow = lowStock(item)
            return (
              <Box
                key={item.id}
                sx={{
                  p: '14px 16px',
                  borderBottom: i < itemList.length - 1 ? '1px solid var(--color-hairline)' : 'none',
                  bgcolor: isLow ? 'rgba(239,68,68,0.03)' : 'transparent',
                }}
              >
                {/* Row 1: name + low stock badge */}
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }} flexWrap="wrap">
                  <UiTypo sx={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', flex: 1 }}>{item.name}</UiTypo>
                  {isLow && <Badge tone="error">{inv.lowStock}</Badge>}
                </Stack>

                {/* Row 2: SKU + category */}
                <Stack direction="row" gap={2} sx={{ mb: 1 }} flexWrap="wrap">
                  {item.sku && (
                    <UiTypo sx={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-muted)' }}>{item.sku}</UiTypo>
                  )}
                  <UiTypo sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{catName(item.category_id)}</UiTypo>
                </Stack>

                {/* Row 3: quantity (prominent) + unit */}
                <Stack direction="row" alignItems="baseline" gap={1.5} sx={{ mb: 1 }}>
                  <Box sx={{ bgcolor: isLow ? 'rgba(239,68,68,0.08)' : 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', px: 2, py: 1, textAlign: 'center', minWidth: 64 }}>
                    <UiTypo sx={{ fontSize: 22, fontWeight: 700, color: isLow ? '#f87171' : 'var(--color-ink)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{item.quantity_on_hand}</UiTypo>
                    <UiTypo sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', mt: 0.25 }}>{item.unit}</UiTypo>
                  </Box>
                  {item.min_stock_level != null && (
                    <Stack>
                      <UiTypo sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Min</UiTypo>
                      <UiTypo sx={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{item.min_stock_level} {item.unit}</UiTypo>
                    </Stack>
                  )}
                  {item.cost_per_unit != null && (
                    <Stack>
                      <UiTypo sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Cost</UiTypo>
                      <UiTypo sx={{ fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 500 }}>{item.cost_per_unit} lei</UiTypo>
                    </Stack>
                  )}
                </Stack>

                {/* Row 4: location + supplier */}
                {(item.location || item.supplier) && (
                  <Stack direction="row" gap={2} sx={{ mb: 1 }} flexWrap="wrap">
                    {item.location && (
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <UiTypo sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Loc.</UiTypo>
                        <UiTypo sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{item.location}</UiTypo>
                      </Stack>
                    )}
                    {item.supplier && (
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <UiTypo sx={{ fontSize: 10, color: 'var(--color-ink-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Furnizor</UiTypo>
                        <UiTypo sx={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>{item.supplier}</UiTypo>
                      </Stack>
                    )}
                  </Stack>
                )}

                {/* Row 5: notes */}
                {item.notes && (
                  <UiTypo sx={{ fontSize: 12, color: 'var(--color-ink-subtle)', fontStyle: 'italic', mb: canEdit ? 1 : 0 }}>{item.notes}</UiTypo>
                )}

                {/* Row 6: actions */}
                {canEdit && (
                  <Stack direction="row" gap={0.75} flexWrap="wrap">
                    <ActionButton onClick={() => openTx(item, 'in')}
                      sx={{ flex: 1, fontSize: 12, py: 0.75, color: '#4ade80', bgcolor: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', '&:hover': { bgcolor: 'rgba(74,222,128,0.15)' } }}>
                      + {inv.txIn}
                    </ActionButton>
                    <ActionButton onClick={() => openTx(item, 'out')}
                      sx={{ flex: 1, fontSize: 12, py: 0.75, color: '#f87171', bgcolor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', '&:hover': { bgcolor: 'rgba(248,113,113,0.15)' } }}>
                      − {inv.txOut}
                    </ActionButton>
                    <ActionButton variant="outlined" onClick={() => setTxLogItem(item)} sx={{ fontSize: 12, py: 0.75, px: 1.5 }}>Log</ActionButton>
                    <ActionButton variant="outlined" onClick={() => { setEditItem(item); setShowForm(true) }} sx={{ fontSize: 12, py: 0.75, px: 1.5 }}>{t.common.edit}</ActionButton>
                    <ActionButton onClick={() => handleDelete(item)} sx={{ fontSize: 12, py: 0.75, px: 1.5, color: 'var(--color-ink-tertiary)', border: '1px solid var(--color-hairline)' }}>✕</ActionButton>
                  </Stack>
                )}
              </Box>
            )
          })}
        </Stack>
      </Card>

      {txItem && (
        <TxDialog item={txItem} txType={txType} userId={userId} onClose={() => setTxItem(null)} onDone={() => { setTxItem(null); refetch() }} />
      )}
      {txLogItem && (
        <TxLog item={txLogItem} onClose={() => setTxLogItem(null)} />
      )}
    </UiStack>
  )
}
