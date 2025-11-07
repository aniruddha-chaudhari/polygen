"use client"

import { useRef, useEffect, useCallback } from "react"
import type {
  GradientState,
  ChaosGameParams,
  MandelbrotParams,
  NewtonParams,
  FlameParams,
  LSystemParams,
  Mode,
} from "@/app/page"

interface CanvasProps {
  mode: Mode
  selectedTemplate: number
  gradient: GradientState
  chaosGameParams: ChaosGameParams
  mandelbrotParams: MandelbrotParams
  newtonParams: NewtonParams
  flameParams: FlameParams
  lsystemParams: LSystemParams
}

const templates = [
  { name: "Ocean", colors: ["#0a1f2e", "#16c784"] },
  { name: "Sunset", colors: ["#ff6b6b", "#ffd93d"] },
  { name: "Forest", colors: ["#1a5f3e", "#90ee90"] },
  { name: "Night", colors: ["#1a1a2e", "#16213e"] },
  { name: "Fire", colors: ["#8b0000", "#ff4500"] },
  { name: "Sky", colors: ["#87ceeb", "#e0f6ff"] },
]

export function Canvas({
  mode,
  selectedTemplate,
  gradient,
  chaosGameParams,
  mandelbrotParams,
  newtonParams,
  flameParams,
  lsystemParams,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const renderGradient = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // ... existing gradient code ...
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
    } else if (mode === "chaos-game") {
      drawChaosGame(ctx, canvas.width, canvas.height, chaosGameParams)
    } else if (mode === "mandelbrot") {
      drawMandelbrot(ctx, canvas.width, canvas.height, mandelbrotParams)
    } else if (mode === "newton") {
      drawNewton(ctx, canvas.width, canvas.height, newtonParams)
    } else if (mode === "flame") {
      drawFlame(ctx, canvas.width, canvas.height, flameParams)
    } else if (mode === "lsystem") {
      drawLSystem(ctx, canvas.width, canvas.height, lsystemParams)
    }
  }, [
    mode,
    selectedTemplate,
    gradient,
    chaosGameParams,
    mandelbrotParams,
    newtonParams,
    flameParams,
    lsystemParams,
    renderGradient,
  ])

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

function drawChaosGame(ctx: CanvasRenderingContext2D, width: number, height: number, params: ChaosGameParams) {
  ctx.fillStyle = params.bgColor
  ctx.fillRect(0, 0, width, height)

  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 3

  // Generate polygon vertices
  const vertices: [number, number][] = []
  for (let i = 0; i < params.sides; i++) {
    const angle = (Math.PI * 2 * i) / params.sides
    vertices.push([centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)])
  }

  // Plot chaos game points
  let x = centerX
  let y = centerY
  ctx.fillStyle = params.pointColor

  for (let i = 0; i < params.pointDensity; i++) {
    const vertex = vertices[Math.floor(Math.random() * params.sides)]
    x = x + (vertex[0] - x) * params.jumpRatio
    y = y + (vertex[1] - y) * params.jumpRatio
    ctx.fillRect(x, y, 1, 1)
  }
}

