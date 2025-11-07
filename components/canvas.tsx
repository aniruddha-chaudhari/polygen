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

      const centerX = (gradient.centerX / 100) * width
      const centerY = (gradient.centerY / 100) * height
      const maxRadius = Math.sqrt(width * width + height * height) / 2

      if (gradient.type === "linear" || gradient.type === "repeating-linear") {
        const angleRad = (gradient.angle * Math.PI) / 180
        const startX = width / 2 - Math.cos(angleRad) * maxRadius
        const startY = height / 2 - Math.sin(angleRad) * maxRadius
        const endX = width / 2 + Math.cos(angleRad) * maxRadius
        const endY = height / 2 + Math.sin(angleRad) * maxRadius
        canvasGradient = ctx.createLinearGradient(startX, startY, endX, endY)
      } else if (gradient.type === "radial" || gradient.type === "repeating-radial") {
        const radius0 = 0
        const radius1 = maxRadius
        canvasGradient = ctx.createRadialGradient(centerX, centerY, radius0, centerX, centerY, radius1)
      } else if (gradient.type === "conic" || gradient.type === "repeating-conic") {
        canvasGradient = ctx.createConicGradient((gradient.angle * Math.PI) / 180, centerX, centerY)
      }

      if (canvasGradient) {
        // Add color stops sorted by position
        const sortedStops = [...gradient.colorStops].sort((a, b) => a.position - b.position)
        sortedStops.forEach((stop) => {
          const rgba = hexToRgba(stop.color, stop.alpha)
          canvasGradient!.addColorStop(stop.position / 100, rgba)
        })

        ctx.fillStyle = canvasGradient
        ctx.fillRect(0, 0, width, height)

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
