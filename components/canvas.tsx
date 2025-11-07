"use client"

import { useRef, useEffect, useCallback } from "react"
import type {
  GradientState,
  ChaosGameParams,
  MandelbrotParams,
  Mode,
} from "@/app/page"

interface CanvasProps {
  mode: Mode
  selectedTemplate: number
  gradient: GradientState
  chaosGameParams: ChaosGameParams
  mandelbrotParams: MandelbrotParams
}

const templates = [
  { name: "Ocean", colors: ["#0a1f2e", "#16c784"] },
  { name: "Sunset", colors: ["#ff6b6b", "#ffd93d"] },
  { name: "Forest", colors: ["#1a5f3e", "#90ee90"] },
  { name: "Night", colors: ["#1a1a2e", "#16213e"] },
  { name: "Fire", colors: ["#8b0000", "#ff4500"] },
  { name: "Sky", colors: ["#87ceeb", "#e0f6ff"] },
]

// Number of worker threads to use (typically CPU cores - 1)
const NUM_WORKERS = typeof navigator !== 'undefined' ? Math.max(2, navigator.hardwareConcurrency || 4) : 4;

export function Canvas({
  mode,
  selectedTemplate,
  gradient,
  chaosGameParams,
  mandelbrotParams,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isRenderingRef = useRef(false)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeWorkersRef = useRef<Worker[]>([])
  const renderIdRef = useRef(0)
  const lastParamsRef = useRef<string>('')

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

    // Only resize if dimensions actually changed
    const currentWidth = canvas.offsetWidth
    const currentHeight = canvas.offsetHeight
    
    const needsResize = canvas.width !== currentWidth || canvas.height !== currentHeight
    
    if (needsResize) {
      canvas.width = currentWidth
      canvas.height = currentHeight
      
      // Recreate offscreen canvas
      offscreenCanvasRef.current = document.createElement('canvas')
      offscreenCanvasRef.current.width = currentWidth
      offscreenCanvasRef.current.height = currentHeight
    }

    // For Mandelbrot, check if params actually changed to avoid unnecessary renders
    if (mode === "mandelbrot") {
      const paramsString = JSON.stringify(mandelbrotParams)
      if (paramsString === lastParamsRef.current && !needsResize) {
        // Parameters haven't changed, skip render
        return
      }
      lastParamsRef.current = paramsString
    }

    // Cancel any pending workers
    activeWorkersRef.current.forEach(worker => worker.terminate())
    activeWorkersRef.current = []

    // Clear any pending render timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current)
    }

    // Increment render ID to invalidate old renders
    renderIdRef.current++
    const currentRenderId = renderIdRef.current

    // Debounce rendering for Mandelbrot to reduce flickering during drag/zoom
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
            activeWorkersRef
          ).then(() => {
            // Only update if this render is still current
            if (currentRenderId === renderIdRef.current && offscreenCanvasRef.current) {
              ctx.drawImage(offscreenCanvasRef.current, 0, 0)
            }
          }).catch((err) => {
            // Render was cancelled or failed, ignore
            if (err.message !== 'Render cancelled') {
              console.error('Render error:', err)
            }
          })
        }
      }, 150) // Increased debounce to 150ms for even smoother dragging
      return
    }

    // For other modes, render directly (they're fast)
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
    }

    // Cleanup timeout on unmount
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }
      activeWorkersRef.current.forEach(worker => worker.terminate())
      activeWorkersRef.current = []
    }
  }, [
    mode,
    selectedTemplate,
    gradient,
    chaosGameParams,
    mandelbrotParams,
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

async function drawMandelbrotAsync(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  params: MandelbrotParams,
  renderId?: number,
  activeWorkersRef?: React.MutableRefObject<Worker[]>
) {
  // Don't clear the canvas here - keep previous frame visible during rendering

  // Check if Workers are supported
  if (typeof Worker === 'undefined') {
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
          const worker = new Worker('/mandelbrot-worker.js')
          workers.push(worker)
          
          const timeout = setTimeout(() => {
            worker.terminate()
            reject(new Error('Worker timeout'))
          }, 10000) // 10 second timeout
          
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

    // Track active workers
    if (activeWorkersRef) {
      activeWorkersRef.current = workers
    }

    await Promise.all(promises)
    
    // Terminate all workers
    workers.forEach(w => w.terminate())
    if (activeWorkersRef) {
      activeWorkersRef.current = []
    }
    
    // Only update canvas after all workers complete
    ctx.putImageData(imageData, 0, 0)
  } catch (error) {
    console.warn('Worker rendering failed, falling back to single-threaded:', error)
    drawMandelbrotSingleThreaded(ctx, width, height, params)
  }
}

function drawMandelbrotSingleThreaded(ctx: CanvasRenderingContext2D, width: number, height: number, params: MandelbrotParams) {
  const imageData = ctx.createImageData(width, height)
  const data = imageData.data

  // Dynamically scale iterations based on zoom level
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
