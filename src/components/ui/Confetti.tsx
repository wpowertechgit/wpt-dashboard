import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import confetti from 'canvas-confetti'
import type { CreateTypes, Options } from 'canvas-confetti'

export type ConfettiRef = {
    fire: (options?: Options) => Promise<null> | null
}

type ConfettiProps = HTMLAttributes<HTMLCanvasElement> & {
    globalOptions?: Options
}

const defaultFireOptions: Options = {
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    origin: { y: 0.68 },
}

export const Confetti = forwardRef<ConfettiRef, ConfettiProps>(
    ({ globalOptions, style, ...props }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null)
        const confettiRef = useRef<CreateTypes | null>(null)

        useEffect(() => {
            if (!canvasRef.current) return

            confettiRef.current = confetti.create(canvasRef.current, {
                resize: true,
                useWorker: true,
            })

            return () => {
                confettiRef.current?.reset()
                confettiRef.current = null
            }
        }, [])

        useImperativeHandle(ref, () => ({
            fire: (options = {}) => confettiRef.current?.({ ...defaultFireOptions, ...globalOptions, ...options }) ?? null,
        }))

        return (
            <canvas
                ref={canvasRef}
                style={{
                    pointerEvents: 'none',
                    ...style,
                }}
                {...props}
            />
        )
    },
)

Confetti.displayName = 'Confetti'

const demoStyles = {
    shell: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        minHeight: 360,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-hairline)',
        background:
            'radial-gradient(circle at 50% 15%, rgba(94, 106, 210, 0.24), transparent 34%), var(--color-surface-1)',
    },
    label: {
        pointerEvents: 'none',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(42px, 9vw, 112px)',
        fontWeight: 700,
        lineHeight: 1,
        color: 'var(--color-ink)',
    },
    canvas: {
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        width: '100%',
        height: '100%',
    },
} satisfies Record<string, CSSProperties>

export function ConfettiDemo() {
    const confettiRef = useRef<ConfettiRef>(null)

    return (
        <div
            style={demoStyles.shell}
            onMouseEnter={() => {
                confettiRef.current?.fire()
            }}
        >
            <span style={demoStyles.label}>Confetti</span>
            <Confetti ref={confettiRef} style={demoStyles.canvas} />
        </div>
    )
}

{/* another usable component
 "use client"

import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"

export function ConfettiCustomShapes() {
  const handleClick = () => {
    const scalar = 2
    const triangle = confetti.shapeFromPath({
      path: "M0 10 L5 0 L10 10z",
    })
    const square = confetti.shapeFromPath({
      path: "M0 0 L10 0 L10 10 L0 10 Z",
    })
    const coin = confetti.shapeFromPath({
      path: "M5 0 A5 5 0 1 0 5 10 A5 5 0 1 0 5 0 Z",
    })
    const tree = confetti.shapeFromPath({
      path: "M5 0 L10 10 L0 10 Z",
    })

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [triangle, square, coin, tree],
      scalar,
    }

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 30,
      })

      confetti({
        ...defaults,
        particleCount: 5,
      })

      confetti({
        ...defaults,
        particleCount: 15,
        scalar: scalar / 2,
        shapes: ["circle"],
      })
    }

    setTimeout(shoot, 0)
    setTimeout(shoot, 100)
    setTimeout(shoot, 200)
  }

  return (
    <div className="relative flex items-center justify-center">
      <Button onClick={handleClick}>Trigger Shapes</Button>
    </div>
  )
}
better for multi directioning

attributes:
Confetti
Prop	Type	Default	Description
particleCount	Integer	50	The number of confetti particles to launch
angle	Number	90	The angle in degrees at which to launch confetti
spread	Number	45	The spread in degrees of the confetti
startVelocity	Number	45	The initial velocity of the confetti
decay	Number	0.9	The rate at which confetti slows down
gravity	Number	1	The gravity applied to confetti particles
drift	Number	0	The horizontal drift applied to particles
flat	Boolean	false	Whether confetti particles are flat
ticks	Number	200	The number of frames confetti lasts
origin	Object	{ x: 0.5, y: 0.5 }	The origin point of the confetti
colors	Array of Strings	['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']	Array of color strings in HEX format
shapes	Array of Strings	['square', 'circle', 'star']	Array of shapes for the confetti
zIndex	Integer	100	The z-index of the confetti
disableForReducedMotion	Boolean	false	Disables confetti for users who prefer no motion
useWorker	Boolean	true	Use Web Worker for better performance
resize	Boolean	true	Whether to resize the canvas
canvas	HTMLCanvasElement or null	null	Custom canvas element to draw confetti
scalar	Number	1	Scaling factor for confetti size
    */}