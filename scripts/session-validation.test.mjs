import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

import { resolveValidSession } from '../src/lib/session.ts'

function createAuth({ session, user, userError }) {
  const calls = []

  return {
    calls,
    async getSession() {
      calls.push(['getSession'])
      return { data: { session } }
    },
    async getUser(token) {
      calls.push(['getUser', token])
      if (userError) return { data: { user: null }, error: userError }
      return { data: { user }, error: null }
    },
    async signOut() {
      calls.push(['signOut'])
      return { error: null }
    },
  }
}

test('resolveValidSession rejects stored sessions that cannot be verified by Supabase Auth', async () => {
  const auth = createAuth({
    session: { access_token: 'stale-token', user: { id: 'cached-user' } },
    user: null,
    userError: new Error('invalid JWT'),
  })

  const session = await resolveValidSession(auth)

  assert.equal(session, null)
  assert.deepEqual(auth.calls, [
    ['getSession'],
    ['getUser', 'stale-token'],
    ['signOut'],
  ])
})

test('resolveValidSession returns a session only when the token user matches the session user', async () => {
  const auth = createAuth({
    session: { access_token: 'valid-token', user: { id: 'cached-user', email: 'cached@example.com' } },
    user: { id: 'cached-user', email: 'verified@example.com' },
  })

  const session = await resolveValidSession(auth)

  assert.deepEqual(session, {
    access_token: 'valid-token',
    user: { id: 'cached-user', email: 'verified@example.com' },
  })
  assert.deepEqual(auth.calls, [
    ['getSession'],
    ['getUser', 'valid-token'],
  ])
})

test('resolveValidSession clears sessions whose token belongs to a different user', async () => {
  const auth = createAuth({
    session: { access_token: 'mixed-token', user: { id: 'cached-user' } },
    user: { id: 'different-user' },
  })

  const session = await resolveValidSession(auth)

  assert.equal(session, null)
  assert.deepEqual(auth.calls, [
    ['getSession'],
    ['getUser', 'mixed-token'],
    ['signOut'],
  ])
})

test('main Supabase client does not persist browser sessions across dev-server restarts', async () => {
  const source = await readFile(new URL('../src/lib/supabase.ts', import.meta.url), 'utf8')
  const mainClientSource = source.slice(
    source.indexOf('export const supabase ='),
    source.indexOf('// Service role client'),
  )

  assert.match(mainClientSource, /persistSession:\s*false/)
})
