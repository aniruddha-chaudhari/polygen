"use client"

import type { MandelbrotParams } from "@/app/page"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/retroui/Button"

interface MandelbrotControlsProps {
  params: MandelbrotParams
  setParams: (params: MandelbrotParams) => void
}

export function MandelbrotControls({ params, setParams }: MandelbrotControlsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Zoom</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[Math.log(params.zoom) / 5]}
            onValueChange={(val) => setParams({ ...params, zoom: Math.exp(val[0] * 5) })}
            min={0}
            max={5}
            step={0.1}
            className="flex-1"
          />
          <span className="text-sm font-mono w-12 text-right">{params.zoom.toFixed(1)}x</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider">Iterations</label>
        <div className="flex items-center gap-2 mt-2">
          <Slider
            value={[params.iterations]}
            onValueChange={(val) => setParams({ ...params, iterations: val[0] })}
            min={10}
            max={500}
            step={10}
            className="flex-1"
          />
          <span className="text-sm font-mono w-12 text-right">{params.iterations}</span>
        </div>
      </div>

      <div>
        <Button
          onClick={() => setParams({ ...params, isJuliaSet: !params.isJuliaSet })}
          variant={params.isJuliaSet ? "default" : "outline"}
          className="w-full text-xs"
        >
          {params.isJuliaSet ? "Julia Set" : "Mandelbrot"}
        </Button>
      </div>

      {params.isJuliaSet && (
        <>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider">Julia Seed X</label>
            <div className="flex items-center gap-2 mt-2">
              <Slider
                value={[((params.juliaSeedX + 2) / 4) * 100]}
                onValueChange={(val) => setParams({ ...params, juliaSeedX: (val[0] / 100) * 4 - 2 })}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12 text-right">{params.juliaSeedX.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider">Julia Seed Y</label>
            <div className="flex items-center gap-2 mt-2">
              <Slider
                value={[((params.juliaSeedY + 2) / 4) * 100]}
                onValueChange={(val) => setParams({ ...params, juliaSeedY: (val[0] / 100) * 4 - 2 })}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12 text-right">{params.juliaSeedY.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
