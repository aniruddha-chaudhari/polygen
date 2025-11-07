"use client"
import type { ChaosGameParams } from "@/app/page"
import { Slider } from "@/components/ui/slider"

interface ChaosGameControlsProps {
  params: ChaosGameParams
  setParams: (params: ChaosGameParams) => void
}

export function ChaosGameControls({ params, setParams }: ChaosGameControlsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Polygon Sides</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[params.sides]}
            onValueChange={(val) => setParams({ ...params, sides: val[0] })}
            min={3}
            max={12}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-mono w-8 text-right">{params.sides}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Jump Ratio</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[params.jumpRatio * 100]}
            onValueChange={(val) => setParams({ ...params, jumpRatio: val[0] / 100 })}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-mono w-12 text-right">{(params.jumpRatio * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Point Density</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[Math.log(params.pointDensity)]}
            onValueChange={(val) => setParams({ ...params, pointDensity: Math.exp(val[0]) })}
            min={Math.log(1000)}
            max={Math.log(100000)}
            step={0.1}
            className="flex-1"
          />
          <span className="text-sm font-mono w-16 text-right">{Math.round(params.pointDensity)}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Point Color</label>
        <input
          type="color"
          value={params.pointColor}
          onChange={(e) => setParams({ ...params, pointColor: e.target.value })}
          className="w-full h-10 border-2 border-border rounded cursor-pointer"
        />
      </div>
    </div>
  )
}
