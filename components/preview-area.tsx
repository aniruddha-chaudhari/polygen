"use client"

import { Canvas } from "./canvas"

interface PreviewAreaProps {
  mode: "template" | "gradient" | "fractal"
  selectedTemplate: number
  gradientColors: string[]
  fractalParams: any
  canvasBackgrounds: string[]
  selectedBgIndex: number | null
}

export function PreviewArea({
  mode,
  selectedTemplate,
  gradientColors,
  fractalParams,
  canvasBackgrounds,
  selectedBgIndex,
}: PreviewAreaProps) {
  const bgColor =
    selectedBgIndex !== null && canvasBackgrounds[selectedBgIndex] ? canvasBackgrounds[selectedBgIndex] : "#000000"

  return (
    <div className="flex-1 bg-background p-8 flex flex-col justify-center items-center">
      {/* Canvas Container */}
      <div
        className="w-full max-w-2xl aspect-video rounded-lg shadow-2xl border border-border overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        <Canvas
          mode={mode}
          selectedTemplate={selectedTemplate}
          gradientColors={gradientColors}
          fractalParams={fractalParams}
        />
      </div>
    </div>
  )
}
