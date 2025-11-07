"use client"

import type React from "react"

import { useRef, useEffect, useCallback } from "react"
import type { GradientState, ChaosGameParams, MandelbrotParams, Mode } from "@/app/page"
import { perlinNoise } from "@/lib/perlin"
import { StrangeAttractors, type AttractorPoint } from "@/lib/attractor-equations"
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
      // Flow field rendering is handled asynchronously with debouncing
      if (mode === "flow-field") {
        renderTimeoutRef.current = setTimeout(async () => {
          try {
            await drawFlowFieldAsync(ctx, canvas.width, canvas.height, flowFieldParams, currentRenderId, activeWorkersRef)
          } catch (err) {
            if (err instanceof Error && err.message !== 'Render cancelled') {
              console.error('Flow field render error:', err)
            }
          }
        }, 150)
        return
      }
    } else if (mode === "reaction-diffusion" && reactionDiffusionParams) {
      // Reaction-diffusion rendering is handled asynchronously with debouncing
      if (mode === "reaction-diffusion") {
        renderTimeoutRef.current = setTimeout(async () => {
          try {
            await drawReactionDiffusionAsync(ctx, canvas.width, canvas.height, reactionDiffusionParams, currentRenderId, activeWorkersRef)
          } catch (err) {
            if (err instanceof Error && err.message !== 'Render cancelled') {
              console.error('Reaction-diffusion render error:', err)
            }
          }
        }, 150)
        return
      }
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
  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x / width) * params.scale
      const ny = (y / height) * params.scale
      const value = perlinNoise.octaveNoise(nx, ny, params.octaves)
      const normalized = (value + 1) / 2

      let ratio = normalized
      if (params.threshold > 0) {
        if (normalized < params.threshold) {
          ratio = 0
        } else {
          const denom = 1 - params.threshold
          ratio = denom > 0 ? (normalized - params.threshold) / denom : 1
        }
      }
      const idx = (y * width + x) * 4
      const color = interpolateColor(params.colorPalette, ratio)

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

  const points = StrangeAttractors.generatePoints(params.type, {
    a: params.a,
    b: params.b,
    c: params.c,
    d: params.d
  }, params.pointDensity)

  ctx.strokeStyle = params.color
  ctx.lineWidth = params.lineWeight
  ctx.globalAlpha = 0.8
  ctx.beginPath()

  // Find min/max for scaling
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  points.forEach((p: AttractorPoint) => {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  })

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const scale = Math.min(width, height) / Math.max(rangeX, rangeY) * 0.8

  points.forEach((point: AttractorPoint, i: number) => {
    const px = width / 2 + (point.x - (minX + maxX) / 2) * scale
    const py = height / 2 + (point.y - (minY + maxY) / 2) * scale

    if (i === 0) {
      ctx.moveTo(px, py)
    } else {
      ctx.lineTo(px, py)
    }
  })

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

  const isCyclic = params.algorithm === "cyclic"
  const stateCount = isCyclic ? 6 : 2

  let grid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0))

  if (params.initialState === "random") {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        grid[y][x] = isCyclic ? Math.floor(Math.random() * stateCount) : Math.random() < 0.3 ? 1 : 0
      }
    }
  } else {
    const centerY = Math.floor(rows / 2)
    const centerX = Math.floor(cols / 2)
    if (isCyclic) {
      for (let y = -6; y <= 6; y++) {
        for (let x = -6; x <= 6; x++) {
          const dist = Math.sqrt(x * x + y * y)
          if (dist <= 6) {
            const px = centerX + x
            const py = centerY + y
            if (px >= 0 && px < cols && py >= 0 && py < rows) {
              const blend = Math.max(0, Math.min(stateCount - 1, Math.round((dist / 6) * (stateCount - 1))))
              grid[py][px] = blend
            }
          }
        }
      }
    } else {
      // Seed with a lightweight glider formation for Conway
      const glider = [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, -1],
        [1, -2],
      ]
      glider.forEach(([dx, dy]) => {
        const px = centerX + dx
        const py = centerY + dy
        if (px >= 0 && px < cols && py >= 0 && py < rows) {
          grid[py][px] = 1
        }
      })
      // Add a small oscillator nearby
      const blinker = [
        [-4, 0],
        [-3, 0],
        [-2, 0],
      ]
      blinker.forEach(([dx, dy]) => {
        const px = centerX + dx
        const py = centerY + dy
        if (px >= 0 && px < cols && py >= 0 && py < rows) {
          grid[py][px] = 1
        }
      })
    }
  }

  const parseRule = (rule: string) => {
    const match = rule.match(/B(\d+)\/S(\d+)/i)
    if (!match) return { birth: [3], survival: [2, 3] }

    const birthStr = match[1]
    const survivalStr = match[2]

    const birth = birthStr.split('').map((n) => Number.parseInt(n, 10)).filter((n) => !Number.isNaN(n))
    const survival = survivalStr.split('').map((n) => Number.parseInt(n, 10)).filter((n) => !Number.isNaN(n))

    return { birth, survival }
  }

  const { birth, survival } = parseRule(params.ruleSet)
  const iterations = isCyclic ? 90 : 60

  for (let gen = 0; gen < iterations; gen++) {
    const newGrid = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0))

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (isCyclic) {
          const current = grid[y][x]
          const target = (current + 1) % stateCount
          let found = false

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue
              const ny = (y + dy + rows) % rows
              const nx = (x + dx + cols) % cols
              if (grid[ny][nx] === target) {
                found = true
                break
              }
            }
            if (found) break
          }

          newGrid[y][x] = found ? target : current
        } else {
          let neighbors = 0
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue
              const ny = (y + dy + rows) % rows
              const nx = (x + dx + cols) % cols
              neighbors += grid[ny][nx] ? 1 : 0
            }
          }

          if (grid[y][x]) {
            newGrid[y][x] = survival.includes(neighbors) ? 1 : 0
          } else {
            newGrid[y][x] = birth.includes(neighbors) ? 1 : 0
          }
        }
      }
    }

    grid = newGrid
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let color = params.colorDead

      if (isCyclic) {
        const state = grid[y][x]
        const ratio = stateCount > 1 ? state / (stateCount - 1) : 0
        color = blendColors(params.colorDead, params.colorLive, ratio)
      } else {
        color = grid[y][x] ? params.colorLive : params.colorDead
      }

      ctx.fillStyle = color
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
  }
}

