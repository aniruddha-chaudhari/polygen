"use client"

import type { FlameParams } from "@/app/page"
import { Slider } from "@/components/ui/slider"

interface FlameControlsProps {
  params: FlameParams
  setParams: (params: FlameParams) => void
}

const functionSets = ["Sinusoidal", "Spherical", "Swirl", "Horseshoe", "Polar", "Handkerchief"]

export function FlameControls({ params, setParams }: FlameControlsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Function Set</label>
        <select
          value={params.functionSet}
          onChange={(e) => setParams({ ...params, functionSet: e.target.value })}
          className="w-full mt-2 p-2 border-2 border-border rounded bg-secondary"
        >
          {functionSets.map((fn) => (
            <option key={fn} value={fn}>
              {fn}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Gamma</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[params.gamma * 10]}
            onValueChange={(val) => setParams({ ...params, gamma: val[0] / 10 })}
            min={5}
            max={30}
            step={0.5}
            className="flex-1"
          />
          <span className="text-sm font-mono w-8 text-right">{params.gamma.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}
