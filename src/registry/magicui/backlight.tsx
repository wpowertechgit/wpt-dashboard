import React, { useEffect, useRef } from 'react'

interface BacklightProps {
  children: React.ReactElement
  blur?: number
  className?: string
  colors?: string[]
  animationDuration?: number
}

export function Backlight({
  children,
  blur = 20,
  className,
  colors = [
    'rgba(59, 130, 246, 0.7)',
    'rgba(99, 102, 241, 0.7)',
    'rgba(168, 85, 247, 0.7)',
    'rgba(236, 72, 153, 0.7)',
    'rgba(239, 68, 68, 0.7)',
    'rgba(245, 158, 11, 0.7)',
    'rgba(34, 197, 94, 0.7)',
    'rgba(6, 182, 212, 0.7)',
    'rgba(59, 130, 246, 0.7)',
  ],
  animationDuration = 6000,
}: BacklightProps) {
  const glowRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    const el = glowRef.current
    if (!el) return

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const segmentCount = colors.length - 1
      const totalProgress = (elapsed % animationDuration) / animationDuration
      const segmentIndex = Math.floor(totalProgress * segmentCount)
      const segmentProgress = (totalProgress * segmentCount) % 1

      const from = colors[segmentIndex]
      const to = colors[Math.min(segmentIndex + 1, colors.length - 1)]

      // Parse rgba values for interpolation
      const parse = (c: string) => {
        const m = c.match(/[\d.]+/g)!.map(Number)
        return m
      }
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      const eased = segmentProgress < 0.5
        ? 2 * segmentProgress * segmentProgress
        : 1 - Math.pow(-2 * segmentProgress + 2, 2) / 2

      const [r1, g1, b1, a1] = parse(from)
      const [r2, g2, b2, a2] = parse(to)
      const color = `rgba(${Math.round(lerp(r1, r2, eased))}, ${Math.round(lerp(g1, g2, eased))}, ${Math.round(lerp(b1, b2, eased))}, ${lerp(a1, a2, eased).toFixed(2)})`

      el.style.background = color
      el.style.boxShadow = `0 0 ${blur}px ${Math.round(blur * 0.4)}px ${color}`

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [colors, blur, animationDuration])

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          filter: `blur(${blur}px)`,
          opacity: 0.8,
          transition: 'background 0.1s',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
