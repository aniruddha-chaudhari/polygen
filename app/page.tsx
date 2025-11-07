"use client"

import { useState } from "react"
import { LeftSidebar } from "@/components/left-sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { PreviewArea } from "@/components/preview-area"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/retroui/Button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface ColorStop {
  color: string
  position: number
  alpha: number
}

export interface GradientState {
  type: "linear" | "radial" | "conic" | "mesh" | "repeating-linear" | "repeating-radial" | "repeating-conic"
  colorStops: ColorStop[]
  angle: number
  centerX: number
  centerY: number
  shape: "circle" | "ellipse"
  shapeRatio: number
  meshGrid: string[][] // 3x3 grid
  meshSpread: number
  repeatSize: number
  noiseEnabled: boolean
  noiseAmount: number
  noiseType: "smooth" | "harsh"
  conicSmoothTransition: boolean
}

export interface ChaosGameParams {
  sides: number
  jumpRatio: number
  pointDensity: number
  pointColor: string
  bgColor: string
}

export interface MandelbrotParams {
  zoom: number
  panX: number
  panY: number
  iterations: number
  colorPalette: ColorStop[]
  juliaSeedX: number
  juliaSeedY: number
  isJuliaSet: boolean
}

export interface NewtonParams {
  roots: number
  iterations: number
  rootColors: string[]
}

export interface FlameParams {
  functionSet: string
  palette: ColorStop[]
  gamma: number
}

export interface LSystemParams {
  preset: string
  iteration: number
  angle: number
  lineWeight: number
  lineColor: string
}

export type Mode = "template" | "gradient" | "chaos-game" | "mandelbrot" | "newton" | "flame" | "lsystem"

