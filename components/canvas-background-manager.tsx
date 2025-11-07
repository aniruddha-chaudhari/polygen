"use client"

import { X } from "lucide-react"

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

  const removeBackground = (index: number) => {
    const updated = backgrounds.filter((_, i) => i !== index)
    setBackgrounds(updated)
    if (selectedIndex === index) {
      setSelectedIndex(updated.length > 0 ? 0 : null)
    }
  }

  return (
    <div className="space-y-4">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Canvas Background</label>


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
