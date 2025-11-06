"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { useState } from "react"

interface CanvasBackgroundManagerProps {
  backgrounds: string[]
  setBackgrounds: (bg: string[]) => void
  selectedIndex: number | null
  setSelectedIndex: (idx: number | null) => void
}

export function CanvasBackgroundManager({
  backgrounds,
  setBackgrounds,
  selectedIndex,
  setSelectedIndex,
}: CanvasBackgroundManagerProps) {
  const [newColor, setNewColor] = useState("#ffffff")

  const addBackground = () => {
    setBackgrounds([...backgrounds, newColor])
    setSelectedIndex(backgrounds.length)
  }

  const removeBackground = (index: number) => {
    const updated = backgrounds.filter((_, i) => i !== index)
    setBackgrounds(updated)
    if (selectedIndex === index) {
      setSelectedIndex(updated.length > 0 ? 0 : null)
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Canvas Background</Label>

      {/* Add new background */}
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2 items-center">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer hover:border-primary transition-colors"
          />
          <Input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-9 text-sm font-mono bg-muted border-border flex-1"
          />
        </div>
        <Button
          onClick={addBackground}
          size="sm"
          variant="outline"
          className="h-10 w-10 p-0 border-border hover:bg-muted bg-transparent"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Background list */}
      {backgrounds.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Backgrounds</p>
          <div className="grid grid-cols-4 gap-2">
            {backgrounds.map((bg, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === idx
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="w-full aspect-square" style={{ backgroundColor: bg }} />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeBackground(idx)
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/90 hover:bg-destructive p-1 rounded-md"
                >
                  <X className="w-3 h-3 text-destructive-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
