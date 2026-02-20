'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Clouds, Cloud, OrbitControls, Sky } from '@react-three/drei'
import * as THREE from 'three'

// Default cloud layer settings
const defaultCloudLayer = {
  segments: 40,
  bounds: [10, 2, 2] as [number, number, number],
  volume: 10,
  color: "#ffffff",
  opacity: 0.8,
  speed: 0.4,
  fade: 10,
  seed: 1,
  concentrate: "inside" as const,
  growth: 4,
  position: [0, 0, 0] as [number, number, number],
  visible: true,
}

type CloudLayer = typeof defaultCloudLayer

const PRESETS = {
  "Sunny Day": {
    sunPosition: [100, 90, 100] as [number, number, number],
    sunColor: "#ffffff",
    turbidity: 8,
    rayleigh: 2,
    mieCoefficient: 0.034,
    mieDirectionalG: 0.83,
    exposure: 0.5,
  },
  "Golden Hour": {
    sunPosition: [100, 10, 100] as [number, number, number],
    sunColor: "#ffaa44",
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.1,
    mieDirectionalG: 0.95,
    exposure: 0.4,
  },
  "Overcast": {
    sunPosition: [50, 80, 50] as [number, number, number],
    sunColor: "#ffffff",
    turbidity: 20,
    rayleigh: 0.5,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.7,
    exposure: 0.3,
  },
  "Sunset": {
    sunPosition: [100, 2, 50] as [number, number, number],
    sunColor: "#ff6633",
    turbidity: 10,
    rayleigh: 4,
    mieCoefficient: 0.1,
    mieDirectionalG: 0.99,
    exposure: 0.35,
  },
  "Night": {
    sunPosition: [-100, -10, 100] as [number, number, number],
    sunColor: "#4466aa",
    turbidity: 0.1,
    rayleigh: 0.1,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.5,
    exposure: 0.1,
  },
}

type SkySettings = typeof PRESETS["Sunny Day"]

function Slider({ label, value, onChange, min, max, step = 0.1 }: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <label style={{ fontSize: 10, color: '#a0a8c0', fontFamily: 'monospace' }}>{label}</label>
        <span style={{ fontSize: 10, color: '#7ee8fa', fontFamily: 'monospace' }}>
          {typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', cursor: 'pointer' }}
      />
    </div>
  )
}

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

// Camera controller component
function CameraController({ position, fov }: { position: [number, number, number], fov: number }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(...position)
    if ('fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = fov
      camera.updateProjectionMatrix()
    }
  }, [camera, position, fov])

  return null
}

