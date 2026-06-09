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

const CF_QUERY = `
query ($zoneTag: String!, $since: Date!, $until: Date!) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      daily: httpRequests1dGroups(
        limit: 31
        filter: { date_geq: $since, date_leq: $until }
        orderBy: [date_ASC]
      ) {
        date
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
}
`

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const cfToken = Deno.env.get('CLOUDFLARE_API_TOKEN')
  const zoneId = Deno.env.get('CLOUDFLARE_ZONE_ID')
  if (!cfToken || !zoneId) {
    return json({ error: 'Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID secrets' }, 500)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing authorization' }, 401)

  let from: string, to: string
  try {
    const body = await req.json()
    from = body.from
    to = body.to
    if (!from || !to) throw new Error()
  } catch {
    const now = new Date()
    to = now.toISOString().slice(0, 10)
    now.setDate(now.getDate() - 7)
    from = now.toISOString().slice(0, 10)
  }

  const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: CF_QUERY,
      variables: { zoneTag: zoneId, since: from, until: to },
    }),
  })

  if (!cfRes.ok) return json({ error: `Cloudflare API error: ${cfRes.status}` }, 502)

  const cfData = await cfRes.json()
  if (cfData.errors?.length) return json({ error: cfData.errors[0].message }, 502)

  const days: Array<{
    date: string
    sum: { requests: number; pageViews: number; bytes: number; cachedBytes: number; threats: number; countryMap: Array<{ clientCountryName: string; requests: number }> }
    uniq: { uniques: number }
  }> = cfData.data?.viewer?.zones?.[0]?.daily ?? []

  const countryAgg: Record<string, number> = {}
  let totalVisitors = 0, totalRequests = 0, totalPageViews = 0, totalBytes = 0, totalThreats = 0, totalCached = 0

  for (const d of days) {
    totalVisitors  += d.uniq?.uniques       ?? 0
    totalRequests  += d.sum?.requests       ?? 0
    totalPageViews += d.sum?.pageViews      ?? 0
    totalBytes     += d.sum?.bytes          ?? 0
    totalThreats   += d.sum?.threats        ?? 0
    totalCached    += d.sum?.cachedBytes    ?? 0
    for (const c of d.sum?.countryMap ?? []) {
      countryAgg[c.clientCountryName] = (countryAgg[c.clientCountryName] ?? 0) + c.requests
    }
  }

  const countries = Object.entries(countryAgg)
    .map(([name, requests]) => ({ name, requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10)

  return json({
    from,
    to,
    totals: { visitors: totalVisitors, requests: totalRequests, pageViews: totalPageViews, bytes: totalBytes, cachedBytes: totalCached, threats: totalThreats },
    days: days.map(d => ({
      date: d.date,
      visitors: d.uniq?.uniques    ?? 0,
      requests: d.sum?.requests    ?? 0,
      pageViews: d.sum?.pageViews  ?? 0,
      bytes: d.sum?.bytes          ?? 0,
      threats: d.sum?.threats      ?? 0,
    })),
    countries,
  })
})
