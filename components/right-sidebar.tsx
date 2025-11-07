"use client"

import { TemplateGallery } from "./template-gallery"
import { GradientControls } from "./gradient-controls"
import { ChaosGameControls } from "./chaos-game-controls"
import { MandelbrotControls } from "./mandelbrot-controls"
import { CanvasBackgroundManager } from "./canvas-background-manager"
import { PerlinNoiseControls } from "./perlin-noise-controls"
import { StrangeAttractorControls } from "./strange-attractor-controls"
import { CellularAutomataControls } from "./cellular-automata-controls"
import { FlowFieldControls } from "./flow-field-controls"
import { ReactionDiffusionControls } from "./reaction-diffusion-controls"
import type {
  Mode,
  ChaosGameParams,
  MandelbrotParams,
  PerlinNoiseParams,
  StrangeAttractorParams,
  CellularAutomataParams,
  FlowFieldParams,
  ReactionDiffusionParams,
} from "@/app/page"

interface RightSidebarProps {
  mode: Mode
  selectedTemplate: number
  setSelectedTemplate: (id: number) => void
  gradient: any
  setGradient: (gradient: any) => void
  showCenterHandle: boolean
  setShowCenterHandle: (show: boolean) => void
  chaosGameParams: ChaosGameParams
  setChaosGameParams: (params: ChaosGameParams) => void
  mandelbrotParams: MandelbrotParams
  setMandelbrotParams: (params: MandelbrotParams) => void
  canvasBackgrounds: string[]
  setCanvasBackgrounds: (bg: string[]) => void
  selectedBgIndex: number | null
  setSelectedBgIndex: (idx: number | null) => void
  perlinNoiseParams: PerlinNoiseParams
  setPerlinNoiseParams: (params: PerlinNoiseParams) => void
  strangeAttractorParams: StrangeAttractorParams
  setStrangeAttractorParams: (params: StrangeAttractorParams) => void
  cellularAutomataParams: CellularAutomataParams
  setCellularAutomataParams: (params: CellularAutomataParams) => void
  flowFieldParams: FlowFieldParams
  setFlowFieldParams: (params: FlowFieldParams) => void
  reactionDiffusionParams: ReactionDiffusionParams
  setReactionDiffusionParams: (params: ReactionDiffusionParams) => void
}

export function RightSidebar({
  mode,
  selectedTemplate,
  setSelectedTemplate,
  gradient,
  setGradient,
  showCenterHandle,
  setShowCenterHandle,
  chaosGameParams,
  setChaosGameParams,
  mandelbrotParams,
  setMandelbrotParams,
  canvasBackgrounds,
  setCanvasBackgrounds,
  selectedBgIndex,
  setSelectedBgIndex,
  perlinNoiseParams,
  setPerlinNoiseParams,
  strangeAttractorParams,
  setStrangeAttractorParams,
  cellularAutomataParams,
  setCellularAutomataParams,
  flowFieldParams,
  setFlowFieldParams,
  reactionDiffusionParams,
  setReactionDiffusionParams,
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
              <GradientControls
                gradient={gradient}
                setGradient={setGradient}
                showCenterHandle={showCenterHandle}
                setShowCenterHandle={setShowCenterHandle}
              />
            </div>
          )}

          {mode === "chaos-game" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">Chaos Garden</h3>
              <p className="text-xs text-muted-foreground mb-3">Iterative function system with random vertex jumping</p>
              <ChaosGameControls params={chaosGameParams} setParams={setChaosGameParams} />
            </div>
          )}

          {mode === "mandelbrot" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">Infinite Zoom</h3>
              <p className="text-xs text-muted-foreground mb-3">Mandelbrot & Julia sets with interactive exploration</p>
              <MandelbrotControls params={mandelbrotParams} setParams={setMandelbrotParams} />
            </div>
          )}

          {mode === "perlin-noise" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">Noise Canvas</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Perlin noise with customizable octaves and color mapping
              </p>
              <PerlinNoiseControls params={perlinNoiseParams} setParams={setPerlinNoiseParams} />
            </div>
          )}

          {mode === "strange-attractor" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">Strange Orbits</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Chaotic dynamical systems with Lorenz, Aizawa & De Jong
              </p>
              <StrangeAttractorControls params={strangeAttractorParams} setParams={setStrangeAttractorParams} />
            </div>
          )}

          {mode === "cellular-automata" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">Grid Genesis</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Conway's Game of Life & cellular automata simulations
              </p>
              <CellularAutomataControls params={cellularAutomataParams} setParams={setCellularAutomataParams} />
            </div>
          )}

          {mode === "flow-field" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">Vector Dreams</h3>
              <p className="text-xs text-muted-foreground mb-3">Particle flow fields with Perlin noise guidance</p>
              <FlowFieldControls params={flowFieldParams} setParams={setFlowFieldParams} />
            </div>
          )}

          {mode === "reaction-diffusion" && (
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase mb-4 text-muted-foreground">Morphic Bloom</h3>
              <p className="text-xs text-muted-foreground mb-3">Gray-Scott reaction-diffusion pattern generation</p>
              <ReactionDiffusionControls params={reactionDiffusionParams} setParams={setReactionDiffusionParams} />
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
