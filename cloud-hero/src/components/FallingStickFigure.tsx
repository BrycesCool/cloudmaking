'use client'

import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import gsap from 'gsap'
import type { Attachment } from '@/types/stickfigure'

export interface FallingStickFigureRef {
  startFall: () => void
  resumeFall: () => void
}

interface FallingStickFigureProps {
  onReachBottom?: () => void
  onReachMiddle?: () => void  // Called when figure stops at middle of second screen
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

// All 16 keyframe poses for the falling animation (hand-crafted frames)
const fallingKeyframes: JointPositions[] = [
  // Frame 1 - Initial tumble
  {
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
  },
  // Frame 2
  {
    head: { x: 110, y: -56 },
    neck: { x: 76, y: -22 },
    shoulder_l: { x: 75, y: -21 },
    shoulder_r: { x: 75, y: -22 },
    elbow_l: { x: 72, y: 50 },
    elbow_r: { x: 4, y: -28 },
    hand_l: { x: 7, y: 88 },
    hand_r: { x: -42, y: -103 },
    hip: { x: 44, y: 22 },
    hip_l: { x: -15, y: 57 },
    hip_r: { x: -14, y: 58 },
    knee_l: { x: -41, y: -28 },
    knee_r: { x: -78, y: 3 },
    foot_l: { x: -136, y: -63 },
    foot_r: { x: -141, y: 67 },
  },
  // Frame 3
  {
    head: { x: 118, y: -52 },
    neck: { x: 74, y: -23 },
    shoulder_l: { x: 81, y: -18 },
    shoulder_r: { x: 80, y: -19 },
    elbow_l: { x: 61, y: 48 },
    elbow_r: { x: 10, y: -38 },
    hand_l: { x: 8, y: 80 },
    hand_r: { x: -36, y: -108 },
    hip: { x: 45, y: 26 },
    hip_l: { x: -17, y: 56 },
    hip_r: { x: -16, y: 57 },
    knee_l: { x: -46, y: -26 },
    knee_r: { x: -80, y: 7 },
    foot_l: { x: -144, y: -56 },
    foot_r: { x: -145, y: 61 },
  },
  // Frame 4
  {
    head: { x: 116, y: -62 },
    neck: { x: 77, y: -22 },
    shoulder_l: { x: 84, y: -17 },
    shoulder_r: { x: 83, y: -18 },
    elbow_l: { x: 59, y: 48 },
    elbow_r: { x: 6, y: -33 },
    hand_l: { x: 7, y: 75 },
    hand_r: { x: -36, y: -99 },
    hip: { x: 39, y: 20 },
    hip_l: { x: -14, y: 57 },
    hip_r: { x: -13, y: 58 },
    knee_l: { x: -47, y: -20 },
    knee_r: { x: -73, y: 17 },
    foot_l: { x: -141, y: -51 },
    foot_r: { x: -143, y: 51 },
  },
  // Frame 5
  {
    head: { x: 129, y: -57 },
    neck: { x: 82, y: -16 },
    shoulder_l: { x: 80, y: -21 },
    shoulder_r: { x: 86, y: -17 },
    elbow_l: { x: 61, y: 48 },
    elbow_r: { x: 11, y: -35 },
    hand_l: { x: 10, y: 77 },
    hand_r: { x: -47, y: -95 },
    hip: { x: 35, y: 16 },
    hip_l: { x: -18, y: 53 },
    hip_r: { x: -17, y: 54 },
    knee_l: { x: -55, y: -20 },
    knee_r: { x: -77, y: 21 },
    foot_l: { x: -139, y: -47 },
    foot_r: { x: -145, y: 32 },
  },
  // Frame 6
  {
    head: { x: 135, y: -41 },
    neck: { x: 88, y: -9 },
    shoulder_l: { x: 87, y: -9 },
    shoulder_r: { x: 84, y: -8 },
    elbow_l: { x: 54, y: 43 },
    elbow_r: { x: 12, y: -46 },
    hand_l: { x: 8, y: 72 },
    hand_r: { x: -49, y: -92 },
    hip: { x: 44, y: 19 },
    hip_l: { x: -14, y: 41 },
    hip_r: { x: -14, y: 42 },
    knee_l: { x: -60, y: -21 },
    knee_r: { x: -76, y: 18 },
    foot_l: { x: -148, y: -38 },
    foot_r: { x: -144, y: 29 },
  },
  // Frame 7 - NEW smooth transition
  {
    head: { x: 129, y: -30 },
    neck: { x: 80, y: 1 },
    shoulder_l: { x: 80, y: 1 },
    shoulder_r: { x: 80, y: 1 },
    elbow_l: { x: 50, y: 42 },
    elbow_r: { x: 29, y: -51 },
    hand_l: { x: 3, y: 65 },
    hand_r: { x: -30, y: -66 },
    hip: { x: 40, y: 18 },
    hip_l: { x: -14, y: 17 },
    hip_r: { x: -15, y: 17 },
    knee_l: { x: -67, y: -16 },
    knee_r: { x: -84, y: 10 },
    foot_l: { x: -143, y: -27 },
    foot_r: { x: -139, y: 21 },
  },
  // Frame 8 - NEW smooth transition
  {
    head: { x: 132, y: -21 },
    neck: { x: 82, y: 9 },
    shoulder_l: { x: 85, y: 9 },
    shoulder_r: { x: 82, y: 10 },
    elbow_l: { x: 37, y: 35 },
    elbow_r: { x: 36, y: -39 },
    hand_l: { x: 1, y: 52 },
    hand_r: { x: -27, y: -52 },
    hip: { x: 37, y: 11 },
    hip_l: { x: -17, y: 10 },
    hip_r: { x: -18, y: 10 },
    knee_l: { x: -70, y: -23 },
    knee_r: { x: -87, y: 3 },
    foot_l: { x: -133, y: -12 },
    foot_r: { x: -146, y: 1 },
  },
  // Frame 9 - Transition to horizontal
  {
    head: { x: 138, y: -8 },
    neck: { x: 81, y: 6 },
    shoulder_l: { x: 82, y: 12 },
    shoulder_r: { x: 81, y: 7 },
    elbow_l: { x: 36, y: 32 },
    elbow_r: { x: 37, y: -48 },
    hand_l: { x: 0, y: 49 },
    hand_r: { x: -24, y: -69 },
    hip: { x: 36, y: 8 },
    hip_l: { x: -18, y: 7 },
    hip_r: { x: -19, y: 7 },
    knee_l: { x: -74, y: -16 },
    knee_r: { x: -88, y: 0 },
    foot_l: { x: -124, y: 12 },
    foot_r: { x: -148, y: -3 },
  },
  // Frame 10
  {
    head: { x: 133, y: 11 },
    neck: { x: 77, y: 16 },
    shoulder_l: { x: 76, y: 16 },
    shoulder_r: { x: 73, y: 13 },
    elbow_l: { x: 40, y: 44 },
    elbow_r: { x: 42, y: -40 },
    hand_l: { x: -4, y: 63 },
    hand_r: { x: -7, y: -73 },
    hip: { x: 37, y: 16 },
    hip_l: { x: -16, y: 8 },
    hip_r: { x: -16, y: 8 },
    knee_l: { x: -75, y: -8 },
    knee_r: { x: -81, y: -40 },
    foot_l: { x: -127, y: -4 },
    foot_r: { x: -146, y: -36 },
  },
  // Frame 11
  {
    head: { x: 133, y: 45 },
    neck: { x: 74, y: 28 },
    shoulder_l: { x: 71, y: 30 },
    shoulder_r: { x: 69, y: 28 },
    elbow_l: { x: 41, y: 59 },
    elbow_r: { x: 42, y: -37 },
    hand_l: { x: -17, y: 61 },
    hand_r: { x: -1, y: -86 },
    hip: { x: 35, y: 18 },
    hip_l: { x: -14, y: -4 },
    hip_r: { x: -16, y: -5 },
    knee_l: { x: -81, y: -17 },
    knee_r: { x: -67, y: -54 },
    foot_l: { x: -133, y: -7 },
    foot_r: { x: -142, y: -58 },
  },
  // Frame 12
  {
    head: { x: 125, y: 69 },
    neck: { x: 72, y: 38 },
    shoulder_l: { x: 70, y: 37 },
    shoulder_r: { x: 69, y: 39 },
    elbow_l: { x: 34, y: 51 },
    elbow_r: { x: 49, y: -35 },
    hand_l: { x: -27, y: 46 },
    hand_r: { x: 20, y: -81 },
    hip: { x: 34, y: 8 },
    hip_l: { x: -15, y: -13 },
    hip_r: { x: -13, y: -14 },
    knee_l: { x: -77, y: -14 },
    knee_r: { x: -65, y: -63 },
    foot_l: { x: -134, y: 4 },
    foot_r: { x: -142, y: -75 },
  },
  // Frame 13
  {
    head: { x: 107, y: 80 },
    neck: { x: 70, y: 39 },
    shoulder_l: { x: 68, y: 38 },
    shoulder_r: { x: 67, y: 40 },
    elbow_l: { x: 32, y: 60 },
    elbow_r: { x: 57, y: -31 },
    hand_l: { x: -28, y: 41 },
    hand_r: { x: 30, y: -83 },
    hip: { x: 27, y: 18 },
    hip_l: { x: -17, y: -12 },
    hip_r: { x: -15, y: -5 },
    knee_l: { x: -79, y: -13 },
    knee_r: { x: -53, y: -70 },
    foot_l: { x: -133, y: -11 },
    foot_r: { x: -137, y: -91 },
  },
  // Frame 14
  {
    head: { x: 92, y: 86 },
    neck: { x: 54, y: 41 },
    shoulder_l: { x: 56, y: 45 },
    shoulder_r: { x: 61, y: 43 },
    elbow_l: { x: 33, y: 54 },
    elbow_r: { x: 68, y: -15 },
    hand_l: { x: -27, y: 35 },
    hand_r: { x: 36, y: -75 },
    hip: { x: 28, y: 20 },
    hip_l: { x: -24, y: -3 },
    hip_r: { x: -24, y: -5 },
    knee_l: { x: -83, y: -31 },
    knee_r: { x: -48, y: -61 },
    foot_l: { x: -129, y: -43 },
    foot_r: { x: -95, y: -95 },
  },
  // Frame 15
  {
    head: { x: 88, y: 94 },
    neck: { x: 44, y: 51 },
    shoulder_l: { x: 46, y: 46 },
    shoulder_r: { x: 48, y: 45 },
    elbow_l: { x: -1, y: 82 },
    elbow_r: { x: 67, y: 3 },
    hand_l: { x: -42, y: 47 },
    hand_r: { x: 45, y: -58 },
    hip: { x: 18, y: 25 },
    hip_l: { x: -20, y: -10 },
    hip_r: { x: -20, y: -12 },
    knee_l: { x: -70, y: -59 },
    knee_r: { x: -24, y: -71 },
    foot_l: { x: -118, y: -66 },
    foot_r: { x: -61, y: -111 },
  },
  // Frame 16 - Final pose (on back, head up)
  {
    head: { x: 27, y: 128 },
    neck: { x: 24, y: 42 },
    shoulder_l: { x: 28, y: 45 },
    shoulder_r: { x: 27, y: 54 },
    elbow_l: { x: -49, y: 95 },
    elbow_r: { x: 81, y: 7 },
    hand_l: { x: -86, y: 50 },
    hand_r: { x: 72, y: -61 },
    hip: { x: 12, y: -12 },
    hip_l: { x: 8, y: -9 },
    hip_r: { x: 16, y: -11 },
    knee_l: { x: -52, y: -31 },
    knee_r: { x: 8, y: -75 },
    foot_l: { x: -95, y: -82 },
    foot_r: { x: -23, y: -133 },
  },
]

// Wing keyframe data for each pose (2 wings per frame)
interface WingKeyframe {
  wing1: { offsetX: number; offsetY: number; rotation: number }
  wing2: { offsetX: number; offsetY: number; rotation: number }
}

const wingKeyframes: WingKeyframe[] = [
  // Frame 1
  { wing1: { offsetX: -61, offsetY: -46, rotation: -10 }, wing2: { offsetX: -8, offsetY: 79, rotation: 166 } },
  // Frame 2
  { wing1: { offsetX: -61, offsetY: -46, rotation: -8 }, wing2: { offsetX: -8, offsetY: 79, rotation: 167 } },
  // Frame 3
  { wing1: { offsetX: -61, offsetY: -46, rotation: -6 }, wing2: { offsetX: -8, offsetY: 79, rotation: 165 } },
  // Frame 4
  { wing1: { offsetX: -61, offsetY: -46, rotation: -8 }, wing2: { offsetX: -8, offsetY: 79, rotation: 168 } },
  // Frame 5
  { wing1: { offsetX: -61, offsetY: -46, rotation: -11 }, wing2: { offsetX: -8, offsetY: 79, rotation: 166 } },
  // Frame 6
  { wing1: { offsetX: -61, offsetY: -46, rotation: -16 }, wing2: { offsetX: -8, offsetY: 79, rotation: 166 } },
  // Frame 7 - NEW
  { wing1: { offsetX: -66, offsetY: -46, rotation: -18 }, wing2: { offsetX: -12, offsetY: 79, rotation: 169 } },
  // Frame 8 - NEW
  { wing1: { offsetX: -66, offsetY: -46, rotation: -21 }, wing2: { offsetX: -25, offsetY: 79, rotation: 177 } },
  // Frame 9
  { wing1: { offsetX: -66, offsetY: -46, rotation: -18 }, wing2: { offsetX: -41, offsetY: 79, rotation: 182 } },
  // Frame 10
  { wing1: { offsetX: -64, offsetY: -46, rotation: -14 }, wing2: { offsetX: -45, offsetY: 79, rotation: 186 } },
  // Frame 11
  { wing1: { offsetX: -47, offsetY: -59, rotation: -4 }, wing2: { offsetX: -45, offsetY: 56, rotation: 197 } },
  // Frame 12
  { wing1: { offsetX: -42, offsetY: -59, rotation: 5 }, wing2: { offsetX: -58, offsetY: 56, rotation: 206 } },
  // Frame 13
  { wing1: { offsetX: -32, offsetY: -59, rotation: 10 }, wing2: { offsetX: -58, offsetY: 56, rotation: 217 } },
  // Frame 14
  { wing1: { offsetX: -32, offsetY: -59, rotation: 10 }, wing2: { offsetX: -58, offsetY: 56, rotation: 217 } },
  // Frame 15
  { wing1: { offsetX: -12, offsetY: -59, rotation: 27 }, wing2: { offsetX: -65, offsetY: 56, rotation: 231 } },
  // Frame 16
  { wing1: { offsetX: 20, offsetY: -50, rotation: 53 }, wing2: { offsetX: -65, offsetY: 40, rotation: 244 } },
]

// Starting pose - standing upright (before fall begins)
// Scaled up for a taller, bigger figure with proper proportions
const startPose: JointPositions = {
  head: { x: 0, y: -115 },
  neck: { x: 0, y: -80 },
  shoulder_l: { x: -30, y: -75 },
  shoulder_r: { x: 30, y: -75 },
  elbow_l: { x: -55, y: -30 },
  elbow_r: { x: 55, y: -30 },
  hand_l: { x: -75, y: 15 },
  hand_r: { x: 75, y: 15 },
  hip: { x: 0, y: 0 },
  hip_l: { x: -22, y: 15 },
  hip_r: { x: 22, y: 15 },
  knee_l: { x: -28, y: 85 },
  knee_r: { x: 28, y: 85 },
  foot_l: { x: -35, y: 155 },
  foot_r: { x: 35, y: 155 },
}

// Calculate distance between two points
function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
}

