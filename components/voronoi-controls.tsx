"use client"

import { ColorPicker } from "./retroui/ColorPicker"
import type { VoronoiParams } from "@/app/page"

interface VoronoiControlsProps {
  params: VoronoiParams
  setParams: (params: VoronoiParams) => void
}

export function VoronoiControls({ params, setParams }: VoronoiControlsProps) {
  return (
    <div className="space-y-4">
      {/* Point Count */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</label>
          <span className="text-xs font-mono text-primary">{params.pointCount}</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          value={params.pointCount}
          onChange={(e) => setParams({ ...params, pointCount: Number(e.target.value) })}
          className="w-full h-2 bg-muted rounded accent-primary"
        />
      </div>

      {/* Layout */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Layout</label>
        <div className="grid grid-cols-3 gap-2">
          {["random", "grid", "grid-jittered"].map((layout) => (
            <button
              key={layout}
              onClick={() => setParams({ ...params, layout: layout as "random" | "grid" | "grid-jittered" })}
              className={`px-2 py-2 text-xs font-semibold rounded border-2 transition-colors ${
                params.layout === layout
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-foreground/10 bg-muted text-muted-foreground"
              }`}
            >
              {layout.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Fill Cells */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fill Cells</label>
          <input
            type="checkbox"
            checked={params.fillCells}
            onChange={(e) => setParams({ ...params, fillCells: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
        </div>
      </div>

      {/* Show Borders */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Show Borders</label>
          <input
            type="checkbox"
            checked={params.showBorders}
            onChange={(e) => setParams({ ...params, showBorders: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
        </div>
      </div>

      {/* Line Weight */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Line Weight</label>
          <span className="text-xs font-mono text-primary">{params.lineWeight}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={params.lineWeight}
          onChange={(e) => setParams({ ...params, lineWeight: Number(e.target.value) })}
          className="w-full h-2 bg-muted rounded accent-primary"
        />
      </div>

      {/* Border Color */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Border Color
        </label>
        <ColorPicker value={params.borderColor} onChange={(color) => setParams({ ...params, borderColor: color })} />
      </div>

      {/* Distance Metric */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Distance Metric
        </label>
        <div className="flex gap-2">
          {["euclidean", "manhattan"].map((metric) => (
            <button
              key={metric}
              onClick={() => setParams({ ...params, distanceMetric: metric as "euclidean" | "manhattan" })}
              className={`flex-1 px-2 py-2 text-xs font-semibold rounded border-2 transition-colors ${
                params.distanceMetric === metric
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-foreground/10 bg-muted text-muted-foreground"
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      {/* Color Mode */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Color Mode</label>
        <div className="flex gap-2">
          {["random", "distance"].map((mode) => (
            <button
              key={mode}
              onClick={() => setParams({ ...params, colorMode: mode as "random" | "distance" })}
              className={`flex-1 px-2 py-2 text-xs font-semibold rounded border-2 transition-colors ${
                params.colorMode === mode
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-foreground/10 bg-muted text-muted-foreground"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
