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
  const [mode, setMode] = useState<"template" | "gradient" | "fractal">("gradient")
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [gradient, setGradient] = useState<GradientState>(defaultGradientState)
  const [canvasBackgrounds, setCanvasBackgrounds] = useState<string[]>([])
  const [selectedBgIndex, setSelectedBgIndex] = useState<number | null>(null)
  const [fractalParams, setFractalParams] = useState({
    sides: 6,
    iterations: 5,
    scale: 1,
    rotation: 0,
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
              fractalParams={fractalParams}
              setFractalParams={setFractalParams}
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
            fractalParams={fractalParams}
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
              fractalParams={fractalParams}
              setFractalParams={setFractalParams}
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
