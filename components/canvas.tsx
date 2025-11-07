"use client"

import { useRef, useEffect, useCallback } from "react"
import type { GradientState } from "@/app/page"

interface CanvasProps {
  mode: "template" | "gradient" | "fractal"
  selectedTemplate: number
  gradient: GradientState
  fractalParams: any
}

const templates = [
  { name: "Ocean", colors: ["#0a1f2e", "#16c784"] },
  { name: "Sunset", colors: ["#ff6b6b", "#ffd93d"] },
  { name: "Forest", colors: ["#1a5f3e", "#90ee90"] },
  { name: "Night", colors: ["#1a1a2e", "#16213e"] },
  { name: "Fire", colors: ["#8b0000", "#ff4500"] },
  { name: "Sky", colors: ["#87ceeb", "#e0f6ff"] },
]

export function Canvas({ mode, selectedTemplate, gradient, fractalParams }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const renderGradient = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      let canvasGradient: CanvasGradient | null = null
      const isRepeating = gradient.type.startsWith('repeating-')
      const baseType = isRepeating ? gradient.type.replace('repeating-', '') as 'linear' | 'radial' | 'conic' : gradient.type

      const centerX = (gradient.centerX / 100) * width
      const centerY = (gradient.centerY / 100) * height
      const maxRadius = Math.sqrt(width * width + height * height) / 2

      if (baseType === "linear") {
        const angleRad = (gradient.angle * Math.PI) / 180
        const startX = width / 2 - Math.cos(angleRad) * maxRadius
        const startY = height / 2 - Math.sin(angleRad) * maxRadius
        const endX = width / 2 + Math.cos(angleRad) * maxRadius
        const endY = height / 2 + Math.sin(angleRad) * maxRadius
        canvasGradient = ctx.createLinearGradient(startX, startY, endX, endY)
      } else if (baseType === "radial") {
        const radius0 = 0
        // Apply shape ratio for elliptical gradients
        const radius1 = gradient.shape === "ellipse"
          ? maxRadius * gradient.shapeRatio
          : maxRadius
        canvasGradient = ctx.createRadialGradient(centerX, centerY, radius0, centerX, centerY, radius1)
      } else if (baseType === "conic") {
        canvasGradient = ctx.createConicGradient((gradient.angle * Math.PI) / 180, centerX, centerY)
      } else if (gradient.type === "mesh") {
        // Mesh gradient: render 9 overlapping radial gradients for organic blending
        const savedGlobalCompositeOperation = ctx.globalCompositeOperation
        ctx.globalCompositeOperation = 'screen' // Additive blending for smooth color mixing

        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const x = (col / 2) * width // Positions: 0, 0.5, 1.0
            const y = (row / 2) * height // Positions: 0, 0.5, 1.0
            const radius = (gradient.meshSpread / 100) * Math.min(width, height) * 0.8

            const meshGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
            const color = gradient.meshGrid[row][col]
            meshGradient.addColorStop(0, hexToRgba(color, 1))
            meshGradient.addColorStop(1, hexToRgba(color, 0))

            ctx.fillStyle = meshGradient
            ctx.fillRect(0, 0, width, height)
          }
        }

        // Restore original composite operation
        ctx.globalCompositeOperation = savedGlobalCompositeOperation

        // Apply noise if enabled (for mesh gradients too)
        if (gradient.noiseEnabled && gradient.noiseAmount > 0) {
          applyNoise(ctx, width, height, gradient.noiseAmount, gradient.noiseType)
        }
        return // Early return since mesh doesn't use the standard color stops logic
      }

      if (canvasGradient) {
        // Add color stops sorted by position
        const sortedStops = [...gradient.colorStops].sort((a, b) => a.position - b.position)
        sortedStops.forEach((stop) => {
          const rgba = hexToRgba(stop.color, stop.alpha)
          canvasGradient!.addColorStop(stop.position / 100, rgba)
        })

        // Add smooth transition for conic gradients
        if (baseType === "conic" && gradient.conicSmoothTransition && sortedStops.length > 0) {
          const firstStop = sortedStops[0]
          const rgba = hexToRgba(firstStop.color, firstStop.alpha)
          canvasGradient!.addColorStop(1.0, rgba) // Add first color at 100% to eliminate sharp line
        }

        if (isRepeating) {
          // Create pattern canvas for repeating gradients
          const patternCanvas = document.createElement('canvas')
          const patternSize = Math.max(50, gradient.repeatSize) // Minimum 50px, configurable
          patternCanvas.width = patternSize
          patternCanvas.height = patternSize
          const patternCtx = patternCanvas.getContext('2d')!

          // Render the gradient on the pattern canvas
          patternCtx.fillStyle = canvasGradient
          patternCtx.fillRect(0, 0, patternSize, patternSize)

          // Create and apply the pattern
          const pattern = ctx.createPattern(patternCanvas, 'repeat')!
          ctx.fillStyle = pattern
          ctx.fillRect(0, 0, width, height)
        } else {
          // Regular gradient rendering
          ctx.fillStyle = canvasGradient
          ctx.fillRect(0, 0, width, height)
        }

        // Apply noise if enabled
        if (gradient.noiseEnabled && gradient.noiseAmount > 0) {
          applyNoise(ctx, width, height, gradient.noiseAmount, gradient.noiseType)
        }
      }
    },
    [gradient],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    if (mode === "template") {
      const template = templates[selectedTemplate % templates.length]
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, template.colors[0])
      gradient.addColorStop(1, template.colors[1])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (mode === "gradient") {
      renderGradient(ctx, canvas.width, canvas.height)
    } else if (mode === "fractal") {
      drawFractal(ctx, canvas.width, canvas.height, fractalParams)
    }
  }, [mode, selectedTemplate, gradient, fractalParams, renderGradient])

  return <canvas ref={canvasRef} className="w-full h-full" crossOrigin="anonymous" />
}

function hexToRgba(hex: string, alpha = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    const r = Number.parseInt(result[1], 16)
    const g = Number.parseInt(result[2], 16)
    const b = Number.parseInt(result[3], 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return "rgba(0, 0, 0, 1)"
}

function applyNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
  type: "smooth" | "harsh",
) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  if (type === "harsh") {
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255 * amount
      data[i] += noise // R
      data[i + 1] += noise // G
      data[i + 2] += noise // B
    }
  } else {
    // Smooth noise using gradient-based approach
    for (let i = 0; i < data.length; i += 4) {
      const seed = Math.random() * 2 - 1
      const noise = seed * 255 * amount * 0.5
      data[i] += noise
      data[i + 1] += noise
      data[i + 2] += noise
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function drawFractal(ctx: CanvasRenderingContext2D, width: number, height: number, params: any) {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 3

  ctx.fillStyle = "#ffffff"
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 2

  const sides = params.sides || 6
  const angle = (Math.PI * 2) / sides

  for (let i = 0; i < sides; i++) {
    const x1 = centerX + radius * Math.cos(angle * i + params.rotation)
    const y1 = centerY + radius * Math.sin(angle * i + params.rotation)
    const x2 = centerX + radius * Math.cos(angle * (i + 1) + params.rotation)
    const y2 = centerY + radius * Math.sin(angle * (i + 1) + params.rotation)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
}
