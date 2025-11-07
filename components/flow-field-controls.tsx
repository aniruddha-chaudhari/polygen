"use client"

import { Slider } from "@/components/retroui/Slider"
import type { FlowFieldParams } from "@/app/page"

interface FlowFieldControlsProps {
  params: FlowFieldParams
  setParams: (params: FlowFieldParams) => void
}

export function FlowFieldControls({ params, setParams }: FlowFieldControlsProps) {
  const handleChange = (key: keyof FlowFieldParams, value: number) => {
    setParams({ ...params, [key]: value })
  }

  const handleParticleCountChange = (values: number[]) => {
    const sliderValue = values[0]
    // Use step-based mapping to avoid precision issues
    const steps = [100, 200, 500, 1000, 2000, 5000, 10000]
    const count = steps[Math.min(sliderValue, steps.length - 1)] || 10000
    setParams({ ...params, particleCount: count })
  }

  const handleStepLengthChange = (values: number[]) => {
    const sliderValue = values[0]
    // Use step-based mapping
    const steps = [50, 100, 200, 300, 500, 750, 1000]
    const length = steps[Math.min(sliderValue, steps.length - 1)] || 1000
    setParams({ ...params, stepLength: length })
  }

  // Map particle count to slider step (0-6)
  const particleSteps = [100, 200, 500, 1000, 2000, 5000, 10000]
  const particleSliderValue = particleSteps.indexOf(params.particleCount)
  const safeParticleSliderValue = particleSliderValue === -1 ? 3 : particleSliderValue

  // Map step length to slider step (0-6)
  const stepSteps = [50, 100, 200, 300, 500, 750, 1000]
  const stepSliderValue = stepSteps.indexOf(params.stepLength)
  const safeStepSliderValue = stepSliderValue === -1 ? 1 : stepSliderValue

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Particle Count</label>
          <span className="text-xs font-mono text-primary">{params.particleCount.toLocaleString()}</span>
        </div>
        <Slider
          value={[safeParticleSliderValue]}
          onValueChange={handleParticleCountChange}
          min={0}
          max={6}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Noise Scale</label>
          <span className="text-xs font-mono text-primary">{params.noiseScale.toFixed(3)}</span>
        </div>
        <Slider
          value={[params.noiseScale]}
          onValueChange={([v]) => handleChange("noiseScale", v)}
          min={0.001}
          max={0.1}
          step={0.001}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step Length</label>
          <span className="text-xs font-mono text-primary">{params.stepLength}</span>
        </div>
        <Slider
          value={[safeStepSliderValue]}
          onValueChange={handleStepLengthChange}
          min={0}
          max={6}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Line Weight</label>
          <span className="text-xs font-mono text-primary">{params.lineWeight}</span>
        </div>
        <Slider
          value={[params.lineWeight]}
          onValueChange={([v]) => handleChange("lineWeight", v)}
          min={0.5}
          max={5}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opacity</label>
          <span className="text-xs font-mono text-primary">{params.opacity.toFixed(2)}</span>
        </div>
        <Slider
          value={[params.opacity]}
          onValueChange={([v]) => handleChange("opacity", v)}
          min={0.1}
          max={1.0}
          step={0.01}
          className="w-full"
        />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Flow Fields:</strong> Particles follow invisible Perlin noise vectors</p>
        <p>• Lower noise scale = smoother curves</p>
        <p>• Higher step length = longer particle paths</p>
        <p>• More particles = denser visualization</p>
      </div>
    </div>
  )
}
