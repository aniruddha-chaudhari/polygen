"use client"

import { Slider } from "@/components/retroui/Slider"
import { GradientColorStops } from "@/components/gradient-color-stops"
import type { PerlinNoiseParams } from "@/app/page"

interface PerlinNoiseControlsProps {
  params: PerlinNoiseParams
  setParams: (params: PerlinNoiseParams) => void
}

export function PerlinNoiseControls({ params, setParams }: PerlinNoiseControlsProps) {
  const handleChange = (key: keyof PerlinNoiseParams, value: number | typeof params.colorPalette) => {
    setParams({ ...params, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scale</label>
          <span className="text-xs font-mono text-primary">{params.scale.toFixed(2)}</span>
        </div>
        <Slider
          value={[params.scale]}
          onValueChange={([v]) => handleChange("scale", v)}
          min={0.1}
          max={10}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Octaves</label>
          <span className="text-xs font-mono text-primary">{params.octaves}</span>
        </div>
        <Slider
          value={[params.octaves]}
          onValueChange={([v]) => handleChange("octaves", Math.round(v))}
          min={1}
          max={8}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Threshold</label>
          <span className="text-xs font-mono text-primary">{params.threshold.toFixed(2)}</span>
        </div>
        <Slider
          value={[params.threshold]}
          onValueChange={([v]) => handleChange("threshold", v)}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color Palette</label>
        <GradientColorStops
          colorStops={params.colorPalette}
          setColorStops={(palette) => handleChange("colorPalette", palette)}
        />
      </div>
    </div>
  )
}