import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

export type FoldPhase = 'idle' | 'cover' | 'reveal'

const D  = 0.2   // per-panel animation duration (s)
const DS = 0.07  // stagger between panels (s)

const PANELS = [
  {
    id: 0,
    clip:   'inset(0 50% 50% 0)',   // TL
    origin: '100% 50%',              // pivot = right edge → folds right
    rotKey: 'rotateY' as const,
    rotVal: -90,
    closeDelay: DS * 0,
    openDelay:  DS * 3,              // opens last → fires onRevealDone
  },
  {
    id: 1,
    clip:   'inset(0 0 50% 50%)',    // TR
    origin: '50% 100%',              // pivot = bottom edge → folds down
    rotKey: 'rotateX' as const,
    rotVal: 90,
    closeDelay: DS * 1,
    openDelay:  DS * 2,
  },
  {
    id: 2,
    clip:   'inset(50% 0 0 50%)',    // BR
    origin: '0% 50%',               // pivot = left edge → folds left
    rotKey: 'rotateY' as const,
    rotVal: 90,
    closeDelay: DS * 2,
    openDelay:  DS * 1,
  },
  {
    id: 3,
    clip:   'inset(50% 50% 0 0)',    // BL
    origin: '50% 0%',               // pivot = top edge → folds up
    rotKey: 'rotateX' as const,
    rotVal: -90,
    closeDelay: DS * 3,              // closes last → fires onCoverDone
    openDelay:  DS * 0,              // opens first ("toward the top")
  },
]

// Fallback colors when no screenshot is available
const FALLBACK = ['#1a1b1e', '#16171a', '#1c1d20', '#18191c']

interface FoldPanelsProps {
  phase: FoldPhase
  screenshot: string | null
  onCoverDone: () => void
  onRevealDone: () => void
}

export function FoldPanels({ phase, screenshot, onCoverDone, onRevealDone }: FoldPanelsProps) {
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  if (phase === 'idle') return null

  const covering = phase === 'cover'

  function makeCallback(id: number) {
    return () => {
      if (id === 3 && phaseRef.current === 'cover') onCoverDone()
      else if (id === 0 && phaseRef.current === 'reveal') onRevealDone()
    }
  }

  const panelBg = (idx: number): CSSProperties =>
    screenshot
      ? {
          backgroundImage: `url(${screenshot})`,
          backgroundSize: '100vw 100vh',
          backgroundPosition: '0 0',
          backgroundRepeat: 'no-repeat',
        }
      : { background: FALLBACK[idx] }

  return (
    <>
      {/* Blur overlay — fades in when all panels are fully closed, fades out on reveal */}
      <motion.div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9997,
          pointerEvents: 'none',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as CSSProperties}
        initial={{ opacity: 0 }}
        animate={{ opacity: covering ? 1 : 0 }}
        transition={{ duration: 0.1, delay: covering ? D + DS * 3 - 0.08 : 0 }}
      />

      {PANELS.map((p, i) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            inset: 0,
            clipPath: p.clip,
            zIndex: 9999,
            pointerEvents: 'none',
            perspective: '600px',
          } as CSSProperties}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: p.origin,
              ...panelBg(i),
            } as CSSProperties}
            initial={{ [p.rotKey]: p.rotVal }}
            animate={{ [p.rotKey]: covering ? 0 : p.rotVal }}
            transition={{ duration: D, ease: [0.4, 0, 0.2, 1], delay: covering ? p.closeDelay : p.openDelay }}
            onAnimationComplete={p.id === 3 || p.id === 0 ? makeCallback(p.id) : undefined}
          />
        </div>
      ))}
    </>
  )
}
