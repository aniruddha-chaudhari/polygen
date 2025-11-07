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
  TessellationParams,
  CirclePackingParams,
  OpArtParams,
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
  tessellationParams?: TessellationParams
  circlePackingParams?: CirclePackingParams
  opArtParams?: OpArtParams
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
  tessellationParams,
  circlePackingParams,
  opArtParams,
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
      // For Mandelbrot, render immediately without debounce for zoom/pan changes
      // but still use debouncing for other parameter changes to avoid excessive computation
      const isOnlyZoomPanChange = (() => {
        const current = mandelbrotParams
        const last = lastParamsRef.current ? JSON.parse(lastParamsRef.current) : null
        if (!last) return false

        // Check if only zoom and pan changed
        return (
          current.iterations === last.iterations &&
          current.isJuliaSet === last.isJuliaSet &&
          JSON.stringify(current.colorPalette) === JSON.stringify(last.colorPalette) &&
          current.juliaSeedX === last.juliaSeedX &&
          current.juliaSeedY === last.juliaSeedY
        )
      })()

      const debounceTime = isOnlyZoomPanChange ? 10 : 50 // Much faster for zoom/pan only

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
      }, debounceTime)
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
      renderTimeoutRef.current = setTimeout(async () => {
        try {
          await drawFlowFieldAsync(ctx, canvas.width, canvas.height, flowFieldParams, currentRenderId, activeWorkersRef)
        } catch (err) {
          if (err instanceof Error && err.message !== "Render cancelled") {
            console.error("Flow field render error:", err)
          }
        }
      }, 150)
      return
    } else if (mode === "tessellation" && tessellationParams) {
      drawTessellation(ctx, canvas.width, canvas.height, tessellationParams)
    } else if (mode === "circle-packing" && circlePackingParams) {
      renderTimeoutRef.current = setTimeout(async () => {
        try {
          await drawCirclePackingAsync(ctx, canvas.width, canvas.height, circlePackingParams, currentRenderId, activeWorkersRef)
        } catch (err) {
          if (err instanceof Error && err.message !== "Render cancelled") {
            console.error("Circle packing render error:", err)
          }
        }
      }, 150)
      return
    } else if (mode === "op-art" && opArtParams) {
      drawOpArt(ctx, canvas.width, canvas.height, opArtParams)
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
    tessellationParams,
    circlePackingParams,
    opArtParams,
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

  const points = StrangeAttractors.generatePoints(
    params.type,
    {
      a: params.a,
      b: params.b,
      c: params.c,
      d: params.d,
    },
    params.pointDensity,
  )

  ctx.strokeStyle = params.color
  ctx.lineWidth = params.lineWeight
  ctx.globalAlpha = 0.8
  ctx.beginPath()

  // Find min/max for scaling
  let minX = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY
  points.forEach((p: AttractorPoint) => {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  })

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const scale = (Math.min(width, height) / Math.max(rangeX, rangeY)) * 0.8

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

    const birth = birthStr
      .split("")
      .map((n) => Number.parseInt(n, 10))
      .filter((n) => !Number.isNaN(n))
    const survival = survivalStr
      .split("")
      .map((n) => Number.parseInt(n, 10))
      .filter((n) => !Number.isNaN(n))

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
  activeWorkersRef?: React.MutableRefObject<Worker[]>,
) {
  // Clear canvas
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, width, height)

  // Check if Workers are supported
  if (typeof Worker === "undefined") {
    console.warn("Web Workers not supported, falling back to single-threaded flow field")
    drawFlowField(ctx, width, height, params)
    return
  }

  try {
    const worker = new Worker("/flow-field-worker.js")
    if (activeWorkersRef) {
      activeWorkersRef.current.push(worker)
    }

    const timeout = setTimeout(() => {
      worker.terminate()
      if (activeWorkersRef) {
        activeWorkersRef.current = activeWorkersRef.current.filter((w) => w !== worker)
      }
      throw new Error("Flow field worker timeout")
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
      activeWorkersRef.current = activeWorkersRef.current.filter((w) => w !== worker)
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
    console.warn("Worker rendering failed, falling back to single-threaded:", error)
    drawFlowField(ctx, width, height, params)
  }
}

function drawFlowField(ctx: CanvasRenderingContext2D, width: number, height: number, params: FlowFieldParams) {
  // Clear canvas
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, width, height)

  // Generate flow field using Perlin noise
  const flowField = new Array(height)
  for (let y = 0; y < height; y++) {
    flowField[y] = new Array(width)
    for (let x = 0; x < width; x++) {
      // Sample Perlin noise at different octaves for more interesting flow
      const angle1 = perlinNoise.noise(x * params.noiseScale, y * params.noiseScale) * Math.PI * 4
      const angle2 = perlinNoise.noise(x * params.noiseScale * 2, y * params.noiseScale * 2) * Math.PI * 2
      const angle3 = perlinNoise.noise(x * params.noiseScale * 4, y * params.noiseScale * 4) * Math.PI

      // Combine angles for more complex flow
      const angle = (angle1 + angle2 * 0.5 + angle3 * 0.25) / 1.75

      flowField[y][x] = angle
    }
  }

  // Set drawing properties
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = params.lineWeight
  ctx.globalAlpha = params.opacity
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  // Trace and draw particle paths
  for (let i = 0; i < params.particleCount; i++) {
    let x, y

    // Start particles at random positions
    x = Math.random() * width
    y = Math.random() * height

    // Also add some particles starting from edges for better coverage
    if (i < params.particleCount * 0.1) {
      // Left edge
      x = 0
      y = Math.random() * height
    } else if (i < params.particleCount * 0.2) {
      // Right edge
      x = width - 1
      y = Math.random() * height
    } else if (i < params.particleCount * 0.3) {
      // Top edge
      x = Math.random() * width
      y = 0
    } else if (i < params.particleCount * 0.4) {
      // Bottom edge
      x = Math.random() * width
      y = height - 1
    }

    // Begin path
    ctx.beginPath()
    ctx.moveTo(x, y)

    // Trace path
    const maxSteps = params.stepLength
    let hasDrawn = false

    for (let step = 0; step < maxSteps; step++) {
      // Get flow direction at current position
      const gridX = Math.floor(x)
      const gridY = Math.floor(y)

      if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) {
        break // Out of bounds
      }

      const angle = flowField[gridY][gridX]

      // Move in direction of flow
      const stepSize = 1
      x += Math.cos(angle) * stepSize
      y += Math.sin(angle) * stepSize

      ctx.lineTo(x, y)
      hasDrawn = true

      // Stop if we go out of bounds
      if (x < 0 || x >= width || y < 0 || y >= height) {
        break
      }
    }

    // Only stroke if we drew something
    if (hasDrawn) {
      ctx.stroke()
    }
  }

  ctx.globalAlpha = 1
}

