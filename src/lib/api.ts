import { supabase } from './supabase'
import { isDemoMode } from './demo'
import { DEMO } from '../data/demo'
import { buildDefaultSubassemblies, stripEmptyDateFields, withDefaultProjectTotals } from './projectDefaults'
import type { PermissionKey, PermissionOverride } from './permissions'

function friendlySupabaseError(error: { message?: string } | null | undefined) {
  const message = error?.message ?? 'Unknown database error'
  if (message.includes('schema cache') || message.includes("Could not find the '")) {
    return new Error('Database schema is behind the app. Run the latest migration, then try again.')
  }
  return error instanceof Error ? error : new Error(message)
}

// ── Production ─────────────────────────────────────────────────────────────────

export async function fetchProiecte() {
  if (isDemoMode()) return DEMO.proiecte
  const { data, error } = await supabase.from('proiecte').select('*').order('id')
  if (error) throw error
  return data
}

export async function deleteProiect(id: string) {
  if (isDemoMode()) return
  const { error } = await supabase.from('proiecte').delete().eq('id', id)
  if (error) throw friendlySupabaseError(error)
}

export async function updateProiect(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('proiecte').update(stripEmptyDateFields(row)).eq('id', id)
  if (error) throw friendlySupabaseError(error)
}

export async function insertProiect(row: Record<string, unknown>) {
  if (isDemoMode()) return
  const projectRow = stripEmptyDateFields(withDefaultProjectTotals(row))
  const { error: projectError } = await supabase.from('proiecte').insert(projectRow)
  if (projectError) throw friendlySupabaseError(projectError)

  const projectId = projectRow.id
  if (typeof projectId !== 'string' || !projectId) return

  const { error: subassemblyError } = await supabase
    .from('subansambluri')
    .insert(buildDefaultSubassemblies(projectId))

  if (!subassemblyError) return

  await supabase.from('proiecte').delete().eq('id', projectId)
  throw friendlySupabaseError(subassemblyError)
}

export async function fetchSubansambluri(proiect?: string) {
  if (isDemoMode()) {
    return proiect ? DEMO.subansambluri.filter((s: { proiect: string }) => s.proiect === proiect) : DEMO.subansambluri
  }
  let q = supabase.from('subansambluri').select('*').order('proiect').order('nr')
  if (proiect) q = q.eq('proiect', proiect)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function upsertSubansamblu(row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('subansambluri').upsert(row, { onConflict: 'proiect,nr' })
  if (error) throw error
}

export async function updateSubansamblu(id: number, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('subansambluri').update(row).eq('id', id)
  if (error) throw friendlySupabaseError(error)
}

export async function fetchBlocaje() {
  if (isDemoMode()) return DEMO.blocaje
  const { data, error } = await supabase.from('blocaje').select('*').order('data_deschidere', { ascending: false })
  if (error) throw error
  return data
}

export async function insertBlocaj(row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('blocaje').insert(row)
  if (error) throw error
}

export async function updateBlocaj(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('blocaje').update(row).eq('id', id)
  if (error) throw error
}

export async function fetchPDCA() {
  if (isDemoMode()) return DEMO.pdca
  const { data, error } = await supabase.from('pdca').select('*').order('data_deschis', { ascending: false })
  if (error) throw error
  return data
}

export async function insertPDCA(row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('pdca').insert(row)
  if (error) throw error
}

export async function updatePDCA(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('pdca').update(row).eq('id', id)
  if (error) throw error
}

export async function fetchFluxZilnic() {
  if (isDemoMode()) return DEMO.flux_zilnic
  const { data, error } = await supabase.from('flux_zilnic').select('*').order('data', { ascending: false }).order('id', { ascending: false })
  if (error) throw error
  return data
}

export async function insertFluxZilnic(row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('flux_zilnic').insert(row)
  if (error) throw error
}

export async function updateFluxZilnic(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('flux_zilnic').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteFluxZilnic(id: string) {
  if (isDemoMode()) return
  const { error } = await supabase.from('flux_zilnic').delete().eq('id', id)
  if (error) throw error
}

export async function fetchKpiEchipe() {
  if (isDemoMode()) return DEMO.kpi_echipe
  const { data, error } = await supabase.from('kpi_echipe').select('*').order('saptamana').order('echipa')
  if (error) throw error
  return data
}

export async function upsertKpiEchipe(row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('kpi_echipe').upsert(row, { onConflict: 'saptamana,echipa' })
  if (error) throw error
}

// ── Users & Profiles ───────────────────────────────────────────────────────────

export async function fetchProfiles() {
  if (isDemoMode()) return []
  const { data, error } = await supabase.from('profiles').select('*').order('created_at')
  if (error) throw error
  return data
}

export async function fetchAllUsers() {
  if (isDemoMode()) return []
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, role, departament').order('full_name')
  if (error) throw error
  return data as { id: string; full_name: string | null; email: string; role: string; departament: string | null }[]
}

export async function createUserAccount(row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { data, error } = await supabase.functions.invoke('create-user', { body: row })
  if (error) throw error
  return data
}

export async function updateProfile(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('profiles').update(row).eq('id', id)
  if (error) throw error
}

// ── Permissions ────────────────────────────────────────────────────────────────

export async function fetchUserPermissionOverrides(userId: string): Promise<PermissionOverride[]> {
  if (isDemoMode()) return []
  const { data, error } = await supabase
    .from('user_permission_overrides')
    .select('permission_key, granted')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as PermissionOverride[]
}

export async function saveUserPermissionOverrides(userId: string, overrides: { permission_key: PermissionKey; granted: boolean }[]) {
  if (isDemoMode()) return
  await supabase.from('user_permission_overrides').delete().eq('user_id', userId)
  if (overrides.length === 0) return
  const { error } = await supabase.from('user_permission_overrides').insert(
    overrides.map(o => ({ user_id: userId, permission_key: o.permission_key, granted: o.granted }))
  )
  if (error) throw error
}

// ── Tasks ──────────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  title: string
  description: string | null
  created_by: string | null
  assigned_to: string | null
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  author_id: string | null
  content: string
  created_at: string
}

export async function fetchTasks(): Promise<Task[]> {
  if (isDemoMode()) return []
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Task[]
}

export async function fetchTasksForUser(userId: string): Promise<{ assigned: Task[]; created: Task[] }> {
  if (isDemoMode()) return { assigned: [], created: [] }
  const [assignedRes, createdRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('assigned_to', userId).order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('created_by', userId).order('created_at', { ascending: false }),
  ])
  if (assignedRes.error) throw assignedRes.error
  if (createdRes.error) throw createdRes.error
  return { assigned: assignedRes.data as Task[], created: createdRes.data as Task[] }
}

