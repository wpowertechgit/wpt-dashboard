import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Role = 'admin' | 'worker'

interface CreateUserBody {
  email?: unknown
  password?: unknown
  full_name?: unknown
  departament?: unknown
  role?: unknown
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readRole(value: unknown): Role | null {
  if (value === 'admin' || value === 'worker') return value
  return null
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Function is missing Supabase environment configuration' }, 500)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '')
  if (!jwt) return json({ error: 'Missing authorization token' }, 401)

  let body: CreateUserBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const email = readString(body.email)
  const password = readString(body.password)
  const fullName = readString(body.full_name)
  const departament = readString(body.departament)
  const role = readRole(body.role ?? 'worker')

  if (!email || !password) return json({ error: 'Email and password are required' }, 400)
  if (!role) return json({ error: 'Invalid role' }, 400)

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: caller, error: callerError } = await authClient.auth.getUser(jwt)
  if (callerError || !caller.user) return json({ error: 'Invalid authorization token' }, 401)

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', caller.user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return json({ error: 'Only admins can create users' }, 403)
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error || !data.user) {
    return json({ error: error?.message ?? 'Could not create user' }, 400)
  }

  const { error: updateError } = await adminClient
    .from('profiles')
    .update({
      full_name: fullName || null,
      role,
      departament: departament || null,
    })
    .eq('id', data.user.id)

  if (updateError) return json({ error: updateError.message }, 400)

  return json({ user: { id: data.user.id, email: data.user.email } }, 201)
})
