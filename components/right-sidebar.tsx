"use client"

import { TemplateGallery } from "./template-gallery"
import { GradientControls } from "./gradient-controls"
import { FractalControls } from "./fractal-controls"
import { CanvasBackgroundManager } from "./canvas-background-manager"

interface RightSidebarProps {
  mode: "template" | "gradient" | "fractal"
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

export function RightSidebar({
  mode,
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
}: RightSidebarProps) {
  return (
    <div className="h-full bg-card flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {mode === "template" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">
                Template Settings
              </h3>
              <TemplateGallery selected={selectedTemplate} onSelect={setSelectedTemplate} />
            </div>
          )}

          {mode === "gradient" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">
                Gradient Settings
              </h3>
              <GradientControls colors={gradientColors} setColors={setGradientColors} />
            </div>
          )}

          {mode === "fractal" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">
                Fractal Settings
              </h3>
              <FractalControls params={fractalParams} setParams={setFractalParams} />
            </div>
          )}

          {/* Canvas settings always visible */}
          <div className="border-t-2 border-foreground/10 pt-4">
            <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">Canvas Settings</h3>
            <CanvasBackgroundManager
              backgrounds={canvasBackgrounds}
              setBackgrounds={setCanvasBackgrounds}
              selectedIndex={selectedBgIndex}
              setSelectedIndex={setSelectedBgIndex}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
