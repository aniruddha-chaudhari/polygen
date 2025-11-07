"use client"

import type React from "react"

import { useRef, useEffect, useCallback } from "react"
import type { GradientState, ChaosGameParams, MandelbrotParams, Mode } from "@/app/page"
import { PerlinNoise } from "@/lib/perlin"
import { AttractorEquations, type AttractorPoint } from "@/lib/attractor-equations"
import type {
  PerlinNoiseParams,
  StrangeAttractorParams,
  CellularAutomataParams,
  FlowFieldParams,
  ReactionDiffusionParams,
} from "@/app/page"

interface CanvasProps {
  mode: Mode
  selectedTemplate: number
  gradient: GradientState
  chaosGameParams: ChaosGameParams
  mandelbrotParams: MandelbrotParams
  perlinNoiseParams?: PerlinNoiseParams
  strangeAttractorParams?: StrangeAttractorParams
  cellularAutomataParams?: CellularAutomataParams
  flowFieldParams?: FlowFieldParams
  reactionDiffusionParams?: ReactionDiffusionParams
}

const templates = [
  { name: "Ocean", colors: ["#0a1f2e", "#16c784"] },
  { name: "Sunset", colors: ["#ff6b6b", "#ffd93d"] },
  { name: "Forest", colors: ["#1a5f3e", "#90ee90"] },
  { name: "Night", colors: ["#1a1a2e", "#16213e"] },
  { name: "Fire", colors: ["#8b0000", "#ff4500"] },
  { name: "Sky", colors: ["#87ceeb", "#e0f6ff"] },
]

const NUM_WORKERS = typeof navigator !== "undefined" ? Math.max(2, navigator.hardwareConcurrency || 4) : 4

export function Canvas({
  mode,
  selectedTemplate,
  gradient,
  chaosGameParams,
  mandelbrotParams,
  perlinNoiseParams,
  strangeAttractorParams,
  cellularAutomataParams,
  flowFieldParams,
  reactionDiffusionParams,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isRenderingRef = useRef(false)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeWorkersRef = useRef<Worker[]>([])
  const renderIdRef = useRef(0)
  const lastParamsRef = useRef<string>("")

  const renderGradient = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const { type, angle, centerX, centerY, colorStops } = gradient

      let grad: CanvasGradient
      if (type === "linear") {
        const angleRad = (angle * Math.PI) / 180
        const x1 = width / 2 - (Math.cos(angleRad) * width) / 2
        const y1 = height / 2 - (Math.sin(angleRad) * height) / 2
        const x2 = width / 2 + (Math.cos(angleRad) * width) / 2
        const y2 = height / 2 + (Math.sin(angleRad) * height) / 2
        grad = ctx.createLinearGradient(x1, y1, x2, y2)
      } else {
        const cx = (centerX / 100) * width
        const cy = (centerY / 100) * height
        const radius = Math.max(width, height) * 0.7
        grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      }

      const sortedStops = [...colorStops].sort((a, b) => a.position - b.position)
      for (const stop of sortedStops) {
        grad.addColorStop(stop.position / 100, stop.color)
      }

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    },
    [gradient],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })
    if (!ctx) return

    const currentWidth = canvas.offsetWidth
    const currentHeight = canvas.offsetHeight

    const needsResize = canvas.width !== currentWidth || canvas.height !== currentHeight

    if (needsResize) {
      canvas.width = currentWidth
      canvas.height = currentHeight

      offscreenCanvasRef.current = document.createElement("canvas")
      offscreenCanvasRef.current.width = currentWidth
      offscreenCanvasRef.current.height = currentHeight
    }

    if (mode === "mandelbrot") {
      const paramsString = JSON.stringify(mandelbrotParams)
      if (paramsString === lastParamsRef.current && !needsResize) {
        return
      }
      lastParamsRef.current = paramsString
    }

    activeWorkersRef.current.forEach((worker) => worker.terminate())
    activeWorkersRef.current = []

    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current)
    }

    renderIdRef.current++
    const currentRenderId = renderIdRef.current

    if (mode === "mandelbrot") {
      renderTimeoutRef.current = setTimeout(() => {
        const offscreenCtx = offscreenCanvasRef.current?.getContext("2d", { alpha: false })
        if (offscreenCtx && offscreenCanvasRef.current) {
          drawMandelbrotAsync(
            offscreenCtx,
            offscreenCanvasRef.current.width,
            offscreenCanvasRef.current.height,
            mandelbrotParams,
            currentRenderId,
            activeWorkersRef,
          )
            .then(() => {
              if (currentRenderId === renderIdRef.current && offscreenCanvasRef.current) {
                ctx.drawImage(offscreenCanvasRef.current, 0, 0)
              }
            })
            .catch((err) => {
              if (err.message !== "Render cancelled") {
                console.error("Render error:", err)
              }
            })
        }
      }, 150)
      return
    }

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
    } else if (mode === "perlin-noise" && perlinNoiseParams) {
      drawPerlinNoise(ctx, canvas.width, canvas.height, perlinNoiseParams)
    } else if (mode === "strange-attractor" && strangeAttractorParams) {
      drawStrangeAttractor(ctx, canvas.width, canvas.height, strangeAttractorParams)
    } else if (mode === "cellular-automata" && cellularAutomataParams) {
      drawCellularAutomata(ctx, canvas.width, canvas.height, cellularAutomataParams)
    } else if (mode === "flow-field" && flowFieldParams) {
      drawFlowField(ctx, canvas.width, canvas.height, flowFieldParams)
    } else if (mode === "reaction-diffusion" && reactionDiffusionParams) {
      drawReactionDiffusion(ctx, canvas.width, canvas.height, reactionDiffusionParams)
    }

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }
      activeWorkersRef.current.forEach((worker) => worker.terminate())
      activeWorkersRef.current = []
    }
  }, [
    mode,
    selectedTemplate,
    gradient,
    chaosGameParams,
    mandelbrotParams,
    perlinNoiseParams,
    strangeAttractorParams,
    cellularAutomataParams,
    flowFieldParams,
    reactionDiffusionParams,
    renderGradient,
  ])

  return <canvas ref={canvasRef} className="w-full h-full" />
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

  const vertices: [number, number][] = []
  for (let i = 0; i < params.sides; i++) {
    const angle = (Math.PI * 2 * i) / params.sides
    vertices.push([centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)])
  }

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

