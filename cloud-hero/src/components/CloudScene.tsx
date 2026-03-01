'use client'

import { useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Clouds, Cloud, Stars, Text } from '@react-three/drei'
import * as THREE from 'three'

// Default cloud layer settings from the original playground
const cloudLayers = [
  { visible: true, seed: 1, segments: 40, bounds: [18.5, 2, 2], volume: 10, color: "#ffffff", opacity: 0.8, speed: 0.4, growth: 4, fade: 10, concentrate: "inside" as const, position: [9, -5, -8] as [number, number, number] },
  { visible: true, seed: 43, segments: 40, bounds: [18.5, 2, 1], volume: 9, color: "#ffffff", opacity: 0.3, speed: 0.4, growth: 4, fade: 2, concentrate: "inside" as const, position: [-1, -5, -5] as [number, number, number] },
  { visible: true, seed: 29, segments: 40, bounds: [10, 3.5, 2], volume: 10, color: "#ffffff", opacity: 0.8, speed: 0.4, growth: 4, fade: 10, concentrate: "inside" as const, position: [-13, -5, -7] as [number, number, number] },
  { visible: true, seed: 92, segments: 40, bounds: [19, 2, 2], volume: 10, color: "#ffffff", opacity: 0.8, speed: 0.4, growth: 4, fade: 10, concentrate: "inside" as const, position: [-1, -8, -3] as [number, number, number] },
]

// Placeholder card component
function ProjectCard({ position }: { position: [number, number, number] }) {
  const planeGeometry = useMemo(() => new THREE.PlaneGeometry(3.5, 4.5), [])

  return (
    <mesh position={position}>
      <planeGeometry args={[3.5, 4.5]} />
      <meshStandardMaterial color="#1a1a2e" transparent opacity={0.9} />
      <lineSegments position={[0, 0, 0.01]}>
        <edgesGeometry args={[planeGeometry]} />
        <lineBasicMaterial color="#3a3a5a" />
      </lineSegments>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[2.5, 0.4]} />
        <meshBasicMaterial color="#2a2a4a" />
      </mesh>
      <mesh position={[0, -1.5, 0.02]}>
        <planeGeometry args={[2.8, 0.3]} />
        <meshBasicMaterial color="#252540" />
      </mesh>
    </mesh>
  )
}

function Scene() {
  const cloudsRef = useRef(null)

  // Card positions in a single row
  const cardZ = -5
  const cardSpacing = 4.5
  const cardY = 0

  const cardPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 6; i++) {
      const x = (i - 2.5) * cardSpacing
      positions.push([x, cardY, cardZ])
    }
    return positions
  }, [])

  return (
    <>
      {/* Pure black background */}
      <color attach="background" args={['#000000']} />

      {/* Starry sky */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Directional light for clouds - kept bright for white clouds */}
      <directionalLight
        position={[100, 50, 100]}
        intensity={2.5}
        color="#ffffff"
      />

      {/* Ambient light - bright to keep clouds white */}
      <ambientLight intensity={1.5} color="#ffffff" />

      {/* Secondary fill light */}
      <directionalLight
        position={[-50, 30, -50]}
        intensity={1}
        color="#ffffff"
      />


      {/* Portfolio title above cards */}
      <Text
        position={[0, 3.5, cardZ]}
        fontSize={1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Our Portfolio
      </Text>

      {/* Project cards behind clouds */}
      {cardPositions.map((pos, i) => (
        <ProjectCard key={i} position={pos} />
      ))}

      {/* Multiple cloud layers */}
      <Clouds ref={cloudsRef} limit={800}>
        {cloudLayers.map((layer, layerIndex) => (
          layer.visible && (
            <Cloud
              key={layerIndex}
              seed={layer.seed}
              segments={layer.segments}
              bounds={layer.bounds as [number, number, number]}
              volume={layer.volume}
              color={layer.color}
              opacity={layer.opacity}
              speed={layer.speed}
              growth={layer.growth}
              fade={layer.fade}
              concentrate={layer.concentrate}
              position={layer.position}
            />
          )
        ))}
      </Clouds>
    </>
  )
}

export default function CloudScene() {
  return (
    <Canvas
      flat
      camera={{ position: [0, 0, 10], fov: 75 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
    >
      <Scene />
    </Canvas>
  )
}
