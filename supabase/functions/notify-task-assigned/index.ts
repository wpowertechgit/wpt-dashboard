import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromAddress = Deno.env.get('RESEND_FROM') ?? 'WPT Dashboard <notifications@oms.wpowertech.ro>'

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Missing Supabase config' }, 500)
  }
  if (!resendKey) {
    return json({ error: 'Missing RESEND_API_KEY secret' }, 500)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader) return json({ error: 'Missing authorization' }, 401)

  let task: Record<string, unknown>
  try {
    task = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const assignedTo = task.assigned_to as string | null
  const createdBy = task.created_by as string | null

  if (!assignedTo || assignedTo === createdBy) {
    return json({ ok: true, skipped: true })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const [assigneeRes, creatorRes] = await Promise.all([
    admin.from('profiles').select('email, full_name').eq('id', assignedTo).single(),
    createdBy
      ? admin.from('profiles').select('full_name, email').eq('id', createdBy).single()
      : Promise.resolve({ data: null, error: null }),
  ])

  const assigneeEmail = (assigneeRes.data as { email?: string } | null)?.email
  if (!assigneeEmail) {
    return json({ ok: true, skipped: true, reason: 'no assignee email' })
  }

  const assigneeName = (assigneeRes.data as { full_name?: string | null; email: string } | null)?.full_name || assigneeEmail
  const creatorName  = (creatorRes.data as { full_name?: string | null; email?: string } | null)?.full_name
    || (creatorRes.data as { email?: string } | null)?.email
    || 'A team member'

  const title = String(task.title ?? '')
  const description = task.description ? String(task.description) : null
  const dueDate = task.due_date ? String(task.due_date) : null
  const priority = String(task.priority ?? 'NORMAL')

  const priorityColors: Record<string, string> = {
    LOW: '#6b7280', NORMAL: '#6366f1', HIGH: '#f59e0b', URGENT: '#ef4444',
  }
  const badgeColor = priorityColors[priority] ?? '#6366f1'

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
      <p style="margin:0 0 24px;font-size:13px;color:#9ca3af;letter-spacing:0.5px;text-transform:uppercase">WPT Dashboard</p>

      <h1 style="margin:0 0 6px;font-size:22px;font-weight:600;color:#111827;line-height:1.3">New task assigned to you</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#6b7280">Assigned by <strong style="color:#374151">${creatorName}</strong></p>

      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin-bottom:28px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="background:${badgeColor};color:#fff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:4px;letter-spacing:0.4px">${priority}</span>
          ${dueDate ? `<span style="font-size:13px;color:#9ca3af">Due ${dueDate}</span>` : ''}
        </div>
        <h2 style="margin:0${description ? ' 0 10px' : ''};font-size:17px;font-weight:600;color:#111827;line-height:1.4">${title}</h2>
        ${description ? `<p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;white-space:pre-wrap">${description}</p>` : ''}
      </div>

      <a href="https://oms.wpowertech.ro/tasks"
         style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:11px 22px;border-radius:7px;font-size:14px;font-weight:500">
        View task →
      </a>

      <p style="margin-top:32px;font-size:12px;color:#d1d5db;border-top:1px solid #f3f4f6;padding-top:20px">
        This notification was sent to ${assigneeName} because a task was assigned to them in WPT Dashboard.
      </p>
    </div>
  `

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [assigneeEmail],
      subject: `New task: ${title}`,
      html,
    }),
  })

  if (!emailRes.ok) {
    const errText = await emailRes.text()
    console.error('Resend error:', errText)
    return json({ error: errText }, 500)
  }

  return json({ ok: true, to: assigneeEmail })
})
