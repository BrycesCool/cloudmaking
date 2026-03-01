'use client'

import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Clouds, Cloud, Stars, Text } from '@react-three/drei'

// Single small cloud for the character to sit on
const introCloud = {
  seed: 15,
  segments: 25,
  bounds: [2.5, 1, 1] as [number, number, number],
  volume: 4,
  color: "#ffffff",
  opacity: 0.95,
  speed: 0.1,
  growth: 2,
  fade: 6,
  concentrate: "inside" as const,
  position: [2, 3.5, 0] as [number, number, number], // Upper area, closer to center for first O
}

function Scene() {
  const cloudsRef = useRef(null)

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

      {/* Directional light for clouds */}
      <directionalLight
        position={[100, 50, 100]}
        intensity={2.5}
        color="#ffffff"
      />

      {/* Ambient light */}
      <ambientLight intensity={1.5} color="#ffffff" />

      {/* Secondary fill light */}
      <directionalLight
        position={[-50, 30, -50]}
        intensity={1}
        color="#ffffff"
      />

      {/* OUR PORTFOLIO title - positioned lower for more vertical space */}
      <Text
        position={[0, -4, 0]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        OUR PORTFOLIO
      </Text>

      {/* Cloud for character to sit on */}
      <Clouds ref={cloudsRef} limit={200}>
        <Cloud
          seed={introCloud.seed}
          segments={introCloud.segments}
          bounds={introCloud.bounds}
          volume={introCloud.volume}
          color={introCloud.color}
          opacity={introCloud.opacity}
          speed={introCloud.speed}
          growth={introCloud.growth}
          fade={introCloud.fade}
          concentrate={introCloud.concentrate}
          position={introCloud.position}
        />
      </Clouds>
    </>
  )
}

export default function IntroCloudScene() {
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
