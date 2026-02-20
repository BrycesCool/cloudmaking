import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Clouds, Cloud, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const PRESETS = {
  "Soft & Dreamy": {
    segments: 40,
    bounds: [10, 2, 2],
    volume: 10,
    color: "#ffffff",
    opacity: 0.8,
    speed: 0.4,
    fade: 10,
    seed: 1,
    concentrate: "inside",
    growth: 4,
    count: 3,
    bgColor: "#1a1a2e",
  },
  "Stormy & Dark": {
    segments: 60,
    bounds: [15, 3, 3],
    volume: 14,
    color: "#8899aa",
    opacity: 0.9,
    speed: 1.2,
    fade: 25,
    seed: 42,
    concentrate: "random",
    growth: 6,
    count: 5,
    bgColor: "#0d0d1a",
  },
  "Sunrise Wisps": {
    segments: 25,
    bounds: [8, 1.5, 1],
    volume: 5,
    color: "#ffaa66",
    opacity: 0.6,
    speed: 0.2,
    fade: 15,
    seed: 7,
    concentrate: "inside",
    growth: 3,
    count: 4,
    bgColor: "#1e0a2e",
  },
  "Cotton Candy": {
    segments: 35,
    bounds: [6, 2, 2],
    volume: 8,
    color: "#ff88cc",
    opacity: 0.7,
    speed: 0.3,
    fade: 12,
    seed: 99,
    concentrate: "inside",
    growth: 5,
    count: 3,
    bgColor: "#0f0f23",
  },
  "Minimal Fog": {
    segments: 15,
    bounds: [20, 1, 1],
    volume: 3,
    color: "#cccccc",
    opacity: 0.4,
    speed: 0.1,
    fade: 30,
    seed: 3,
    concentrate: "outside",
    growth: 2,
    count: 2,
    bgColor: "#111111",
  },
  "Thick Cumulus": {
    segments: 50,
    bounds: [8, 4, 4],
    volume: 16,
    color: "#eeeeff",
    opacity: 1,
    speed: 0.5,
    fade: 8,
    seed: 21,
    concentrate: "inside",
    growth: 4,
    count: 2,
    bgColor: "#162447",
  },
}