function blendColors(color1: string, color2: string, ratio: number): string {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  const r = Math.round(c1.r + (c2.r - c1.r) * ratio)
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio)
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio)

  return `rgb(${r}, ${g}, ${b})`
}

async function drawFlowFieldAsync(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: FlowFieldParams,
  renderId?: number,
  activeWorkersRef?: React.MutableRefObject<Worker[]>
) {
  // Clear canvas
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, width, height)

  // Check if Workers are supported
  if (typeof Worker === 'undefined') {
    console.warn('Web Workers not supported, falling back to single-threaded flow field')
    drawFlowFieldSingleThreaded(ctx, width, height, params)
    return
  }

  try {
    const worker = new Worker('/flow-field-worker.js')
    if (activeWorkersRef) {
      activeWorkersRef.current.push(worker)
    }

    const timeout = setTimeout(() => {
      worker.terminate()
      if (activeWorkersRef) {
        activeWorkersRef.current = activeWorkersRef.current.filter(w => w !== worker)
      }
      throw new Error('Flow field worker timeout')
    }, 10000) // 10 second timeout

    const result = await new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        clearTimeout(timeout)
        resolve(e.data)
      }

      worker.onerror = (error) => {
        clearTimeout(timeout)
        reject(error)
      }

      worker.postMessage({ width, height, params })
    })

    // Terminate worker
    worker.terminate()
    if (activeWorkersRef) {
      activeWorkersRef.current = activeWorkersRef.current.filter(w => w !== worker)
    }

    // Render the paths
    const resultTyped = result as { paths: Array<Array<{ x: number; y: number }>> }
    const { paths } = resultTyped
    ctx.strokeStyle = "#a78bfa"
    ctx.globalAlpha = params.opacity
    ctx.lineWidth = params.lineWeight

    for (const path of paths) {
      if (path.length < 2) continue

      ctx.beginPath()
      ctx.moveTo(path[0].x, path[0].y)

      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y)
      }

      ctx.stroke()
    }

    ctx.globalAlpha = 1

  } catch (error) {
    console.warn('Worker rendering failed, falling back to single-threaded:', error)
    drawFlowFieldSingleThreaded(ctx, width, height, params)
  }
}

function drawFlowFieldSingleThreaded(ctx: CanvasRenderingContext2D, width: number, height: number, params: FlowFieldParams) {
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, width, height)

  const particles: Array<{ x: number; y: number }> = []
  for (let i = 0; i < Math.min(params.particleCount, 2000); i++) { // Limit for performance
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

    const steps = Math.min(params.stepLength, 100) // Limit steps for performance
    for (let i = 0; i < steps; i++) {
      const angle = perlinNoise.noise(x * params.noiseScale, y * params.noiseScale) * Math.PI * 2
      x += Math.cos(angle) * 2
      y += Math.sin(angle) * 2

      if (x < 0 || x > width || y < 0 || y > height) break
      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

async function drawReactionDiffusionAsync(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: ReactionDiffusionParams,
  renderId?: number,
  activeWorkersRef?: React.MutableRefObject<Worker[]>
) {
  // Check if Workers are supported
  if (typeof Worker === 'undefined') {
    console.warn('Web Workers not supported, falling back to single-threaded reaction-diffusion')
    drawReactionDiffusionSingleThreaded(ctx, width, height, params)
    return
  }

  try {
    const worker = new Worker('/reaction-diffusion-worker.js')
    if (activeWorkersRef) {
      activeWorkersRef.current.push(worker)
    }

    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.terminate()
        if (activeWorkersRef) {
          activeWorkersRef.current = activeWorkersRef.current.filter(w => w !== worker)
        }
        reject(new Error('Reaction-diffusion worker timeout'))
      }, 20000) // 20 second timeout (increased from 15)

      worker.onmessage = (e) => {
        clearTimeout(timeout)
        // Check if worker sent an error
        if (e.data.error) {
          reject(new Error(e.data.error))
        } else {
          resolve(e.data)
        }
      }

      worker.onerror = (error) => {
        clearTimeout(timeout)
        reject(error)
      }

      worker.postMessage({ width, height, params, currentFrame: Date.now() })
    })

    // Terminate worker
    worker.terminate()
    if (activeWorkersRef) {
      activeWorkersRef.current = activeWorkersRef.current.filter(w => w !== worker)
    }

    // Render the result
    const resultTyped = result as { imageData: ArrayBuffer }
    const { imageData } = resultTyped
    const imgData = new ImageData(new Uint8ClampedArray(imageData), width, height)
    ctx.putImageData(imgData, 0, 0)

  } catch (error) {
    console.warn('Worker rendering failed, falling back to single-threaded:', error)
    drawReactionDiffusionSingleThreaded(ctx, width, height, params)
  }
}

