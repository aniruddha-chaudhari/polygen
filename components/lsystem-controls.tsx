"use client"

import type { LSystemParams } from "@/app/page"
import { Slider } from "@/components/ui/slider"

interface LSystemControlsProps {
  params: LSystemParams
  setParams: (params: LSystemParams) => void
}

const presets = ["Fern", "Tree", "Koch Curve", "Dragon Curve", "Sierpinski Triangle"]

export function LSystemControls({ params, setParams }: LSystemControlsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Preset</label>
        <select
          value={params.preset}
          onChange={(e) => setParams({ ...params, preset: e.target.value })}
          className="w-full mt-2 p-2 border-2 border-border rounded bg-secondary"
        >
          {presets.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Iteration</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[params.iteration]}
            onValueChange={(val) => setParams({ ...params, iteration: val[0] })}
            min={1}
            max={8}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-mono w-8 text-right">{params.iteration}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Angle (°)</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[params.angle]}
            onValueChange={(val) => setParams({ ...params, angle: val[0] })}
            min={0}
            max={90}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-mono w-12 text-right">{params.angle}°</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Line Weight</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[params.lineWeight]}
            onValueChange={(val) => setParams({ ...params, lineWeight: val[0] })}
            min={1}
            max={5}
            step={0.5}
            className="flex-1"
          />
          <span className="text-sm font-mono w-8 text-right">{params.lineWeight.toFixed(1)}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Line Color</label>
        <input
          type="color"
          value={params.lineColor}
          onChange={(e) => setParams({ ...params, lineColor: e.target.value })}
          className="w-full h-10 border-2 border-border rounded cursor-pointer mt-2"
        />
      </div>
    </div>
  )
}
