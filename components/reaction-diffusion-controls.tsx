"use client"

import { Slider } from "@/components/retroui/Slider"
import type { ReactionDiffusionParams } from "@/app/page"
import { Select } from "@/components/retroui/Select"

interface ReactionDiffusionControlsProps {
  params: ReactionDiffusionParams
  setParams: (params: ReactionDiffusionParams) => void
}

export function ReactionDiffusionControls({ params, setParams }: ReactionDiffusionControlsProps) {
  const handleChange = (key: keyof ReactionDiffusionParams, value: number | string) => {
    setParams({ ...params, [key]: value })
  }

  const handlePresetChange = (preset: string) => {
    let newParams: Partial<ReactionDiffusionParams> = {}

    switch (preset) {
      case "spots":
        newParams = { preset: "spots", feedRate: 0.055, killRate: 0.062 }
        break
      case "stripes":
        newParams = { preset: "stripes", feedRate: 0.035, killRate: 0.065 }
        break
      case "labyrinth":
        newParams = { preset: "labyrinth", feedRate: 0.039, killRate: 0.058 }
        break
      case "worms":
        newParams = { preset: "worms", feedRate: 0.046, killRate: 0.063 }
        break
      case "spots-stripes":
        newParams = { preset: "spots-stripes", feedRate: 0.014, killRate: 0.054 }
        break
      case "moving-spots":
        newParams = { preset: "moving-spots", feedRate: 0.062, killRate: 0.061 }
        break
    }

    setParams({ ...params, ...newParams })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pattern Preset</label>
        <Select
          value={params.preset}
          onValueChange={handlePresetChange}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder="Select preset" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="spots">Spots (Turing)</Select.Item>
            <Select.Item value="stripes">Stripes (Zebra)</Select.Item>
            <Select.Item value="labyrinth">Labyrinth</Select.Item>
            <Select.Item value="worms">Worms</Select.Item>
            <Select.Item value="spots-stripes">Spots & Stripes</Select.Item>
            <Select.Item value="moving-spots">Moving Spots</Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feed Rate</label>
          <span className="text-xs font-mono text-primary">{params.feedRate.toFixed(4)}</span>
        </div>
        <Slider
          value={[params.feedRate]}
          onValueChange={([v]) => handleChange("feedRate", v)}
          min={0.01}
          max={0.1}
          step={0.001}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kill Rate</label>
          <span className="text-xs font-mono text-primary">{params.killRate.toFixed(4)}</span>
        </div>
        <Slider
          value={[params.killRate]}
          onValueChange={([v]) => handleChange("killRate", v)}
          min={0.04}
          max={0.07}
          step={0.001}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Speed</label>
          <span className="text-xs font-mono text-primary">{params.speed.toFixed(2)}x</span>
        </div>
        <Slider
          value={[params.speed]}
          onValueChange={([v]) => handleChange("speed", v)}
          min={0.1}
          max={2.0}
          step={0.1}
          className="w-full"
        />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Reaction-Diffusion:</strong> Two chemicals react and diffuse</p>
        <p>• Feed rate controls chemical A production</p>
        <p>• Kill rate controls chemical B production</p>
        <p>• Different ratios create various patterns</p>
        <p>• Speed controls simulation iterations per frame</p>
      </div>
    </div>
  )
}