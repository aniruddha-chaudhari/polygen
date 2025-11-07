"use client"

import { FileText, PaintBucket, Sparkles, Maximize, GitBranch, Flame, Sprout } from "lucide-react"
import type { Mode, ChaosGameParams, MandelbrotParams, NewtonParams, FlameParams, LSystemParams } from "@/app/page"

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
  newtonParams: NewtonParams
  setNewtonParams: (params: NewtonParams) => void
  flameParams: FlameParams
  setFlameParams: (params: FlameParams) => void
  lsystemParams: LSystemParams
  setLSystemParams: (params: LSystemParams) => void
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
  newtonParams,
  setNewtonParams,
  flameParams,
  setFlameParams,
  lsystemParams,
  setLSystemParams,
}: LeftSidebarProps) {
  const tabs = [
    {
      id: "template" as const,
      label: "Templates",
      icon: FileText,
    },
    {
      id: "gradient" as const,
      label: "Gradients",
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
      id: "newton" as const,
      label: "Root Finder",
      icon: GitBranch,
    },
    {
      id: "flame" as const,
      label: "Cosmic Flame",
      icon: Flame,
    },
    {
      id: "lsystem" as const,
      label: "Organic Growth",
      icon: Sprout,
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
