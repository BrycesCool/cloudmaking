'use client'

import { useRef, forwardRef, useImperativeHandle } from 'react'
import gsap from 'gsap'

export interface FallingStickFigureRef {
  startFall: () => void
}

interface FallingStickFigureProps {
  onReachBottom?: () => void
  onFallComplete?: () => void
}

const FallingStickFigure = forwardRef<FallingStickFigureRef, FallingStickFigureProps>(
  ({ onReachBottom, onFallComplete }, ref) => {
    const figureRef = useRef<SVGSVGElement>(null)
    const leftArmRef = useRef<SVGLineElement>(null)
    const rightArmRef = useRef<SVGLineElement>(null)
    const leftLegRef = useRef<SVGLineElement>(null)
    const rightLegRef = useRef<SVGLineElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const upperWingRef = useRef<SVGGElement>(null)

    useImperativeHandle(ref, () => ({
      startFall: () => {
        if (!figureRef.current || !containerRef.current) return

        // Reset limbs to standing position
        gsap.set(leftArmRef.current, { attr: { x2: -10, y2: 8 } })
        gsap.set(rightArmRef.current, { attr: { x2: 10, y2: 8 } })
        gsap.set(leftLegRef.current, { attr: { x2: -6, y2: 35 } })
        gsap.set(rightLegRef.current, { attr: { x2: 6, y2: 35 } })

        // Reset upper wing scale
        gsap.set(upperWingRef.current, { scaleX: -1 })

        // Reset figure position
        gsap.set(figureRef.current, {
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
        })

        // Main timeline
        const tl = gsap.timeline()

        // Single smooth fall through first screen
        // Rotation and y position animate together
        tl.to(figureRef.current, {
          rotation: 90,
          y: '110vh',
          scale: 1.4,
          duration: 2.2,
          ease: 'power2.in',
          onComplete: () => {
            onReachBottom?.()

            // Reset to above screen - keep horizontal
            const vh = window.innerHeight
            gsap.set(figureRef.current, {
              y: -(vh / 2) - 150,
              rotation: 90,
              scale: 1,
            })
          }
        })

        // Fall through second screen - smooth continuation
        tl.to(figureRef.current, {
          rotation: 90,
          y: '110vh',
          scale: 1.8,
          duration: 3,
          ease: 'power1.in',
        })

        // Fade out at bottom
        tl.to(figureRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            onFallComplete?.()
          }
        }, '-=0.3')

        // Arms reach UP toward the sky (negative Y in figure's space = toward top when rotated)
        // When figure is at -90 rotation, "up" in world space is toward negative X in figure space
        gsap.to(leftArmRef.current, {
          attr: { x2: -5, y2: -15 },
          duration: 0.4,
          ease: 'power2.out',
        })
        gsap.to(leftArmRef.current, {
          attr: { x2: -3, y2: -20 },
          duration: 0.6,
          delay: 0.4,
          ease: 'power2.out',
        })
        // Gentle floating
        gsap.to(leftArmRef.current, {
          attr: { x2: -6, y2: -22 },
          duration: 0.8,
          delay: 1,
          repeat: 6,
          yoyo: true,
          ease: 'sine.inOut',
        })

        gsap.to(rightArmRef.current, {
          attr: { x2: 5, y2: -15 },
          duration: 0.35,
          ease: 'power2.out',
        })
        gsap.to(rightArmRef.current, {
          attr: { x2: 3, y2: -22 },
          duration: 0.6,
          delay: 0.35,
          ease: 'power2.out',
        })
        // Gentle floating
        gsap.to(rightArmRef.current, {
          attr: { x2: 8, y2: -25 },
          duration: 0.9,
          delay: 1,
          repeat: 6,
          yoyo: true,
          ease: 'sine.inOut',
        })

        // Legs reach UP toward the sky
        gsap.to(leftLegRef.current, {
          attr: { x2: -8, y2: 20 },
          duration: 0.4,
          ease: 'power2.out',
        })
        gsap.to(leftLegRef.current, {
          attr: { x2: -5, y2: 10 },
          duration: 0.5,
          delay: 0.4,
          ease: 'power2.out',
        })
        // Gentle floating
        gsap.to(leftLegRef.current, {
          attr: { x2: -8, y2: 5 },
          duration: 0.7,
          delay: 0.9,
          repeat: 5,
          yoyo: true,
          ease: 'sine.inOut',
        })

        gsap.to(rightLegRef.current, {
          attr: { x2: 8, y2: 18 },
          duration: 0.45,
          ease: 'power2.out',
        })
        gsap.to(rightLegRef.current, {
          attr: { x2: 5, y2: 8 },
          duration: 0.5,
          delay: 0.45,
          ease: 'power2.out',
        })
        // Gentle floating
        gsap.to(rightLegRef.current, {
          attr: { x2: 10, y2: 3 },
          duration: 0.75,
          delay: 0.95,
          repeat: 5,
          yoyo: true,
          ease: 'sine.inOut',
        })

        // Upper wing slowly flips horizontally during fall
        gsap.to(upperWingRef.current, {
          scaleX: 1,
          duration: 4,
          delay: 0.5,
          ease: 'power1.inOut',
        })
      }
    }))

    return (
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 150,
        }}
      >
        <svg
          ref={figureRef}
          width="80"
          height="100"
          viewBox="-25 -35 50 80"
          style={{
            transformOrigin: 'center center',
          }}
        >
          {/* Head */}
          <circle
            cx="0"
            cy="-15"
            r="8"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Body */}
          <line
            x1="0"
            y1="-7"
            x2="0"
            y2="15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Angel Wings - positioned on right side of body, pointing right */}
          {/* Upper Wing - flipped horizontally to point right, animates during fall */}
          <g ref={upperWingRef} transform="translate(26, -26) scale(0.15, 0.15) rotate(0)" style={{ transformOrigin: '0 0', transformBox: 'fill-box' }}>
            <path
              d="M134.4,229.8c4.7-1.1,3-8.5-1.7-7.3c-6.4,2.1-14.2,1.2-20.5,0.6c-16.6-2.2-32.3-7.7-47-15.2c-16.3-9.6-59.4-36.9-51.9-58.8c3.2-3.4,7.4-2.3,11.6-1.2c3.2,0.8,6.3,1.6,9,0.6c3.9-2.5,1-6.9-1.7-9c-3.7-3.9-6.9-8.1-9.9-12.5c-15.1-29,0.5-22.3,19.4-11.3c5.9,0.4,4.8-6.4,1.9-9.4c-3.3-5.4-6.2-11-8.9-16.8c-11.4-25.4-20.3-52-27-79c25.8,21.3,49.9,44.8,75.2,66.7c18.5,15.9,38.9,29.4,58.1,44.4c14.2,11.5,28.7,25.5,32.1,44.1c3.8,18.4-11.8,40.8-31.9,32.4c-11.9-2.9-21.6-14.3-18.3-26.9c0.1-3.4,4.5-5.1,3.2-8.5c-4.4-7-10.3,2.8-10.7,7.6c-7.7,34,47.9,52.1,61.2,19.5c18.8-42.2-28.7-72.9-58-94.1C103,84,87.4,71.6,73.1,58.5C60.1,46.3,47,34.5,33.5,22.7C26.5,18,9.7-1.7,2.6,0.1C-9.9,2.8,26.8,92.6,32.8,102.3c-33.4-15.8-25.8,22.3-10.2,37.5c-17-3.8-22,14.7-14.9,27c9.7,17.7,26.8,30,43,41.2c20.4,12.4,44.9,23.1,69.3,23.1C124.9,231.1,129.6,230.7,134.4,229.8L134.4,229.8z"
              fill="white"
              stroke="white"
              strokeWidth="6"
            />
          </g>
          {/* Lower Wing - slightly different angle for spread effect */}
          <g transform="translate(26, -15) scale(-0.14, 0.14) rotate(0)">
            <path
              d="M134.4,229.8c4.7-1.1,3-8.5-1.7-7.3c-6.4,2.1-14.2,1.2-20.5,0.6c-16.6-2.2-32.3-7.7-47-15.2c-16.3-9.6-59.4-36.9-51.9-58.8c3.2-3.4,7.4-2.3,11.6-1.2c3.2,0.8,6.3,1.6,9,0.6c3.9-2.5,1-6.9-1.7-9c-3.7-3.9-6.9-8.1-9.9-12.5c-15.1-29,0.5-22.3,19.4-11.3c5.9,0.4,4.8-6.4,1.9-9.4c-3.3-5.4-6.2-11-8.9-16.8c-11.4-25.4-20.3-52-27-79c25.8,21.3,49.9,44.8,75.2,66.7c18.5,15.9,38.9,29.4,58.1,44.4c14.2,11.5,28.7,25.5,32.1,44.1c3.8,18.4-11.8,40.8-31.9,32.4c-11.9-2.9-21.6-14.3-18.3-26.9c0.1-3.4,4.5-5.1,3.2-8.5c-4.4-7-10.3,2.8-10.7,7.6c-7.7,34,47.9,52.1,61.2,19.5c18.8-42.2-28.7-72.9-58-94.1C103,84,87.4,71.6,73.1,58.5C60.1,46.3,47,34.5,33.5,22.7C26.5,18,9.7-1.7,2.6,0.1C-9.9,2.8,26.8,92.6,32.8,102.3c-33.4-15.8-25.8,22.3-10.2,37.5c-17-3.8-22,14.7-14.9,27c9.7,17.7,26.8,30,43,41.2c20.4,12.4,44.9,23.1,69.3,23.1C124.9,231.1,129.6,230.7,134.4,229.8L134.4,229.8z"
              fill="white"
              stroke="white"
              strokeWidth="6"
            />
          </g>

          {/* Left arm */}
          <line
            ref={leftArmRef}
            x1="0"
            y1="0"
            x2="-10"
            y2="8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Right arm */}
          <line
            ref={rightArmRef}
            x1="0"
            y1="0"
            x2="10"
            y2="8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Left leg */}
          <line
            ref={leftLegRef}
            x1="0"
            y1="15"
            x2="-6"
            y2="35"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Right leg */}
          <line
            ref={rightLegRef}
            x1="0"
            y1="15"
            x2="6"
            y2="35"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }
)

FallingStickFigure.displayName = 'FallingStickFigure'

export default FallingStickFigure
