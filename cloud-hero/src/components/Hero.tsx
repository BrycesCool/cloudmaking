'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'

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
      background: 'linear-gradient(to bottom, #000000, #111111)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ color: '#fff', fontSize: '18px' }}>Loading clouds...</div>
    </div>
  ),
})

interface HeroProps {
  onArrowClick?: () => void
  isAnimating?: boolean
}

export default function Hero({ onArrowClick, isAnimating = false }: HeroProps) {
  return (
    <section style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <CloudScene />

      {/* Down Arrow Button */}
      <button
        onClick={onArrowClick}
        disabled={isAnimating}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'transparent',
          border: 'none',
          cursor: isAnimating ? 'default' : 'pointer',
          opacity: isAnimating ? 0 : 1,
          transition: 'opacity 0.3s ease',
          zIndex: 50,
          padding: '20px'
        }}
        aria-label="Scroll down"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: 'bounce 2s infinite'
          }}
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>

      {/* Bounce animation keyframes */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </section>
  )
}
