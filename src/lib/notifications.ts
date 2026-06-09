import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export interface AppNotification {
  id: string
  user_id: string
  message: string
  type: string
  task_id: string | null
  read: boolean
  created_at: string
}

export function insertNotification(userId: string, message: string, type: string, taskId?: string | null) {
  supabase.from('notifications').insert({
    user_id: userId,
    message,
    type,
    task_id: taskId ?? null,
  }).then()
}

async function loadNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data as AppNotification[]
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    if (!userId) return

    let active = true
    loadNotifications(userId)
      .then(data => { if (active) setNotifications(data) })
      .catch(() => {})

    const channel = supabase
      .channel(`notifications:${userId}:${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        if (active) setNotifications(prev => [payload.new as AppNotification, ...prev])
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [userId])

  const unreadCount = notifications.filter(n => !n.read).length

  function markRead(id: string) {
    supabase.from('notifications').update({ read: true }).eq('id', id).then()
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    if (!userId) return
    supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false).then()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return { notifications, unreadCount, markRead, markAllRead }
}
