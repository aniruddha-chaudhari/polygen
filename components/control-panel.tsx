"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TemplateGallery } from "./template-gallery"
import { GradientControls } from "./gradient-controls"
import { FractalControls } from "./fractal-controls"
import { CanvasBackgroundManager } from "./canvas-background-manager"
import { Download } from "lucide-react"

interface ControlPanelProps {
  mode: "template" | "gradient" | "fractal"
  setMode: (mode: "template" | "gradient" | "fractal") => void
  selectedTemplate: number
  setSelectedTemplate: (id: number) => void
  gradientColors: string[]
  setGradientColors: (colors: string[]) => void
  fractalParams: any
  setFractalParams: (params: any) => void
  canvasBackgrounds: string[]
  setCanvasBackgrounds: (bg: string[]) => void
  selectedBgIndex: number | null
  setSelectedBgIndex: (idx: number | null) => void
}

export function ControlPanel({
  mode,
  setMode,
  selectedTemplate,
  setSelectedTemplate,
  gradientColors,
  setGradientColors,
  fractalParams,
  setFractalParams,
  canvasBackgrounds,
  setCanvasBackgrounds,
  selectedBgIndex,
  setSelectedBgIndex,
}: ControlPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string>(mode)

  const algorithms = [
    { id: "template", label: "Templates", description: "Pre-made styles" },
    { id: "gradient", label: "Gradient", description: "Color blending" },
    { id: "fractal", label: "Fractals", description: "Recursive patterns" },
  ]

  return (
    <div className="w-80 border-l-2 border-foreground/10 bg-card flex flex-col overflow-hidden">
      {/* Accordion Navigation - Retro Style */}
      <div className="border-b-2 border-foreground/10 bg-secondary/30">
        <div className="space-y-0">
          {algorithms.map((algo) => (
            <button
              key={algo.id}
              onClick={() => {
                setMode(algo.id as any)
                setExpandedSection(algo.id)
              }}
              className={`w-full px-4 py-3 flex items-center justify-between border-b border-foreground/5 hover:bg-secondary/50 transition-colors text-left font-medium ${
                expandedSection === algo.id ? "bg-primary/10 text-primary border-l-4 border-l-primary" : ""
              }`}
            >
              <div>
                <div className="text-sm font-semibold">{algo.label}</div>
                <div className="text-xs text-muted-foreground">{algo.description}</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${expandedSection === algo.id ? "rotate-180" : ""}`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {mode === "template" && expandedSection === "template" && (
            <TemplateGallery selected={selectedTemplate} onSelect={setSelectedTemplate} />
          )}

          {mode === "gradient" && expandedSection === "gradient" && (
            <GradientControls colors={gradientColors} setColors={setGradientColors} />
          )}

          {mode === "fractal" && expandedSection === "fractal" && (
            <FractalControls params={fractalParams} setParams={setFractalParams} />
          )}

          <div className="border-t-2 border-foreground/10 pt-4">
            <CanvasBackgroundManager
              backgrounds={canvasBackgrounds}
              setBackgrounds={setCanvasBackgrounds}
              selectedIndex={selectedBgIndex}
              setSelectedIndex={setSelectedBgIndex}
            />
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="border-t-2 border-foreground/10 p-4 bg-secondary/30">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm py-2 flex items-center justify-center gap-2 border border-foreground/20">
          <Download className="w-4 h-4" />
          DOWNLOAD
        </Button>
      </div>
    </div>
  )
}
