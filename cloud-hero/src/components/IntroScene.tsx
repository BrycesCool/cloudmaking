'use client'

import { useRef, forwardRef, useImperativeHandle, useState } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import type { Attachment } from '@/types/stickfigure'

// Dynamically import IntroCloudScene with no SSR
const IntroCloudScene = dynamic(() => import('./IntroCloudScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ color: '#fff', fontSize: '18px' }}>Loading...</div>
    </div>
  ),
})

export interface IntroSceneRef {
  triggerFall: () => void
}

interface IntroSceneProps {
  onFallStart?: () => void
  onFallComplete?: () => void
  attachments?: Attachment[]
}

// Sitting pose for the stick figure on the cloud
interface JointPositions {
  head: { x: number; y: number }
  neck: { x: number; y: number }
  shoulder_l: { x: number; y: number }
  shoulder_r: { x: number; y: number }
  elbow_l: { x: number; y: number }
  elbow_r: { x: number; y: number }
  hand_l: { x: number; y: number }
  hand_r: { x: number; y: number }
  hip: { x: number; y: number }
  hip_l: { x: number; y: number }
  hip_r: { x: number; y: number }
  knee_l: { x: number; y: number }
  knee_r: { x: number; y: number }
  foot_l: { x: number; y: number }
  foot_r: { x: number; y: number }
}

// Sitting pose - on edge of cloud, legs dangling, casually holding fishing rod (facing LEFT)
const sittingPose: JointPositions = {
  head: { x: 0, y: -55 },
  neck: { x: 0, y: -35 },
  shoulder_l: { x: -12, y: -32 },
  shoulder_r: { x: 12, y: -32 },
  elbow_l: { x: -30, y: -15 },  // Left arm holding rod, relaxed angle
  elbow_r: { x: 20, y: -10 },
  hand_l: { x: -45, y: 0 },     // Hand holding rod grip
  hand_r: { x: 18, y: 10 },     // Right hand resting
  hip: { x: 0, y: 0 },
  hip_l: { x: -10, y: 8 },
  hip_r: { x: 10, y: 8 },
  knee_l: { x: -15, y: 45 },    // Legs dangling off edge
  knee_r: { x: 12, y: 42 },
  foot_l: { x: -18, y: 75 },
  foot_r: { x: 10, y: 72 },
}

// Bones connecting joints
const bones: { from: keyof JointPositions; to: keyof JointPositions }[] = [
  { from: 'head', to: 'neck' },
  { from: 'neck', to: 'hip' },
  { from: 'neck', to: 'shoulder_l' },
  { from: 'neck', to: 'shoulder_r' },
  { from: 'shoulder_l', to: 'elbow_l' },
  { from: 'shoulder_r', to: 'elbow_r' },
  { from: 'elbow_l', to: 'hand_l' },
  { from: 'elbow_r', to: 'hand_r' },
  { from: 'hip', to: 'hip_l' },
  { from: 'hip', to: 'hip_r' },
  { from: 'hip_l', to: 'knee_l' },
  { from: 'hip_r', to: 'knee_r' },
  { from: 'knee_l', to: 'foot_l' },
  { from: 'knee_r', to: 'foot_r' },
]

