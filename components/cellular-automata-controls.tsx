"use client"

import { ColorPicker } from "@/components/retroui/ColorPicker"
import { Input } from "@/components/retroui/Input"
import type { CellularAutomataParams } from "@/app/page"
import { Select } from "@/components/retroui/Select"
import { Button } from "@/components/retroui/Button"

interface CellularAutomataControlsProps {
  params: CellularAutomataParams
  setParams: (params: CellularAutomataParams) => void
}

export function CellularAutomataControls({ params, setParams }: CellularAutomataControlsProps) {
  const handleChange = (key: keyof CellularAutomataParams, value: string) => {
    setParams({ ...params, [key]: value })
  }

  const presetRules = {
    conway: "B3/S23",
    "cyclic-2": "B1/S1",
    "cyclic-3": "B2/S1",
    "cyclic-4": "B3/S1",
    "high-life": "B36/S23",
    "day-and-night": "B3678/S34678"
  }

  const handlePresetSelect = (preset: string) => {
    if (preset in presetRules) {
      setParams({ ...params, ruleSet: presetRules[preset as keyof typeof presetRules] })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Algorithm</label>
        <Select
          value={params.algorithm}
          onValueChange={(value) => handleChange("algorithm", value)}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder="Select algorithm" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="conway">Conway's Game of Life</Select.Item>
            <Select.Item value="cyclic">Cyclic Cellular Automata</Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rule Set</label>
        <div className="space-y-2">
          <Input
            value={params.ruleSet}
            onChange={(e) => handleChange("ruleSet", e.target.value)}
            placeholder="e.g., B3/S23"
            className="text-xs"
          />
          <div className="text-xs text-muted-foreground">
            Format: Birth/Survival (e.g., B3/S23 means "born with 3 neighbors, survives with 2-3")
          </div>
        </div>

        {/* Preset rules */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(presetRules).map(([key, rule]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(key)}
                className="text-xs h-8"
              >
                {key.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Initial State</label>
        <Select
          value={params.initialState}
          onValueChange={(value) => handleChange("initialState", value)}
        >
          <Select.Trigger className="w-full">
            <Select.Value placeholder="Select initial state" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="random">Random</Select.Item>
            <Select.Item value="centered">Centered Seed</Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Cell Color</label>
        <ColorPicker
          value={params.colorLive}
          onChange={(color) => handleChange("colorLive", color)}
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dead Cell Color</label>
        <ColorPicker
          value={params.colorDead}
          onChange={(color) => handleChange("colorDead", color)}
        />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Conway's Game of Life:</strong> Classic cellular automata with birth/survival rules</p>
        <p><strong>Cyclic CA:</strong> Cells cycle through states, creating wave-like patterns</p>
        <p>Click on the canvas to add/remove cells manually</p>
      </div>
    </div>
  )
}