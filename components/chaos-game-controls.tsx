"use client"

import { Slider } from "@/components/retroui/Slider"
import { ColorPicker } from "@/components/retroui/ColorPicker"
import type { ChaosGameParams } from "@/app/page"

interface ChaosGameControlsProps {
  params: ChaosGameParams
  setParams: (params: ChaosGameParams) => void
}

export function ChaosGameControls({ params, setParams }: ChaosGameControlsProps) {
  const handleChange = (key: string, value: number | string) => {
    setParams({ ...params, [key]: value })
  }

  const handlePointDensityChange = (values: number[]) => {
    const sliderValue = values[0]
    // Use step-based mapping to avoid precision issues
    const steps = [1000, 2000, 5000, 10000, 20000, 50000, 100000]
    const density = steps[Math.min(sliderValue, steps.length - 1)] || 100000
    setParams({ ...params, pointDensity: density })
  }

  // Map point density to slider step (0-6)
  const steps = [1000, 2000, 5000, 10000, 20000, 50000, 100000]
  const sliderValue = steps.indexOf(params.pointDensity)
  const safeSliderValue = sliderValue === -1 ? 6 : sliderValue

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Polygon Sides</label>
          <span className="text-xs font-mono text-primary">{params.sides}</span>
        </div>
        <Slider
          value={[Math.max(3, Math.min(12, params.sides || 6))]}
          onValueChange={([v]) => handleChange("sides", v)}
          min={3}
          max={12}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jump Ratio</label>
          <span className="text-xs font-mono text-primary">{params.jumpRatio.toFixed(2)}</span>
        </div>
        <Slider
          value={[params.jumpRatio]}
          onValueChange={([v]) => handleChange("jumpRatio", v)}
          min={0.1}
          max={0.9}
          step={0.01}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Point Density</label>
          <span className="text-xs font-mono text-primary">{params.pointDensity.toLocaleString()}</span>
        </div>
        <Slider
          value={[safeSliderValue]}
          onValueChange={handlePointDensityChange}
          min={0}
          max={6}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Point Color</label>
        <ColorPicker
          value={params.pointColor}
          onChange={(color) => handleChange("pointColor", color)}
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Background Color</label>
        <ColorPicker
          value={params.bgColor}
          onChange={(color) => handleChange("bgColor", color)}
        />
      </div>
    </div>
  )
}
