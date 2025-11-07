"use client"

import { useState, useCallback } from "react"
import { Popover } from "@/components/retroui/Popover"
import {
  ColorPicker as AdvancedColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "@/components/retroui/AdvancedColorPicker"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className = "" }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleColorChange = useCallback((color: string) => {
    onChange(color)
  }, [onChange])

  return (
    <Popover>
      <Popover.Trigger asChild>
        <button
          className={`w-14 h-14 cursor-pointer border-2 border-black hover:shadow-md transition-all hover:translate-y-1 active:translate-y-2 active:translate-x-1 ${className}`}
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(true)}
        />
      </Popover.Trigger>
      <Popover.Content className="w-80 p-4 font-sans shadow-md">
        <AdvancedColorPicker
          value={value}
          onChange={handleColorChange}
          className="gap-3"
        >
          {/* Color Selection Area */}
          <ColorPickerSelection className="aspect-square w-full" />

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex justify-end mb-2">
              <ColorPickerEyeDropper />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2">
                Hue
              </label>
              <ColorPickerHue />
            </div>
          </div>
        </AdvancedColorPicker>
      </Popover.Content>
    </Popover>
  )
}
