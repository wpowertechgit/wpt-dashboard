import { supabase } from './supabase'
import { isDemoMode } from './demo'
import { DEMO } from '../data/demo'
import { buildDefaultSubassemblies, stripEmptyDateFields, withDefaultProjectTotals } from './projectDefaults'
import type { PermissionKey, PermissionOverride } from './permissions'
import { insertNotification } from './notifications'

// ── Activity logging (fire-and-forget, never throws) ───────────────────────────

export function logAuthEvent(action: 'login' | 'logout', userId: string, userEmail: string) {
  if (isDemoMode()) return
  supabase.from('activity_logs').insert({
    user_id: userId,
    user_email: userEmail,
    action,
    entity_type: 'session',
    entity_id: userId,
    entity_label: userEmail,
    details: null,
  }).then()
}

export function logActivity(action: string, entityType: string, entityId: string, entityLabel: string, details?: Record<string, unknown>) {
  if (isDemoMode()) return
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session?.user) return
    supabase.from('activity_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email ?? '',
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_label: entityLabel,
      details: details ?? null,
    }).then()
  })
}

export interface ActivityLog {
  id: string
  user_id: string | null
  user_email: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  entity_label: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export async function fetchLogs(): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)
  if (error) throw error
  return data as ActivityLog[]
}

export async function deleteLog(id: string) {
  const { error } = await supabase.from('activity_logs').delete().eq('id', id)
  if (error) throw error
}

export async function clearAllLogs() {
  const { error } = await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
}

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
  logActivity('delete', 'project', id, `Proiect: ${id}`)
}

export async function updateProiect(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('proiecte').update(stripEmptyDateFields(row)).eq('id', id)
  if (error) throw friendlySupabaseError(error)
  logActivity('update', 'project', id, `Proiect: ${id}`)
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

  if (!subassemblyError) {
    logActivity('create', 'project', projectId, `Proiect: ${projectId}`)
    return
  }

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

const SA_DATE_FIELDS = new Set(['data_start','data_due','data_done','proiectare_done','laser_done','rolat_done','sudat_done','asamblat_done','vopsit_done'])

function sanitizeSaRow(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, SA_DATE_FIELDS.has(k) && v === '' ? null : v])
  )
}

export async function updateSubansamblu(id: number, row: Record<string, unknown>, before?: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('subansambluri').update(sanitizeSaRow(row)).eq('id', id)
  if (error) throw friendlySupabaseError(error)
  const label = row.status_global ? `SA #${id} → ${row.status_global}` : `SA #${id}`
  logActivity('update', 'subassembly', String(id), label, before ? { before, after: row } : undefined)
}

export async function rollbackSubansamblu(subassemblyId: number, before: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('subansambluri').update(sanitizeSaRow(before)).eq('id', subassemblyId)
  if (error) throw friendlySupabaseError(error)
  logActivity('rollback', 'subassembly', String(subassemblyId), `Rollback SA #${subassemblyId}`)
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
  logActivity('create', 'blocaj', String(row.id ?? ''), `Blocaj: ${row.id} — ${row.proiect ?? ''}`)
}

export async function updateBlocaj(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('blocaje').update(row).eq('id', id)
  if (error) throw error
  const action = row.status === 'Rezolvat' ? 'resolve' : 'update'
  logActivity(action, 'blocaj', id, `Blocaj: ${id}`)
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
  logActivity('create', 'pdca', String(row.id ?? ''), `PDCA: ${row.id} — ${row.proiect ?? ''}`)
}

export async function updatePDCA(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('pdca').update(row).eq('id', id)
  if (error) throw error
  const action = row.status === 'Inchis' ? 'close' : 'update'
  logActivity(action, 'pdca', id, `PDCA: ${id}`)
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
  logActivity('create', 'flux', '', `Flux: ${row.dept_origine} → ${row.dept_destinatie} (${row.proiect ?? ''})`)
}

export async function updateFluxZilnic(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('flux_zilnic').update(row).eq('id', id)
  if (error) throw error
  logActivity('update', 'flux', id, `Flux #${id}`)
}