function CloudScene({ cloudLayers, skySettings, showCards, cardZ, cardSpacing, cardY, cameraPosition, cameraFov }: {
  cloudLayers: CloudLayer[]
  skySettings: SkySettings
  showCards: boolean
  cardZ: number
  cardSpacing: number
  cardY: number
  cameraPosition: [number, number, number]
  cameraFov: number
}) {
  const cloudsRef = useRef(null)

  // Card positions in a single row
  const cardPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 6; i++) {
      const x = (i - 2.5) * cardSpacing
      positions.push([x, cardY, cardZ])
    }
    return positions
  }, [cardZ, cardSpacing, cardY])

  return (
    <>
      {/* Realistic sky with sun */}
      <Sky
        distance={450000}
        sunPosition={skySettings.sunPosition}
        inclination={0.5}
        azimuth={0.25}
        turbidity={skySettings.turbidity}
        rayleigh={skySettings.rayleigh}
        mieCoefficient={skySettings.mieCoefficient}
        mieDirectionalG={skySettings.mieDirectionalG}
      />

      {/* Sun light - directional light from sun position */}
      <directionalLight
        position={skySettings.sunPosition}
        intensity={skySettings.exposure * 5}
        color={skySettings.sunColor}
        castShadow
      />

      {/* Ambient light for fill */}
      <ambientLight intensity={0.3} color="#aaccff" />

      {/* Hemisphere light for sky/ground color variation */}
      <hemisphereLight args={["#87ceeb", "#362907", 0.4]} />

      {/* Camera controller */}
      <CameraController position={cameraPosition} fov={cameraFov} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={100}
      />

      {/* Project cards behind clouds */}
      {showCards && cardPositions.map((pos, i) => (
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
              bounds={layer.bounds}
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

function CloudLayerControls({ layer, index, onChange, onRemove }: {
  layer: CloudLayer
  index: number
  onChange: (index: number, layer: CloudLayer) => void
  onRemove: (index: number) => void
}) {
  const update = (key: keyof CloudLayer, value: unknown) => {
    onChange(index, { ...layer, [key]: value })
  }

  const updatePosition = (axis: number, value: number) => {
    const newPos = [...layer.position] as [number, number, number]
    newPos[axis] = value
    onChange(index, { ...layer, position: newPos })
  }

  const updateBounds = (axis: number, value: number) => {
    const newBounds = [...layer.bounds] as [number, number, number]
    newBounds[axis] = value
    onChange(index, { ...layer, bounds: newBounds })
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
      border: '1px solid #1a1a3a',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => update('visible', !layer.visible)}
            style={{
              width: 20, height: 20, borderRadius: 4, border: 'none',
              background: layer.visible ? '#7ee8fa' : '#2a2a4a',
              cursor: 'pointer', fontSize: 10, color: layer.visible ? '#000' : '#666'
            }}
          >
            {layer.visible ? '✓' : ''}
          </button>
          <span style={{ fontSize: 11, color: '#7ee8fa', fontFamily: 'monospace' }}>Layer {index + 1}</span>
        </div>
        <button
          onClick={() => onRemove(index)}
          style={{
            background: 'rgba(255,100,100,0.2)', border: '1px solid #ff6666',
            borderRadius: 4, padding: '2px 8px', cursor: 'pointer', color: '#ff6666', fontSize: 10
          }}
        >
          ×
        </button>
      </div>

      {layer.visible && (
        <>
          <Slider label="Segments" value={layer.segments} onChange={v => update('segments', v)} min={5} max={80} step={1} />
          <Slider label="Volume" value={layer.volume} onChange={v => update('volume', v)} min={1} max={30} step={0.5} />
          <Slider label="Opacity" value={layer.opacity} onChange={v => update('opacity', v)} min={0} max={1} step={0.05} />
          <Slider label="Speed" value={layer.speed} onChange={v => update('speed', v)} min={0} max={2} step={0.1} />
          <Slider label="Growth" value={layer.growth} onChange={v => update('growth', v)} min={1} max={15} step={0.5} />
          <Slider label="Fade" value={layer.fade} onChange={v => update('fade', v)} min={1} max={100} step={1} />
          <Slider label="Seed" value={layer.seed} onChange={v => update('seed', v)} min={0} max={100} step={1} />

          <div style={{ fontSize: 9, color: '#556', marginTop: 8, marginBottom: 4 }}>BOUNDS</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Slider label="X" value={layer.bounds[0]} onChange={v => updateBounds(0, v)} min={1} max={30} step={0.5} />
            <Slider label="Y" value={layer.bounds[1]} onChange={v => updateBounds(1, v)} min={1} max={15} step={0.5} />
            <Slider label="Z" value={layer.bounds[2]} onChange={v => updateBounds(2, v)} min={1} max={15} step={0.5} />
          </div>

          <div style={{ fontSize: 9, color: '#556', marginTop: 8, marginBottom: 4 }}>POSITION</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Slider label="X" value={layer.position[0]} onChange={v => updatePosition(0, v)} min={-30} max={30} step={1} />
            <Slider label="Y" value={layer.position[1]} onChange={v => updatePosition(1, v)} min={-20} max={20} step={1} />
            <Slider label="Z" value={layer.position[2]} onChange={v => updatePosition(2, v)} min={-30} max={30} step={1} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#556', marginBottom: 4 }}>COLOR</div>
              <input
                type="color"
                value={layer.color}
                onChange={e => update('color', e.target.value)}
                style={{ width: '100%', height: 24, border: '1px solid #2a2a4a', borderRadius: 4, cursor: 'pointer' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#556', marginBottom: 4 }}>CONCENTRATE</div>
              <select
                value={layer.concentrate}
                onChange={e => update('concentrate', e.target.value)}
                style={{
                  width: '100%', height: 24, background: '#1a1a2e', border: '1px solid #2a2a4a',
                  borderRadius: 4, color: '#7ee8fa', fontSize: 10, cursor: 'pointer'
                }}
              >
                <option value="random">random</option>
                <option value="inside">inside</option>
                <option value="outside">outside</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function EditorPage() {
  const [cloudLayers, setCloudLayers] = useState<CloudLayer[]>([
    { ...defaultCloudLayer, visible: true, seed: 1, segments: 40, bounds: [18.5, 2, 2], volume: 10, opacity: 0.8, speed: 0.4, growth: 4, fade: 10, concentrate: "inside", position: [9, -5, -8] },
    { ...defaultCloudLayer, visible: true, seed: 43, segments: 40, bounds: [18.5, 2, 1], volume: 9, opacity: 0.3, speed: 0.4, growth: 4, fade: 2, concentrate: "inside", position: [-1, -5, -5] },
    { ...defaultCloudLayer, visible: true, seed: 29, segments: 40, bounds: [10, 3.5, 2], volume: 10, opacity: 0.8, speed: 0.4, growth: 4, fade: 10, concentrate: "inside", position: [-13, -5, -7] },
    { ...defaultCloudLayer, visible: true, seed: 92, segments: 40, bounds: [19, 2, 2], volume: 10, opacity: 0.8, speed: 0.4, growth: 4, fade: 10, concentrate: "inside", position: [-1, -8, -3] },
  ])

  const [skySettings, setSkySettings] = useState<SkySettings>(PRESETS["Sunny Day"])
  const [activePreset, setActivePreset] = useState<string | null>("Sunny Day")

  const [showCards, setShowCards] = useState(true)
  const [cardZ, setCardZ] = useState(-5)
  const [cardSpacing, setCardSpacing] = useState(4.5)
  const [cardY, setCardY] = useState(0)

  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 30])
  const [cameraFov, setCameraFov] = useState(75)

  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [activeTab, setActiveTab] = useState('clouds')

  const updateSky = (key: keyof SkySettings, value: unknown) => {
    setSkySettings(prev => ({ ...prev, [key]: value }))
    setActivePreset(null)
  }

  const updateSunPosition = (axis: number, value: number) => {
    setSkySettings(prev => {
      const newPos = [...prev.sunPosition] as [number, number, number]
      newPos[axis] = value
      return { ...prev, sunPosition: newPos }
    })
    setActivePreset(null)
  }

  const selectPreset = (name: string) => {
    setSkySettings(PRESETS[name as keyof typeof PRESETS])
    setActivePreset(name)
  }

  const addCloudLayer = () => {
    setCloudLayers(prev => [...prev, {
      ...defaultCloudLayer,
      visible: true,
      seed: Math.floor(Math.random() * 100),
      position: [Math.random() * 20 - 10, Math.random() * 10, Math.random() * 10 - 5] as [number, number, number]
    }])
  }

  const updateCloudLayer = (index: number, newLayer: CloudLayer) => {
    setCloudLayers(prev => prev.map((l, i) => i === index ? newLayer : l))
  }

  const removeCloudLayer = (index: number) => {
    setCloudLayers(prev => prev.filter((_, i) => i !== index))
  }

  const generateCode = () => {
    const clouds = cloudLayers.filter(l => l.visible).map((layer) => `
    <Cloud
      seed={${layer.seed}}
      segments={${layer.segments}}
      bounds={[${layer.bounds.join(', ')}]}
      volume={${layer.volume}}
      color="${layer.color}"
      opacity={${layer.opacity}}
      speed={${layer.speed}}
      growth={${layer.growth}}
      fade={${layer.fade}}
      concentrate="${layer.concentrate}"
      position={[${layer.position.join(', ')}]}
    />`).join('\n')

    return `import { Canvas } from '@react-three/fiber'
import { Clouds, Cloud, Sky } from '@react-three/drei'

function CloudScene() {
  return (
    <Canvas flat camera={{ position: [${cameraPosition.join(', ')}], fov: ${cameraFov} }}>
      <Sky
        sunPosition={[${skySettings.sunPosition.join(', ')}]}
        turbidity={${skySettings.turbidity}}
        rayleigh={${skySettings.rayleigh}}
        mieCoefficient={${skySettings.mieCoefficient}}
        mieDirectionalG={${skySettings.mieDirectionalG}}
      />
      <directionalLight
        position={[${skySettings.sunPosition.join(', ')}]}
        intensity={${(skySettings.exposure * 5).toFixed(1)}}
        color="${skySettings.sunColor}"
      />
      <ambientLight intensity={0.3} />
      <Clouds limit={800}>
${clouds}
      </Clouds>
    </Canvas>
  )
}`
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a14', color: '#e0e4f0', fontFamily: 'sans-serif' }}>
      {/* Left Panel */}
      <div style={{ width: 320, background: '#0e0e1a', borderRight: '1px solid #1a1a3a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: 14, borderBottom: '1px solid #1a1a3a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #7ee8fa, #80ff72)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7ee8fa', fontFamily: 'monospace' }}>CLOUD EDITOR</span>
          </div>
          <a href="/" style={{ fontSize: 10, color: '#556', textDecoration: 'none', marginTop: 8, display: 'block' }}>
            ← Back to Home
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1a1a3a' }}>
          {['clouds', 'sky', 'camera', 'cards'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '10px 0', fontSize: 10, fontFamily: 'monospace',
                background: activeTab === tab ? 'rgba(126,232,250,0.1)' : 'transparent',
                border: 'none', borderBottom: activeTab === tab ? '2px solid #7ee8fa' : '2px solid transparent',
                color: activeTab === tab ? '#7ee8fa' : '#556', cursor: 'pointer', textTransform: 'uppercase'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {activeTab === 'clouds' && (
            <>
              <button
                onClick={addCloudLayer}
                style={{
                  width: '100%', padding: 10, marginBottom: 12, fontSize: 11, fontFamily: 'monospace',
                  background: 'rgba(128,255,114,0.1)', border: '1px solid #80ff72', borderRadius: 6,
                  color: '#80ff72', cursor: 'pointer'
                }}
              >
                + Add Cloud Layer
              </button>

              {cloudLayers.map((layer, index) => (
                <CloudLayerControls
                  key={index}
                  layer={layer}
                  index={index}
                  onChange={updateCloudLayer}
                  onRemove={removeCloudLayer}
                />
              ))}
            </>
          )}

          {activeTab === 'sky' && (
            <>
              <div style={{ fontSize: 10, color: '#556', marginBottom: 8, fontFamily: 'monospace' }}>SKY PRESETS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                {Object.keys(PRESETS).map(name => (
                  <button
                    key={name}
                    onClick={() => selectPreset(name)}
                    style={{
                      padding: '5px 8px', fontSize: 9, fontFamily: 'monospace',
                      background: activePreset === name ? 'rgba(126,232,250,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${activePreset === name ? '#7ee8fa' : '#1a1a3a'}`,
                      borderRadius: 6, color: activePreset === name ? '#7ee8fa' : '#778', cursor: 'pointer'
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#556', marginBottom: 8, fontFamily: 'monospace' }}>SUN POSITION</div>
              <Slider label="X" value={skySettings.sunPosition[0]} onChange={v => updateSunPosition(0, v)} min={-200} max={200} step={5} />
              <Slider label="Y (Height)" value={skySettings.sunPosition[1]} onChange={v => updateSunPosition(1, v)} min={-50} max={200} step={5} />
              <Slider label="Z" value={skySettings.sunPosition[2]} onChange={v => updateSunPosition(2, v)} min={-200} max={200} step={5} />

              <div style={{ fontSize: 10, color: '#556', marginTop: 12, marginBottom: 8, fontFamily: 'monospace' }}>ATMOSPHERE</div>
              <Slider label="Turbidity" value={skySettings.turbidity} onChange={v => updateSky('turbidity', v)} min={0} max={20} step={0.5} />
              <Slider label="Rayleigh" value={skySettings.rayleigh} onChange={v => updateSky('rayleigh', v)} min={0} max={10} step={0.1} />
              <Slider label="Mie Coefficient" value={skySettings.mieCoefficient} onChange={v => updateSky('mieCoefficient', v)} min={0} max={0.2} step={0.001} />
              <Slider label="Mie Directional G" value={skySettings.mieDirectionalG} onChange={v => updateSky('mieDirectionalG', v)} min={0} max={1} step={0.01} />

              <div style={{ fontSize: 10, color: '#556', marginTop: 12, marginBottom: 8, fontFamily: 'monospace' }}>LIGHTING</div>
              <Slider label="Exposure" value={skySettings.exposure} onChange={v => updateSky('exposure', v)} min={0} max={1} step={0.05} />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 9, color: '#556', marginBottom: 4 }}>SUN COLOR</div>
                <input
                  type="color"
                  value={skySettings.sunColor}
                  onChange={e => updateSky('sunColor', e.target.value)}
                  style={{ width: '100%', height: 28, border: '1px solid #2a2a4a', borderRadius: 4, cursor: 'pointer' }}
                />
              </div>
            </>
          )}

          {activeTab === 'camera' && (
            <>
              <div style={{ fontSize: 10, color: '#556', marginBottom: 8, fontFamily: 'monospace' }}>CAMERA POSITION</div>
              <Slider label="X" value={cameraPosition[0]} onChange={v => setCameraPosition([v, cameraPosition[1], cameraPosition[2]])} min={-50} max={50} step={1} />
              <Slider label="Y" value={cameraPosition[1]} onChange={v => setCameraPosition([cameraPosition[0], v, cameraPosition[2]])} min={-50} max={50} step={1} />
              <Slider label="Z (Distance)" value={cameraPosition[2]} onChange={v => setCameraPosition([cameraPosition[0], cameraPosition[1], v])} min={5} max={100} step={1} />

              <div style={{ fontSize: 10, color: '#556', marginTop: 12, marginBottom: 8, fontFamily: 'monospace' }}>FIELD OF VIEW</div>
              <Slider label="FOV" value={cameraFov} onChange={setCameraFov} min={30} max={120} step={1} />

              <button
                onClick={() => {
                  setCameraPosition([0, 0, 30])
                  setCameraFov(75)
                }}
                style={{
                  width: '100%', padding: 10, marginTop: 16, fontSize: 11, fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a4a', borderRadius: 6,
                  color: '#778', cursor: 'pointer'
                }}
              >
                Reset Camera
              </button>

              <p style={{ fontSize: 9, color: '#445', marginTop: 12, textAlign: 'center' }}>
                Tip: You can still drag to orbit in the preview
              </p>
            </>
          )}

          {activeTab === 'cards' && (
            <>
              <button
                onClick={() => setShowCards(!showCards)}
                style={{
                  width: '100%', padding: 10, fontSize: 11, fontFamily: 'monospace',
                  background: showCards ? 'rgba(126,232,250,0.15)' : 'transparent',
                  border: `1px solid ${showCards ? '#7ee8fa' : '#2a2a4a'}`, borderRadius: 6,
                  color: showCards ? '#7ee8fa' : '#667', cursor: 'pointer', marginBottom: 12
                }}
              >
                {showCards ? '◼' : '◻'} Show Project Cards
              </button>

              {showCards && (
                <>
                  <Slider label="Card Depth (Z)" value={cardZ} onChange={setCardZ} min={-30} max={10} step={0.5} />
                  <Slider label="Card Spacing" value={cardSpacing} onChange={setCardSpacing} min={2} max={10} step={0.5} />
                  <Slider label="Card Height (Y)" value={cardY} onChange={setCardY} min={-15} max={15} step={0.5} />
                </>
              )}

              <p style={{ fontSize: 9, color: '#445', marginTop: 12, textAlign: 'center' }}>
                6 placeholder cards to visualize your portfolio layout
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right: 3D Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Buttons */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowCode(!showCode)}
            style={{
              padding: '8px 14px', fontSize: 11, fontFamily: 'monospace',
              background: showCode ? 'rgba(126,232,250,0.15)' : 'rgba(0,0,0,0.5)',
              border: '1px solid #2a2a4a', borderRadius: 8, color: showCode ? '#7ee8fa' : '#889', cursor: 'pointer'
            }}
          >
            {showCode ? 'Hide Code' : 'View Code'}
          </button>
          <button
            onClick={copyCode}
            style={{
              padding: '8px 14px', fontSize: 11, fontFamily: 'monospace',
              background: copied ? 'rgba(128,255,114,0.15)' : 'rgba(0,0,0,0.5)',
              border: `1px solid ${copied ? '#80ff72' : '#2a2a4a'}`, borderRadius: 8,
              color: copied ? '#80ff72' : '#889', cursor: 'pointer'
            }}
          >
            {copied ? 'Copied!' : 'Copy JSX'}
          </button>
        </div>

        {/* 3D Canvas */}
        <div style={{ flex: 1 }}>
          <Canvas
            flat
            camera={{ position: [0, 0, 30], fov: 75 }}
          >
            <CloudScene
              cloudLayers={cloudLayers}
              skySettings={skySettings}
              showCards={showCards}
              cardZ={cardZ}
              cardSpacing={cardSpacing}
              cardY={cardY}
              cameraPosition={cameraPosition}
              cameraFov={cameraFov}
            />
          </Canvas>
        </div>

        {/* Code Panel */}
        {showCode && (
          <div style={{
            height: 280, background: '#08081a', borderTop: '1px solid #1a1a3a', overflow: 'auto', padding: 16
          }}>
            <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.5, fontFamily: 'monospace', color: '#b4bcd0', whiteSpace: 'pre-wrap' }}>
              {generateCode()}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
