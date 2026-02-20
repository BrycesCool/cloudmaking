import { useEffect } from 'react'
import { Cloud } from '@react-three/drei'
import { useControls, folder } from 'leva'

/**
 * CloudLayer Component
 *
 * A reusable component that renders a single Cloud instance with its own
 * Leva control panel folder. Each layer can be independently configured.
 *
 * The drei Cloud component uses billboard textures (planes that always face
 * the camera) to create the illusion of volumetric clouds. Multiple billboard
 * planes are stacked together based on the 'segments' prop.
 *
 * @param {string} name - Display name for the Leva folder (e.g., "Front Clouds")
 * @param {object} initialValues - Initial prop values for this cloud layer
 * @param {function} onValuesChange - Callback when any value changes
 */
export default function CloudLayer({ name, initialValues, onValuesChange }) {
  // Create Leva controls for this specific cloud layer
  // Each layer gets its own collapsible folder in the GUI
  // The second element returned is the `set` function to update values programmatically
  const [values, set] = useControls(
    name,
    () => ({
      // Visibility toggle - allows hiding individual layers
      visible: { value: initialValues.visible ?? true, label: 'Visible' },

      // Seed controls the randomization of cloud shape
      // Different seeds produce different cloud formations
      seed: {
        value: initialValues.seed ?? 1,
        min: 0,
        max: 100,
        step: 1,
        label: 'Seed',
      },

      // Segments = number of billboard planes per cloud
      // Higher = more detail but worse performance
      segments: {
        value: initialValues.segments ?? 20,
        min: 1,
        max: 80,
        step: 1,
        label: 'Segments',
      },

      // Volume controls the puffiness/thickness of the cloud
      // Higher values make clouds appear more dense and billowy
      volume: {
        value: initialValues.volume ?? 6,
        min: 0,
        max: 100,
        step: 0.5,
        label: 'Volume',
      },

      // Opacity controls transparency (0 = invisible, 1 = solid)
      opacity: {
        value: initialValues.opacity ?? 0.8,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Opacity',
      },

      // Fade controls the distance at which clouds fade out
      // Useful for creating depth and atmosphere
      fade: {
        value: initialValues.fade ?? 100,
        min: 0,
        max: 400,
        step: 1,
        label: 'Fade Distance',
      },

      // Growth affects how much the cloud expands/spreads
      growth: {
        value: initialValues.growth ?? 4,
        min: 0,
        max: 20,
        step: 0.5,
        label: 'Growth',
      },

      // Speed controls animation/drift speed of the cloud
      speed: {
        value: initialValues.speed ?? 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Speed',
      },

      // Bounds folder - controls the bounding box size
      // Clouds are distributed within this 3D box
      bounds: folder(
        {
          boundsX: {
            value: initialValues.boundsX ?? 20,
            min: 1,
            max: 50,
            step: 1,
            label: 'Width (X)',
          },
          boundsY: {
            value: initialValues.boundsY ?? 8,
            min: 1,
            max: 30,
            step: 1,
            label: 'Height (Y)',
          },
          boundsZ: {
            value: initialValues.boundsZ ?? 15,
            min: 1,
            max: 50,
            step: 1,
            label: 'Depth (Z)',
          },
        },
        { collapsed: true }
      ),

      // Color picker for cloud tint
      // White is typical, but colored clouds create special effects
      color: {
        value: initialValues.color ?? '#ffffff',
        label: 'Color',
      },

      // Position folder - offset the entire cloud layer
      position: folder(
        {
          positionX: {
            value: initialValues.positionX ?? 0,
            min: -50,
            max: 50,
            step: 0.5,
            label: 'X',
          },
          positionY: {
            value: initialValues.positionY ?? 5,
            min: -20,
            max: 40,
            step: 0.5,
            label: 'Y',
          },
          positionZ: {
            value: initialValues.positionZ ?? 0,
            min: -50,
            max: 50,
            step: 0.5,
            label: 'Z',
          },
        },
        { collapsed: true }
      ),
    }),
    [initialValues]
  )

  // Update Leva values when initialValues change (e.g., preset switch)
  useEffect(() => {
    set({
      visible: initialValues.visible ?? true,
      seed: initialValues.seed ?? 1,
      segments: initialValues.segments ?? 20,
      volume: initialValues.volume ?? 6,
      opacity: initialValues.opacity ?? 0.8,
      fade: initialValues.fade ?? 100,
      growth: initialValues.growth ?? 4,
      speed: initialValues.speed ?? 0.1,
      boundsX: initialValues.boundsX ?? 20,
      boundsY: initialValues.boundsY ?? 8,
      boundsZ: initialValues.boundsZ ?? 15,
      color: initialValues.color ?? '#ffffff',
      positionX: initialValues.positionX ?? 0,
      positionY: initialValues.positionY ?? 5,
      positionZ: initialValues.positionZ ?? 0,
    })
  }, [initialValues, set])

  // Notify parent component of value changes for export functionality
  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(values)
    }
  }, [values, onValuesChange])

  // Don't render if visibility is toggled off
  if (!values.visible) {
    return null
  }

  return (
    <Cloud
      // Seed determines the random shape - same seed = same cloud shape
      seed={values.seed}
      // Number of billboard planes (affects detail and performance)
      segments={values.segments}
      // Bounding box as [width, height, depth] array
      bounds={[values.boundsX, values.boundsY, values.boundsZ]}
      // Volume/puffiness of the cloud
      volume={values.volume}
      // Transparency level
      opacity={values.opacity}
      // Fade-out distance from camera
      fade={values.fade}
      // Cloud expansion/growth factor
      growth={values.growth}
      // Animation speed
      speed={values.speed}
      // Cloud color
      color={values.color}
      // Position offset for this layer
      position={[values.positionX, values.positionY, values.positionZ]}
    />
  )
}

/**
 * Helper function to extract current values from Leva controls
 * Used for the export functionality
 */
export function getCloudLayerSettings(values) {
  return {
    visible: values.visible,
    seed: values.seed,
    segments: values.segments,
    volume: values.volume,
    opacity: values.opacity,
    fade: values.fade,
    growth: values.growth,
    speed: values.speed,
    boundsX: values.boundsX,
    boundsY: values.boundsY,
    boundsZ: values.boundsZ,
    color: values.color,
    positionX: values.positionX,
    positionY: values.positionY,
    positionZ: values.positionZ,
  }
}
