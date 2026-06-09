const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const cfToken = Deno.env.get('CLOUDFLARE_API_TOKEN')
  const zoneId  = Deno.env.get('CLOUDFLARE_ZONE_ID')

  console.log('secrets present:', { cfToken: !!cfToken, zoneId: !!zoneId })

  if (!cfToken || !zoneId) {
    return json({ error: 'Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID secrets' }, 500)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing authorization' }, 401)

  // Decode the Supabase JWT to get the requesting user's identity
  function getUserFromToken(header: string): { id: string; email: string } | null {
    try {
      const payload = JSON.parse(atob(header.replace('Bearer ', '').split('.')[1]))
      return { id: payload.sub ?? '', email: payload.email ?? '' }
    } catch { return null }
  }
  const requestingUser = getUserFromToken(authHeader)

  let from: string, to: string
  try {
    const body = await req.json()
    from = body.from
    to   = body.to
    if (!from || !to) throw new Error('missing dates')
  } catch {
    const now = new Date()
    to = now.toISOString().slice(0, 10)
    now.setDate(now.getDate() - 7)
    from = now.toISOString().slice(0, 10)
  }

  console.log('fetching CF data for range:', from, '->', to, 'zone:', zoneId)

  // Inline dates directly — avoids GraphQL Date scalar issues with some CF API versions
  const dayCount = Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000) + 2

  const query = `{
    viewer {
      zones(filter: { zoneTag: "${zoneId}" }) {
        daily: httpRequests1dGroups(
          limit: ${dayCount}
          filter: { date_geq: "${from}", date_leq: "${to}" }
          orderBy: [date_ASC]
        ) {
          dimensions {
            date
          }
          sum {
            requests
            pageViews
            bytes
            cachedBytes
            threats
            countryMap {
              clientCountryName
              requests
            }
          }
          uniq {
            uniques
          }
        }
      }
    }
  }`

  let cfRes: Response
  try {
    cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
  } catch (err) {
    console.error('fetch to CF failed:', err)
    return json({ error: `Network error reaching Cloudflare: ${err}` }, 502)
  }

  console.log('CF response status:', cfRes.status)

  const cfText = await cfRes.text()
  console.log('CF response body (first 500 chars):', cfText.slice(0, 500))

  if (!cfRes.ok) {
    return json({ error: `Cloudflare API HTTP ${cfRes.status}: ${cfText.slice(0, 300)}` }, 502)
  }

  let cfData: { data?: { viewer?: { zones?: Array<{ daily?: unknown[] }> } }; errors?: Array<{ message: string }> }
  try {
    cfData = JSON.parse(cfText)
  } catch {
    return json({ error: 'Invalid JSON from Cloudflare', raw: cfText.slice(0, 300) }, 502)
  }

  if (cfData.errors?.length) {
    console.error('CF GraphQL errors:', cfData.errors)
    return json({ error: cfData.errors.map(e => e.message).join('; ') }, 502)
  }

  type DayRow = {
    dimensions: { date: string }
    sum: { requests: number; pageViews: number; bytes: number; cachedBytes: number; threats: number; countryMap: Array<{ clientCountryName: string; requests: number }> }
    uniq: { uniques: number }
  }

  const days = (cfData.data?.viewer?.zones?.[0]?.daily ?? []) as DayRow[]
  console.log('days returned:', days.length)

  const countryAgg: Record<string, number> = {}
  let totalVisitors = 0, totalRequests = 0, totalPageViews = 0, totalBytes = 0, totalThreats = 0, totalCached = 0

  for (const d of days) {
    totalVisitors  += d.uniq?.uniques    ?? 0
    totalRequests  += d.sum?.requests    ?? 0
    totalPageViews += d.sum?.pageViews   ?? 0
    totalBytes     += d.sum?.bytes       ?? 0
    totalThreats   += d.sum?.threats     ?? 0
    totalCached    += d.sum?.cachedBytes ?? 0
    for (const c of d.sum?.countryMap ?? []) {
      countryAgg[c.clientCountryName] = (countryAgg[c.clientCountryName] ?? 0) + c.requests
    }
  }

  const countries = Object.entries(countryAgg)
    .map(([name, requests]) => ({ name, requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10)

  // Log the report generation with the actual requesting user
  const supabaseUrl2 = Deno.env.get('SUPABASE_URL')
  const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (supabaseUrl2 && serviceKey && requestingUser) {
    fetch(`${supabaseUrl2}/rest/v1/activity_logs`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id: requestingUser.id,
        user_email: requestingUser.email,
        action: 'report',
        entity_type: 'report',
        entity_id: `cf-${from}-${to}`,
        entity_label: `Cloudflare report: ${from} → ${to}`,
        details: { from, to, days: days.length },
      }),
    }).then()
  }

  return json({
    from, to,
    totals: { visitors: totalVisitors, requests: totalRequests, pageViews: totalPageViews, bytes: totalBytes, cachedBytes: totalCached, threats: totalThreats },
    days: days.map(d => ({
      date:      d.dimensions?.date,
      visitors:  d.uniq?.uniques   ?? 0,
      requests:  d.sum?.requests   ?? 0,
      pageViews: d.sum?.pageViews  ?? 0,
      bytes:     d.sum?.bytes      ?? 0,
      threats:   d.sum?.threats    ?? 0,
    })),
    countries,
  })
})
