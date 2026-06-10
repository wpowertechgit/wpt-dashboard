import type { CSSProperties } from 'react'

interface BorderBeamProps {
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  borderWidth?: number
  reverse?: boolean
  /** Must match the background color of the container so the interior stays transparent. */
  bgColor?: string
  className?: string
  style?: CSSProperties
}

export function BorderBeam({
  size = 100,
  duration = 6,
  delay = 0,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  borderWidth = 1,
  reverse = false,
  bgColor = 'var(--color-surface-1, #0f1011)',
  style,
}: BorderBeamProps) {
  const arcPct = Math.round(Math.min(60, Math.max(15, size / 5)))
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        border: `${borderWidth}px solid transparent`,
        background: `linear-gradient(${bgColor}, ${bgColor}) padding-box, conic-gradient(from var(--border-beam-angle, 0deg), transparent 0%, transparent ${100 - arcPct}%, ${colorFrom} ${100 - arcPct}%, ${colorTo} 100%) border-box`,
        animation: `${reverse ? 'border-beam-reverse' : 'border-beam'} ${duration}s linear ${delay}s infinite`,
        pointerEvents: 'none',
        zIndex: 1,
        ...style,
      } as CSSProperties}
    />
  )
}
