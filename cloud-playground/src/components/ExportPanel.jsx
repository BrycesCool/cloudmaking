import { useControls, button } from 'leva'
import { useState, useCallback } from 'react'

/**
 * ExportPanel Component
 *
 * Provides export functionality to copy current cloud settings to clipboard.
 * Two export formats are available:
 *
 * 1. JSON Export: Raw configuration object that can be saved/loaded
 * 2. JSX Export: Ready-to-paste React Three Fiber code
 *
 * @param {object} cloudLayers - Current settings for all cloud layers
 * @param {object} environment - Current environment settings
 * @param {object} animation - Current animation settings
 * @param {function} showToast - Function to show success notification
 */
export default function ExportPanel({
  cloudLayers,
  environment,
  animation,
  showToast,
}) {
  // Export controls in a dedicated folder
  useControls(
    'Export Settings',
    {
      // Button to copy all settings as JSON
      'Copy JSON': button(() => {
        const settings = generateJSONExport(cloudLayers, environment, animation)
        copyToClipboard(settings, showToast, 'JSON settings')
      }),

      // Button to copy as ready-to-use JSX code
      'Copy as JSX': button(() => {
        const jsx = generateJSXExport(cloudLayers)
        copyToClipboard(jsx, showToast, 'JSX code')
      }),

      // Button to copy just the Cloud components
      'Copy Clouds Only': button(() => {
        const jsx = generateCloudsOnlyJSX(cloudLayers)
        copyToClipboard(jsx, showToast, 'Clouds JSX')
      }),
    },
    [cloudLayers, environment, animation]
  )

  return null // This component only provides UI controls
}

/**
 * Generate JSON export of all settings
 */
function generateJSONExport(cloudLayers, environment, animation) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    environment: environment,
    animation: animation,
    cloudLayers: {
      front: cloudLayers.front,
      mid: cloudLayers.mid,
      back: cloudLayers.back,
    },
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Generate JSX code for the complete cloud setup
 * This produces ready-to-paste code for your portfolio
 */
function generateJSXExport(cloudLayers) {
  const layers = ['front', 'mid', 'back']
  const cloudComponents = []

  layers.forEach((layerName, index) => {
    const layer = cloudLayers[layerName]
    if (layer && layer.visible) {
      cloudComponents.push(generateCloudJSX(layer, `cloud-${index + 1}`))
    }
  })

  return `// Cloud configuration exported from Cloud Playground
// Paste this inside your <Canvas> component

import { Clouds, Cloud } from '@react-three/drei'

function CloudScene() {
  return (
    <Clouds>
${cloudComponents.map((c) => '      ' + c).join('\n')}
    </Clouds>
  )
}
`
}

/**
 * Generate just the <Clouds> wrapper with <Cloud> components
 */
function generateCloudsOnlyJSX(cloudLayers) {
  const layers = ['front', 'mid', 'back']
  const cloudComponents = []

  layers.forEach((layerName, index) => {
    const layer = cloudLayers[layerName]
    if (layer && layer.visible) {
      cloudComponents.push(generateCloudJSX(layer, `cloud-${index + 1}`))
    }
  })

  return `<Clouds>
${cloudComponents.map((c) => '  ' + c).join('\n')}
</Clouds>`
}

/**
 * Generate a single <Cloud> JSX component string
 */
function generateCloudJSX(layer, key) {
  // Format position as array string
  const position = `[${layer.positionX}, ${layer.positionY}, ${layer.positionZ}]`
  const bounds = `[${layer.boundsX}, ${layer.boundsY}, ${layer.boundsZ}]`

  return `<Cloud
    key="${key}"
    seed={${layer.seed}}
    segments={${layer.segments}}
    bounds={${bounds}}
    volume={${layer.volume}}
    opacity={${layer.opacity}}
    fade={${layer.fade}}
    growth={${layer.growth}}
    speed={${layer.speed}}
    color="${layer.color}"
    position={${position}}
  />`
}

/**
 * Copy text to clipboard and show notification
 */
async function copyToClipboard(text, showToast, label) {
  try {
    await navigator.clipboard.writeText(text)
    if (showToast) {
      showToast(`${label} copied to clipboard!`)
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    if (showToast) {
      showToast(`${label} copied to clipboard!`)
    }
  }
}
