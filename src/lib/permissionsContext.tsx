import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { resolvePermissions, canWriteOperationalData } from './permissions'
import type { PermissionKey, PermissionOverride, AppRole } from './permissions'
import { supabase } from './supabase'
import { isDemoMode } from './demo'

interface PermissionsValue {
  role: AppRole
  canWrite: boolean
  hasPermission: (key: PermissionKey) => boolean
  permissionsLoaded: boolean
}

const PermissionsContext = createContext<PermissionsValue>({
  role: null,
  canWrite: false,
  hasPermission: () => false,
  permissionsLoaded: false,
})

export function PermissionsProvider({
  role,
  userId,
  demoMode,
  children,
}: {
  role: AppRole
  userId: string | null
  demoMode: boolean
  children: ReactNode
}) {
  const [overrides, setOverrides] = useState<PermissionOverride[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (demoMode) { setLoaded(true); return }
    if (!userId || !role) { setOverrides([]); setLoaded(true); return }

    supabase
      .from('user_permission_overrides')
      .select('permission_key, granted')
      .eq('user_id', userId)
      .then(({ data }) => {
        setOverrides((data ?? []) as PermissionOverride[])
        setLoaded(true)
      })
  }, [userId, role, demoMode])

  const effective = resolvePermissions(role, overrides)

  const value: PermissionsValue = {
    role,
    canWrite: canWriteOperationalData(role, { demoMode }),
    hasPermission: (key: PermissionKey) => demoMode ? true : effective.has(key),
    permissionsLoaded: loaded,
  }

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

export function usePermissions() {
  return useContext(PermissionsContext)
}