function drawReactionDiffusionSingleThreaded(
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

  const seedCircle = (cx: number, cy: number, radius: number, strength = 1) => {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const px = cx + x
        const py = cy + y
        if (px >= 0 && px < cols && py >= 0 && py < rows && x * x + y * y <= radius * radius) {
          v[py][px] = strength
          u[py][px] = Math.max(0, 1 - strength)
        }
      }
    }
  }

  // Gentle noise baseline
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      u[y][x] = 1 - Math.random() * 0.05
      v[y][x] = Math.random() * 0.05
    }
  }

  const centerX = Math.floor(cols / 2)
  const centerY = Math.floor(rows / 2)

  switch (params.preset) {
    case "stripes":
      for (let x = 0; x < cols; x++) {
        if (x % 12 < 6) {
          for (let y = 0; y < rows; y++) {
            v[y][x] = 0.9
            u[y][x] = 0.1
          }
        }
      }
      break
    case "labyrinth":
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if ((x ^ y) % 7 === 0) {
            v[y][x] = 0.8
            u[y][x] = 0.2
          }
        }
      }
      break
    case "worms":
      for (let i = 0; i < 20; i++) {
        seedCircle(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 4, 0.9)
      }
      break
    case "spots-stripes":
      for (let x = 0; x < cols; x++) {
        if (x % 20 < 10) {
          for (let y = 0; y < rows; y++) {
            if (y % 8 < 4) {
              v[y][x] = 0.85
              u[y][x] = 0.15
            }
          }
        }
      }
      for (let i = 0; i < 30; i++) {
        seedCircle(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 3, 0.95)
      }
      break
    case "moving-spots":
      for (let i = 0; i < 40; i++) {
        seedCircle(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 3, 1)
      }
      break
    case "spots":
    default:
      for (let i = 0; i < 60; i++) {
        seedCircle(centerX + Math.floor((Math.random() - 0.5) * cols * 0.7), centerY + Math.floor((Math.random() - 0.5) * rows * 0.7), 3 + Math.floor(Math.random() * 4), 1)
      }
      break
  }

  // Gray-Scott parameters
  const Du = 0.16
  const Dv = 0.08
  const F = params.feedRate
  const k = params.killRate
  const dt = 1

  // Run a moderate number of iterations to approximate the worker result
  const iterations = 80 + Math.floor(params.speed * 120)

  for (let t = 0; t < iterations; t++) {
    const newU = u.map((r) => [...r])
    const newV = v.map((r) => [...r])

    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        // Laplacian
        const laplacianU =
          -u[y][x] +
          (u[y-1][x] + u[y+1][x] + u[y][x-1] + u[y][x+1]) * 0.2 +
          (u[y-1][x-1] + u[y-1][x+1] + u[y+1][x-1] + u[y+1][x+1]) * 0.05

        const laplacianV =
          -v[y][x] +
          (v[y-1][x] + v[y+1][x] + v[y][x-1] + v[y][x+1]) * 0.2 +
          (v[y-1][x-1] + v[y-1][x+1] + v[y+1][x-1] + v[y+1][x+1]) * 0.05

        // Gray-Scott equations
        const uvv = u[y][x] * v[y][x] * v[y][x]
        const du = Du * laplacianU - uvv + F * (1 - u[y][x])
        const dv = Dv * laplacianV + uvv - (F + k) * v[y][x]

        newU[y][x] = Math.max(0, Math.min(1, u[y][x] + du * dt))
        newV[y][x] = Math.max(0, Math.min(1, v[y][x] + dv * dt))
      }
    }

    u = newU
    v = newV
  }

  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const uVal = u[y][x]
      const vVal = v[y][x]

      // Color based on chemical concentrations
      const r = Math.floor((1 - vVal) * 255)
      const g = Math.floor((uVal - vVal + 1) * 128)
      const b = Math.floor(vVal * 255)

      // Fill the scaled area
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const py = y * scale + dy
          const px = x * scale + dx

          if (py < height && px < width) {
            const idx = (py * width + px) * 4
            data[idx] = Math.max(0, Math.min(255, r))
            data[idx + 1] = Math.max(0, Math.min(255, g))
            data[idx + 2] = Math.max(0, Math.min(255, b))
            data[idx + 3] = 255
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
