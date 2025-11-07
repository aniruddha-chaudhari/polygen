"use client"

import { useRef, useCallback, useState } from "react"
import { Canvas } from "./canvas"
import { GradientCenterHandle } from "./gradient-center-handle"
import type {
  GradientState,
  ChaosGameParams,
  MandelbrotParams,
  Mode,
} from "@/app/page"

interface PreviewAreaProps {
  mode: Mode
  selectedTemplate: number
  gradient: GradientState
  setGradient: (gradient: GradientState) => void
  showCenterHandle: boolean
  chaosGameParams: ChaosGameParams
  mandelbrotParams: MandelbrotParams
  setMandelbrotParams: (params: MandelbrotParams) => void
  canvasBackgrounds: string[]
  selectedBgIndex: number | null
}

export function PreviewArea({
  mode,
  selectedTemplate,
  gradient,
  setGradient,
  showCenterHandle,
  chaosGameParams,
  mandelbrotParams,
  setMandelbrotParams,
  canvasBackgrounds,
  selectedBgIndex,
}: PreviewAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgColor =
    selectedBgIndex !== null && canvasBackgrounds[selectedBgIndex] ? canvasBackgrounds[selectedBgIndex] : "#000000"

  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Handle mouse interactions for Mandelbrot/Julia sets
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode !== "mandelbrot") return

    // Start dragging for pan (both Mandelbrot and Julia modes)
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }, [mode, setMandelbrotParams])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || mode !== "mandelbrot") return

    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y

    // Convert pixel movement to complex plane movement
    // Scale based on current zoom level
    const scale = 4 / mandelbrotParams.zoom // Base range is [-2, 2] at zoom 1
    const panScale = scale / 400 // Adjust sensitivity

    setMandelbrotParams({
      ...mandelbrotParams,
      panX: mandelbrotParams.panX + deltaX * panScale,
      panY: mandelbrotParams.panY + deltaY * panScale,
    })

    setLastMousePos({ x: e.clientX, y: e.clientY })
  }, [isDragging, mode, mandelbrotParams, setMandelbrotParams, lastMousePos])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle mouse leave to stop dragging
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (mode !== "mandelbrot") return

    e.preventDefault()

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = mandelbrotParams.zoom * zoomFactor

    setMandelbrotParams({
      ...mandelbrotParams,
      zoom: newZoom,
    })
  }, [mode, mandelbrotParams, setMandelbrotParams])

  return (
    <div className="flex-1 bg-background p-8 flex flex-col justify-center items-center">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={`relative w-full max-w-2xl aspect-video rounded-lg border border-border overflow-hidden ${
          mode === "mandelbrot" ? "cursor-grab" : "cursor-default"
        } ${isDragging ? "cursor-grabbing" : ""}`}
        style={{ backgroundColor: bgColor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <Canvas
          mode={mode}
          selectedTemplate={selectedTemplate}
          gradient={gradient}
          chaosGameParams={chaosGameParams}
          mandelbrotParams={mandelbrotParams}
        />
        {showCenterHandle && mode === "gradient" && (
          <GradientCenterHandle gradient={gradient} setGradient={setGradient} />
        )}
      </div>

      {/* Instructions for Mandelbrot mode */}
      {mode === "mandelbrot" && (
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Scroll to zoom • Click and drag to pan
        </div>
      )}
    </div>
  )
}
