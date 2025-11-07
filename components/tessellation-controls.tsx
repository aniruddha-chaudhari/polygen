"use client"

import { ColorPicker } from "./retroui/ColorPicker"
import type { TessellationParams } from "@/app/page"

interface TessellationControlsProps {
  params: TessellationParams
  setParams: (params: TessellationParams) => void
}

export function TessellationControls({ params, setParams }: TessellationControlsProps) {
  return (
    <div className="space-y-4">
      {/* Shape */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Shape</label>
        <div className="grid grid-cols-3 gap-2">
          {["triangles", "squares", "hexagons"].map((shape) => (
            <button
              key={shape}
              onClick={() => setParams({ ...params, shape: shape as "triangles" | "squares" | "hexagons" })}
              className={`px-2 py-2 text-xs font-semibold rounded border-2 transition-colors ${
                params.shape === shape
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-foreground/10 bg-muted text-muted-foreground"
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      {/* Offset */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Offset</label>
          <span className="text-xs font-mono text-primary">{params.offset.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={params.offset}
          onChange={(e) => setParams({ ...params, offset: Number(e.target.value) })}
          className="w-full h-2 bg-muted rounded accent-primary"
        />
      </div>

      {/* Gutter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gutter</label>
          <span className="text-xs font-mono text-primary">{params.gutter}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={params.gutter}
          onChange={(e) => setParams({ ...params, gutter: Number(e.target.value) })}
          className="w-full h-2 bg-muted rounded accent-primary"
        />
      </div>

      {/* Fill Mode */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Fill Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {["solid", "random", "gradient"].map((mode) => (
            <button
              key={mode}
              onClick={() => setParams({ ...params, fillMode: mode as "solid" | "random" | "gradient" })}
              className={`px-2 py-2 text-xs font-semibold rounded border-2 transition-colors ${
                params.fillMode === mode
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-foreground/10 bg-muted text-muted-foreground"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Base Color */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Base Color</label>
        <ColorPicker value={params.baseColor} onChange={(color) => setParams({ ...params, baseColor: color })} />
      </div>
    </div>
  )
}
