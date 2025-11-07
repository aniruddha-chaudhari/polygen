"use client"

import { useState } from "react"
import { GradientColorStops } from "./gradient-color-stops"
import type { GradientState } from "@/app/page"

interface GradientControlsProps {
  gradient: GradientState
  setGradient: (gradient: GradientState) => void
}

export function GradientControls({ gradient, setGradient }: GradientControlsProps) {
  const [selectedTab, setSelectedTab] = useState<"basic" | "advanced">("basic")

  const handleTypeChange = (type: GradientState["type"]) => {
    setGradient({ ...gradient, type })
  }

  return (
    <div className="space-y-4">
      {/* Gradient Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Gradient Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["linear", "radial", "conic", "mesh"].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type as GradientState["type"])}
              className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded border-2 transition-colors ${
                gradient.type === type
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-foreground/10 bg-muted text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs for Basic/Advanced */}
      <div className="flex gap-2 border-b-2 border-foreground/10">
        {["basic", "advanced"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as "basic" | "advanced")}
            className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              selectedTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Basic Controls */}
      {selectedTab === "basic" && (
        <div className="space-y-4">
          <GradientColorStops
            colorStops={gradient.colorStops}
            setColorStops={(stops) => setGradient({ ...gradient, colorStops: stops })}
          />

          {/* Angle for Linear */}
          {(gradient.type === "linear" || gradient.type === "repeating-linear") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Angle</label>
                <span className="text-xs font-mono text-primary">{gradient.angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={gradient.angle}
                onChange={(e) => setGradient({ ...gradient, angle: Number(e.target.value) })}
                className="w-full h-2 bg-muted rounded accent-primary"
              />
            </div>
          )}

          {/* Center Position for Radial/Conic */}
          {(gradient.type === "radial" ||
            gradient.type === "conic" ||
            gradient.type === "repeating-radial" ||
            gradient.type === "repeating-conic") && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Center X
                  </label>
                  <span className="text-xs font-mono text-primary">{gradient.centerX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gradient.centerX}
                  onChange={(e) => setGradient({ ...gradient, centerX: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Center Y
                  </label>
                  <span className="text-xs font-mono text-primary">{gradient.centerY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gradient.centerY}
                  onChange={(e) => setGradient({ ...gradient, centerY: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded accent-primary"
                />
              </div>

              {gradient.type === "conic" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Start Angle
                    </label>
                    <span className="text-xs font-mono text-primary">{gradient.angle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradient.angle}
                    onChange={(e) => setGradient({ ...gradient, angle: Number(e.target.value) })}
                    className="w-full h-2 bg-muted rounded accent-primary"
                  />
                </div>
              )}
            </>
          )}

          {/* Shape for Radial */}
          {(gradient.type === "radial" || gradient.type === "repeating-radial") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shape</label>
                <span className="text-xs font-mono text-primary">{gradient.shape}</span>
              </div>
              <div className="flex gap-2">
                {["circle", "ellipse"].map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setGradient({ ...gradient, shape: shape as "circle" | "ellipse" })}
                    className={`flex-1 px-3 py-2 text-xs font-semibold uppercase rounded border-2 transition-colors ${
                      gradient.shape === shape
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-foreground/10 bg-muted text-muted-foreground"
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Controls */}
      {selectedTab === "advanced" && (
        <div className="space-y-4 p-3 bg-muted rounded border border-foreground/10">
          {/* Noise Controls */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">
              <input
                type="checkbox"
                checked={gradient.noiseEnabled}
                onChange={(e) => setGradient({ ...gradient, noiseEnabled: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              Add Grain
            </label>
          </div>

          {gradient.noiseEnabled && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</label>
                  <span className="text-xs font-mono text-primary">{Math.round(gradient.noiseAmount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={gradient.noiseAmount}
                  onChange={(e) => setGradient({ ...gradient, noiseAmount: Number(e.target.value) })}
                  className="w-full h-2 bg-background rounded accent-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Type
                </label>
                <div className="flex gap-2">
                  {["smooth", "harsh"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setGradient({ ...gradient, noiseType: type as "smooth" | "harsh" })}
                      className={`flex-1 px-3 py-2 text-xs font-semibold uppercase rounded border-2 transition-colors ${
                        gradient.noiseType === type
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-foreground/10 bg-background text-muted-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
