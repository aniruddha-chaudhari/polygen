"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { FlowFieldParams } from "@/app/page"

interface FlowFieldControlsProps {
  params: FlowFieldParams
  setParams: (params: FlowFieldParams) => void
}

export function FlowFieldControls({ params, setParams }: FlowFieldControlsProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="particles" className="text-xs font-bold uppercase tracking-wider">
          Particle Count: {params.particleCount}
        </Label>
        <Slider
          id="particles"
          min={100}
          max={5000}
          step={100}
          value={[params.particleCount]}
          onValueChange={(value) => setParams({ ...params, particleCount: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="noise-scale" className="text-xs font-bold uppercase tracking-wider">
          Noise Scale: {params.noiseScale.toFixed(4)}
        </Label>
        <Slider
          id="noise-scale"
          min={0.001}
          max={0.1}
          step={0.001}
          value={[params.noiseScale]}
          onValueChange={(value) => setParams({ ...params, noiseScale: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="step" className="text-xs font-bold uppercase tracking-wider">
          Step Length: {params.stepLength}
        </Label>
        <Slider
          id="step"
          min={50}
          max={1000}
          step={10}
          value={[params.stepLength]}
          onValueChange={(value) => setParams({ ...params, stepLength: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="line-weight" className="text-xs font-bold uppercase tracking-wider">
          Line Weight: {params.lineWeight.toFixed(1)}
        </Label>
        <Slider
          id="line-weight"
          min={0.5}
          max={5}
          step={0.1}
          value={[params.lineWeight]}
          onValueChange={(value) => setParams({ ...params, lineWeight: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="opacity" className="text-xs font-bold uppercase tracking-wider">
          Opacity: {params.opacity.toFixed(2)}
        </Label>
        <Slider
          id="opacity"
          min={0.1}
          max={1.0}
          step={0.05}
          value={[params.opacity]}
          onValueChange={(value) => setParams({ ...params, opacity: value[0] })}
          className="w-full"
        />
      </div>
    </div>
  )
}
