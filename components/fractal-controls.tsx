"use client"

import { Slider } from "@/components/retroui/Slider"

interface FractalControlsProps {
  params: any
  setParams: (params: any) => void
}

export function FractalControls({ params, setParams }: FractalControlsProps) {
  const handleChange = (key: string, value: number) => {
    setParams({ ...params, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sides</label>
          <span className="text-xs font-mono text-primary">{params.sides}</span>
        </div>
        <Slider
          value={[params.sides]}
          onValueChange={([v]) => handleChange("sides", v)}
          min={3}
          max={12}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Iterations</label>
          <span className="text-xs font-mono text-primary">{params.iterations}</span>
        </div>
        <Slider
          value={[params.iterations]}
          onValueChange={([v]) => handleChange("iterations", v)}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scale</label>
          <span className="text-xs font-mono text-primary">{params.scale.toFixed(2)}</span>
        </div>
        <Slider
          value={[params.scale]}
          onValueChange={([v]) => handleChange("scale", v)}
          min={0.1}
          max={3}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rotation</label>
          <span className="text-xs font-mono text-primary">{params.rotation.toFixed(0)}°</span>
        </div>
        <Slider
          value={[params.rotation]}
          onValueChange={([v]) => handleChange("rotation", v)}
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  )
}
