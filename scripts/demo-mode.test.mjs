import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'

import { enterDemo, exitDemo, isDemoAvailable, isDemoMode } from '../src/lib/demo.ts'

class MemoryStorage {
  items = new Map()

  getItem(key) {
    return this.items.get(key) ?? null
  }

  setItem(key, value) {
    this.items.set(key, String(value))
  }

  removeItem(key) {
    this.items.delete(key)
  }
}

beforeEach(() => {
  globalThis.sessionStorage = new MemoryStorage()
})

test('demo mode is disabled unless the build explicitly enables it', () => {
  sessionStorage.setItem('wpt_demo_mode', '1')

  assert.equal(isDemoAvailable(), false)
  assert.equal(isDemoMode(), false)
})

test('enterDemo does not store a demo bypass when demo mode is disabled', () => {
  enterDemo()

  assert.equal(sessionStorage.getItem('wpt_demo_mode'), null)
  assert.equal(isDemoMode(), false)
})

test('exitDemo clears any existing demo flag', () => {
  sessionStorage.setItem('wpt_demo_mode', '1')

  exitDemo()

  assert.equal(sessionStorage.getItem('wpt_demo_mode'), null)
})
