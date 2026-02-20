'use client'

import dynamic from 'next/dynamic'

// Dynamically import CloudScene with no SSR since Three.js requires browser APIs
const CloudScene = dynamic(() => import('./CloudScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to bottom, #87ceeb, #e0f0ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ color: '#333', fontSize: '18px' }}>Loading clouds...</div>
    </div>
  ),
})

export default function Hero() {
  return (
    <section style={{
      position: 'relative',
      width: '100%',
      height: '600px',
      overflow: 'hidden'
    }}>
      <CloudScene />
    </section>
  )
}
