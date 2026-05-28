import type { AuthError, Session, User } from '@supabase/supabase-js'

interface AuthSessionClient {
  getSession(): Promise<{ data: { session: Session | null } }>
  getUser(jwt?: string): Promise<{ data: { user: User | null }; error: AuthError | Error | null }>
  signOut(): Promise<{ error: AuthError | Error | null }>
}

async function clearStoredSession(auth: AuthSessionClient): Promise<null> {
  try {
    await auth.signOut()
  } catch (error) {
    console.error('Failed to clear invalid session:', error)
  }
  return null
}

export async function verifySession(auth: AuthSessionClient, session: Session | null): Promise<Session | null> {
  if (!session?.access_token) return null

  const { data, error } = await auth.getUser(session.access_token)

  if (error || !data.user || data.user.id !== session.user.id) {
    return clearStoredSession(auth)
  }

  return { ...session, user: data.user }
}

export async function resolveValidSession(auth: AuthSessionClient): Promise<Session | null> {
  const { data } = await auth.getSession()
  return verifySession(auth, data.session)
}
