"use client"

import { FileText, PaintBucket, Sparkles, Maximize, Waves, Orbit, Grid3x3, Wind } from "lucide-react"
import type {
  Mode,
  ChaosGameParams,
  MandelbrotParams,
  PerlinNoiseParams,
  StrangeAttractorParams,
  CellularAutomataParams,
  FlowFieldParams,
} from "@/app/page"

interface LeftSidebarProps {
  mode: Mode
  setMode: (mode: Mode) => void
  selectedTemplate: number
  setSelectedTemplate: (id: number) => void
  gradient: any
  setGradient: (gradient: any) => void
  chaosGameParams: ChaosGameParams
  setChaosGameParams: (params: ChaosGameParams) => void
  mandelbrotParams: MandelbrotParams
  setMandelbrotParams: (params: MandelbrotParams) => void
  perlinNoiseParams: PerlinNoiseParams
  setPerlinNoiseParams: (params: PerlinNoiseParams) => void
  strangeAttractorParams: StrangeAttractorParams
  setStrangeAttractorParams: (params: StrangeAttractorParams) => void
  cellularAutomataParams: CellularAutomataParams
  setCellularAutomataParams: (params: CellularAutomataParams) => void
  flowFieldParams: FlowFieldParams
  setFlowFieldParams: (params: FlowFieldParams) => void
}

export function LeftSidebar({
  mode,
  setMode,
  selectedTemplate,
  setSelectedTemplate,
  gradient,
  setGradient,
  chaosGameParams,
  setChaosGameParams,
  mandelbrotParams,
  setMandelbrotParams,
  perlinNoiseParams,
  setPerlinNoiseParams,
  strangeAttractorParams,
  setStrangeAttractorParams,
  cellularAutomataParams,
  setCellularAutomataParams,
  flowFieldParams,
  setFlowFieldParams,
}: LeftSidebarProps) {
  const tabs = [
    {
      id: "template" as const,
      label: "Prismatic Palettes",
      icon: FileText,
    },
    {
      id: "gradient" as const,
      label: "Chromatic Flows",
      icon: PaintBucket,
    },
    {
      id: "chaos-game" as const,
      label: "Chaos Garden",
      icon: Sparkles,
    },
    {
      id: "mandelbrot" as const,
      label: "Infinite Zoom",
      icon: Maximize,
    },
    {
      id: "perlin-noise" as const,
      label: "Noise Canvas",
      icon: Waves,
    },
    {
      id: "strange-attractor" as const,
      label: "Strange Orbits",
      icon: Orbit,
    },
    {
      id: "cellular-automata" as const,
      label: "Grid Genesis",
      icon: Grid3x3,
    },
    {
      id: "flow-field" as const,
      label: "Vector Dreams",
      icon: Wind,
    },
  ]

  return (
    <div className="h-full bg-card flex flex-col">
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`aspect-square flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  mode === tab.id
                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                    : "bg-secondary/30 border-border hover:bg-secondary/50"
                }`}
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
