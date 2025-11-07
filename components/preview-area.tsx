"use client"

import type React from "react"

import { useRef, useCallback, useState, useEffect } from "react"
import { Canvas } from "./canvas"
import { GradientCenterHandle } from "./gradient-center-handle"
import type {
  GradientState,
  ChaosGameParams,
  MandelbrotParams,
  Mode,
  PerlinNoiseParams,
  StrangeAttractorParams,
  CellularAutomataParams,
  FlowFieldParams,
  VoronoiParams,
  TessellationParams,
  CirclePackingParams,
  OpArtParams,
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
  perlinNoiseParams?: PerlinNoiseParams
  strangeAttractorParams?: StrangeAttractorParams
  cellularAutomataParams?: CellularAutomataParams
  flowFieldParams?: FlowFieldParams
  mandelbrotAutoZoomActive?: boolean
  setMandelbrotAutoZoomActive?: (active: boolean) => void
  voronoiParams?: VoronoiParams
  tessellationParams?: TessellationParams
  circlePackingParams?: CirclePackingParams
  opArtParams?: OpArtParams
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
  perlinNoiseParams,
  strangeAttractorParams,
  cellularAutomataParams,
  flowFieldParams,
  mandelbrotAutoZoomActive,
  setMandelbrotAutoZoomActive,
  voronoiParams,
  tessellationParams,
  circlePackingParams,
  opArtParams,
}: PreviewAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const autoZoomIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const bgColor =
    selectedBgIndex !== null && canvasBackgrounds[selectedBgIndex] ? canvasBackgrounds[selectedBgIndex] : "#000000"

  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (mode !== "mandelbrot" || !mandelbrotAutoZoomActive || !setMandelbrotAutoZoomActive) return

    // Beautiful zoom target points in the Mandelbrot set
    const zoomTargets = [
      { panX: -0.7469, panY: 0.1102, zoom: 1000 }, // Seahorse Valley
      { panX: -0.748, panY: 0.099, zoom: 10000 }, // Deep zoom
      { panX: -0.7492, panY: 0.1009, zoom: 100 }, // Ultra deep
      { panX: -0.5, panY: 0, zoom: 3 }, // Main bulb zoom out
    ]

    let currentTargetIndex = 0

    const animateToPoint = () => {
      const currentTarget = zoomTargets[currentTargetIndex]
      const startParams = { ...mandelbrotParams }
      const startTime = Date.now()
      const animationDuration = 4000 // 4 seconds per zoom
      const holdDuration = 2000 // Hold at target for 2 seconds

      const animate = () => {
        const elapsed = Date.now() - startTime

        if (elapsed < animationDuration) {
          // Easing function for smooth zoom
          const progress = elapsed / animationDuration
          const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress

          const newZoom = startParams.zoom + (currentTarget.zoom - startParams.zoom) * easeProgress
          const newPanX = startParams.panX + (currentTarget.panX - startParams.panX) * easeProgress
          const newPanY = startParams.panY + (currentTarget.panY - startParams.panY) * easeProgress

          setMandelbrotParams({
            ...mandelbrotParams,
            zoom: newZoom,
            panX: newPanX,
            panY: newPanY,
          })
          autoZoomIntervalRef.current = setTimeout(animate, 16) // ~60fps
        } else if (elapsed < animationDuration + holdDuration) {
          // Hold at target
          setMandelbrotParams({
            ...mandelbrotParams,
            zoom: currentTarget.zoom,
            panX: currentTarget.panX,
            panY: currentTarget.panY,
          })
          autoZoomIntervalRef.current = setTimeout(animate, 16)
        } else {
          // Move to next target
          currentTargetIndex = (currentTargetIndex + 1) % zoomTargets.length
          animateToPoint()
        }
      }

      animate()
    }

    animateToPoint()

    return () => {
      if (autoZoomIntervalRef.current) {
        clearTimeout(autoZoomIntervalRef.current)
      }
    }
  }, [mode, mandelbrotAutoZoomActive, setMandelbrotAutoZoomActive])

  // Handle mouse interactions for Mandelbrot/Julia sets
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== "mandelbrot") return

      // Start dragging for pan (both Mandelbrot and Julia modes)
      setIsDragging(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
    },
    [mode, setMandelbrotParams],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || mode !== "mandelbrot") return

      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y

      // Convert pixel movement to complex plane movement
      // Scale based on current zoom level
      const scale = 4 / mandelbrotParams.zoom // Base range is [-2, 2] at zoom 1
      const panScale = scale / 800 // Adjust sensitivity for smoother dragging

      setMandelbrotParams({
        ...mandelbrotParams,
        panX: mandelbrotParams.panX - deltaX * panScale,
        panY: mandelbrotParams.panY - deltaY * panScale,
      })

      setLastMousePos({ x: e.clientX, y: e.clientY })
    },
    [isDragging, mode, mandelbrotParams, setMandelbrotParams, lastMousePos],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle mouse leave to stop dragging
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (mode !== "mandelbrot") return

      e.preventDefault()

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = mandelbrotParams.zoom * zoomFactor

      setMandelbrotParams({
        ...mandelbrotParams,
        zoom: newZoom,
      })
    },
    [mode, mandelbrotParams, setMandelbrotParams],
  )

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
          perlinNoiseParams={perlinNoiseParams}
          strangeAttractorParams={strangeAttractorParams}
          cellularAutomataParams={cellularAutomataParams}
          flowFieldParams={flowFieldParams}
          voronoiParams={voronoiParams}
          tessellationParams={tessellationParams}
          circlePackingParams={circlePackingParams}
          opArtParams={opArtParams}
        />
        {showCenterHandle && mode === "gradient" && (
          <GradientCenterHandle gradient={gradient} setGradient={setGradient} />
        )}
      </div>

      {/* Instructions for Mandelbrot mode */}
      {mode === "mandelbrot" && (
        <div className="mt-4 text-xs text-muted-foreground text-center">Scroll to zoom • Click and drag to pan</div>
      )}
    </div>
  )
}
