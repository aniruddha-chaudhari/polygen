"use client"

import { Slider } from "@/components/retroui/Slider"
import { Select } from "@/components/retroui/Select"
import { Switch } from "@/components/ui/switch"
import { GradientColorStops } from "@/components/gradient-color-stops"
import type { CirclePackingParams } from "@/app/page"

interface CirclePackingControlsProps {
  params: CirclePackingParams
  setParams: (params: CirclePackingParams) => void
}

export function CirclePackingControls({ params, setParams }: CirclePackingControlsProps) {
  const handleChange = (key: keyof CirclePackingParams, value: number | boolean | string | typeof params.colorPalette) => {
    setParams({ ...params, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Packing Mode */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Packing Mode</label>
        <Select
          value={params.packingMode}
          onValueChange={(value: CirclePackingParams["packingMode"]) => handleChange("packingMode", value)}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder="Select packing mode" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="random">Random Sizes</Select.Item>
            <Select.Item value="grow-from-center">Grow from Center</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Max Circles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Circles</label>
          <span className="text-xs font-mono text-primary">{params.maxCircles}</span>
        </div>
        <Slider
          value={[params.maxCircles]}
          onValueChange={([v]) => handleChange("maxCircles", v)}
          min={50}
          max={2000}
          step={50}
          className="w-full"
        />
      </div>

      {/* Padding */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Padding</label>
          <span className="text-xs font-mono text-primary">{params.padding}</span>
        </div>
        <Slider
          value={[params.padding]}
          onValueChange={([v]) => handleChange("padding", v)}
          min={0}
          max={10}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Show Fill */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Show Fill</label>
        <Switch
          checked={params.showFill}
          onCheckedChange={(checked) => handleChange("showFill", checked)}
        />
      </div>

      {/* Show Stroke */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Show Stroke</label>
        <Switch
          checked={params.showStroke}
          onCheckedChange={(checked) => handleChange("showStroke", checked)}
        />
      </div>

      {/* Fill Color */}
      {params.showFill && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fill Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={params.fillColor}
              onChange={(e) => handleChange("fillColor", e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <span className="text-xs font-mono text-primary">{params.fillColor}</span>
          </div>
        </div>
      )}

      {/* Stroke Color */}
      {params.showStroke && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stroke Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={params.strokeColor}
              onChange={(e) => handleChange("strokeColor", e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <span className="text-xs font-mono text-primary">{params.strokeColor}</span>
          </div>
        </div>
      )}

      {/* Color Palette */}
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