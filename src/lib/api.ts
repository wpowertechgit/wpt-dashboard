import { supabase } from './supabase'
import { isDemoMode } from './demo'
import { DEMO } from '../data/demo'

export async function fetchProiecte() {
  if (isDemoMode()) return DEMO.proiecte
  const { data, error } = await supabase.from('proiecte').select('*').order('id')
  if (error) throw error
  return data
}

export async function insertProiect(row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('proiecte').insert(row)
  if (error) throw error
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

export async function fetchProfiles() {
  if (isDemoMode()) return []
  const { data, error } = await supabase.from('profiles').select('*').order('created_at')
  if (error) throw error
  return data
}

export async function updateProfile(id: string, row: Record<string, unknown>) {
  if (isDemoMode()) return
  const { error } = await supabase.from('profiles').update(row).eq('id', id)
  if (error) throw error
}
