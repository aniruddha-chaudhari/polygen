"use client"

import { FileText, PaintBucket, Zap } from "lucide-react"

interface LeftSidebarProps {
  mode: "template" | "gradient" | "fractal"
  setMode: (mode: "template" | "gradient" | "fractal") => void
  selectedTemplate: number
  setSelectedTemplate: (id: number) => void
  gradient: any
  setGradient: (gradient: any) => void
  fractalParams: any
  setFractalParams: (params: any) => void
}

export function LeftSidebar({
  mode,
  setMode,
  selectedTemplate,
  setSelectedTemplate,
  gradient,
  setGradient,
  fractalParams,
  setFractalParams,
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
      id: "fractal" as const,
      label: "Fractals",
      icon: Zap,
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
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
