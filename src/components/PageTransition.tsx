import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

export type FoldPhase = 'idle' | 'cover' | 'reveal'

// Duration per panel in seconds
const D = 0.22

const PANELS = [
  { id: 0, clip: 'inset(0 50% 50% 0)',  origin: '100% 50%', ry: -90, delay: 0.00, shine: 'to right'  },
  { id: 1, clip: 'inset(0 0 50% 50%)',  origin: '0% 50%',   ry:  90, delay: 0.04, shine: 'to left'   },
  { id: 2, clip: 'inset(50% 50% 0 0)',  origin: '100% 50%', ry: -90, delay: 0.04, shine: 'to right'  },
  { id: 3, clip: 'inset(50% 0 0 50%)',  origin: '0% 50%',   ry:  90, delay: 0.00, shine: 'to left'   },
]

// Panel 1 finishes last (delay 0.04) — drives the done callback
const LAST_PANEL_ID = 1

interface FoldPanelsProps {
  phase: FoldPhase
  onCoverDone: () => void
  onRevealDone: () => void
}

export function FoldPanels({ phase, onCoverDone, onRevealDone }: FoldPanelsProps) {
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  if (phase === 'idle') return null

  const covering = phase === 'cover'

  function handleLastComplete() {
    if (phaseRef.current === 'cover') onCoverDone()
    else if (phaseRef.current === 'reveal') onRevealDone()
  }

  return (
    <>
      {PANELS.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            inset: 0,
            clipPath: p.clip,
            zIndex: 9999,
            pointerEvents: 'none',
            perspective: '1200px',
          } as CSSProperties}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--color-surface-2, #141516)',
              transformOrigin: p.origin,
            } as CSSProperties}
            initial={{ rotateY: covering ? p.ry : 0 }}
            animate={{ rotateY: covering ? 0 : p.ry }}
            transition={{ duration: D, ease: [0.4, 0, 0.2, 1], delay: p.delay }}
            onAnimationComplete={p.id === LAST_PANEL_ID ? handleLastComplete : undefined}
          >
            {/* Fold-edge light catch — simulates paper crease */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(${p.shine}, rgba(255,255,255,0.05) 0%, transparent 35%)`,
              pointerEvents: 'none',
            } as CSSProperties} />
            {/* Center-edge accent line */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              [p.ry < 0 ? 'right' : 'left']: 0,
              width: 1,
              background: 'rgba(94, 106, 210, 0.5)',
              pointerEvents: 'none',
            } as CSSProperties} />
          </motion.div>
        </div>
      ))}
    </>
  )
}