export async function createTask(row: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  if (isDemoMode()) throw new Error('Not available in demo mode')
  const { data, error } = await supabase.from('tasks').insert(row).select().single()
  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, row: Partial<Task>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('tasks').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string) {
  if (isDemoMode()) return
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function fetchTaskComments(taskId: string): Promise<TaskComment[]> {
  if (isDemoMode()) return []
  const { data, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at')
  if (error) throw error
  return data as TaskComment[]
}

export async function createTaskComment(taskId: string, authorId: string, content: string): Promise<TaskComment> {
  if (isDemoMode()) throw new Error('Not available in demo mode')
  const { data, error } = await supabase
    .from('task_comments')
    .insert({ task_id: taskId, author_id: authorId, content })
    .select()
    .single()
  if (error) throw error
  return data as TaskComment
}

// ── Inventory ──────────────────────────────────────────────────────────────────

export interface InventoryCategory {
  id: string
  name: string
  type: 'raw_material' | 'finished_good'
  unit: string | null
  description: string | null
  created_at: string
}

export interface InventoryItem {
  id: string
  category_id: string | null
  name: string
  sku: string | null
  type: 'raw_material' | 'finished_good'
  unit: string
  quantity_on_hand: number
  quantity_reserved: number
  min_stock_level: number | null
  cost_per_unit: number | null
  supplier: string | null
  location: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InventoryTransaction {
  id: string
  item_id: string
  type: 'in' | 'out' | 'adjustment' | 'reservation'
  quantity: number
  reference: string | null
  notes: string | null
  performed_by: string | null
  created_at: string
}

export async function fetchInventoryCategories(): Promise<InventoryCategory[]> {
  if (isDemoMode()) return []
  const { data, error } = await supabase.from('inventory_categories').select('*').order('name')
  if (error) throw error
  return data as InventoryCategory[]
}

export async function createInventoryCategory(row: Omit<InventoryCategory, 'id' | 'created_at'>): Promise<InventoryCategory> {
  if (isDemoMode()) throw new Error('Not available in demo mode')
  const { data, error } = await supabase.from('inventory_categories').insert(row).select().single()
  if (error) throw error
  return data as InventoryCategory
}

export async function fetchInventoryItems(type?: 'raw_material' | 'finished_good'): Promise<InventoryItem[]> {
  if (isDemoMode()) return []
  let q = supabase.from('inventory_items').select('*').order('name')
  if (type) q = q.eq('type', type)
  const { data, error } = await q
  if (error) throw error
  return data as InventoryItem[]
}

export async function createInventoryItem(row: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
  if (isDemoMode()) throw new Error('Not available in demo mode')
  const { data, error } = await supabase.from('inventory_items').insert(row).select().single()
  if (error) throw error
  return data as InventoryItem
}

export async function updateInventoryItem(id: string, row: Partial<InventoryItem>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('inventory_items').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteInventoryItem(id: string) {
  if (isDemoMode()) return
  const { error } = await supabase.from('inventory_items').delete().eq('id', id)
  if (error) throw error
}

export async function fetchInventoryTransactions(itemId: string): Promise<InventoryTransaction[]> {
  if (isDemoMode()) return []
  const { data, error } = await supabase
    .from('inventory_transactions')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as InventoryTransaction[]
}

export async function createInventoryTransaction(row: Omit<InventoryTransaction, 'id' | 'created_at'>): Promise<InventoryTransaction> {
  if (isDemoMode()) throw new Error('Not available in demo mode')
  const { data, error } = await supabase.from('inventory_transactions').insert(row).select().single()
  if (error) throw error
  return data as InventoryTransaction
}

export async function fetchLowStockItems(): Promise<InventoryItem[]> {
  if (isDemoMode()) return []
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .not('min_stock_level', 'is', null)
    .order('name')
  if (error) throw error
  return (data as InventoryItem[]).filter(i => i.quantity_on_hand < (i.min_stock_level ?? Infinity))
}
