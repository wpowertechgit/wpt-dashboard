import type { ReactNode, CSSProperties } from 'react'

interface AuroraTextProps {
  children: ReactNode
  className?: string
  colors?: string[]
  speed?: number
  style?: CSSProperties
}

export function AuroraText({
  children,
  className,
  colors = ['#FF0080', '#7928CA', '#0070F3', '#38bdf8'],
  speed = 1,
  style,
}: AuroraTextProps) {
  const gradient = [...colors, colors[0]].join(', ')
  return (
    <span
      className={className}
      style={{
        backgroundImage: `linear-gradient(90deg, ${gradient})`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: `aurora-shift ${4 / speed}s linear infinite`,
        display: 'inline',
        ...style,
      } as CSSProperties}
    >
      {children}
    </span>
  )
}
