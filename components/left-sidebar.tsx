"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface LeftSidebarProps {
  mode: "template" | "gradient" | "fractal"
  setMode: (mode: "template" | "gradient" | "fractal") => void
  selectedTemplate: number
  setSelectedTemplate: (id: number) => void
  gradientColors: string[]
  setGradientColors: (colors: string[]) => void
  fractalParams: any
  setFractalParams: (params: any) => void
}

export function LeftSidebar({
  mode,
  setMode,
  selectedTemplate,
  setSelectedTemplate,
  gradientColors,
  setGradientColors,
  fractalParams,
  setFractalParams,
}: LeftSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string>(mode)

  const algorithms = [
    {
      id: "template",
      label: "TEMPLATES",
      description: "Pre-made styles",
      items: [
        { id: "preset-1", label: "Sunset", type: "template" },
        { id: "preset-2", label: "Ocean", type: "template" },
        { id: "preset-3", label: "Forest", type: "template" },
      ],
    },
    {
      id: "gradient",
      label: "GRADIENTS",
      description: "Color blending",
      items: [
        { id: "gradient-linear", label: "Linear", type: "gradient" },
        { id: "gradient-radial", label: "Radial", type: "gradient" },
        { id: "gradient-conic", label: "Conic", type: "gradient" },
      ],
    },
    {
      id: "fractal",
      label: "FRACTALS",
      description: "Recursive patterns",
      items: [
        { id: "fractal-mandelbrot", label: "Mandelbrot", type: "fractal" },
        { id: "fractal-julia", label: "Julia Set", type: "fractal" },
        { id: "fractal-sierpinski", label: "Sierpinski", type: "fractal" },
      ],
    },
  ]

  return (
    <div className="h-full bg-card flex flex-col overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-0">
          {algorithms.map((algo) => (
            <div key={algo.id}>
              {/* Main Section Header */}
              <button
                onClick={() => {
                  setMode(algo.id as any)
                  setExpandedSection(expandedSection === algo.id ? "" : algo.id)
                }}
                className={`w-full px-4 py-3 flex items-center justify-between border-b-2 border-foreground/10 hover:bg-secondary/50 transition-colors text-left font-medium ${
                  mode === algo.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                }`}
              >
                <div>
                  <div className="text-xs font-black tracking-wider">{algo.label}</div>
                  <div className="text-xs text-muted-foreground">{algo.description}</div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${
                    expandedSection === algo.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Sub-items */}
              {expandedSection === algo.id && (
                <div className="bg-secondary/20">
                  {algo.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMode(algo.id as any)}
                      className="w-full px-6 py-2 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border-b border-foreground/5 font-medium"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
