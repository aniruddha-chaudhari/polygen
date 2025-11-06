"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface GradientControlsProps {
  colors: string[]
  setColors: (colors: string[]) => void
}

export function GradientControls({ colors, setColors }: GradientControlsProps) {
  const [gradientAngle, setGradientAngle] = useState(135)

  return (
    <div className="space-y-6">
      {/* Color stops */}
      {[0, 1].map((index) => (
        <div key={index} className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {index === 0 ? "Start" : "End"} Color
          </Label>
          <div className="flex gap-3 items-center">
            <div className="relative group">
              <input
                type="color"
                value={colors[index]}
                onChange={(e) => {
                  const newColors = [...colors]
                  newColors[index] = e.target.value
                  setColors(newColors)
                }}
                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-border hover:border-primary transition-colors"
              />
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-primary/10 transition-opacity" />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                value={colors[index]}
                onChange={(e) => {
                  const newColors = [...colors]
                  newColors[index] = e.target.value
                  setColors(newColors)
                }}
                className="h-9 text-sm font-mono bg-muted text-foreground border-border"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Gradient angle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Angle</Label>
          <span className="text-xs font-mono text-primary">{gradientAngle}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={gradientAngle}
          onChange={(e) => setGradientAngle(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Live preview */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</Label>
        <div
          className="w-full h-32 rounded-lg border-2 border-border shadow-lg"
          style={{
            background: `linear-gradient(${gradientAngle}deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
          }}
        />
      </div>
    </div>
  )
}
