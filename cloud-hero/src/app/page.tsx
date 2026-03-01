'use client'

import { useState, useRef, useEffect } from "react";
import Hero from "@/components/Hero";
import FallingStickFigure, { FallingStickFigureRef } from "@/components/FallingStickFigure";
import GlassShatter, { GlassShatterRef } from "@/components/GlassShatter";
import type { Attachment } from "@/types/stickfigure";

export default function Home() {
  const [showContent, setShowContent] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [waitingAtMiddle, setWaitingAtMiddle] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const figureRef = useRef<FallingStickFigureRef>(null)
  const glassRef = useRef<GlassShatterRef>(null)

  // Load attachments from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('stickfigure-config')
    if (saved) {
      try {
        const config = JSON.parse(saved)
        if (config.attachments) {
          setAttachments(config.attachments)
        }
      } catch (e) {
        console.error('Failed to load stickfigure config:', e)
      }
    }
  }, [])

  const handleArrowClick = () => {
    if (isAnimating) return
    setIsAnimating(true)
    figureRef.current?.startFall()
  }

  const handleContinueFall = () => {
    if (!waitingAtMiddle) return
    setWaitingAtMiddle(false)
    figureRef.current?.resumeFall()
  }

  return (
    <main>
      {/* Glass shatter effect */}
      <GlassShatter ref={glassRef} particleCount={50} />

      {/* Global Falling Stick Figure */}
      <FallingStickFigure
        ref={figureRef}
        attachments={attachments}
        onReachBottom={() => {
          setShowContent(true)
          // Trigger glass shatter right before figure enters screen
          setTimeout(() => {
            glassRef.current?.trigger()
          }, 400)
        }}
        onReachMiddle={() => {
          // Figure stopped at middle, waiting for click
          setWaitingAtMiddle(true)
        }}
        onFallComplete={() => {
          // Figure finished falling
          setIsAnimating(false)
        }}
      />

      {/* Hero section - hide when content shows */}
      <div style={{
        display: showContent ? 'none' : 'block',
      }}>
        <Hero onArrowClick={handleArrowClick} isAnimating={isAnimating} />
      </div>

      {/* Black screen - figure falls through */}
      {showContent && (
        <section style={{
          width: '100%',
          height: '100vh',
          background: '#000000',
          position: 'relative',
        }}>
          {/* Down arrow - appears when figure stops at middle */}
          {waitingAtMiddle && (
            <button
              onClick={handleContinueFall}
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '20px',
                zIndex: 10000,
              }}
            >
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: 'bounce 1s infinite',
                }}
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              <style>{`
                @keyframes bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(10px); }
                }
              `}</style>
            </button>
          )}
        </section>
      )}
    </main>
  );
}