export async function deleteFluxZilnic(id: string) {
  if (isDemoMode()) return
  const { error } = await supabase.from('flux_zilnic').delete().eq('id', id)
  if (error) throw error
  logActivity('delete', 'flux', id, `Flux #${id}`)
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
  logActivity('update', 'kpi', '', `KPI: ${row.echipa ?? ''} — ${row.saptamana ?? ''}`)
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
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, role, departament, avatar_url').order('full_name')
  if (error) throw error
  return data as { id: string; full_name: string | null; email: string; role: string; departament: string | null; avatar_url: string | null }[]
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${userId}.${ext}`
  const { error } = await supabase.storage.from('Profiles').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('Profiles').getPublicUrl(path)
  return data.publicUrl
}

export async function updateOwnProfile(userId: string, fields: { full_name?: string; departament?: string; avatar_url?: string | null }) {
  if (isDemoMode()) return
  const { error } = await supabase.from('profiles').update(fields).eq('id', userId)
  if (error) throw error
  logActivity('update', 'user', userId, `Profil actualizat: ${fields.full_name ?? userId}`)
}

export async function createUserAccount(row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: row,
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  logActivity('create', 'user', String(row.email ?? ''), `Utilizator nou: ${row.email ?? ''}`)
  return data
}

export async function updateProfile(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('profiles').update(row).eq('id', id)
  if (error) throw error
  logActivity('update', 'user', id, `Profil actualizat: ${row.full_name ?? row.role ?? id}`)
}

export async function sendPasswordReset(email: string) {
  if (isDemoMode()) return
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://oms.wpowertech.ro/reset-password',
  })
  if (error) throw error
  logActivity('reset_password', 'user', email, `Reset parolă: ${email}`)
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
  if (overrides.length > 0) {
    const { error } = await supabase.from('user_permission_overrides').insert(
      overrides.map(o => ({ user_id: userId, permission_key: o.permission_key, granted: o.granted }))
    )
    if (error) throw error
  }
  logActivity('update_permissions', 'user', userId, `Permisiuni actualizate: ${overrides.length} override-uri`)
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
  logActivity('create', 'task', data.id, `Task: ${row.title}`)
  if (row.assigned_to && row.assigned_to !== row.created_by) {
    insertNotification(row.assigned_to, `New task assigned to you: ${row.title}`, 'task_assigned', data.id)
    supabase.functions.invoke('notify-task-assigned', { body: data }).then()
  }
  return data as Task
}

export async function updateTask(id: string, row: Partial<Task>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('tasks').update(row).eq('id', id)
  if (error) throw error
  const action = row.status === 'DONE' ? 'complete' : 'update'
  logActivity(action, 'task', id, `Task #${id}${row.status ? ` → ${row.status}` : ''}`)
}

export async function deleteTask(id: string) {
  if (isDemoMode()) return
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
  logActivity('delete', 'task', id, `Task #${id}`)
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

export async function createTaskComment(
  taskId: string,
  authorId: string,
  content: string,
  task?: { title: string; created_by: string | null; assigned_to: string | null },
): Promise<TaskComment> {
  if (isDemoMode()) throw new Error('Not available in demo mode')
  const { data, error } = await supabase
    .from('task_comments')
    .insert({ task_id: taskId, author_id: authorId, content })
    .select()
    .single()
  if (error) throw error
  logActivity('comment', 'task', taskId, `Comentariu pe task #${taskId}`)
  if (task) {
    const msg = `New comment on task: ${task.title}`
    const recipients = new Set<string>()
    if (task.created_by && task.created_by !== authorId) recipients.add(task.created_by)
    if (task.assigned_to && task.assigned_to !== authorId) recipients.add(task.assigned_to)
    recipients.forEach(uid => insertNotification(uid, msg, 'task_comment', taskId))
  }
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
  logActivity('create', 'inventory', data.id, `Categorie stoc: ${row.name}`)
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
  logActivity('create', 'inventory', data.id, `Stoc: ${row.name} (${row.sku ?? ''})`)
  return data as InventoryItem
}

export async function updateInventoryItem(id: string, row: Partial<InventoryItem>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('inventory_items').update(row).eq('id', id)
  if (error) throw error
  logActivity('update', 'inventory', id, `Stoc actualizat: ${row.name ?? id}`)
}

export async function deleteInventoryItem(id: string) {
  if (isDemoMode()) return
  const { error } = await supabase.from('inventory_items').delete().eq('id', id)
  if (error) throw error
  logActivity('delete', 'inventory', id, `Stoc șters: ${id}`)
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
  logActivity('transaction', 'inventory', row.item_id, `Tranzacție stoc: ${row.type} ${row.quantity} (${row.reference ?? ''})`)
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
