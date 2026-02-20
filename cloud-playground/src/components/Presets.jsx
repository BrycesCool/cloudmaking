import { useControls, button } from 'leva'
import { cloudPresets, presetNames, defaultPreset } from '../presets/cloudPresets'

/**
 * Presets Component
 *
 * Provides a dropdown selector for quickly switching between predefined
 * cloud configurations. When a preset is selected, it updates all the
 * Leva controls across all cloud layers and environment settings.
 *
 * Available presets:
 * - Fluffy Day: Bright, happy day with white puffy clouds
 * - Stormy: Dark, moody storm clouds with low lighting
 * - Sunset: Warm orange/pink tinted clouds with golden light
 * - Minimal/Wispy: Sparse, delicate wispy clouds
 * - Dense Overcast: Heavy full cloud coverage
 *
 * @param {function} onPresetChange - Callback when a preset is selected
 * @param {string} currentPreset - Currently active preset name
 */
export default function Presets({ onPresetChange, currentPreset }) {
  // Create the preset selector dropdown
  useControls(
    'Presets',
    {
      // Dropdown to select a preset
      preset: {
        value: currentPreset || defaultPreset,
        options: presetNames,
        label: 'Select Preset',
        onChange: (value) => {
          // When a preset is selected, get its configuration and notify parent
          const presetConfig = cloudPresets[value]
          if (presetConfig && onPresetChange) {
            onPresetChange(value, presetConfig)
          }
        },
      },
    },
    [currentPreset]
  )

  return null // This component only provides UI controls, no 3D elements
}

/**
 * Get a preset configuration by name
 *
 * @param {string} presetName - Name of the preset to retrieve
 * @returns {object|null} The preset configuration or null if not found
 */
export function getPreset(presetName) {
  return cloudPresets[presetName] || null
}

/**
 * Get the default preset configuration
 *
 * @returns {object} The default preset configuration
 */
export function getDefaultPreset() {
  return {
    name: defaultPreset,
    config: cloudPresets[defaultPreset],
  }
}