function Slider({ label, value, onChange, min, max, step = 0.1 }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <label style={{ fontSize: 11, color: '#a0a8c0', fontFamily: 'monospace' }}>{label}</label>
        <span style={{ fontSize: 11, color: '#7ee8fa', fontFamily: 'monospace' }}>
          {typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}
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

function CloudScene({ params }) {
  const cloudsRef = useRef()

  // Generate cloud positions based on seed
  const cloudConfigs = []
  for (let i = 0; i < params.count; i++) {
    const seedOffset = params.seed + i * 10
    // Spread clouds out
    const x = (i - (params.count - 1) / 2) * 4
    const y = Math.sin(seedOffset) * 2
    const z = Math.cos(seedOffset) * 3
    cloudConfigs.push({ seedOffset, position: [x, y, z] })
  }

  return (
    <>
      <color attach="background" args={[params.bgColor]} />
      <ambientLight intensity={2} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={50}
      />

      <Clouds ref={cloudsRef} limit={400}>
        {cloudConfigs.map((config, i) => (
          <Cloud
            key={i}
            seed={config.seedOffset}
            segments={params.segments}
            bounds={params.bounds}
            volume={params.volume}
            color={params.color}
            opacity={params.opacity}
            speed={params.speed}
            growth={params.growth}
            fade={params.fade}
            concentrate={params.concentrate}
            position={config.position}
          />
        ))}
      </Clouds>
    </>
  )
}

function generateCode(params) {
  const clouds = []
  for (let i = 0; i < params.count; i++) {
    const x = (i - (params.count - 1) / 2) * 4
    clouds.push(
      `    <Cloud
      seed={${params.seed + i * 10}}
      segments={${params.segments}}
      bounds={[${params.bounds.join(', ')}]}
      volume={${params.volume}}
      color="${params.color}"
      opacity={${params.opacity}}
      speed={${params.speed}}
      growth={${params.growth}}
      fade={${params.fade}}
      concentrate="${params.concentrate}"
      position={[${x}, 0, 0]}
    />`
    )
  }

  return `import { Canvas } from '@react-three/fiber'
import { Clouds, Cloud, OrbitControls } from '@react-three/drei'

function CloudScene() {
  return (
    <Canvas
      flat
      camera={{ position: [0, 0, 20], fov: 75 }}
      style={{ background: '${params.bgColor}' }}
    >
      <ambientLight intensity={2} />
      <Clouds>
${clouds.join('\n')}
      </Clouds>
      <OrbitControls />
    </Canvas>
  )
}`
}

export default function App() {
  const [params, setParams] = useState(PRESETS["Soft & Dreamy"])
  const [activePreset, setActivePreset] = useState("Soft & Dreamy")
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const update = (key, value) => {
    setParams(p => ({ ...p, [key]: value }))
    setActivePreset(null)
  }

  const updateBounds = (index, value) => {
    setParams(p => {
      const newBounds = [...p.bounds]
      newBounds[index] = value
      return { ...p, bounds: newBounds }
    })
    setActivePreset(null)
  }

  const selectPreset = (name) => {
    setParams(PRESETS[name])
    setActivePreset(name)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode(params))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a14', color: '#e0e4f0', fontFamily: 'sans-serif' }}>
      {/* Left Panel */}
      <div style={{ width: 300, background: '#0e0e1a', borderRight: '1px solid #1a1a3a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: 16, borderBottom: '1px solid #1a1a3a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #7ee8fa, #80ff72)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#7ee8fa', fontFamily: 'monospace' }}>CLOUD PLAYGROUND</span>
          </div>
          <p style={{ fontSize: 11, color: '#556', margin: '4px 0 0', fontFamily: 'monospace' }}>@react-three/drei</p>
        </div>

        {/* Presets */}
        <div style={{ padding: 12, borderBottom: '1px solid #1a1a3a' }}>
          <div style={{ fontSize: 10, color: '#556', marginBottom: 8, fontFamily: 'monospace' }}>PRESETS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {Object.keys(PRESETS).map(name => (
              <button
                key={name}
                onClick={() => selectPreset(name)}
                style={{
                  padding: '5px 8px',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  background: activePreset === name ? 'rgba(126,232,250,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activePreset === name ? '#7ee8fa' : '#1a1a3a'}`,
                  borderRadius: 6,
                  color: activePreset === name ? '#7ee8fa' : '#778',
                  cursor: 'pointer',
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
          <div style={{ fontSize: 10, color: '#556', marginBottom: 10, fontFamily: 'monospace' }}>CLOUD PROPS</div>

          <Slider label="segments" value={params.segments} onChange={v => update('segments', v)} min={5} max={80} step={1} />
          <Slider label="volume" value={params.volume} onChange={v => update('volume', v)} min={1} max={20} step={0.5} />
          <Slider label="opacity" value={params.opacity} onChange={v => update('opacity', v)} min={0} max={1} step={0.05} />
          <Slider label="speed" value={params.speed} onChange={v => update('speed', v)} min={0} max={2} step={0.1} />
          <Slider label="growth" value={params.growth} onChange={v => update('growth', v)} min={1} max={10} step={0.5} />
          <Slider label="fade" value={params.fade} onChange={v => update('fade', v)} min={1} max={50} step={1} />
          <Slider label="seed" value={params.seed} onChange={v => update('seed', v)} min={0} max={100} step={1} />
          <Slider label="count" value={params.count} onChange={v => update('count', v)} min={1} max={8} step={1} />

          <div style={{ fontSize: 10, color: '#556', margin: '16px 0 8px', fontFamily: 'monospace' }}>BOUNDS</div>
          <Slider label="X" value={params.bounds[0]} onChange={v => updateBounds(0, v)} min={1} max={25} step={0.5} />
          <Slider label="Y" value={params.bounds[1]} onChange={v => updateBounds(1, v)} min={1} max={10} step={0.5} />
          <Slider label="Z" value={params.bounds[2]} onChange={v => updateBounds(2, v)} min={1} max={10} step={0.5} />

          <div style={{ marginTop: 16, marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#556', marginBottom: 6, fontFamily: 'monospace' }}>CONCENTRATE</div>
            <div style={{ display: 'flex', gap: 5 }}>
              {['random', 'inside', 'outside'].map(c => (
                <button
                  key={c}
                  onClick={() => update('concentrate', c)}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    background: params.concentrate === c ? 'rgba(126,232,250,0.15)' : 'transparent',
                    border: `1px solid ${params.concentrate === c ? '#7ee8fa' : '#2a2a4a'}`,
                    borderRadius: 5,
                    color: params.concentrate === c ? '#7ee8fa' : '#667',
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#556', marginBottom: 6, fontFamily: 'monospace' }}>COLOR</div>
              <input
                type="color"
                value={params.color}
                onChange={e => update('color', e.target.value)}
                style={{ width: '100%', height: 32, border: '1px solid #2a2a4a', borderRadius: 5, cursor: 'pointer' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#556', marginBottom: 6, fontFamily: 'monospace' }}>BACKGROUND</div>
              <input
                type="color"
                value={params.bgColor}
                onChange={e => update('bgColor', e.target.value)}
                style={{ width: '100%', height: 32, border: '1px solid #2a2a4a', borderRadius: 5, cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: 3D Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Buttons */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowCode(!showCode)}
            style={{
              padding: '8px 14px',
              fontSize: 11,
              fontFamily: 'monospace',
              background: showCode ? 'rgba(126,232,250,0.15)' : 'rgba(0,0,0,0.5)',
              border: '1px solid #2a2a4a',
              borderRadius: 8,
              color: showCode ? '#7ee8fa' : '#889',
              cursor: 'pointer',
            }}
          >
            {showCode ? 'Hide Code' : 'View Code'}
          </button>
          <button
            onClick={copyCode}
            style={{
              padding: '8px 14px',
              fontSize: 11,
              fontFamily: 'monospace',
              background: copied ? 'rgba(128,255,114,0.15)' : 'rgba(0,0,0,0.5)',
              border: `1px solid ${copied ? '#80ff72' : '#2a2a4a'}`,
              borderRadius: 8,
              color: copied ? '#80ff72' : '#889',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied!' : 'Copy JSX'}
          </button>
        </div>

        {/* 3D Canvas */}
        <div style={{ flex: 1 }}>
          <Canvas
            flat
            camera={{ position: [0, 0, 20], fov: 75 }}
          >
            <CloudScene params={params} />
          </Canvas>
        </div>

        {/* Code Panel */}
        {showCode && (
          <div style={{
            height: 280,
            background: '#08081a',
            borderTop: '1px solid #1a1a3a',
            overflow: 'auto',
            padding: 16,
          }}>
            <pre style={{
              margin: 0,
              fontSize: 11,
              lineHeight: 1.6,
              fontFamily: 'monospace',
              color: '#b4bcd0',
              whiteSpace: 'pre-wrap',
            }}>
              {generateCode(params)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
