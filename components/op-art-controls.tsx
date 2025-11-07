"use client"

import { ColorPicker } from "./retroui/ColorPicker"
import type { OpArtParams } from "@/app/page"

interface OpArtControlsProps {
  params: OpArtParams
  setParams: (params: OpArtParams) => void
}

export function OpArtControls({ params, setParams }: OpArtControlsProps) {
  return (
    <div className="space-y-4">
      {/* Pattern */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Pattern</label>
        <div className="grid grid-cols-3 gap-2">
          {["sine-wave", "warped-grid", "checkered"].map((pattern) => (
            <button
              key={pattern}
              onClick={() => setParams({ ...params, pattern: pattern as "sine-wave" | "warped-grid" | "checkered" })}
              className={`px-2 py-2 text-xs font-semibold rounded border-2 transition-colors ${
                params.pattern === pattern
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-foreground/10 bg-muted text-muted-foreground"
              }`}
            >
              {pattern.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frequency</label>
          <span className="text-xs font-mono text-primary">{params.frequency}</span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          value={params.frequency}
          onChange={(e) => setParams({ ...params, frequency: Number(e.target.value) })}
          className="w-full h-2 bg-muted rounded accent-primary"
        />
      </div>

      {/* Amplitude */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amplitude</label>
          <span className="text-xs font-mono text-primary">{params.amplitude}</span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          value={params.amplitude}
          onChange={(e) => setParams({ ...params, amplitude: Number(e.target.value) })}
          className="w-full h-2 bg-muted rounded accent-primary"
        />
      </div>

      {/* Color 1 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Color 1</label>
        <ColorPicker value={params.color1} onChange={(color) => setParams({ ...params, color1: color })} />
      </div>

      {/* Color 2 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Color 2</label>
        <ColorPicker value={params.color2} onChange={(color) => setParams({ ...params, color2: color })} />
      </div>

      {/* Color 3 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Color 3</label>
        <ColorPicker value={params.color3} onChange={(color) => setParams({ ...params, color3: color })} />
      </div>
    </div>
  )
}
