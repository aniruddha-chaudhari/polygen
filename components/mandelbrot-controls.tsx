"use client"

import { Slider } from "@/components/retroui/Slider"
import { Input } from "@/components/retroui/Input"
import { GradientColorStops } from "@/components/gradient-color-stops"
import type { MandelbrotParams } from "@/app/page"
import { Select } from "@/components/retroui/Select"

interface MandelbrotControlsProps {
  params: MandelbrotParams
  setParams: (params: MandelbrotParams) => void
}

export function MandelbrotControls({ params, setParams }: MandelbrotControlsProps) {
  const handleChange = (key: keyof MandelbrotParams, value: number | boolean | typeof params.colorPalette) => {
    setParams({ ...params, [key]: value })
  }

  // Convert logarithmic scale for zoom (unlimited)
  const logZoom = Math.log10(Math.max(0.001, params.zoom)) // Prevent log(0)
  const minLogZoom = Math.log10(0.001) // Much smaller minimum
  const maxLogZoom = Math.log10(1000000) // Much larger maximum

  const handleZoomChange = (values: number[]) => {
    const logValue = values[0]
    const linearValue = Math.pow(10, logValue)
    handleChange("zoom", linearValue)
  }

  const handlePanChange = (axis: 'panX' | 'panY', value: string) => {
    const numValue = parseFloat(value) || 0
    handleChange(axis, numValue)
  }

  return (
    <div className="space-y-6">
      {/* Set Type Toggle */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Set Type</label>
        <Select
          value={params.isJuliaSet ? "julia" : "mandelbrot"}
          onValueChange={(value) => handleChange("isJuliaSet", value === "julia")}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder="Select set type" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="mandelbrot">Mandelbrot Set</Select.Item>
            <Select.Item value="julia">Julia Set</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Zoom Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zoom</label>
          <span className="text-xs font-mono text-primary">{params.zoom.toFixed(2)}x</span>
        </div>
        <Slider
          value={[logZoom]}
          onValueChange={handleZoomChange}
          min={minLogZoom}
          max={maxLogZoom}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Pan Controls */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pan Position</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">X</label>
            <Input
              type="number"
              value={params.panX}
              onChange={(e) => handlePanChange('panX', e.target.value)}
              step="0.01"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Y</label>
            <Input
              type="number"
              value={params.panY}
              onChange={(e) => handlePanChange('panY', e.target.value)}
              step="0.01"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Iterations Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Iterations</label>
          <span className="text-xs font-mono text-primary">
            {params.iterations}
            {params.zoom > 1 && (
              <span className="text-muted-foreground">
                → {Math.min(1000, Math.max(params.iterations, Math.floor(params.iterations * (1 + Math.log10(params.zoom + 1)))))} dynamic
              </span>
            )}
          </span>
        </div>
        <Slider
          value={[params.iterations]}
          onValueChange={([v]) => handleChange("iterations", v)}
          min={10}
          max={500}
          step={10}
          className="w-full"
        />
        {params.zoom > 1 && (
          <div className="text-xs text-muted-foreground">
            Higher zoom levels automatically increase iterations for better detail
          </div>
        )}
      </div>

      {/* Julia Seed Controls (only visible when Julia set is selected) */}
      {params.isJuliaSet && (
        <div className="space-y-4 border-t pt-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Julia Seed</label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">X</label>
              <span className="text-xs font-mono text-primary">{params.juliaSeedX.toFixed(4)}</span>
            </div>
            <Slider
              value={[params.juliaSeedX]}
              onValueChange={([v]) => handleChange("juliaSeedX", v)}
              min={-2}
              max={2}
              step={0.001}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Y</label>
              <span className="text-xs font-mono text-primary">{params.juliaSeedY.toFixed(4)}</span>
            </div>
            <Slider
              value={[params.juliaSeedY]}
              onValueChange={([v]) => handleChange("juliaSeedY", v)}
              min={-2}
              max={2}
              step={0.001}
              className="w-full"
            />
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