async function drawMandelbrotAsync(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: MandelbrotParams,
  renderId?: number,
  activeWorkersRef?: React.MutableRefObject<Worker[]>,
) {
  if (typeof Worker === "undefined") {
    drawMandelbrotSingleThreaded(ctx, width, height, params)
    return
  }

  try {
    const imageData = ctx.createImageData(width, height)
    const rowsPerWorker = Math.ceil(height / NUM_WORKERS)
    const promises: Promise<void>[] = []
    const workers: Worker[] = []

    for (let i = 0; i < NUM_WORKERS; i++) {
      const startRow = i * rowsPerWorker
      const endRow = Math.min((i + 1) * rowsPerWorker, height)

      if (startRow >= height) break

      const promise = new Promise<void>((resolve, reject) => {
        try {
          const worker = new Worker("/mandelbrot-worker.js")
          workers.push(worker)

          const timeout = setTimeout(() => {
            worker.terminate()
            reject(new Error("Worker timeout"))
          }, 10000)

          worker.onmessage = (e) => {
            clearTimeout(timeout)
            const { imageData: workerData, startRow: sr } = e.data
            const offset = sr * width * 4
            imageData.data.set(new Uint8ClampedArray(workerData), offset)
            resolve()
          }

          worker.onerror = (error) => {
            clearTimeout(timeout)
            reject(error)
          }

          worker.postMessage({ width, height, params, startRow, endRow })
        } catch (err) {
          reject(err)
        }
      })

      promises.push(promise)
    }

    if (activeWorkersRef) {
      activeWorkersRef.current = workers
    }

    await Promise.all(promises)

    workers.forEach((w) => w.terminate())
    if (activeWorkersRef) {
      activeWorkersRef.current = []
    }

    ctx.putImageData(imageData, 0, 0)
  } catch (error) {
    console.warn("Worker rendering failed, falling back to single-threaded:", error)
    drawMandelbrotSingleThreaded(ctx, width, height, params)
  }
}

