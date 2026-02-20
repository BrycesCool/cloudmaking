import { useThree } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import { useEffect } from 'react'
import * as THREE from 'three'

/**
 * Environment Component
 *
 * Controls the scene environment including:
 * - Background color (with gradient option via CSS on the canvas)
 * - Ambient lighting (uniform, directionless light)
 * - Directional lighting (simulates sun, creates shadows/highlights)
 * - Fog (atmospheric depth effect)
 * - Camera FOV
 *
 * All settings are exposed via Leva controls for real-time adjustment.
 */
export default function Environment({ initialValues, onValuesChange }) {
  // Access Three.js scene and camera
  const { scene, camera } = useThree()

  // Environment controls in a dedicated folder
  // The second element returned is the `set` function to update values programmatically
  const [values, set] = useControls(
    'Environment',
    () => ({
      // Background color of the scene
      // This sets the scene.background property
      backgroundColor: {
        value: initialValues?.backgroundColor ?? '#87CEEB',
        label: 'Background',
      },

      // Ambient light illuminates all objects equally from all directions
      // Essential for making clouds visible without harsh shadows
      ambientIntensity: {
        value: initialValues?.ambientIntensity ?? 1.2,
        min: 0,
        max: 3,
        step: 0.1,
        label: 'Ambient Light',
      },

      // Directional light simulates sunlight
      // Creates highlights and gives clouds dimension
      directionalIntensity: {
        value: initialValues?.directionalIntensity ?? 2.5,
        min: 0,
        max: 5,
        step: 0.1,
        label: 'Sun Intensity',
      },

      // Directional light position folder
      // Moving the light changes where highlights appear on clouds
      sunPosition: folder(
        {
          sunX: {
            value: initialValues?.directionalPosition?.[0] ?? 10,
            min: -30,
            max: 30,
            step: 1,
            label: 'X',
          },
          sunY: {
            value: initialValues?.directionalPosition?.[1] ?? 20,
            min: 0,
            max: 40,
            step: 1,
            label: 'Y',
          },
          sunZ: {
            value: initialValues?.directionalPosition?.[2] ?? 10,
            min: -30,
            max: 30,
            step: 1,
            label: 'Z',
          },
        },
        { collapsed: true }
      ),

      // Fog creates atmospheric depth
      // Objects fade into the fog color at distance
      fog: folder(
        {
          fogEnabled: {
            value: initialValues?.fogEnabled ?? false,
            label: 'Enable Fog',
          },
          fogColor: {
            value: initialValues?.fogColor ?? '#87CEEB',
            label: 'Fog Color',
            render: (get) => get('Environment.fog.fogEnabled'),
          },
          fogNear: {
            value: initialValues?.fogNear ?? 10,
            min: 0,
            max: 50,
            step: 1,
            label: 'Fog Near',
            render: (get) => get('Environment.fog.fogEnabled'),
          },
          fogFar: {
            value: initialValues?.fogFar ?? 100,
            min: 20,
            max: 200,
            step: 5,
            label: 'Fog Far',
            render: (get) => get('Environment.fog.fogEnabled'),
          },
        },
        { collapsed: true }
      ),

      // Camera field of view
      // Lower = telephoto (zoomed in), Higher = wide angle
      cameraFov: {
        value: initialValues?.cameraFov ?? 60,
        min: 30,
        max: 120,
        step: 1,
        label: 'Camera FOV',
      },
    }),
    [initialValues]
  )

  // Force set background on mount and when initialValues change
  useEffect(() => {
    const bgColor = initialValues?.backgroundColor ?? '#87CEEB'
    scene.background = new THREE.Color(bgColor)
  }, [scene, initialValues?.backgroundColor])

  // Update Leva values when initialValues change (e.g., preset switch)
  useEffect(() => {
    set({
      backgroundColor: initialValues?.backgroundColor ?? '#87CEEB',
      ambientIntensity: initialValues?.ambientIntensity ?? 1.2,
      directionalIntensity: initialValues?.directionalIntensity ?? 2.5,
      sunX: initialValues?.directionalPosition?.[0] ?? 10,
      sunY: initialValues?.directionalPosition?.[1] ?? 20,
      sunZ: initialValues?.directionalPosition?.[2] ?? 10,
      fogEnabled: initialValues?.fogEnabled ?? false,
      fogColor: initialValues?.fogColor ?? '#87CEEB',
      fogNear: initialValues?.fogNear ?? 10,
      fogFar: initialValues?.fogFar ?? 100,
      cameraFov: initialValues?.cameraFov ?? 60,
    })
  }, [initialValues, set])

  // Update scene background when color changes
  useEffect(() => {
    scene.background = new THREE.Color(values.backgroundColor)
  }, [scene, values.backgroundColor])

  // Update fog when settings change
  useEffect(() => {
    if (values.fogEnabled) {
      scene.fog = new THREE.Fog(values.fogColor, values.fogNear, values.fogFar)
    } else {
      scene.fog = null
    }
  }, [scene, values.fogEnabled, values.fogColor, values.fogNear, values.fogFar])

  // Update camera FOV
  useEffect(() => {
    camera.fov = values.cameraFov
    camera.updateProjectionMatrix()
  }, [camera, values.cameraFov])

  // Notify parent of value changes for export
  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(values)
    }
  }, [values, onValuesChange])

  return (
    <>
      {/* Simple ambient light only - no directional to avoid color tinting */}
      <ambientLight intensity={values.ambientIntensity} color="#ffffff" />
    </>
  )
}

/**
 * Helper to extract environment settings for export
 */
export function getEnvironmentSettings(values) {
  return {
    backgroundColor: values.backgroundColor,
    ambientIntensity: values.ambientIntensity,
    directionalIntensity: values.directionalIntensity,
    directionalPosition: [values.sunX, values.sunY, values.sunZ],
    fogEnabled: values.fogEnabled,
    fogColor: values.fogColor,
    fogNear: values.fogNear,
    fogFar: values.fogFar,
    cameraFov: values.cameraFov,
  }
}
