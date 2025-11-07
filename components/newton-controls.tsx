"use client"

import type { NewtonParams } from "@/app/page"
import { Slider } from "@/components/ui/slider"

interface NewtonControlsProps {
  params: NewtonParams
  setParams: (params: NewtonParams) => void
}

export function NewtonControls({ params, setParams }: NewtonControlsProps) {
  const handleColorChange = (index: number, color: string) => {
    const newColors = [...params.rootColors]
    newColors[index] = color
    setParams({ ...params, rootColors: newColors })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Polynomial Roots</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[params.roots]}
            onValueChange={(val) => {
              const newRoots = val[0]
              const colors = [...params.rootColors]
              while (colors.length < newRoots) {
                colors.push(`hsl(${Math.random() * 360}, 100%, 50%)`)
              }
              setParams({ ...params, roots: newRoots, rootColors: colors.slice(0, newRoots) })
            }}
            min={3}
            max={8}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-mono w-8 text-right">{params.roots}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Iterations</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[params.iterations]}
            onValueChange={(val) => setParams({ ...params, iterations: val[0] })}
            min={5}
            max={100}
            step={5}
            className="flex-1"
          />
          <span className="text-sm font-mono w-12 text-right">{params.iterations}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Root Colors</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {params.rootColors.map((color, idx) => (
            <input
              key={idx}
              type="color"
              value={color}
              onChange={(e) => handleColorChange(idx, e.target.value)}
              className="h-10 border-2 border-border rounded cursor-pointer"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
