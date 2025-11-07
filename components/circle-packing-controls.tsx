"use client"

import { ColorPicker } from "./retroui/ColorPicker"
import type { CirclePackingParams } from "@/app/page"

interface CirclePackingControlsProps {
  params: CirclePackingParams
  setParams: (params: CirclePackingParams) => void
}

export function CirclePackingControls({ params, setParams }: CirclePackingControlsProps) {
  return (
    <div className="space-y-4">
      {/* Packing Mode */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Packing Mode
        </label>
        <div className="flex gap-2">
          {["random", "grow-from-center"].map((mode) => (
            <button
              key={mode}
              onClick={() => setParams({ ...params, packingMode: mode as "random" | "grow-from-center" })}
              className={`flex-1 px-2 py-2 text-xs font-semibold rounded border-2 transition-colors ${
                params.packingMode === mode
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-foreground/10 bg-muted text-muted-foreground"
              }`}
            >
              {mode.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Max Circles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Circles</label>
          <span className="text-xs font-mono text-primary">{params.maxCircles}</span>
        </div>
        <input
          type="range"
          min="50"
          max="2000"
          step="50"
          value={params.maxCircles}
          onChange={(e) => setParams({ ...params, maxCircles: Number(e.target.value) })}
          className="w-full h-2 bg-muted rounded accent-primary"
        />
      </div>

      {/* Padding */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Padding</label>
          <span className="text-xs font-mono text-primary">{params.padding}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={params.padding}
          onChange={(e) => setParams({ ...params, padding: Number(e.target.value) })}
          className="w-full h-2 bg-muted rounded accent-primary"
        />
      </div>

      {/* Show Fill */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Show Fill</label>
          <input
            type="checkbox"
            checked={params.showFill}
            onChange={(e) => setParams({ ...params, showFill: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
        </div>
      </div>

      {/* Show Stroke */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Show Stroke</label>
          <input
            type="checkbox"
            checked={params.showStroke}
            onChange={(e) => setParams({ ...params, showStroke: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
        </div>
      </div>

      {/* Fill Color */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Fill Color</label>
        <ColorPicker value={params.fillColor} onChange={(color) => setParams({ ...params, fillColor: color })} />
      </div>

      {/* Stroke Color */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Stroke Color
        </label>
        <ColorPicker value={params.strokeColor} onChange={(color) => setParams({ ...params, strokeColor: color })} />
      </div>
    </div>
  )
}
