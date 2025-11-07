"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { ReactionDiffusionParams } from "@/app/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReactionDiffusionControlsProps {
  params: ReactionDiffusionParams
  setParams: (params: ReactionDiffusionParams) => void
}

export function ReactionDiffusionControls({ params, setParams }: ReactionDiffusionControlsProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="preset" className="text-xs font-bold uppercase tracking-wider">
          Pattern Preset
        </Label>
        <Select value={params.preset} onValueChange={(value: any) => setParams({ ...params, preset: value })}>
          <SelectTrigger id="preset" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spots">Spots</SelectItem>
            <SelectItem value="stripes">Stripes</SelectItem>
            <SelectItem value="labyrinth">Labyrinth</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="feed" className="text-xs font-bold uppercase tracking-wider">
          Feed Rate: {params.feedRate.toFixed(4)}
        </Label>
        <Slider
          id="feed"
          min={0.01}
          max={0.1}
          step={0.001}
          value={[params.feedRate]}
          onValueChange={(value) => setParams({ ...params, feedRate: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="kill" className="text-xs font-bold uppercase tracking-wider">
          Kill Rate: {params.killRate.toFixed(4)}
        </Label>
        <Slider
          id="kill"
          min={0.04}
          max={0.07}
          step={0.001}
          value={[params.killRate]}
          onValueChange={(value) => setParams({ ...params, killRate: value[0] })}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="speed" className="text-xs font-bold uppercase tracking-wider">
          Speed: {params.speed.toFixed(1)}x
        </Label>
        <Slider
          id="speed"
          min={0.1}
          max={2.0}
          step={0.1}
          value={[params.speed]}
          onValueChange={(value) => setParams({ ...params, speed: value[0] })}
          className="w-full"
        />
      </div>
    </div>
  )
}
