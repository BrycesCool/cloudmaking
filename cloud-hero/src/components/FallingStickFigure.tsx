'use client'

import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import gsap from 'gsap'
import type { Attachment } from '@/types/stickfigure'

export interface FallingStickFigureRef {
  startFall: () => void
}

interface FallingStickFigureProps {
  onReachBottom?: () => void
  onFallComplete?: () => void
  attachments?: Attachment[]
}

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

// Starting pose - standing upright
const startPose: JointPositions = {
  head: { x: 0, y: -80 },
  neck: { x: 0, y: -50 },
  shoulder_l: { x: -20, y: -45 },
  shoulder_r: { x: 20, y: -45 },
  elbow_l: { x: -35, y: -20 },
  elbow_r: { x: 35, y: -20 },
  hand_l: { x: -45, y: 5 },
  hand_r: { x: 45, y: 5 },
  hip: { x: 0, y: 0 },
  hip_l: { x: -15, y: 10 },
  hip_r: { x: 15, y: 10 },
  knee_l: { x: -20, y: 50 },
  knee_r: { x: 20, y: 50 },
  foot_l: { x: -25, y: 90 },
  foot_r: { x: 25, y: 90 },
}

// Mid-fall pose - tumbling
const midPose: JointPositions = {
  head: { x: 97, y: -63 },
  neck: { x: 78, y: -20 },
  shoulder_l: { x: 77, y: -19 },
  shoulder_r: { x: 77, y: -20 },
  elbow_l: { x: 69, y: 45 },
  elbow_r: { x: 13, y: -33 },
  hand_l: { x: 3, y: 81 },
  hand_r: { x: -42, y: -95 },
  hip: { x: 46, y: 24 },
  hip_l: { x: -13, y: 59 },
  hip_r: { x: -12, y: 60 },
  knee_l: { x: -40, y: -34 },
  knee_r: { x: -79, y: -4 },
  foot_l: { x: -138, y: -56 },
  foot_r: { x: -136, y: 80 },
}

// End pose - flailing
const endPose: JointPositions = {
  head: { x: 92, y: 117 },
  neck: { x: 43, y: 134 },
  shoulder_l: { x: 18, y: 45 },
  shoulder_r: { x: 61, y: 41 },
  elbow_l: { x: 37, y: -54 },
  elbow_r: { x: 78, y: -43 },
  hand_l: { x: 57, y: -89 },
  hand_r: { x: 96, y: -61 },
  hip: { x: -20, y: 125 },
  hip_l: { x: -53, y: 84 },
  hip_r: { x: -91, y: 41 },
  knee_l: { x: -1, y: -43 },
  knee_r: { x: -90, y: -70 },
  foot_l: { x: -91, y: -156 },
  foot_r: { x: -165, y: -194 },
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

const FallingStickFigure = forwardRef<FallingStickFigureRef, FallingStickFigureProps>(
  ({ onReachBottom, onFallComplete, attachments = [] }, ref) => {
    const figureRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [joints, setJoints] = useState<JointPositions>(startPose)
    const jointsRef = useRef(startPose)

    // Update state when ref changes (for animation)
    useEffect(() => {
      const interval = setInterval(() => {
        setJoints({ ...jointsRef.current })
      }, 16) // ~60fps
      return () => clearInterval(interval)
    }, [])

    useImperativeHandle(ref, () => ({
      startFall: () => {
        if (!figureRef.current || !containerRef.current) return

        // Reset joints to start pose
        jointsRef.current = { ...startPose }
        setJoints({ ...startPose })

        // Reset figure position
        gsap.set(figureRef.current, {
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
        })

        // Main timeline for figure movement
        const tl = gsap.timeline()

        // Animate joints to mid pose
        const jointKeys = Object.keys(startPose) as (keyof JointPositions)[]

        // Transition to mid pose during first part of fall
        jointKeys.forEach(key => {
          gsap.to(jointsRef.current[key], {
            x: midPose[key].x,
            y: midPose[key].y,
            duration: 2,
            delay: 0.5,
            ease: 'power2.inOut',
          })
        })

        // Transition to end pose (on back, head up) - continues through both screens
        jointKeys.forEach(key => {
          gsap.to(jointsRef.current[key], {
            x: endPose[key].x,
            y: endPose[key].y,
            duration: 3,
            delay: 3,
            ease: 'power2.inOut',
          })
        })

        // Single smooth fall through first screen
        tl.to(figureRef.current, {
          rotation: 0,
          y: '110vh',
          scale: 1.4,
          duration: 3.5,
          ease: 'power2.in',
          onComplete: () => {
            onReachBottom?.()

            // Reset to above screen - no rotation
            const vh = window.innerHeight
            gsap.set(figureRef.current, {
              y: -(vh / 2) - 150,
              rotation: 0,
              scale: 1,
            })
          }
        })

        // Fall through second screen - no rotation, just falling
        tl.to(figureRef.current, {
          rotation: 0,
          y: '110vh',
          scale: 1.8,
          duration: 4.5,
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
          width="120"
          height="150"
          viewBox="-180 -210 320 380"
          style={{
            transformOrigin: 'center center',
          }}
        >
          {/* Attachments BEHIND body (zIndex < 0) */}
          {attachments.filter(a => a.zIndex < 0).map(att => {
            const jointKey = att.jointId as keyof JointPositions
            const joint = joints[jointKey]
            if (!joint) return null
            const rotX = att.rotationX ?? 0
            const rotY = att.rotationY ?? 0
            return (
              <g
                key={att.id}
                transform={`translate(${joint.x + att.offsetX}, ${joint.y + att.offsetY})`}
              >
                <image
                  href={att.imageData}
                  x="-50"
                  y="-50"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    transformOrigin: 'center center',
                    transformBox: 'fill-box',
                    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${att.rotation}deg) scale(${att.scale})`,
                  }}
                />
              </g>
            )
          })}

          {/* Head */}
          <circle
            cx={joints.head.x}
            cy={joints.head.y}
            r={25}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Bones/Lines */}
          {bones.map((bone, index) => (
            <line
              key={index}
              x1={joints[bone.from].x}
              y1={joints[bone.from].y}
              x2={joints[bone.to].x}
              y2={joints[bone.to].y}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}

          {/* Attachments IN FRONT of body (zIndex > 0) */}
          {attachments.filter(a => a.zIndex > 0).map(att => {
            const jointKey = att.jointId as keyof JointPositions
            const joint = joints[jointKey]
            if (!joint) return null
            const rotX = att.rotationX ?? 0
            const rotY = att.rotationY ?? 0
            return (
              <g
                key={att.id}
                transform={`translate(${joint.x + att.offsetX}, ${joint.y + att.offsetY})`}
              >
                <image
                  href={att.imageData}
                  x="-50"
                  y="-50"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    transformOrigin: 'center center',
                    transformBox: 'fill-box',
                    transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${att.rotation}deg) scale(${att.scale})`,
                  }}
                />
              </g>
            )
          })}
        </svg>
      </div>
    )
  }
)

FallingStickFigure.displayName = 'FallingStickFigure'

export default FallingStickFigure
