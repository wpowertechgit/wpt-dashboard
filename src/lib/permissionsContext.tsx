import { createContext, useContext } from 'react'
import { canWriteOperationalData } from './permissions'

interface PermissionsValue {
  role: string | null
  canWrite: boolean
}

const PermissionsContext = createContext<PermissionsValue>({ role: null, canWrite: false })

export function PermissionsProvider({ role, demoMode, children }: { role: string | null; demoMode: boolean; children: React.ReactNode }) {
  return (
    <PermissionsContext.Provider value={{ role, canWrite: canWriteOperationalData(role, { demoMode }) }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  return useContext(PermissionsContext)
}
