"use client"

import { Slider } from "@/components/retroui/Slider"
import { Select } from "@/components/retroui/Select"
import { GradientColorStops } from "@/components/gradient-color-stops"
import type { TessellationParams } from "@/app/page"

interface TessellationControlsProps {
  params: TessellationParams
  setParams: (params: TessellationParams) => void
}

export function TessellationControls({ params, setParams }: TessellationControlsProps) {
  const handleChange = (key: keyof TessellationParams, value: number | string | typeof params.colorPalette) => {
    setParams({ ...params, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Shape */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shape</label>
        <Select
          value={params.shape}
          onValueChange={(value: TessellationParams["shape"]) => handleChange("shape", value)}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder="Select shape" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="triangles">Triangles</Select.Item>
            <Select.Item value="hexagons">Hexagons</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Offset */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Offset</label>
          <span className="text-xs font-mono text-primary">{params.offset.toFixed(2)}</span>
        </div>
        <Slider
          value={[params.offset]}
          onValueChange={([v]) => handleChange("offset", v)}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* Gutter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gutter</label>
          <span className="text-xs font-mono text-primary">{params.gutter}</span>
        </div>
        <Slider
          value={[params.gutter]}
          onValueChange={([v]) => handleChange("gutter", v)}
          min={0}
          max={20}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Fill Mode */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fill Mode</label>
        <Select
          value={params.fillMode}
          onValueChange={(value: TessellationParams["fillMode"]) => handleChange("fillMode", value)}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder="Select fill mode" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="solid">Solid</Select.Item>
            <Select.Item value="random">Random Color</Select.Item>
            <Select.Item value="gradient">Gradient</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Base Color */}
      {params.fillMode === "solid" && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={params.baseColor}
              onChange={(e) => handleChange("baseColor", e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <span className="text-xs font-mono text-primary">{params.baseColor}</span>
          </div>
        </div>
      )}

      {/* Color Palette */}
      {(params.fillMode === "random" || params.fillMode === "gradient") && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color Palette</label>
          <GradientColorStops
            colorStops={params.colorPalette}
            setColorStops={(palette) => handleChange("colorPalette", palette)}
          />
        </div>
      )}
    </div>
  )
}