// Bone hierarchy for constraint solving (parent → child relationships)
// Only constrain LIMBS - let head/neck/torso follow animation freely
// This prevents the head from "bouncing" due to constraint fighting
const boneHierarchy: { parent: keyof JointPositions; child: keyof JointPositions }[] = [
  // Arms
  { parent: 'shoulder_l', child: 'elbow_l' },
  { parent: 'shoulder_r', child: 'elbow_r' },
  { parent: 'elbow_l', child: 'hand_l' },
  { parent: 'elbow_r', child: 'hand_r' },
  // Legs
  { parent: 'hip_l', child: 'knee_l' },
  { parent: 'hip_r', child: 'knee_r' },
  { parent: 'knee_l', child: 'foot_l' },
  { parent: 'knee_r', child: 'foot_r' },
]

// Calculate canonical bone lengths from startPose
const canonicalBoneLengths: Map<string, number> = new Map()
boneHierarchy.forEach(({ parent, child }) => {
  const len = distance(startPose[parent], startPose[child])
  canonicalBoneLengths.set(`${parent}-${child}`, len)
})

// Enforce bone length constraints on a pose
// Moves child joints to maintain proper bone lengths while preserving direction
function enforceBoneLengths(pose: JointPositions): JointPositions {
  const result = { ...pose }
  // Deep copy all joints
  for (const key of Object.keys(pose) as (keyof JointPositions)[]) {
    result[key] = { ...pose[key] }
  }

  // Solve constraints from root outward
  for (const { parent, child } of boneHierarchy) {
    const parentPos = result[parent]
    const childPos = result[child]
    const targetLength = canonicalBoneLengths.get(`${parent}-${child}`) || 0

    const currentLength = distance(parentPos, childPos)
    if (currentLength > 0.001 && Math.abs(currentLength - targetLength) > 0.001) {
      // Calculate direction from parent to child
      const dx = childPos.x - parentPos.x
      const dy = childPos.y - parentPos.y
      // Scale to target length
      const scale = targetLength / currentLength
      result[child] = {
        x: parentPos.x + dx * scale,
        y: parentPos.y + dy * scale,
      }
    }
  }

  return result
}

