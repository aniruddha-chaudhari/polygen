"use client"
import { Label } from "@/components/ui/label"
import type { CellularAutomataParams } from "@/app/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CellularAutomataControlsProps {
  params: CellularAutomataParams
  setParams: (params: CellularAutomataParams) => void
}

export function CellularAutomataControls({ params, setParams }: CellularAutomataControlsProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="algorithm" className="text-xs font-bold uppercase tracking-wider">
          Algorithm
        </Label>
        <Select value={params.algorithm} onValueChange={(value: any) => setParams({ ...params, algorithm: value })}>
          <SelectTrigger id="algorithm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conway">Conway's Life</SelectItem>
            <SelectItem value="cyclic">Cyclic CA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="ruleset" className="text-xs font-bold uppercase tracking-wider">
          Rule Set
        </Label>
        <input
          id="ruleset"
          type="text"
          value={params.ruleSet}
          onChange={(e) => setParams({ ...params, ruleSet: e.target.value })}
          className="w-full px-3 py-2 border-2 border-foreground/20 bg-background text-foreground text-sm"
          placeholder="B3/S23"
        />
      </div>

      <div>
        <Label htmlFor="initial" className="text-xs font-bold uppercase tracking-wider">
          Initial State
        </Label>
        <Select
          value={params.initialState}
          onValueChange={(value: any) => setParams({ ...params, initialState: value })}
        >
          <SelectTrigger id="initial" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="random">Random</SelectItem>
            <SelectItem value="centered">Centered Seed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="color-live" className="text-xs font-bold uppercase tracking-wider">
          Live Cell Color
        </Label>
        <input
          id="color-live"
          type="color"
          value={params.colorLive}
          onChange={(e) => setParams({ ...params, colorLive: e.target.value })}
          className="w-full h-10 border-2 border-foreground/20 cursor-pointer"
        />
      </div>

      <div>
        <Label htmlFor="color-dead" className="text-xs font-bold uppercase tracking-wider">
          Dead Cell Color
        </Label>
        <input
          id="color-dead"
          type="color"
          value={params.colorDead}
          onChange={(e) => setParams({ ...params, colorDead: e.target.value })}
          className="w-full h-10 border-2 border-foreground/20 cursor-pointer"
        />
      </div>
    </div>
  )
}
