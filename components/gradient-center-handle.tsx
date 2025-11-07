"use client"

import { useRef, useEffect, useCallback } from "react"
import type { GradientState } from "@/app/page"

interface GradientCenterHandleProps {
  gradient: GradientState
  setGradient: (gradient: GradientState) => void
}

export function GradientCenterHandle({ gradient, setGradient }: GradientCenterHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })

  // Only show for types that have a center point
  const shouldShow = ['radial', 'conic', 'repeating-radial', 'repeating-conic'].includes(gradient.type)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    startPosRef.current = { x: e.clientX, y: e.clientY }

    // Add global pointer events for dragging
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return

      const rect = handleRef.current?.parentElement?.getBoundingClientRect()
      if (!rect) return

      const newX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const newY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))

      setGradient({
        ...gradient,
        centerX: Math.round(newX),
        centerY: Math.round(newY)
      })
    }

    const handlePointerUp = () => {
      isDraggingRef.current = false
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
  }, [gradient, setGradient])

  if (!shouldShow) return null

  return (
    <div
      className="absolute inset-0 pointer-events-none"
    >
      {/* Center point indicator */}
      <div
        ref={handleRef}
        className="absolute w-6 h-6 border-2 border-white rounded-full shadow-lg pointer-events-auto cursor-move transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${gradient.centerX}%`,
          top: `${gradient.centerY}%`,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
        onPointerDown={handlePointerDown}
      >
        {/* Crosshair in the center */}
        <div className="absolute inset-1/2 w-0.5 h-0.5 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-1/2 w-2 h-px bg-black transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-1/2 w-px h-2 bg-black transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}