// Helper function to interpolate between two poses
// Uses uniform linear interpolation then enforces bone length constraints
function interpolatePoses(poseA: JointPositions, poseB: JointPositions, t: number): JointPositions {
  const result: Partial<JointPositions> = {}
  const keys = Object.keys(poseA) as (keyof JointPositions)[]
  for (const key of keys) {
    result[key] = {
      x: poseA[key].x + (poseB[key].x - poseA[key].x) * t,
      y: poseA[key].y + (poseB[key].y - poseA[key].y) * t,
    }
  }
  // Enforce bone lengths after interpolation to prevent stretching
  return enforceBoneLengths(result as JointPositions)
}

// Generate in-between frames for smoother animation
function generateInBetweens(keyframes: JointPositions[], framesPerKeyframe: number): JointPositions[] {
  const result: JointPositions[] = []
  for (let i = 0; i < keyframes.length - 1; i++) {
    result.push(keyframes[i])
    for (let j = 1; j < framesPerKeyframe; j++) {
      const t = j / framesPerKeyframe
      result.push(interpolatePoses(keyframes[i], keyframes[i + 1], t))
    }
  }
  result.push(keyframes[keyframes.length - 1])
  return result
}

// Generate smooth animation frames (15 in-betweens per keyframe = ~256 total frames)
const smoothKeyframes = generateInBetweens(fallingKeyframes, 15)

