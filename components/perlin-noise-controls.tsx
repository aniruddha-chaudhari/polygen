"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { PerlinNoiseParams } from "@/app/page"
import { GradientColorStops } from "./gradient-color-stops"

interface PerlinNoiseControlsProps {
  params: PerlinNoiseParams
  setParams: (params: PerlinNoiseParams) => void
}

export function PerlinNoiseControls({ params, setParams }: PerlinNoiseControlsProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="scale" className="text-xs font-bold uppercase tracking-wider">
          Scale: {params.scale.toFixed(2)}
        </Label>
        <Slider
          id="scale"
          min={0.1}
          max={10}
          step={0.1}
          value={[params.scale]}
          onValueChange={(value) => setParams({ ...params, scale: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="octaves" className="text-xs font-bold uppercase tracking-wider">
          Octaves: {params.octaves}
        </Label>
        <Slider
          id="octaves"
          min={1}
          max={8}
          step={1}
          value={[params.octaves]}
          onValueChange={(value) => setParams({ ...params, octaves: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="threshold" className="text-xs font-bold uppercase tracking-wider">
          Threshold: {params.threshold.toFixed(2)}
        </Label>
        <Slider
          id="threshold"
          min={0}
          max={1}
          step={0.01}
          value={[params.threshold]}
          onValueChange={(value) => setParams({ ...params, threshold: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label className="text-xs font-bold uppercase tracking-wider mb-3 block">Color Palette</Label>
        <GradientColorStops
          colorStops={params.colorPalette}
          onChange={(stops) => setParams({ ...params, colorPalette: stops })}
        />
      </div>
    </div>
  )
}
