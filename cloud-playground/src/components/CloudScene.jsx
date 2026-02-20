import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Clouds, OrbitControls } from '@react-three/drei'
import { useControls, folder } from 'leva'

import CloudLayer from './CloudLayer'
import Environment from './Environment'
import Presets, { getDefaultPreset } from './Presets'
import ExportPanel from './ExportPanel'
import { cloudPresets } from '../presets/cloudPresets'

/**
 * CloudScene Component
 *
 * The main 3D scene containing all cloud layers, environment settings,
 * animation controls, and the preset system. This is where everything
 * comes together.
 *
 * Features:
 * - 3 independent cloud layers (Front, Mid, Back)
 * - Full environment controls (lighting, fog, background)
 * - Animation system (auto-rotate, drift, color cycling)
 * - Preset switching
 * - Export functionality
 *
 * @param {function} showToast - Function to show toast notifications
 * @param {function} onStatsUpdate - Callback to update the info overlay
 */
export default function CloudScene({ showToast, onStatsUpdate }) {
  // Refs for animation
  const cloudsGroupRef = useRef()
  const colorHueRef = useRef(0)

  // Get default preset for initial values
  const defaultPresetData = getDefaultPreset()
  const defaultConfig = defaultPresetData.config

  // State for current preset and settings
  const [currentPreset, setCurrentPreset] = useState(defaultPresetData.name)
  const [presetConfig, setPresetConfig] = useState(defaultConfig)

  // State to track current values from each layer for export
  const [layerValues, setLayerValues] = useState({
    front: defaultConfig.layers.front,
    mid: defaultConfig.layers.mid,
    back: defaultConfig.layers.back,
  })
  const [envValues, setEnvValues] = useState(defaultConfig.environment)
  const [animValues, setAnimValues] = useState(defaultConfig.animation)

  // Animation controls in a dedicated folder
  // The second element returned is the `set` function to update values programmatically
  const [animation, setAnimation] = useControls(
    'Animation',
    () => ({
      // Auto-rotate the entire cloud group
      autoRotate: {
        value: presetConfig.animation?.autoRotate ?? false,
        label: 'Auto Rotate',
      },
      rotationSpeed: {
        value: presetConfig.animation?.rotationSpeed ?? 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Rotation Speed',
        render: (get) => get('Animation.autoRotate'),
      },

      // Drift clouds along X axis
      drift: {
        value: presetConfig.animation?.drift ?? true,
        label: 'Drift',
      },
      driftSpeed: {
        value: presetConfig.animation?.driftSpeed ?? 0.5,
        min: 0,
        max: 3,
        step: 0.1,
        label: 'Drift Speed',
        render: (get) => get('Animation.drift'),
      },

      // Color cycling - gradually shifts cloud hue
      colorCycle: {
        value: presetConfig.animation?.colorCycle ?? false,
        label: 'Color Cycle',
      },
    }),
    [presetConfig]
  )

  // Update Leva animation values when presetConfig changes
  useEffect(() => {
    setAnimation({
      autoRotate: presetConfig.animation?.autoRotate ?? false,
      rotationSpeed: presetConfig.animation?.rotationSpeed ?? 0.1,
      drift: presetConfig.animation?.drift ?? true,
      driftSpeed: presetConfig.animation?.driftSpeed ?? 0.5,
      colorCycle: presetConfig.animation?.colorCycle ?? false,
    })
  }, [presetConfig, setAnimation])

  // Update animation values for export
  useEffect(() => {
    setAnimValues(animation)
  }, [animation])

  // Handle preset change
  const handlePresetChange = useCallback((presetName, config) => {
    setCurrentPreset(presetName)
    setPresetConfig(config)
    // Update layer values to match new preset
    setLayerValues({
      front: config.layers.front,
      mid: config.layers.mid,
      back: config.layers.back,
    })
    setEnvValues(config.environment)
    setAnimValues(config.animation)
  }, [])

  // Callbacks to update layer values when they change in Leva
  const handleFrontChange = useCallback((values) => {
    setLayerValues((prev) => ({ ...prev, front: values }))
  }, [])

  const handleMidChange = useCallback((values) => {
    setLayerValues((prev) => ({ ...prev, mid: values }))
  }, [])

  const handleBackChange = useCallback((values) => {
    setLayerValues((prev) => ({ ...prev, back: values }))
  }, [])

  const handleEnvChange = useCallback((values) => {
    setEnvValues(values)
  }, [])

  // Calculate total segments for performance warning
  const totalSegments = useMemo(() => {
    let total = 0
    if (layerValues.front?.visible) total += layerValues.front.segments || 0
    if (layerValues.mid?.visible) total += layerValues.mid.segments || 0
    if (layerValues.back?.visible) total += layerValues.back.segments || 0
    return total
  }, [layerValues])

  // Animation frame loop
  useFrame((state, delta) => {
    if (!cloudsGroupRef.current) return

    // Auto-rotation
    if (animation.autoRotate) {
      cloudsGroupRef.current.rotation.y += delta * animation.rotationSpeed
    }

    // Drift animation - move clouds along X, reset when out of view
    if (animation.drift) {
      cloudsGroupRef.current.position.x += delta * animation.driftSpeed
      // Reset position when drifted too far (creates infinite loop effect)
      if (cloudsGroupRef.current.position.x > 50) {
        cloudsGroupRef.current.position.x = -50
      }
    }

    // Color cycling animation
    if (animation.colorCycle) {
      colorHueRef.current += delta * 0.05
      if (colorHueRef.current > 1) colorHueRef.current = 0
      // Note: Color cycling is handled by the Cloud component's internal animation
      // This is a placeholder for custom color cycling if needed
    }

    // Update stats for info overlay
    if (onStatsUpdate) {
      onStatsUpdate({
        totalSegments,
        cameraPosition: [
          state.camera.position.x.toFixed(1),
          state.camera.position.y.toFixed(1),
          state.camera.position.z.toFixed(1),
        ],
      })
    }
  })

  return (
    <>
      {/* Preset selector - changes all settings at once */}
      <Presets
        onPresetChange={handlePresetChange}
        currentPreset={currentPreset}
      />

      {/* Environment - lighting, fog, background */}
      <Environment
        initialValues={presetConfig.environment}
        onValuesChange={handleEnvChange}
      />

      {/* Export panel - copy settings to clipboard */}
      <ExportPanel
        cloudLayers={layerValues}
        environment={envValues}
        animation={animValues}
        showToast={showToast}
      />

      {/* OrbitControls - allows camera rotation/zoom with mouse */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={100}
        // Limit vertical rotation to keep clouds in view
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.8}
      />

      {/*
        Clouds wrapper - required by drei to manage cloud instances
        Uses drei's default material which works well with lighting
      */}
      <Clouds ref={cloudsGroupRef}>
        {/* Front Cloud Layer - closest to camera */}
        <CloudLayer
          name="Front Clouds"
          initialValues={presetConfig.layers.front}
          onValuesChange={handleFrontChange}
        />

        {/* Mid Cloud Layer - middle distance */}
        <CloudLayer
          name="Mid Clouds"
          initialValues={presetConfig.layers.mid}
          onValuesChange={handleMidChange}
        />

        {/* Back Cloud Layer - furthest from camera */}
        <CloudLayer
          name="Back Clouds"
          initialValues={presetConfig.layers.back}
          onValuesChange={handleBackChange}
        />
      </Clouds>

      {/* Performance warning component - shown when segments are high */}
      {totalSegments > 60 && (
        <PerformanceWarningHelper totalSegments={totalSegments} />
      )}
    </>
  )
}

/**
 * Helper component to trigger performance warning
 * This exists because we can't easily render HTML from within the Canvas
 */
function PerformanceWarningHelper({ totalSegments }) {
  // This will be handled by the App component via the stats update
  return null
}