// Interpolate wing keyframes with linear motion for smooth consistent movement
function interpolateWings(frameA: WingKeyframe, frameB: WingKeyframe, t: number): WingKeyframe {
  return {
    wing1: {
      offsetX: frameA.wing1.offsetX + (frameB.wing1.offsetX - frameA.wing1.offsetX) * t,
      offsetY: frameA.wing1.offsetY + (frameB.wing1.offsetY - frameA.wing1.offsetY) * t,
      rotation: frameA.wing1.rotation + (frameB.wing1.rotation - frameA.wing1.rotation) * t,
    },
    wing2: {
      offsetX: frameA.wing2.offsetX + (frameB.wing2.offsetX - frameA.wing2.offsetX) * t,
      offsetY: frameA.wing2.offsetY + (frameB.wing2.offsetY - frameA.wing2.offsetY) * t,
      rotation: frameA.wing2.rotation + (frameB.wing2.rotation - frameA.wing2.rotation) * t,
    },
  }
}

// Generate smooth wing keyframes
function generateWingInBetweens(keyframes: WingKeyframe[], framesPerKeyframe: number): WingKeyframe[] {
  const result: WingKeyframe[] = []
  for (let i = 0; i < keyframes.length - 1; i++) {
    result.push(keyframes[i])
    for (let j = 1; j < framesPerKeyframe; j++) {
      const t = j / framesPerKeyframe
      result.push(interpolateWings(keyframes[i], keyframes[i + 1], t))
    }
  }
  result.push(keyframes[keyframes.length - 1])
  return result
}

