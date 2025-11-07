"use client"
import { Input } from "@/components/retroui/Input"
import { ColorPicker } from "@/components/retroui/ColorPicker"
import { useState, useEffect, useCallback } from "react"

// Helper function to validate if a string is a valid CSS color
function isValidColor(color: string): boolean {
  if (!color || color.trim() === '') return false

  // Check if we're on the client side (browser environment)
  if (typeof window === 'undefined' || !document) return true

  // Create a temporary element to test the color
  const testElement = document.createElement('div')
  testElement.style.color = color
  return testElement.style.color !== ''
}

// Fallback colors for invalid inputs
const FALLBACK_COLORS = ['#a78bfa', '#ec4899']

interface GradientControlsProps {
  colors: string[]
  setColors: (colors: string[]) => void
  angle: number
  setAngle: (angle: number) => void
}

export function GradientControls({ colors, setColors, angle, setAngle }: GradientControlsProps) {
  // Local state for text inputs - allows typing without affecting parent state
  const [inputValues, setInputValues] = useState(colors)

  // Sync input values when colors prop changes
  useEffect(() => {
    setInputValues(colors)
  }, [colors])

  const handleColorChange = useCallback((index: number, newColor: string) => {
    // Only update state if the new color is valid
    if (isValidColor(newColor)) {
      const newColors = [...colors]
      newColors[index] = newColor
      setColors(newColors)
    }
  }, [colors, setColors])

  // Create stable callbacks for each color index
  const handleColor0Change = useCallback((color: string) => handleColorChange(0, color), [handleColorChange])
  const handleColor1Change = useCallback((color: string) => handleColorChange(1, color), [handleColorChange])

  const handleTextInputChange = (index: number, newValue: string) => {
    // Update local input state immediately
    const newInputValues = [...inputValues]
    newInputValues[index] = newValue
    setInputValues(newInputValues)

    // Only update parent state if valid
    if (isValidColor(newValue)) {
      const newColors = [...colors]
      newColors[index] = newValue
      setColors(newColors)
    }
  }

  // For display, use the current valid colors (don't change them until valid input)
  const displayColors = colors.map((color, index) =>
    isValidColor(color) ? color : FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  )

  return (
    <div className="space-y-6">
      {/* Color stops */}
      {[0, 1].map((index) => (
        <div key={index} className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            {index === 0 ? "Start" : "End"} Color
          </label>
          <div className="flex gap-3 items-center">
            <ColorPicker
              value={displayColors[index]}
              onChange={index === 0 ? handleColor0Change : handleColor1Change}
            />
            <div className="flex-1">
              <Input
                type="text"
                value={inputValues[index]}
                onChange={(e) => handleTextInputChange(index, e.target.value)}
                className="h-9 text-sm font-mono bg-muted text-foreground border-border"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Gradient angle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Angle</label>
          <span className="text-xs font-mono text-primary">{angle}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

    </div>
  )
}
