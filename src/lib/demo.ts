const KEY = 'wpt_demo_mode'

export function isDemoMode(): boolean {
  return sessionStorage.getItem(KEY) === '1'
}

export function enterDemo(): void {
  sessionStorage.setItem(KEY, '1')
}

export function exitDemo(): void {
  sessionStorage.removeItem(KEY)
}