const smoothWingKeyframes = generateWingInBetweens(wingKeyframes, 15)

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
  ({ onReachBottom, onReachMiddle, onFallComplete, attachments = [] }, ref) => {
    const figureRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [joints, setJoints] = useState<JointPositions>(startPose)
    const jointsRef = useRef(startPose)

    // Animated attachment overrides (for wing animation)
    const [animatedAttachments, setAnimatedAttachments] = useState<Attachment[]>([])
    const wingAnimRef = useRef<{ wing1: { offsetX: number; offsetY: number; rotation: number }; wing2: { offsetX: number; offsetY: number; rotation: number } }>({
      wing1: { offsetX: -61, offsetY: -46, rotation: -10 },
      wing2: { offsetX: -8, offsetY: 79, rotation: 166 },
    })
    // Flag to stop all animation updates when complete
    const animationFrozenRef = useRef(false)

    // Update state when ref changes (for animation)
    useEffect(() => {
      const interval = setInterval(() => {
        // Don't update if animation is frozen (completed)
        if (animationFrozenRef.current) return

        setJoints({ ...jointsRef.current })
        // Update attachments with animated wing values
        if (attachments.length >= 2) {
          const updated = attachments.map((att, i) => {
            if (i === 0) {
              return { ...att, offsetX: wingAnimRef.current.wing1.offsetX, offsetY: wingAnimRef.current.wing1.offsetY, rotation: wingAnimRef.current.wing1.rotation }
            } else if (i === 1) {
              return { ...att, offsetX: wingAnimRef.current.wing2.offsetX, offsetY: wingAnimRef.current.wing2.offsetY, rotation: wingAnimRef.current.wing2.rotation }
            }
            return att
          })
          setAnimatedAttachments(updated)
        }
      }, 16) // ~60fps
      return () => clearInterval(interval)
    }, [attachments])

    // Ref to store the second phase timeline for resuming
    const secondPhaseTlRef = useRef<gsap.core.Timeline | null>(null)
    const poseTlRef = useRef<gsap.core.Timeline | null>(null)

    useImperativeHandle(ref, () => ({
      startFall: () => {
        if (!figureRef.current || !containerRef.current) return

        // Unfreeze animation updates for new fall
        animationFrozenRef.current = false

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

        // Create a separate paused timeline for pose animations (so we can pause/resume)
        const poseTl = gsap.timeline({ paused: true })
        poseTlRef.current = poseTl

        // Animate joints through all smooth keyframes
        const jointKeys = Object.keys(startPose) as (keyof JointPositions)[]
        // Total pose animation duration (split across both screens)
        const totalAnimationDuration = 6.5 // Total time for all poses

        // Use continuous interpolation for truly smooth motion
        // This calculates exact positions at every GSAP tick (~60fps)
        const totalBodyFrames = smoothKeyframes.length
        const totalWingFrames = smoothWingKeyframes.length
        const progressObj = { value: 0 }

        poseTl.to(progressObj, {
          value: 1,
          duration: totalAnimationDuration,
          ease: 'none',
          onUpdate: () => {
            const progress = progressObj.value

            // Calculate body pose with sub-frame interpolation
            const bodyFrameFloat = progress * (totalBodyFrames - 1)
            const bodyFrameIndex = Math.min(Math.floor(bodyFrameFloat), totalBodyFrames - 2)
            const bodyFrameProgress = bodyFrameFloat - bodyFrameIndex
            const currentBodyFrame = smoothKeyframes[bodyFrameIndex]
            const nextBodyFrame = smoothKeyframes[bodyFrameIndex + 1]

            // Interpolate all joints smoothly between frames
            const interpolatedPose: Partial<JointPositions> = {}
            jointKeys.forEach(key => {
              interpolatedPose[key] = {
                x: currentBodyFrame[key].x +
                  (nextBodyFrame[key].x - currentBodyFrame[key].x) * bodyFrameProgress,
                y: currentBodyFrame[key].y +
                  (nextBodyFrame[key].y - currentBodyFrame[key].y) * bodyFrameProgress,
              }
            })

            // Enforce bone lengths to prevent stretching during sub-frame interpolation
            const constrainedPose = enforceBoneLengths(interpolatedPose as JointPositions)
            jointKeys.forEach(key => {
              jointsRef.current[key].x = constrainedPose[key].x
              jointsRef.current[key].y = constrainedPose[key].y
            })

            // Calculate wing pose with sub-frame interpolation
            const wingFrameFloat = progress * (totalWingFrames - 1)
            const wingFrameIndex = Math.min(Math.floor(wingFrameFloat), totalWingFrames - 2)
            const wingFrameProgress = wingFrameFloat - wingFrameIndex
            const currentWingFrame = smoothWingKeyframes[wingFrameIndex]
            const nextWingFrame = smoothWingKeyframes[wingFrameIndex + 1]

            // Interpolate wings smoothly
            wingAnimRef.current.wing1.offsetX = currentWingFrame.wing1.offsetX +
              (nextWingFrame.wing1.offsetX - currentWingFrame.wing1.offsetX) * wingFrameProgress
            wingAnimRef.current.wing1.offsetY = currentWingFrame.wing1.offsetY +
              (nextWingFrame.wing1.offsetY - currentWingFrame.wing1.offsetY) * wingFrameProgress
            wingAnimRef.current.wing1.rotation = currentWingFrame.wing1.rotation +
              (nextWingFrame.wing1.rotation - currentWingFrame.wing1.rotation) * wingFrameProgress

            wingAnimRef.current.wing2.offsetX = currentWingFrame.wing2.offsetX +
              (nextWingFrame.wing2.offsetX - currentWingFrame.wing2.offsetX) * wingFrameProgress
            wingAnimRef.current.wing2.offsetY = currentWingFrame.wing2.offsetY +
              (nextWingFrame.wing2.offsetY - currentWingFrame.wing2.offsetY) * wingFrameProgress
            wingAnimRef.current.wing2.rotation = currentWingFrame.wing2.rotation +
              (nextWingFrame.wing2.rotation - currentWingFrame.wing2.rotation) * wingFrameProgress
          }
        }, 0)

        // Start pose animation after small delay
        gsap.delayedCall(0.3, () => poseTl.play())

        // Single smooth fall through first screen (slow start, fast end)
        tl.to(figureRef.current, {
          rotation: 0,
          y: '110vh',
          scale: 1.4,
          duration: 3.5,
          ease: 'power3.in',
          onComplete: () => {
            // PAUSE pose animation when going off-screen
            poseTl.pause()

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

        // Phase 1: Fall to middle of second screen with ease-out (slowing down)
        // y: 0 is the true center since container uses flexbox centering
        tl.to(figureRef.current, {
          rotation: 0,
          y: 0,
          scale: 1.4,
          duration: 2.5,
          onStart: () => {
            // RESUME pose animation when back on screen
            poseTl.play()
            // Pause pose animation 1 second before reaching middle (1.5s into 2.5s duration)
            gsap.delayedCall(1.5, () => poseTl.pause())
          },
          ease: 'power3.out', // Slows down as it reaches middle
          onComplete: () => {
            // Notify parent that figure is waiting at middle
            onReachMiddle?.()
          }
        })

        // Phase 2: Create but don't play yet - waits for resumeFall()
        const secondPhaseTl = gsap.timeline({ paused: true })
        secondPhaseTlRef.current = secondPhaseTl

        // Continue fall from middle to bottom (same speed as entry)
        secondPhaseTl.to(figureRef.current, {
          rotation: 0,
          y: '110vh',
          scale: 1.8,
          duration: 2.5,
          onStart: () => {
            // Resume pose animation to finish
            poseTl.play()
          },
          ease: 'power3.in', // Accelerates like gravity (mirror of entry's power3.out)
        })

        // Fade out at bottom
        secondPhaseTl.to(figureRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            // Stop pose animation when landing - freeze the figure
            poseTl.pause()
            // Freeze all animation updates
            animationFrozenRef.current = true
            onFallComplete?.()
          }
        }, '-=0.3')
      },

      resumeFall: () => {
        // Resume the second phase of the fall
        if (secondPhaseTlRef.current) {
          secondPhaseTlRef.current.play()
        }
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
          zIndex: 9999,
        }}
      >
        <svg
          ref={figureRef}
          width="200"
          height="250"
          viewBox="-300 -350 600 700"
          style={{
            transformOrigin: 'center center',
          }}
        >
          {/* Attachments BEHIND body (zIndex < 0) */}
          {(animatedAttachments.length > 0 ? animatedAttachments : attachments).filter(a => a.zIndex < 0).map(att => {
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
            r={40}
            fill="none"
            stroke="white"
            strokeWidth="10"
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
              strokeWidth="10"
              strokeLinecap="round"
            />
          ))}

          {/* Attachments IN FRONT of body (zIndex > 0) */}
          {(animatedAttachments.length > 0 ? animatedAttachments : attachments).filter(a => a.zIndex > 0).map(att => {
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
