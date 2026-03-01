'use client'

import { useRef, forwardRef, useImperativeHandle } from 'react'
import gsap from 'gsap'

export interface GlassShatterRef {
  trigger: () => void
}

interface GlassShatterProps {
  particleCount?: number
}

const GlassShatter = forwardRef<GlassShatterRef, GlassShatterProps>(
  ({ particleCount = 100 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const particlesRef = useRef<HTMLDivElement[]>([])

    useImperativeHandle(ref, () => ({
      trigger: () => {
        if (!containerRef.current) return

        // Show container
        gsap.set(containerRef.current, { display: 'block' })

        // Animate each particle
        particlesRef.current.forEach((particle, i) => {
          if (!particle) return

          // Random starting position near top center (where figure enters)
          const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 80
          const startY = -5

          // Random end position - spread outward and fall
          const endX = startX + (Math.random() - 0.5) * 500
          const endY = window.innerHeight * (0.2 + Math.random() * 0.6)

          // Random rotation
          const rotation = (Math.random() - 0.5) * 540

          // Smaller random size (2-6px)
          const size = 2 + Math.random() * 4

          // Set initial state
          gsap.set(particle, {
            x: startX,
            y: startY,
            width: size,
            height: size,
            opacity: 0.9,
            rotation: 0,
            scale: 1,
          })

          // Animate falling - slower duration
          gsap.to(particle, {
            x: endX,
            y: endY,
            rotation: rotation,
            opacity: 0,
            scale: 0.3,
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 0.2,
            ease: 'power1.out',
          })
        })

        // Hide container after animation
        gsap.to(containerRef.current, {
          display: 'none',
          delay: 5,
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
          pointerEvents: 'none',
          zIndex: 140,
          display: 'none',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: particleCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) particlesRef.current[i] = el
            }}
            style={{
              position: 'absolute',
              background: 'rgba(255, 255, 255, 0.85)',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.4)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          />
        ))}
      </div>
    )
  }
)

GlassShatter.displayName = 'GlassShatter'

export default GlassShatter