function drawMandelbrotSingleThreaded(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: MandelbrotParams,
) {
  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  const baseIterations = params.iterations
  const zoomFactor = Math.log10(params.zoom + 1)
  const dynamicIterations = Math.min(1000, Math.max(baseIterations, Math.floor(baseIterations * (1 + zoomFactor))))

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

      while (iter < dynamicIterations && x * x + y * y < 4) {
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

      const ratio = iter / dynamicIterations
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

function drawPerlinNoise(ctx: CanvasRenderingContext2D, width: number, height: number, params: PerlinNoiseParams) {
  const perlin = new PerlinNoise()
  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x / width) * params.scale
      const ny = (y / height) * params.scale
      const value = perlin.octaveNoise(nx, ny, params.octaves)
      const normalized = (value + 1) / 2
      const isAboveThreshold = normalized > params.threshold

      const ratio = isAboveThreshold ? normalized : 0
      const idx = (y * width + x) * 4
      const color = interpolateColor(params.colorPalette, ratio * 100)

      data[idx] = color.r
      data[idx + 1] = color.g
      data[idx + 2] = color.b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function drawStrangeAttractor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: StrangeAttractorParams,
) {
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = params.color
  ctx.lineWidth = params.lineWeight
  ctx.globalAlpha = 0.6

  let point: AttractorPoint = { x: 1, y: 1, z: 1 }
  const scale = Math.min(width, height) / 50

  for (let i = 0; i < params.pointDensity; i++) {
    if (params.type === "lorenz") {
      point = AttractorEquations.lorenzStep(point, params.a, params.b, params.c)
    } else if (params.type === "aizawa") {
      point = AttractorEquations.aizawaStep(point, params.a, params.b, params.c)
    } else if (params.type === "dejong") {
      point = AttractorEquations.deJongStep(point, params.a, params.b, params.c, params.d)
    }

    const px = width / 2 + point.x * scale
    const py = height / 2 + point.y * scale

    if (i === 0) {
      ctx.beginPath()
      ctx.moveTo(px, py)
    } else {
      ctx.lineTo(px, py)
    }

    if (i % 100 === 0) {
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(px, py)
    }
  }

  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawCellularAutomata(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: CellularAutomataParams,
) {
  const cellSize = 4
  const cols = Math.floor(width / cellSize)
  const rows = Math.floor(height / cellSize)

  let grid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(params.initialState === "random" ? Math.random() > 0.7 : 0))

  if (params.initialState === "centered") {
    grid[Math.floor(rows / 2)][Math.floor(cols / 2)] = 1
  }

  for (let gen = 0; gen < 10; gen++) {
    const newGrid = JSON.parse(JSON.stringify(grid))

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let alive = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const ny = (y + dy + rows) % rows
            const nx = (x + dx + cols) % cols
            alive += grid[ny][nx] ? 1 : 0
          }
        }

        if (params.algorithm === "conway") {
          newGrid[y][x] = (grid[y][x] && (alive === 2 || alive === 3)) || (!grid[y][x] && alive === 3) ? 1 : 0
        }
      }
    }
    grid = newGrid
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = grid[y][x] ? params.colorLive : params.colorDead
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
  }
}

function drawFlowField(ctx: CanvasRenderingContext2D, width: number, height: number, params: FlowFieldParams) {
  const perlin = new PerlinNoise()
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, width, height)

  const particles: Array<{ x: number; y: number }> = []
  for (let i = 0; i < params.particleCount; i++) {
    particles.push({ x: Math.random() * width, y: Math.random() * height })
  }

  ctx.strokeStyle = "#a78bfa"
  ctx.globalAlpha = params.opacity
  ctx.lineWidth = params.lineWeight

  for (const particle of particles) {
    ctx.beginPath()
    let x = particle.x
    let y = particle.y
    ctx.moveTo(x, y)

    for (let i = 0; i < 50; i++) {
      const angle = perlin.noise(x * params.noiseScale, y * params.noiseScale) * Math.PI * 2
      x += Math.cos(angle) * params.stepLength
      y += Math.sin(angle) * params.stepLength

      if (x < 0 || x > width || y < 0 || y > height) break
      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

function drawReactionDiffusion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: ReactionDiffusionParams,
) {
  const scale = 4
  const cols = Math.floor(width / scale)
  const rows = Math.floor(height / scale)

  let u = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(1))
  let v = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0))

  for (let y = Math.floor(rows / 2) - 5; y < Math.floor(rows / 2) + 5; y++) {
    for (let x = Math.floor(cols / 2) - 5; x < Math.floor(cols / 2) + 5; x++) {
      if (y >= 0 && y < rows && x >= 0 && x < cols) {
        v[y][x] = 1
      }
    }
  }

  const du = 0.2082
  const dv = 0.105
  const dt = 1

  for (let t = 0; t < 50; t++) {
    const newU = u.map((r) => [...r])
    const newV = v.map((r) => [...r])

    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const uLap = (u[y][x - 1] + u[y][x + 1] + u[y - 1][x] + u[y + 1][x] - 4 * u[y][x]) / 4
        const vLap = (v[y][x - 1] + v[y][x + 1] + v[y - 1][x] + v[y + 1][x] - 4 * v[y][x]) / 4

        newU[y][x] = u[y][x] + (du * uLap - u[y][x] * v[y][x] * v[y][x] + params.feedRate * (1 - u[y][x])) * dt
        newV[y][x] =
          v[y][x] + (dv * vLap + u[y][x] * v[y][x] * v[y][x] - (params.killRate + params.feedRate) * v[y][x]) * dt

        newU[y][x] = Math.max(0, Math.min(1, newU[y][x]))
        newV[y][x] = Math.max(0, Math.min(1, newV[y][x]))
      }
    }

    u = newU
    v = newV
  }

  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const val = Math.floor((1 - v[y][x]) * 255)
      const idx = (y * scale * width + x * scale) * 4
      data[idx] = val
      data[idx + 1] = val
      data[idx + 2] = val
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
