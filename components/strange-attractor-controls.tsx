"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { StrangeAttractorParams } from "@/app/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StrangeAttractorControlsProps {
  params: StrangeAttractorParams
  setParams: (params: StrangeAttractorParams) => void
}

export function StrangeAttractorControls({ params, setParams }: StrangeAttractorControlsProps) {
  const getAttractorLabel = (type: string) => {
    switch (type) {
      case "lorenz":
        return "Lorenz (a, b, c)"
      case "aizawa":
        return "Aizawa (a, b, c)"
      case "dejong":
        return "De Jong (a, b, c, d)"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="attractor-type" className="text-xs font-bold uppercase tracking-wider">
          Attractor Type
        </Label>
        <Select value={params.type} onValueChange={(value: any) => setParams({ ...params, type: value })}>
          <SelectTrigger id="attractor-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lorenz">Lorenz</SelectItem>
            <SelectItem value="aizawa">Aizawa</SelectItem>
            <SelectItem value="dejong">De Jong</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="param-a" className="text-xs font-bold uppercase tracking-wider">
          {getAttractorLabel(params.type).split("(")[0].trim()} A: {params.a.toFixed(2)}
        </Label>
        <Slider
          id="param-a"
          min={-30}
          max={30}
          step={0.1}
          value={[params.a]}
          onValueChange={(value) => setParams({ ...params, a: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="param-b" className="text-xs font-bold uppercase tracking-wider">
          B: {params.b.toFixed(2)}
        </Label>
        <Slider
          id="param-b"
          min={-30}
          max={30}
          step={0.1}
          value={[params.b]}
          onValueChange={(value) => setParams({ ...params, b: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="param-c" className="text-xs font-bold uppercase tracking-wider">
          C: {params.c.toFixed(2)}
        </Label>
        <Slider
          id="param-c"
          min={-30}
          max={30}
          step={0.1}
          value={[params.c]}
          onValueChange={(value) => setParams({ ...params, c: value[0] })}
          className="w-full"
        />
      </div>

      {params.type === "dejong" && (
        <div>
          <Label htmlFor="param-d" className="text-xs font-bold uppercase tracking-wider">
            D: {params.d.toFixed(2)}
          </Label>
          <Slider
            id="param-d"
            min={-30}
            max={30}
            step={0.1}
            value={[params.d]}
            onValueChange={(value) => setParams({ ...params, d: value[0] })}
            className="w-full"
          />
        </div>
      )}

      <div>
        <Label htmlFor="density" className="text-xs font-bold uppercase tracking-wider">
          Point Density: {params.pointDensity}
        </Label>
        <Slider
          id="density"
          min={1000}
          max={100000}
          step={1000}
          value={[params.pointDensity]}
          onValueChange={(value) => setParams({ ...params, pointDensity: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="weight" className="text-xs font-bold uppercase tracking-wider">
          Line Weight: {params.lineWeight.toFixed(1)}
        </Label>
        <Slider
          id="weight"
          min={0.5}
          max={5}
          step={0.1}
          value={[params.lineWeight]}
          onValueChange={(value) => setParams({ ...params, lineWeight: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="color" className="text-xs font-bold uppercase tracking-wider">
          Color
        </Label>
        <input
          id="color"
          type="color"
          value={params.color}
          onChange={(e) => setParams({ ...params, color: e.target.value })}
          className="w-full h-10 border-2 border-foreground/20 cursor-pointer"
        />
      </div>
    </div>
  )
}
