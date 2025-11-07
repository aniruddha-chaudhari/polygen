"use client"

import { Slider } from "@/components/retroui/Slider"
import { ColorPicker } from "@/components/retroui/ColorPicker"
import type { StrangeAttractorParams } from "@/app/page"
import { Select } from "@/components/retroui/Select"
import { StrangeAttractors } from "@/lib/attractor-equations"

interface StrangeAttractorControlsProps {
  params: StrangeAttractorParams
  setParams: (params: StrangeAttractorParams) => void
}

export function StrangeAttractorControls({ params, setParams }: StrangeAttractorControlsProps) {
  const handleChange = (key: keyof StrangeAttractorParams, value: number | string) => {
    setParams({ ...params, [key]: value })
  }

  const handleTypeChange = (type: "lorenz" | "aizawa" | "dejong") => {
    const newParams = StrangeAttractors.getDefaultParams(type)
    setParams({
      ...params,
      type,
      a: newParams.a,
      b: newParams.b,
      c: newParams.c,
      d: newParams.d,
    })
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
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attractor Type</label>
        <Select
          value={params.type}
          onValueChange={(value) => handleTypeChange(value as "lorenz" | "aizawa" | "dejong")}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder="Select attractor type" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="lorenz">Lorenz (Butterfly)</Select.Item>
            <Select.Item value="aizawa">Aizawa (Spiral)</Select.Item>
            <Select.Item value="dejong">De Jong (Abstract)</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Dynamic parameter controls based on attractor type */}
      {params.type === "lorenz" && (
        <div className="space-y-4 border-t pt-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lorenz Parameters</label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">σ (Sigma)</label>
              <span className="text-xs font-mono text-primary">{params.a}</span>
            </div>
            <Slider
              value={[params.a]}
              onValueChange={([v]) => handleChange("a", v)}
              min={0}
              max={20}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ρ (Rho)</label>
              <span className="text-xs font-mono text-primary">{params.b}</span>
            </div>
            <Slider
              value={[params.b]}
              onValueChange={([v]) => handleChange("b", v)}
              min={0}
              max={50}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">β (Beta)</label>
              <span className="text-xs font-mono text-primary">{params.c}</span>
            </div>
            <Slider
              value={[params.c]}
              onValueChange={([v]) => handleChange("c", v)}
              min={0}
              max={5}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>
      )}

      {params.type === "aizawa" && (
        <div className="space-y-4 border-t pt-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aizawa Parameters</label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">a</label>
              <span className="text-xs font-mono text-primary">{params.a.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.a]}
              onValueChange={([v]) => handleChange("a", v)}
              min={0.1}
              max={2}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">b</label>
              <span className="text-xs font-mono text-primary">{params.b.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.b]}
              onValueChange={([v]) => handleChange("b", v)}
              min={0.1}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">c</label>
              <span className="text-xs font-mono text-primary">{params.c.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.c]}
              onValueChange={([v]) => handleChange("c", v)}
              min={0.1}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">d</label>
              <span className="text-xs font-mono text-primary">{params.d.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.d]}
              onValueChange={([v]) => handleChange("d", v)}
              min={1}
              max={5}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>
      )}

      {params.type === "dejong" && (
        <div className="space-y-4 border-t pt-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">De Jong Parameters</label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">a</label>
              <span className="text-xs font-mono text-primary">{params.a.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.a]}
              onValueChange={([v]) => handleChange("a", v)}
              min={-3}
              max={3}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">b</label>
              <span className="text-xs font-mono text-primary">{params.b.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.b]}
              onValueChange={([v]) => handleChange("b", v)}
              min={-3}
              max={3}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">c</label>
              <span className="text-xs font-mono text-primary">{params.c.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.c]}
              onValueChange={([v]) => handleChange("c", v)}
              min={-3}
              max={3}
              step={0.01}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">d</label>
              <span className="text-xs font-mono text-primary">{params.d.toFixed(2)}</span>
            </div>
            <Slider
              value={[params.d]}
              onValueChange={([v]) => handleChange("d", v)}
              min={-3}
              max={3}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>
      )}

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
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color</label>
        <ColorPicker
          value={params.color}
          onChange={(color) => handleChange("color", color)}
        />
      </div>
    </div>
  )
}
