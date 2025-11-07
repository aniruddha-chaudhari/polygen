"use client"

import { useState, useCallback, useEffect } from "react"
import { ColorPicker } from "./retroui/ColorPicker"
import { Input } from "./retroui/Input"
import { Button } from "./retroui/Button"
import { X, Plus } from "lucide-react"
import type { ColorStop } from "@/app/page"

interface GradientColorStopsProps {
  colorStops: ColorStop[]
  setColorStops: (stops: ColorStop[]) => void
}

export function GradientColorStops({ colorStops, setColorStops }: GradientColorStopsProps) {
  const [previewGradient, setPreviewGradient] = useState("")

  // Update preview gradient whenever stops change
  const updatePreview = useCallback((stops: ColorStop[]) => {
    const gradient = stops
      .sort((a, b) => a.position - b.position)
      .map((stop) => `rgba(${hexToRgb(stop.color)}, ${stop.alpha}) ${stop.position}%`)
      .join(", ")
    setPreviewGradient(gradient)
  }, [])

  // Update preview when colorStops prop changes
  useEffect(() => {
    updatePreview(colorStops)
  }, [colorStops, updatePreview])

  const handleColorChange = (index: number, newColor: string) => {
    const newStops = [...colorStops]
    newStops[index].color = newColor
    setColorStops(newStops)
    updatePreview(newStops)
  }

  const handlePositionChange = (index: number, newPosition: number) => {
    const clampedPosition = Math.max(0, Math.min(100, newPosition))
    const newStops = [...colorStops]
    newStops[index].position = clampedPosition
    setColorStops(newStops)
    updatePreview(newStops)
  }

  const handleAlphaChange = (index: number, newAlpha: number) => {
    const clampedAlpha = Math.max(0, Math.min(1, newAlpha))
    const newStops = [...colorStops]
    newStops[index].alpha = clampedAlpha
    setColorStops(newStops)
    updatePreview(newStops)
  }

  const addColorStop = () => {
    if (colorStops.length < 5) {
      const newStop: ColorStop = {
        color: "#a78bfa",
        position: 50,
        alpha: 1,
      }
      const newStops = [...colorStops, newStop].sort((a, b) => a.position - b.position)
      setColorStops(newStops)
      updatePreview(newStops)
    }
  }

  const removeColorStop = (index: number) => {
    if (colorStops.length > 2) {
      const newStops = colorStops.filter((_, i) => i !== index)
      setColorStops(newStops)
      updatePreview(newStops)
    }
  }

  return (
    <div className="space-y-4">
      {/* Gradient Preview */}
      <div
        className="w-full h-12 rounded border-2 border-foreground/20"
        style={{
          background: `linear-gradient(to right, ${previewGradient})`,
        }}
      />

      {/* Color Stops List */}
      <div className="space-y-3">
        {colorStops.map((stop, index) => (
          <div key={index} className="space-y-2 p-3 bg-white rounded border border-foreground/10">
            {/* Color and Alpha */}
            <div className="flex gap-2 items-center">
              <ColorPicker value={stop.color} onChange={(color) => handleColorChange(index, color)} />
              <div className="flex-1">
                <Input
                  type="text"
                  value={stop.color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              {colorStops.length > 2 && (
                <Button onClick={() => removeColorStop(index)} variant="outline" size="icon" className="w-8 h-8">
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Position */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Position</label>
                <span className="text-xs font-mono text-primary">{stop.position}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={stop.position}
                onChange={(e) => handlePositionChange(index, Number(e.target.value))}
                className="w-full h-2 bg-background rounded accent-primary"
              />
            </div>

            {/* Alpha */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Alpha</label>
                <span className="text-xs font-mono text-primary">{Math.round(stop.alpha * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={stop.alpha}
                onChange={(e) => handleAlphaChange(index, Number(e.target.value))}
                className="w-full h-2 bg-background rounded accent-primary"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Stop Button */}
      {colorStops.length < 5 && (
        <Button
          onClick={addColorStop}
          variant="outline"
          className="w-full h-8 text-xs font-semibold uppercase tracking-wider bg-transparent"
        >
          <Plus className="w-3 h-3 mr-2" /> Add Stop
        </Button>
      )}
    </div>
  )
}

// Helper function to convert hex to rgb
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    const r = Number.parseInt(result[1], 16)
    const g = Number.parseInt(result[2], 16)
    const b = Number.parseInt(result[3], 16)
    return `${r}, ${g}, ${b}`
  }
  return "0, 0, 0"
}
