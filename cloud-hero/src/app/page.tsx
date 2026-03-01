'use client'

import { useState, useRef, useEffect } from "react";
import Hero from "@/components/Hero";
import FallingStickFigure, { FallingStickFigureRef } from "@/components/FallingStickFigure";
import GlassShatter, { GlassShatterRef } from "@/components/GlassShatter";
import type { Attachment } from "@/types/stickfigure";

export default function Home() {
  const [showContent, setShowContent] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
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
        onFallComplete={() => {
          // Figure finished falling
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
        }} />
      )}
    </main>
  );
}
