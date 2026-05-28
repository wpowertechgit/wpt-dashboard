const KEY = 'wpt_demo_mode'

export function isDemoAvailable(): boolean {
  return import.meta.env?.DEV || import.meta.env?.VITE_ENABLE_DEMO === 'true'
}

export function isDemoMode(): boolean {
  return isDemoAvailable() && sessionStorage.getItem(KEY) === '1'
}

export function enterDemo(): void {
  if (!isDemoAvailable()) return
  sessionStorage.setItem(KEY, '1')
}

export function exitDemo(): void {
  sessionStorage.removeItem(KEY)
}