const IntroScene = forwardRef<IntroSceneRef, IntroSceneProps>(
  ({ onFallStart, onFallComplete, attachments = [] }, ref) => {
    const figureGroupRef = useRef<SVGGElement>(null)
    const fishingLineRef = useRef<SVGPathElement>(null)
    const [joints] = useState<JointPositions>(sittingPose)
    const [isVisible, setIsVisible] = useState(true)

    useImperativeHandle(ref, () => ({
      triggerFall: () => {
        if (!figureGroupRef.current) return

        onFallStart?.()

        const tl = gsap.timeline()

        // Fishing line snaps/retracts to rod tip
        if (fishingLineRef.current) {
          tl.to(fishingLineRef.current, {
            attr: { d: 'M -105 15 Q -100 20 -95 15' },
            duration: 0.2,
            ease: 'power2.in',
          })
        }

        // Fall straight down (like the main falling animation)
        tl.to(figureGroupRef.current, {
          y: '150vh',
          duration: 3.5,
          ease: 'power3.in', // Slow start, fast end - same as main fall
          onComplete: () => {
            setIsVisible(false)
            onFallComplete?.()
          }
        })
      }
    }))

    if (!isVisible) return null

    return (
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          background: '#000000',
        }}
      >
        {/* 3D Cloud Scene with title */}
        <IntroCloudScene />

        {/* Stick figure overlay - positioned on the small cloud */}
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <svg
            width="200"
            height="600"
            viewBox="-100 -80 200 600"
            style={{ overflow: 'visible' }}
          >
            {/* Stick figure group (for animation) */}
            <g ref={figureGroupRef} style={{ transformOrigin: '0 0' }}>
              {/* Fishing rod - extending left and slightly down (relaxed angle) */}
              <line
                x1={joints.hand_l.x}
                y1={joints.hand_l.y}
                x2={joints.hand_l.x - 60}
                y2={joints.hand_l.y + 15}
                stroke="#8B4513"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Fishing line - drops straight down into the first "O" in OUR */}
              <path
                ref={fishingLineRef}
                d="M -105 15 Q -120 200 -95 350 Q -85 420 -75 480"
                fill="none"
                stroke="#666"
                strokeWidth="1"
              />
              {/* Small hook at end of line inside the first O */}
              <path
                d="M -75 480 Q -70 488 -75 492 Q -82 488 -78 480"
                fill="none"
                stroke="#666"
                strokeWidth="1"
              />

              {/* Attachments BEHIND body (zIndex < 0) - wings tucked behind, small and subtle */}
              {attachments.filter(a => a.zIndex < 0).map(att => {
                const jointKey = att.jointId as keyof JointPositions
                const joint = joints[jointKey]
                if (!joint) return null
                return (
                  <g
                    key={att.id}
                    transform={`translate(${joint.x + att.offsetX * 0.5}, ${joint.y + att.offsetY * 0.5})`}
                  >
                    <image
                      href={att.imageData}
                      x="-25"
                      y="-25"
                      width="50"
                      height="50"
                      preserveAspectRatio="xMidYMid meet"
                      style={{
                        transformOrigin: 'center center',
                        transformBox: 'fill-box',
                        transform: `rotate(${att.rotation}deg) scale(${att.scale * 0.5})`,
                      }}
                    />
                  </g>
                )
              })}

              {/* Head - smaller */}
              <circle
                cx={joints.head.x}
                cy={joints.head.y}
                r={18}
                fill="none"
                stroke="white"
                strokeWidth="4"
              />

              {/* Bones/Lines - thinner for smaller scale */}
              {bones.map((bone, index) => (
                <line
                  key={index}
                  x1={joints[bone.from].x}
                  y1={joints[bone.from].y}
                  x2={joints[bone.to].x}
                  y2={joints[bone.to].y}
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              ))}

              {/* Attachments IN FRONT of body (zIndex > 0) - scaled down */}
              {attachments.filter(a => a.zIndex > 0).map(att => {
                const jointKey = att.jointId as keyof JointPositions
                const joint = joints[jointKey]
                if (!joint) return null
                return (
                  <g
                    key={att.id}
                    transform={`translate(${joint.x + att.offsetX * 0.5}, ${joint.y + att.offsetY * 0.5})`}
                  >
                    <image
                      href={att.imageData}
                      x="-25"
                      y="-25"
                      width="50"
                      height="50"
                      preserveAspectRatio="xMidYMid meet"
                      style={{
                        transformOrigin: 'center center',
                        transformBox: 'fill-box',
                        transform: `rotate(${att.rotation}deg) scale(${att.scale * 0.5})`,
                      }}
                    />
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        {/* Click instruction - down arrow */}
        <button
          onClick={() => {
            if (!figureGroupRef.current) return

            onFallStart?.()

            const tl = gsap.timeline()

            // Fishing line snaps/retracts to rod tip
            if (fishingLineRef.current) {
              tl.to(fishingLineRef.current, {
                attr: { d: 'M -105 15 Q -100 20 -95 15' },
                duration: 0.2,
                ease: 'power2.in',
              })
            }

            // Fall straight down (like the main falling animation)
            tl.to(figureGroupRef.current, {
              y: '150vh',
              duration: 3.5,
              ease: 'power3.in',
              onComplete: () => {
                setIsVisible(false)
                onFallComplete?.()
              }
            })
          }}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '20px',
            zIndex: 50,
          }}
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: 'bounce 1s infinite',
            }}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(10px); }
            }
          `}</style>
        </button>
      </section>
    )
  }
)

IntroScene.displayName = 'IntroScene'

export default IntroScene
