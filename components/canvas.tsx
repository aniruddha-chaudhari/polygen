"use client"

import { useRef, useEffect } from "react"

interface CanvasProps {
  mode: "template" | "gradient" | "fractal"
  selectedTemplate: number
  gradientColors: string[]
  gradientAngle: number
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

export function Canvas({ mode, selectedTemplate, gradientColors, gradientAngle, fractalParams }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
      // Validate colors and provide fallbacks
      const validColors = gradientColors.map((color, index) => {
        if (color && color.trim() !== '') {
          // Test if color is valid by setting it temporarily
          const testDiv = document.createElement('div')
          testDiv.style.color = color
          if (testDiv.style.color !== '') return color
        }
        // Fallback colors
        return index === 0 ? '#a78bfa' : '#ec4899'
      })

      // Calculate gradient start and end points based on angle
      const angleRad = (gradientAngle * Math.PI) / 180
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY) * 2

      const startX = centerX - Math.cos(angleRad) * maxDistance
      const startY = centerY - Math.sin(angleRad) * maxDistance
      const endX = centerX + Math.cos(angleRad) * maxDistance
      const endY = centerY + Math.sin(angleRad) * maxDistance

      const gradient = ctx.createLinearGradient(startX, startY, endX, endY)
      gradient.addColorStop(0, validColors[0])
      gradient.addColorStop(1, validColors[1])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (mode === "fractal") {
      drawFractal(ctx, canvas.width, canvas.height, fractalParams)
    }
  }, [mode, selectedTemplate, gradientColors, gradientAngle, fractalParams])

  return <canvas ref={canvasRef} className="w-full h-full" crossOrigin="anonymous" />
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
