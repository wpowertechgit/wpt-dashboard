import { useState, useEffect, useCallback, useRef } from 'react'

const cache = new Map<string, { data: unknown; ts: number }>()
const inflight = new Map<string, Promise<unknown>>()
const STALE_MS = 30_000

function cacheKey(fn: () => unknown, deps: unknown[]): string {
  return (fn.name || fn.toString()) + JSON.stringify(deps)
}

export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const key = cacheKey(fn, deps)
  const hit = cache.get(key)

  const [data, setData] = useState<T | null>((hit?.data as T) ?? null)
  const [loading, setLoading] = useState(!hit)
  const [error, setError] = useState<string | null>(null)

  // always call the latest fn even if key hasn't changed
  const fnRef = useRef(fn)
  fnRef.current = fn

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const load = useCallback(async (silent = false) => {
    if (!silent && mounted.current) setLoading(true)
    try {
      // deduplicate: share one in-flight request per key
      let promise = inflight.get(key) as Promise<T> | undefined
      if (!promise) {
        promise = fnRef.current()
        inflight.set(key, promise as Promise<unknown>)
        promise.finally(() => inflight.delete(key))
      }
      const result = await promise
      cache.set(key, { data: result, ts: Date.now() })
      if (mounted.current) { setData(result); setLoading(false); setError(null) }
    } catch (e: unknown) {
      if (mounted.current) {
        setError(e instanceof Error ? e.message : String(e))
        if (!silent) setLoading(false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    const cached = cache.get(key)
    if (cached) {
      setData(cached.data as T)
      setLoading(false)
      // revalidate in background if stale
      if (Date.now() - cached.ts > STALE_MS) load(true)
    } else {
      setData(null)
      setLoading(true)
      load(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const refetch = useCallback(() => {
    cache.delete(key)
    load(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, load])

  return { data, loading, error, refetch }
}

export function invalidateQuery(fn: () => unknown, deps: unknown[] = []) {
  cache.delete(cacheKey(fn, deps))
}
