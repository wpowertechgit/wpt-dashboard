export type AppRole = 'admin' | 'worker' | string | null | undefined

export function canWriteOperationalData(role: AppRole, options: { demoMode?: boolean } = {}): boolean {
  return options.demoMode === true || role === 'admin'
}