function drawMandelbrot(ctx: CanvasRenderingContext2D, width: number, height: number, params: MandelbrotParams) {
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, width, height)

  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  const xMin = -2.5 / params.zoom + params.panX
  const xMax = 1 / params.zoom + params.panX
  const yMin = -1.25 / params.zoom + params.panY
  const yMax = 1.25 / params.zoom + params.panY

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x0 = xMin + (px / width) * (xMax - xMin)
      const y0 = yMin + (py / height) * (yMax - yMin)

      let x = 0,
        y = 0,
        iter = 0

      if (params.isJuliaSet) {
        x = x0
        y = y0
      }

      while (iter < params.iterations && x * x + y * y < 4) {
        if (params.isJuliaSet) {
          const xtmp = x * x - y * y + params.juliaSeedX
          y = 2 * x * y + params.juliaSeedY
          x = xtmp
        } else {
          const xtmp = x * x - y * y + x0
          y = 2 * x * y + y0
          x = xtmp
        }
        iter++
      }

      const ratio = iter / params.iterations
      const idx = (py * width + px) * 4
      const color = interpolateColor(params.colorPalette, ratio)
      data[idx] = color.r
      data[idx + 1] = color.g
      data[idx + 2] = color.b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function drawNewton(ctx: CanvasRenderingContext2D, width: number, height: number, params: NewtonParams) {
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, width, height)

  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let x = (px / width) * 4 - 2
      let y = (py / height) * 4 - 2

      let closestRoot = 0
      let closestDist = Number.POSITIVE_INFINITY

      for (let iter = 0; iter < params.iterations; iter++) {
        // Newton's method for z^n - 1 = 0
        const r2 = x * x + y * y
        if (r2 < 0.0001) break

        // Compute derivative numerically
        const n = params.roots
        const re =
          Math.pow(r2, n / 2 - 1) *
          (x * Math.cos((n - 1) * Math.atan2(y, x)) - y * Math.sin((n - 1) * Math.atan2(y, x)))
        const im =
          Math.pow(r2, n / 2 - 1) *
          (x * Math.sin((n - 1) * Math.atan2(y, x)) + y * Math.cos((n - 1) * Math.atan2(y, x)))

        // Newton step (simplified)
        const stepX = x - (re * x - im * y) / (re * re + im * im + 0.0001)
        const stepY = y - (im * x + re * y) / (re * re + im * im + 0.0001)

        x = stepX
        y = stepY

        // Check convergence to roots
        for (let root = 0; root < params.roots; root++) {
          const angle = (Math.PI * 2 * root) / params.roots
          const rootX = Math.cos(angle)
          const rootY = Math.sin(angle)
          const dist = Math.hypot(x - rootX, y - rootY)
          if (dist < closestDist) {
            closestDist = dist
            closestRoot = root
          }
        }
      }

      const idx = (py * width + px) * 4
      const color = hexToRgb(params.rootColors[closestRoot % params.rootColors.length])
      data[idx] = color.r
      data[idx + 1] = color.g
      data[idx + 2] = color.b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function drawFlame(ctx: CanvasRenderingContext2D, width: number, height: number, params: FlameParams) {
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, width, height)

  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  // Simple IFS-based flame with variations
  const points: number[][] = []
  let x = Math.random()
  let y = Math.random()

  for (let i = 0; i < 100000; i++) {
    const rand = Math.random()
    let newX, newY

    if (rand < 0.5) {
      newX = 0.5 * x
      newY = 0.5 * y
    } else if (rand < 0.75) {
      newX = 0.5 * x + 0.5
      newY = 0.5 * y
    } else {
      newX = 0.5 * x + 0.25
      newY = 0.5 * y + 0.5
    }

    x = newX
    y = newY
    const px = Math.floor(x * width)
    const py = Math.floor(y * height)

    if (px >= 0 && px < width && py >= 0 && py < height) {
      const idx = (py * width + px) * 4
      const ratio = i / 100000
      const color = interpolateColor(params.palette, ratio)
      data[idx] = Math.min(255, data[idx] + color.r / 10)
      data[idx + 1] = Math.min(255, data[idx + 1] + color.g / 10)
      data[idx + 2] = Math.min(255, data[idx + 2] + color.b / 10)
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function drawLSystem(ctx: CanvasRenderingContext2D, width: number, height: number, params: LSystemParams) {
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, width, height)

  const rules: { [key: string]: string } = {
    Fern: "X|->|F-[[X]+X]+F[+FX]-X|F|->|FF",
    Tree: "F|->|FF-[-F+F+F]+[+F-F-F]",
    "Koch Curve": "F|->|F+F-F-F+F",
    "Dragon Curve": "FX|->|X|X|->|X+YF+|Y|->|-FX-Y",
    "Sierpinski Triangle": "A|->|B-A-B|B|->|A+B+A",
  }

  const ruleStr = rules[params.preset] || rules.Fern
  const [axiom, ...rulePairs] = ruleStr.split("|->|")

  let system = axiom.trim()
  for (let i = 0; i < params.iteration; i++) {
    let newSystem = ""
    for (const char of system) {
      const ruleIndex = rulePairs.findIndex((r) => r.includes(char + "|->|"))
      if (ruleIndex !== -1) {
        const replacement = rulePairs[ruleIndex].split("|->|")[1]
        newSystem += replacement
      } else {
        newSystem += char
      }
    }
    system = newSystem
  }

  // Turtle graphics rendering
  let x = width / 2
  let y = height * 0.9
  let angle = Math.PI / 2
  const stack: any[] = []

  ctx.strokeStyle = params.lineColor
  ctx.lineWidth = params.lineWeight
  ctx.lineCap = "round"

  const stepSize = 100 / (params.iteration + 1)

  for (const char of system) {
    switch (char) {
      case "F":
      case "A":
      case "B":
      case "X":
      case "Y":
        const newX = x + stepSize * Math.cos(angle)
        const newY = y - stepSize * Math.sin(angle)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(newX, newY)
        ctx.stroke()
        x = newX
        y = newY
        break
      case "+":
        angle -= (params.angle * Math.PI) / 180
        break
      case "-":
        angle += (params.angle * Math.PI) / 180
        break
      case "[":
        stack.push({ x, y, angle })
        break
      case "]":
        if (stack.length > 0) {
          const state = stack.pop()
          x = state.x
          y = state.y
          angle = state.angle
        }
        break
    }
  }
}

function interpolateColor(palette: any[], ratio: number): { r: number; g: number; b: number } {
  const sorted = [...palette].sort((a, b) => a.position - b.position)
  const pos = ratio * 100

  for (let i = 0; i < sorted.length - 1; i++) {
    if (pos >= sorted[i].position && pos <= sorted[i + 1].position) {
      const range = sorted[i + 1].position - sorted[i].position
      const localRatio = (pos - sorted[i].position) / range
      const c1 = hexToRgb(sorted[i].color)
      const c2 = hexToRgb(sorted[i + 1].color)
      return {
        r: Math.round(c1.r + (c2.r - c1.r) * localRatio),
        g: Math.round(c1.g + (c2.g - c1.g) * localRatio),
        b: Math.round(c1.b + (c2.b - c1.b) * localRatio),
      }
    }
  }

  return hexToRgb(sorted[0].color)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16),
    }
  }
  return { r: 0, g: 0, b: 0 }
}
