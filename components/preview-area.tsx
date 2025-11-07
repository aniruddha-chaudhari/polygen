"use client"

import { Canvas } from "./canvas"
import { GradientCenterHandle } from "./gradient-center-handle"
import type { GradientState } from "@/app/page"

interface PreviewAreaProps {
  mode: "template" | "gradient" | "fractal"
  selectedTemplate: number
  gradient: GradientState
  setGradient: (gradient: GradientState) => void
  showCenterHandle: boolean
  fractalParams: any
  canvasBackgrounds: string[]
  selectedBgIndex: number | null
}

export function PreviewArea({
  mode,
  selectedTemplate,
  gradient,
  setGradient,
  showCenterHandle,
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
        className="relative w-full max-w-2xl aspect-video rounded-lg border border-border overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        <Canvas mode={mode} selectedTemplate={selectedTemplate} gradient={gradient} fractalParams={fractalParams} />
        {showCenterHandle && (
          <GradientCenterHandle
            gradient={gradient}
            setGradient={setGradient}
          />
        )}
      </div>
    </div>
  )
}
