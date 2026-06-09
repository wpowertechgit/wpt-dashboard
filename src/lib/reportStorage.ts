import { supabase } from './supabase'

const BUCKET = 'Excel reports'
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export interface ReportFile {
  name: string
  path: string
  size: number
  createdAt: string
}

function nowTag(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`
}

export function projectReportPath(projectId: string): { path: string; filename: string } {
  const filename = `WPT_${projectId}_${nowTag()}.xlsx`
  return { path: `projects/${projectId}/${filename}`, filename }
}

export function batchReportPath(): { path: string; filename: string } {
  const filename = `WPT_AllProjects_${nowTag()}.xlsx`
  return { path: `batch/${filename}`, filename }
}

export async function uploadReport(storagePath: string, buffer: ArrayBuffer): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: XLSX_MIME, upsert: false })
  if (error) throw error
}

export async function listProjectReports(projectId: string): Promise<ReportFile[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(`projects/${projectId}`, { limit: 30, sortBy: { column: 'created_at', order: 'desc' } })
  if (error) throw error
  return (data ?? [])
    .filter(f => f.name !== '.emptyFolderPlaceholder')
    .map(f => ({
      name: f.name,
      path: `projects/${projectId}/${f.name}`,
      size: (f.metadata as Record<string, number> | null)?.size ?? 0,
      createdAt: f.created_at ?? '',
    }))
}

export async function listBatchReports(): Promise<ReportFile[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list('batch', { limit: 30, sortBy: { column: 'created_at', order: 'desc' } })
  if (error) throw error
  return (data ?? [])
    .filter(f => f.name !== '.emptyFolderPlaceholder')
    .map(f => ({
      name: f.name,
      path: `batch/${f.name}`,
      size: (f.metadata as Record<string, number> | null)?.size ?? 0,
      createdAt: f.created_at ?? '',
    }))
}

export async function getSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export async function deleteReport(storagePath: string): Promise<void> {
  const { data, error } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (error) throw error
  // Supabase returns an empty array (no error) when RLS blocks deletion
  if (!data || data.length === 0) {
    throw new Error('Stergere esuata — verifica politicile RLS pentru bucket-ul "Excel reports" (DELETE policy lipsa)')
  }
}

export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function parseReportDate(filename: string): string {
  // WPT_WP1000-11_2026-06-09_1430.xlsx  →  09.06.2026 14:30
  const m = filename.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})/)
  if (!m) return ''
  return `${m[3]}.${m[2]}.${m[1]} ${m[4]}:${m[5]}`
}