const defaultGradientState: GradientState = {
  type: "linear",
  colorStops: [
    { color: "#a78bfa", position: 0, alpha: 1 },
    { color: "#ec4899", position: 100, alpha: 1 },
  ],
  angle: 135,
  centerX: 50,
  centerY: 50,
  shape: "circle",
  shapeRatio: 1,
  meshGrid: [
    ["#ff0000", "#00ff00", "#0000ff"],
    ["#ffff00", "#ff00ff", "#00ffff"],
    ["#ff8800", "#00ff88", "#8800ff"],
  ],
  meshSpread: 50,
  repeatSize: 100,
  noiseEnabled: false,
  noiseAmount: 0,
  noiseType: "smooth",
  conicSmoothTransition: true,
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("gradient")
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [gradient, setGradient] = useState<GradientState>(defaultGradientState)
  const [canvasBackgrounds, setCanvasBackgrounds] = useState<string[]>([])
  const [selectedBgIndex, setSelectedBgIndex] = useState<number | null>(null)

  const [chaosGameParams, setChaosGameParams] = useState<ChaosGameParams>({
    sides: 6,
    jumpRatio: 0.5,
    pointDensity: 10000,
    pointColor: "#a78bfa",
    bgColor: "#0a0a0a",
  })

  const [mandelbrotParams, setMandelbrotParams] = useState<MandelbrotParams>({
    zoom: 1,
    panX: 0,
    panY: 0,
    iterations: 100,
    colorPalette: [
      { color: "#000000", position: 0, alpha: 1 },
      { color: "#ff6b00", position: 50, alpha: 1 },
      { color: "#ffff00", position: 100, alpha: 1 },
    ],
    juliaSeedX: -0.5,
    juliaSeedY: 0,
    isJuliaSet: false,
  })

  const [newtonParams, setNewtonParams] = useState<NewtonParams>({
    roots: 3,
    iterations: 50,
    rootColors: ["#ff1744", "#00e676", "#2979f3"],
  })

  const [flameParams, setFlameParams] = useState<FlameParams>({
    functionSet: "Sinusoidal",
    palette: [
      { color: "#000000", position: 0, alpha: 1 },
      { color: "#ff6b00", position: 50, alpha: 1 },
      { color: "#ffff00", position: 100, alpha: 1 },
    ],
    gamma: 1.5,
  })

  const [lsystemParams, setLSystemParams] = useState<LSystemParams>({
    preset: "Fern",
    iteration: 5,
    angle: 25,
    lineWeight: 2,
    lineColor: "#90ee90",
  })

  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [showCenterHandle, setShowCenterHandle] = useState(true)

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme)
    if (typeof window !== "undefined") {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="flex h-screen bg-background text-foreground">
        {/* Top Header - Retro style */}
        <div className="fixed top-0 left-0 right-0 h-20 border-b-4 border-foreground/20 bg-background/95 backdrop-blur flex items-center justify-between px-6 z-50">
          <img src="/logo.svg" alt="POLYGEN" className="h-40 w-auto" />
          <ThemeSwitcher theme={theme} setTheme={handleThemeChange} />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 pt-20">
          {/* Left Sidebar - Collapsible */}
          <div
            className={`transition-all duration-300 border-r-4 border-foreground/10 overflow-hidden ${
              leftSidebarOpen ? "w-64" : "w-0"
            }`}
          >
            <LeftSidebar
              mode={mode}
              setMode={setMode}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              gradient={gradient}
              setGradient={setGradient}
              chaosGameParams={chaosGameParams}
              setChaosGameParams={setChaosGameParams}
              mandelbrotParams={mandelbrotParams}
              setMandelbrotParams={setMandelbrotParams}
              newtonParams={newtonParams}
              setNewtonParams={setNewtonParams}
              flameParams={flameParams}
              setFlameParams={setFlameParams}
              lsystemParams={lsystemParams}
              setLSystemParams={setLSystemParams}
            />
          </div>

          {/* Toggle Left Sidebar Button */}
          <Button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            variant="outline"
            size="icon"
            className="group w-8 border-r-2 border-foreground/10"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${!leftSidebarOpen ? "rotate-180" : ""}`} />
          </Button>

          {/* Center Canvas Area */}
          <PreviewArea
            mode={mode}
            selectedTemplate={selectedTemplate}
            gradient={gradient}
            setGradient={setGradient}
            showCenterHandle={showCenterHandle}
            chaosGameParams={chaosGameParams}
            mandelbrotParams={mandelbrotParams}
            newtonParams={newtonParams}
            flameParams={flameParams}
            lsystemParams={lsystemParams}
            canvasBackgrounds={canvasBackgrounds}
            selectedBgIndex={selectedBgIndex}
          />

          {/* Toggle Right Sidebar Button */}
          <Button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            variant="outline"
            size="icon"
            className="group w-8 border-l-2 border-foreground/10"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${!rightSidebarOpen ? "rotate-180" : ""}`} />
          </Button>

          {/* Right Sidebar - Collapsible */}
          <div
            className={`transition-all duration-300 border-l-4 border-foreground/10 overflow-hidden ${
              rightSidebarOpen ? "w-80" : "w-0"
            }`}
          >
            <RightSidebar
              mode={mode}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              gradient={gradient}
              setGradient={setGradient}
              showCenterHandle={showCenterHandle}
              setShowCenterHandle={setShowCenterHandle}
              chaosGameParams={chaosGameParams}
              setChaosGameParams={setChaosGameParams}
              mandelbrotParams={mandelbrotParams}
              setMandelbrotParams={setMandelbrotParams}
              newtonParams={newtonParams}
              setNewtonParams={setNewtonParams}
              flameParams={flameParams}
              setFlameParams={setFlameParams}
              lsystemParams={lsystemParams}
              setLSystemParams={setLSystemParams}
              canvasBackgrounds={canvasBackgrounds}
              setCanvasBackgrounds={setCanvasBackgrounds}
              selectedBgIndex={selectedBgIndex}
              setSelectedBgIndex={setSelectedBgIndex}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
