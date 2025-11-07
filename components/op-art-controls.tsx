"use client"

import { Slider } from "@/components/retroui/Slider"
import { Select } from "@/components/retroui/Select"
import type { OpArtParams } from "@/app/page"

interface OpArtControlsProps {
  params: OpArtParams
  setParams: (params: OpArtParams) => void
}

export function OpArtControls({ params, setParams }: OpArtControlsProps) {
  const handleChange = (key: keyof OpArtParams, value: number | string) => {
    setParams({ ...params, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Pattern */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pattern</label>
        <Select
          value={params.pattern}
          onValueChange={(value: OpArtParams["pattern"]) => handleChange("pattern", value)}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder="Select pattern" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="sine-wave">Sine Wave Lines</Select.Item>
            <Select.Item value="checkered">Checkered</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Frequency */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frequency</label>
          <span className="text-xs font-mono text-primary">{params.frequency}</span>
        </div>
        <Slider
          value={[params.frequency]}
          onValueChange={([v]) => handleChange("frequency", v)}
          min={5}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Amplitude */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amplitude</label>
          <span className="text-xs font-mono text-primary">{params.amplitude}</span>
        </div>
        <Slider
          value={[params.amplitude]}
          onValueChange={([v]) => handleChange("amplitude", v)}
          min={5}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Color 1 */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color 1</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={params.color1}
            onChange={(e) => handleChange("color1", e.target.value)}
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <span className="text-xs font-mono text-primary">{params.color1}</span>
        </div>
      </div>

      {/* Color 2 */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color 2</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={params.color2}
            onChange={(e) => handleChange("color2", e.target.value)}
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <span className="text-xs font-mono text-primary">{params.color2}</span>
        </div>
      </div>

      {/* Color 3 */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color 3</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={params.color3}
            onChange={(e) => handleChange("color3", e.target.value)}
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <span className="text-xs font-mono text-primary">{params.color3}</span>
        </div>
      </div>
    </div>
  )
}