async function drawVoronoiAsync(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: VoronoiParams,
  renderId?: number,
  activeWorkersRef?: React.MutableRefObject<Worker[]>,
) {
  // Check if Workers are supported
  if (typeof Worker === "undefined") {
    console.warn("Web Workers not supported, falling back to single-threaded Voronoi")
    drawVoronoiSingleThreaded(ctx, width, height, params)
    return
  }

  try {
    const worker = new Worker("/voronoi-worker.js")
    if (activeWorkersRef) {
      activeWorkersRef.current.push(worker)
    }

    const result = await new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        resolve(e.data)
      }
      worker.onerror = (error) => {
        reject(error)
      }

      worker.postMessage({ width, height, params })
    })

    // Clean up worker
    if (activeWorkersRef) {
      const index = activeWorkersRef.current.indexOf(worker)
      if (index > -1) {
        activeWorkersRef.current.splice(index, 1)
      }
    }
    worker.terminate()

    // Render the result
    const { voronoiData, seedPoints } = result as { voronoiData: Uint8ClampedArray, seedPoints: Array<{x: number, y: number, id: number}> }

    // Create color mapping for seeds
    const seedColors = seedPoints.map((seed, index) => {
      if (params.colorMode === "random") {
        const color = interpolateColor(params.colorPalette, Math.random() * 100)
        return { ...color, id: seed.id }
      } else {
        // Distance-based coloring
        const distance = Math.sqrt(seed.x * seed.x + seed.y * seed.y)
        const maxDistance = Math.sqrt(width * width + height * height)
        const ratio = distance / maxDistance
        const color = interpolateColor(params.colorPalette, ratio * 100)
        return { ...color, id: seed.id }
      }
    })

    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let i = 0; i < voronoiData.length; i++) {
      const cellId = voronoiData[i]
      const color = seedColors.find(c => c.id === cellId)
      if (color) {
        const idx = i * 4
        if (params.fillCells) {
          data[idx] = color.r
          data[idx + 1] = color.g
          data[idx + 2] = color.b
          data[idx + 3] = 255
        } else {
          data[idx] = 255
          data[idx + 1] = 255
          data[idx + 2] = 255
          data[idx + 3] = 255
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Draw borders if enabled
    if (params.showBorders) {
      ctx.strokeStyle = params.borderColor
      ctx.lineWidth = params.lineWeight

      for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
          const currentCell = voronoiData[y * width + x]
          const rightCell = voronoiData[y * width + x + 1]
          const bottomCell = voronoiData[(y + 1) * width + x]

          if (currentCell !== rightCell) {
            ctx.beginPath()
            ctx.moveTo(x + 1, y)
            ctx.lineTo(x + 1, y + 1)
            ctx.stroke()
          }

          if (currentCell !== bottomCell) {
            ctx.beginPath()
            ctx.moveTo(x, y + 1)
            ctx.lineTo(x + 1, y + 1)
            ctx.stroke()
          }
        }
      }
    }
  } catch (error) {
    console.warn("Worker rendering failed, falling back to single-threaded:", error)
    drawVoronoiSingleThreaded(ctx, width, height, params)
  }
}

