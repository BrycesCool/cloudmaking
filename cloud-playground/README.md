# Cloud Playground

An interactive 3D cloud sandbox built with React Three Fiber and drei's Cloud components. Use this development tool to visually experiment with cloud settings before integrating them into your portfolio website or other projects.

![Cloud Playground](https://via.placeholder.com/800x400/87CEEB/ffffff?text=Cloud+Playground)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Features

- **Interactive 3D Cloud Scene** - Full-viewport canvas with orbit controls
- **Live GUI Controls** - Adjust every cloud parameter in real-time via Leva
- **Multiple Cloud Layers** - 3 independent layers (Front, Mid, Back) for depth
- **5 Built-in Presets** - Quickly switch between different cloud styles
- **Environment Controls** - Lighting, fog, and background customization
- **Animation System** - Auto-rotate, drift, and color cycling effects
- **Export Functionality** - Copy settings as JSON or ready-to-paste JSX
- **Performance Monitoring** - FPS counter and segment warnings

## Leva Control Panel Guide

The control panel (top-right corner) is organized into folders:

### Presets
Quick-switch between pre-configured cloud styles:
- **Fluffy Day** - Bright white clouds, blue sky
- **Stormy** - Dark, moody storm clouds
- **Sunset** - Warm orange/pink tinted clouds
- **Minimal/Wispy** - Sparse, delicate clouds
- **Dense Overcast** - Heavy cloud coverage

### Cloud Layer Controls (Front/Mid/Back Clouds)
Each layer has its own folder with these controls:

| Property | Range | Description |
|----------|-------|-------------|
| Visible | Toggle | Show/hide this layer |
| Seed | 0-100 | Changes cloud shape randomization |
| Segments | 1-80 | Number of billboard planes (affects detail/performance) |
| Volume | 0-100 | Puffiness/thickness of the cloud |
| Opacity | 0-1 | Transparency level |
| Fade Distance | 0-400 | Distance at which clouds fade out |
| Growth | 0-20 | How much the cloud expands/spreads |
| Speed | 0-1 | Internal animation speed |
| Bounds (X/Y/Z) | Various | Size of the cloud bounding box |
| Color | Color picker | Cloud tint color |
| Position (X/Y/Z) | Various | Offset the cloud layer position |

### Environment
| Property | Range | Description |
|----------|-------|-------------|
| Background | Color | Scene background color |
| Ambient Light | 0-3 | Overall scene illumination |
| Sun Intensity | 0-5 | Directional light strength |
| Sun Position | X/Y/Z sliders | Light direction |
| Fog Toggle | On/Off | Enable atmospheric fog |
| Fog Color | Color | Color of the fog |
| Fog Near/Far | Distance | Fog density range |
| Camera FOV | 30-120 | Field of view (zoom effect) |

### Animation
| Property | Description |
|----------|-------------|
| Auto Rotate | Slowly spin the entire cloud group |
| Rotation Speed | Speed of auto-rotation |
| Drift | Move clouds along the X-axis |
| Drift Speed | Speed of drift movement |
| Color Cycle | Gradually shift cloud colors |

### Export Settings
| Button | Description |
|--------|-------------|
| Copy JSON | Copy all settings as JSON configuration |
| Copy as JSX | Copy complete component code |
| Copy Clouds Only | Copy just the `<Clouds>` wrapper code |

## Understanding Cloud Props

Here's what each prop does visually:

- **seed**: Think of it as a "shape ID" - different seeds produce different cloud formations while keeping the same settings
- **segments**: More segments = more detailed/complex clouds, but also more GPU work. Start with 15-25 for a good balance
- **volume**: Higher values make clouds look fluffier and more substantial. Low values create thin, wispy clouds
- **opacity**: Full opacity (1.0) looks solid; lower values create translucent, ethereal clouds
- **fade**: Controls how quickly clouds disappear with distance. Higher = clouds stay visible longer
- **growth**: Affects how spread out the cloud particles are. Higher = more dispersed cloud structure
- **speed**: The internal animation speed of the cloud billboards
- **bounds**: Defines the 3D box within which cloud particles are distributed
- **color**: Tints all particles in the cloud - great for sunset/mood effects

## Exporting Settings to Your Project

### Method 1: Copy as JSX
Click "Copy as JSX" to get ready-to-paste code like:

```jsx
import { Clouds, Cloud } from '@react-three/drei'

function CloudScene() {
  return (
    <Clouds>
      <Cloud
        key="cloud-1"
        seed={1}
        segments={25}
        bounds={[20, 8, 15]}
        volume={8}
        opacity={0.9}
        fade={100}
        growth={6}
        speed={0.2}
        color="#ffffff"
        position={[0, 5, 0]}
      />
      {/* More clouds... */}
    </Clouds>
  )
}
```

### Method 2: Copy JSON
Click "Copy JSON" to get a configuration object you can save/load:

```json
{
  "exportedAt": "2024-01-15T12:00:00.000Z",
  "version": "1.0",
  "environment": { ... },
  "animation": { ... },
  "cloudLayers": {
    "front": { ... },
    "mid": { ... },
    "back": { ... }
  }
}
```

## Performance Tips

1. **Keep segments low** - Each segment is a separate billboard plane. Total segments across all layers should stay under 60 for smooth performance

2. **Reduce visible layers** - Toggle off layers you don't need

3. **Lower bounds** - Smaller bounding boxes mean fewer particles to render

4. **Watch the FPS counter** - The info overlay shows real-time FPS. If it drops below 30, reduce complexity

5. **The warning appears at 60+ total segments** - This is when you might start seeing performance issues on lower-end hardware

## Tech Stack

- **Vite** - Fast development server and build tool
- **React** - UI library
- **Three.js** - 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers including Cloud components
- **Leva** - GUI control panel

## How drei Clouds Work

The drei `<Cloud>` component uses **billboard textures** - flat planes that always face the camera. By stacking multiple billboards with cloud textures at different positions and sizes, it creates the illusion of volumetric 3D clouds.

Key points:
- Clouds are NOT true 3D geometry - they're 2D planes facing the camera
- This makes them very performant compared to volumetric rendering
- The `segments` prop controls how many billboard planes are used
- Higher segments = more detailed/complex appearance but more GPU work

## File Structure

```
cloud-playground/
├── src/
│   ├── App.jsx              # Main app with Canvas and UI overlays
│   ├── components/
│   │   ├── CloudScene.jsx   # 3D scene orchestration
│   │   ├── CloudLayer.jsx   # Single cloud layer with Leva controls
│   │   ├── Environment.jsx  # Lighting, fog, background
│   │   ├── Presets.jsx      # Preset selector
│   │   └── ExportPanel.jsx  # Export buttons
│   ├── presets/
│   │   └── cloudPresets.js  # Preset configurations
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## Controls

- **Left-click + drag** - Rotate camera
- **Right-click + drag** - Pan camera
- **Scroll wheel** - Zoom in/out

## License

MIT - Feel free to use this in your projects!