async function drawCirclePackingAsync(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: CirclePackingParams,
  renderId?: number,
  activeWorkersRef?: React.MutableRefObject<Worker[]>,
) {
  // Check if Workers are supported
  if (typeof Worker === "undefined") {
    console.warn("Web Workers not supported, falling back to single-threaded circle packing")
    drawCirclePackingSingleThreaded(ctx, width, height, params)
    return
  }

  try {
    const worker = new Worker("/circle-packing-worker.js")
    if (activeWorkersRef) {
      activeWorkersRef.current.push(worker)
    }

    const result = await new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        resolve(e.data)
      }
      worker.onerror = (error) => {
        reject(error)
      }

      worker.postMessage({ width, height, params })
    })

    // Clean up worker
    if (activeWorkersRef) {
      const index = activeWorkersRef.current.indexOf(worker)
      if (index > -1) {
        activeWorkersRef.current.splice(index, 1)
      }
    }
    worker.terminate()

    // Render the result
    const { circles } = result as { circles: Array<{x: number, y: number, radius: number}> }

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    circles.forEach(circle => {
      // Fill circle if enabled
      if (params.showFill) {
        ctx.fillStyle = params.fillColor
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Stroke circle if enabled
      if (params.showStroke) {
        ctx.strokeStyle = params.strokeColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
  } catch (error) {
    console.warn("Worker rendering failed, falling back to single-threaded:", error)
    drawCirclePackingSingleThreaded(ctx, width, height, params)
  }
}

function drawCirclePackingSingleThreaded(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: CirclePackingParams,
) {
  // Simple circle packing without worker
  const circles = []
  const maxCircles = Math.min(params.maxCircles, 100) // Limit for performance

  for (let i = 0; i < maxCircles; i++) {
    let attempts = 0
    let placed = false

    while (!placed && attempts < 50) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = Math.random() * 15 + 5

      let collision = false
      for (const circle of circles) {
        const distance = Math.sqrt((x - circle.x) ** 2 + (y - circle.y) ** 2)
        if (distance < radius + circle.radius + params.padding) {
          collision = true
          break
        }
      }

      if (!collision && x - radius > 0 && x + radius < width && y - radius > 0 && y + radius < height) {
        circles.push({ x, y, radius })
        placed = true
      }
      attempts++
    }
  }

  // Clear canvas
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  circles.forEach(circle => {
    if (params.showFill) {
      ctx.fillStyle = params.fillColor
      ctx.beginPath()
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    if (params.showStroke) {
      ctx.strokeStyle = params.strokeColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
      ctx.stroke()
    }
  })
}

function drawVoronoiSingleThreaded(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: VoronoiParams,
) {
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, width, height)

  const particles: Array<{ x: number; y: number }> = []
  for (let i = 0; i < Math.min(params.particleCount, 2000); i++) {
    // Limit for performance
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

function drawVoronoi(ctx: CanvasRenderingContext2D, width: number, height: number, params: VoronoiParams) {
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, width, height)

  // Generate seed points
  const seeds: Array<{ x: number; y: number; color: string }> = []

  if (params.layout === "random") {
    for (let i = 0; i < params.pointCount; i++) {
      seeds.push({
        x: Math.random() * width,
        y: Math.random() * height,
        color: params.colorMode === "random" ? `hsl(${Math.random() * 360}, 70%, 60%)` : params.colorPalette[0].color,
      })
    }
  } else if (params.layout === "grid") {
    const cols = Math.ceil(Math.sqrt(params.pointCount))
    const cellWidth = width / cols
    const cellHeight = height / cols
    for (let y = 0; y < cols; y++) {
      for (let x = 0; x < cols; x++) {
        if (seeds.length < params.pointCount) {
          seeds.push({
            x: x * cellWidth + cellWidth / 2,
            y: y * cellHeight + cellHeight / 2,
            color:
              params.colorMode === "random" ? `hsl(${Math.random() * 360}, 70%, 60%)` : params.colorPalette[0].color,
          })
        }
      }
    }
  } else if (params.layout === "grid-jittered") {
    const cols = Math.ceil(Math.sqrt(params.pointCount))
    const cellWidth = width / cols
    const cellHeight = height / cols
    for (let y = 0; y < cols; y++) {
      for (let x = 0; x < cols; x++) {
        if (seeds.length < params.pointCount) {
          seeds.push({
            x: x * cellWidth + cellWidth / 2 + (Math.random() - 0.5) * cellWidth * 0.4,
            y: y * cellHeight + cellHeight / 2 + (Math.random() - 0.5) * cellHeight * 0.4,
            color:
              params.colorMode === "random" ? `hsl(${Math.random() * 360}, 70%, 60%)` : params.colorPalette[0].color,
          })
        }
      }
    }
  }

  // Create Voronoi diagram by coloring each pixel
  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let minDist = Number.POSITIVE_INFINITY
      let nearestSeed = seeds[0]

      for (const seed of seeds) {
        let dist: number
        if (params.distanceMetric === "manhattan") {
          dist = Math.abs(px - seed.x) + Math.abs(py - seed.y)
        } else {
          dist = Math.hypot(px - seed.x, py - seed.y)
        }

        if (dist < minDist) {
          minDist = dist
          nearestSeed = seed
        }
      }

      const color = hexToRgb(nearestSeed.color)
      const idx = (py * width + px) * 4

      if (params.fillCells) {
        data[idx] = color.r
        data[idx + 1] = color.g
        data[idx + 2] = color.b
        data[idx + 3] = 255
      } else {
        data[idx] = 255
        data[idx + 1] = 255
        data[idx + 2] = 255
        data[idx + 3] = 255
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Draw borders
  if (params.showBorders) {
    ctx.strokeStyle = params.borderColor
    ctx.lineWidth = params.lineWeight
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width - 1; px++) {
        const idx1 = (py * width + px) * 4
        const idx2 = (py * width + px + 1) * 4
        const r1 = data[idx1]
        const r2 = data[idx2]
        if (r1 !== r2) {
          ctx.fillStyle = params.borderColor
          ctx.fillRect(px, py, 1, 1)
        }
      }
    }
  }
}

function drawTessellation(ctx: CanvasRenderingContext2D, width: number, height: number, params: TessellationParams) {
  ctx.fillStyle = params.baseColor
  ctx.fillRect(0, 0, width, height)

  const spacing = 40 + params.offset * 30
  const gutter = params.gutter

  if (params.shape === "hexagons") {
    const hexWidth = spacing
    const hexHeight = (spacing * Math.sqrt(3)) / 2

    for (let row = -3; row < Math.ceil(height / hexHeight) + 3; row++) {
      for (let col = -3; col < Math.ceil(width / hexWidth) + 3; col++) {
        const x = col * (hexWidth * 0.75)
        const y = row * hexHeight + (col % 2) * (hexHeight / 2)
        const hexSize = Math.max(1, spacing / 2 - gutter)
        drawHexagon(ctx, x, y, hexSize, params)
      }
    }
  } else if (params.shape === "triangles") {
    for (let y = -spacing; y < height + spacing; y += spacing) {
      for (let x = -spacing; x < width + spacing; x += spacing) {
        drawTriangle(ctx, x, y, spacing, params)
        drawTriangle(ctx, x + spacing / 2, y + spacing / 2, spacing, params)
      }
    }
  }
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, params: TessellationParams) {
  ctx.fillStyle = params.fillMode === "random" ? `hsl(${Math.random() * 360}, 70%, 60%)` : params.baseColor
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    const px = x + size * Math.cos(angle)
    const py = y + size * Math.sin(angle)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, params: TessellationParams) {
  ctx.fillStyle = params.fillMode === "random" ? `hsl(${Math.random() * 360}, 70%, 60%)` : params.baseColor
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + size / 2, y + size)
  ctx.lineTo(x - size / 2, y + size)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawCirclePacking(ctx: CanvasRenderingContext2D, width: number, height: number, params: CirclePackingParams) {
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, width, height)

  const circles: Array<{ x: number; y: number; r: number }> = []
  let attempts = 0
  const maxAttempts = params.maxCircles * 10

  while (circles.length < params.maxCircles && attempts < maxAttempts) {
    let x, y, r: number

    if (params.packingMode === "random") {
      x = Math.random() * width
      y = Math.random() * height
      r = Math.random() * 30 + 5
    } else {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * Math.min(width, height) * 0.4
      x = width / 2 + Math.cos(angle) * dist
      y = height / 2 + Math.sin(angle) * dist
      r = 20
    }

    let collides = false
    for (const circle of circles) {
      if (Math.hypot(x - circle.x, y - circle.y) < r + circle.r + params.padding) {
        collides = true
        break
      }
    }

    if (!collides && x - r > 0 && x + r < width && y - r > 0 && y + r < height) {
      circles.push({ x, y, r })
    }

    attempts++
  }

  for (const circle of circles) {
    const colorIdx = Math.floor((circle.r / 30) * (params.colorPalette.length - 1))
    const color = params.colorPalette[colorIdx] || params.colorPalette[0]

    if (params.showFill) {
      ctx.fillStyle = color.color
      ctx.globalAlpha = color.alpha
      ctx.beginPath()
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2)
      ctx.fill()
    }

    if (params.showStroke) {
      ctx.strokeStyle = params.strokeColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  ctx.globalAlpha = 1
}

function drawOpArt(ctx: CanvasRenderingContext2D, width: number, height: number, params: OpArtParams) {
  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value: number

      if (params.pattern === "sine-wave") {
        value = Math.sin((x / params.frequency) * Math.PI + (y / params.amplitude) * Math.PI) * 0.5 + 0.5
      } else {
        const checker = (Math.floor(x / (params.frequency / 10)) + Math.floor(y / (params.frequency / 10))) % 2
        value = checker
      }

      const color = value > 0.5 ? hexToRgb(params.color1) : hexToRgb(params.color2)
      const idx = (y * width + x) * 4
      data[idx] = color.r
      data[idx + 1] = color.g
      data[idx + 2] = color.b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
